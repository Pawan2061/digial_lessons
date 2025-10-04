import { inngest } from "@/inngest.config";
import { Sandbox } from "@e2b/code-interpreter";
import { createClient } from "@/lib/supabase/server";
import { SANDBOX_TIMEOUT } from "@/lib/utils/types";

interface ExecuteLessonEvent {
  data: {
    lessonId: string;
  };
}

export const executeLesson = inngest.createFunction(
  {
    id: "execute-lesson",
    name: "Execute Lesson",
  },
  { event: "lesson/execute" },
  async ({ event, step }) => {
    const { lessonId } = event.data as ExecuteLessonEvent["data"];

    // Step 1: Fetch the lesson from Supabase
    const lesson = await step.run("fetch-lesson", async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (error || !data) {
        throw new Error(`Failed to fetch lesson: ${error?.message}`);
      }

      if (!data.content) {
        throw new Error("Lesson content is missing");
      }

      return data;
    });

    const sandboxInfo = await step.run("create-sandbox", async () => {
      const sandbox = await Sandbox.create("digital_lessons");
      await sandbox.setTimeout(SANDBOX_TIMEOUT);

      return {
        id: sandbox.sandboxId,
        url: `https://${sandbox.getHost(3000)}`,
      };
    });

    await step.run("write-code-to-sandbox", async () => {
      const sandbox = await Sandbox.connect(sandboxInfo.id);

      try {
        const cleanedContent = cleanGeneratedCode(lesson.content);

        await sandbox.files.write("/home/user/app/page.tsx", cleanedContent);

        console.log("✅ Successfully wrote code to sandbox page.tsx");
      } finally {
        console.log(`🎉 Sandbox ready at: ${sandboxInfo.url}`);
      }
    });

    await step.run("update-lesson-with-sandbox", async () => {
      const supabase = await createClient();
      const { error } = await supabase
        .from("lessons")
        .update({
          sandbox_id: sandboxInfo.id,
          sandbox_url: sandboxInfo.url,
          executed_at: new Date().toISOString(),
        })
        .eq("id", lessonId);

      if (error) {
        console.error("⚠️ Failed to update lesson with sandbox info:", error);
      }
    });

    return {
      lessonId,
      sandboxId: sandboxInfo.id,
      sandboxUrl: sandboxInfo.url,
      success: true,
    };
  }
);

/**
 * Cleans AI-generated code to ensure it's a valid Next.js page component
 */
function cleanGeneratedCode(content: string): string {
  // Remove markdown code blocks if present
  let cleaned = content.trim();

  // Remove ```typescript, ```tsx, ```jsx, ```ts, ```js markers
  cleaned = cleaned.replace(
    /^```(?:typescript|tsx|jsx|ts|js|react)?\s*\n/i,
    ""
  );
  cleaned = cleaned.replace(/\n```\s*$/, "");

  // Ensure the component has proper React imports if missing
  if (!cleaned.includes("import React") && !cleaned.includes("'react'")) {
    cleaned = `'use client';\n\nimport React from 'react';\n\n${cleaned}`;
  } else if (!cleaned.includes("'use client'")) {
    // Add 'use client' directive if not present
    cleaned = `'use client';\n\n${cleaned}`;
  }

  // Ensure there's a default export
  if (!cleaned.includes("export default")) {
    // Try to find the main component name
    const componentMatch = cleaned.match(/(?:function|const)\s+([A-Z]\w+)/);
    if (componentMatch) {
      cleaned += `\n\nexport default ${componentMatch[1]};`;
    }
  }

  return cleaned;
}
