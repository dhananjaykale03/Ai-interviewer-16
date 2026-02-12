import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { type, role, level, techstack, amount, userid } =
      await request.json();

    const { text: questions } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.

IMPORTANT:
- Return only a JSON array.
- Do not include explanation text.
- Do not use special characters like "/" or "*".
- Format exactly like:
["Question 1", "Question 2", "Question 3"]
`,
    });

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
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
