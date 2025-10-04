import { serve } from "inngest/next";
import { inngest } from "@/inngest.config";
import { executeLesson } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [executeLesson],
});
