import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "digital-lessons",
  name: "Digital Lessons",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
