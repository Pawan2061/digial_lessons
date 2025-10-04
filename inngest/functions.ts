import { inngest } from "@/inngest.config";

export const executeLesson = inngest.createFunction({
  id: "execute-lesson",
  name: "Execute Lesson",
  data: {
    name: "Execute Lesson",
  },
});
