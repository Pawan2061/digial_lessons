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

REQUIREMENTS:
1. Generate a complete, functional TypeScript React component
2. The component should be educational and interactive
3. Use proper TypeScript types and React hooks
4. Include proper error handling and loading states
5. Make it engaging with good UX
6. The component should be self-contained and executable
7. Use Tailwind CSS for styling
8. Include proper accessibility features

EXAMPLES:
- For quizzes: Create interactive quiz with questions, answers, scoring, and explanations
- For tutorials: Create step-by-step interactive tutorials with progress tracking
- For exercises: Create hands-on exercises with immediate feedback
- For explanations: Create interactive explanations with examples and visualizations

Generate ONLY the TypeScript React component code, no explanations or markdown.`,
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
