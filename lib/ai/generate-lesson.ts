import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function generateLessonContent(outline: string) {
  console.log("🤖 Starting AI lesson generation for:", outline);

  try {
    const { text, usage } = await generateText({
      model: openai("gpt-4"),
      messages: [
        {
          role: "system",
          content: `You are an expert educational content generator. Create interactive TypeScript React components for educational lessons.

CRITICAL REQUIREMENTS:
1. Generate ONLY valid, executable TypeScript React component code
2. NO explanatory comments, NO instructional text, NO markdown
3. Do NOT include lines like "Here is...", "Please note...", "Make sure..."
4. Use proper TypeScript types and React hooks
5. The component must be self-contained and immediately executable
6. Use Tailwind CSS for styling (already installed)
7. Use 'use client' directive at the top
8. Include proper accessibility features

COMPONENT STRUCTURE:
- Start with: 'use client';
- Import only React and useState/useEffect if needed
- Create ONE main functional component
- Export the component as default
- Make it educational and interactive

EXAMPLES:
- For quizzes: Interactive quiz with questions, answers, scoring, and explanations
- For tutorials: Step-by-step interactive tutorials with progress tracking
- For exercises: Hands-on exercises with immediate feedback

OUTPUT: Only valid TypeScript/React code. Nothing else.`,
        },
        {
          role: "user",
          content: `Create an interactive educational lesson for: ${outline}`,
        },
      ],
      temperature: 0.7,
      maxOutputTokens: 4000,
    });

    console.log("✅ AI generation completed");
    console.log("📊 Token usage:", usage);

    return {
      content: text,
      usage,
      success: true,
    };
  } catch (error) {
    console.error("❌ AI generation failed:", error);
    return {
      content: null,
      usage: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
