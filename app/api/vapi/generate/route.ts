import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { type, role, level, techstack, amount, userid } =
      await request.json();

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `You are a professional technical interviewer.

Generate ${amount} interview questions.

Role: ${role}
Experience Level: ${level}
Tech Stack: ${techstack}
Focus Type: ${type}

IMPORTANT RULES:
- Return ONLY a valid JSON array.
- No explanation.
- No extra text.
- No markdown.
- No special characters like "/" or "*".
- Format strictly like:
["Question 1", "Question 2", "Question 3"]
`,
    });

    // Clean response just in case
    const cleaned = text.trim();

    let parsedQuestions: string[] = [];

    try {
      parsedQuestions = JSON.parse(cleaned);
    } catch {
      // Fallback safety (in case model slightly misformats)
      parsedQuestions = cleaned
        .replace(/[\[\]]/g, "")
        .split(",")
        .map((q) => q.replace(/"/g, "").trim());
    }

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  return Response.json(
    { success: true, data: "AI Interview API Working!" },
    { status: 200 }
  );
}
