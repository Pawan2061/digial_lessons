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
    retries: 0,
  },
  { event: "lesson/execute" },
  async ({ event, step }) => {
    const { lessonId } = event.data as ExecuteLessonEvent["data"];

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

    await step.run("deploy-code-to-sandbox", async () => {
      console.log("📝 Deploying code to sandbox");
      const sandbox = await Sandbox.connect(sandboxInfo.id);
      const cleanedContent = cleanGeneratedCode(lesson.content);

      await sandbox.files.write("/home/user/app/page.tsx", cleanedContent);
      console.log("✅ Code written successfully");

      sandbox.commands
        .run(
          "cd /home/user && nohup npx next dev --turbopack -H 0.0.0.0 > /tmp/nextjs.log 2>&1 &"
        )
        .catch((err) => {
          console.warn("Server start command warning (non-critical):", err);
        });

      console.log("🚀 Dev server starting in background");
      console.log(`🎉 Sandbox ready at: ${sandboxInfo.url}`);
      console.log(
        "⏳ Note: First page load will take 30-60s while server compiles"
      );
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
      } else {
        console.log("✅ Lesson updated with sandbox info");
      }
    });

    console.log("🎉 Deployment complete! Sandbox URL:", sandboxInfo.url);

    return {
      lessonId,
      sandboxId: sandboxInfo.id,
      sandboxUrl: sandboxInfo.url,
      success: true,
    };
  }
);

function cleanGeneratedCode(content: string): string {
  let cleaned = content.trim();

  cleaned = cleaned.replace(
    /^```(?:typescript|tsx|jsx|ts|js|react)?\s*\n/i,
    ""
  );
  cleaned = cleaned.replace(/\n```\s*$/, "");

  const lines = cleaned.split("\n");
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("Here") ||
      trimmed.startsWith("Please") ||
      trimmed.startsWith("Note that") ||
      trimmed.startsWith("Make sure")
    ) {
      return false;
    }
    return true;
  });
  cleaned = filteredLines.join("\n");

  if (!cleaned.includes("import React") && !cleaned.includes("'react'")) {
    cleaned = `'use client';\n\nimport React from 'react';\n\n${cleaned}`;
  } else if (!cleaned.includes("'use client'")) {
    cleaned = `'use client';\n\n${cleaned}`;
  }

  if (!cleaned.includes("export default")) {
    const componentMatch = cleaned.match(/(?:function|const)\s+([A-Z]\w+)/);
    if (componentMatch) {
      cleaned += `\n\nexport default ${componentMatch[1]};`;
    }
  }

  return cleaned;
}
