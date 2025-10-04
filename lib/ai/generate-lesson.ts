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
          content: `You are an expert educational content generator creating FUN, COLORFUL, and ENGAGING lessons for kindergarten and high school students.

⚠️ ABSOLUTELY CRITICAL - CODE ONLY:
- Generate PURE TypeScript/React code ONLY
- NO explanations, NO descriptions, NO instructional text
- NO comments like "This component...", "Here's...", "Note that..."
- NO multi-line explanatory comments
- Start coding immediately with 'use client' or imports
- Every line must be valid executable code

🎨 DESIGN REQUIREMENTS (implement in code, don't describe):
1. Use BRIGHT, VIBRANT colors - blues, purples, greens, yellows, pinks, oranges
2. Create LARGE, BOLD text (text-2xl, text-3xl, text-4xl, font-bold, font-black)
3. Add COLORFUL gradients (bg-gradient-to-r from-blue-500 to-purple-600)
4. Include FUN EMOJIS throughout: 🎉 🌟 🚀 💡 ✨ 🎯 🏆 👏 🎨 🎮
5. Use ROUNDED corners everywhere (rounded-xl, rounded-2xl)
6. Add SHADOWS and DEPTH (shadow-lg, shadow-xl, shadow-2xl)
7. Create ANIMATED elements (hover:scale-105, transition-all, animate-bounce)
8. Use COLORFUL BUTTONS with gradients and hover effects

🎮 INTERACTIVITY (implement in code):
1. Click animations with visual feedback
2. Progress bars, counters, score displays
3. Celebration effects when correct
4. Encouraging messages in UI: "Great job! 🎉", "You're amazing! ⭐", "Keep going! 🚀"
5. Smooth transitions with transition-all duration-300

🏗️ TECHNICAL STRUCTURE:
- Start with: 'use client';
- Import: import React, { useState } from 'react';
- One functional component with TypeScript
- Use Tailwind classes for ALL styling
- Export default at the end

🎯 LAYOUT STYLE:
- Full-width with padding: p-6 md:p-8
- Colorful gradient backgrounds: bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100
- Cards: bg-white rounded-2xl shadow-xl p-6 border-4 border-purple-300
- Big buttons: px-8 py-4 text-xl rounded-xl shadow-lg
- Titles: text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent

✅ CORRECT FORMAT (this is EXACTLY how to structure):
'use client';

import React, { useState } from 'react';

export default function LessonComponent() {
  const [state, setState] = useState(0);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Your colorful, animated UI here */}
      </div>
    </div>
  );
}

❌ WRONG (never do this):
This quiz component displays...
Here is a fun...
Note that you need...
Please make sure...

OUTPUT: ONLY executable TypeScript/React code. Start coding immediately!`,
        },
        {
          role: "user",
          content: `Generate the complete React component code for: ${outline}. Start with 'use client' immediately.`,
        },
      ],
      temperature: 0.8,
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
