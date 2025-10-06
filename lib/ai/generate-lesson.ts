import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from "./prompts";

export async function generateLessonContent(outline: string) {
  console.log("🤖 Starting AI lesson generation for:", outline);

  try {
    const { text, usage } = await generateText({
      model: openai("gpt-4"),
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: USER_PROMPT_TEMPLATE.replace("{outline}", outline),
        },
      ],
      temperature: 0.9, // Higher temperature for more creativity and variety
      maxOutputTokens: 6000,
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
