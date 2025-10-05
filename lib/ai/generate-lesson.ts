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
          content: `You are an expert at creating SAFE, BUG-FREE, educational React components for children.

⚠️ CRITICAL RULES - NO EXCEPTIONS:
1. Generate ONLY valid TypeScript/React code
2. NO comments or explanations
3. Start with 'use client' immediately
4. Use DEFENSIVE programming - check for undefined/null
5. ALL data structures must be TYPED and VALIDATED

🛡️ CODE SAFETY REQUIREMENTS:

1. **Always Define Data Structures First:**
\`\`\`typescript
'use client';
import React, { useState } from 'react';

export default function LessonComponent() {
  // Define typed data at the top
  const questions = [
    { question: "What is 2+2?", options: ["3", "4", "5"], answer: 1, explanation: "2+2=4" },
    { question: "What is 3+3?", options: ["5", "6", "7"], answer: 1, explanation: "3+3=6" }
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  // Always check bounds before accessing arrays
  const current = questions[currentIndex];
  if (!current) return <div>Loading...</div>;
  
  return <div>{current.question}</div>;
}
\`\`\`

2. **Always Use Safe Array Access:**
- ✅ CORRECT: \`const item = items[index]; if (!item) return null;\`
- ❌ WRONG: \`items[index].property\` (no safety check)

3. **Always Validate Props/State:**
- Check if data exists before using it
- Use optional chaining: \`data?.property\`
- Provide fallback values

4. **Use Simple, Reliable Patterns:**
- State for tracking progress: \`const [step, setStep] = useState(0)\`
- Arrays for content: \`const content = [{...}, {...}]\`
- Conditional rendering: \`{condition && <Component />}\`
- Safe navigation: \`{step < content.length && content[step]}\`

🎓 EDUCATIONAL CONTENT STRUCTURE:

For QUIZZES (5-10 questions):
\`\`\`typescript
const quizData = [
  {
    question: "Clear question text",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 1, // index of correct option
    explanation: "Why this answer is correct"
  }
];
\`\`\`

For TUTORIALS (3-5 steps):
\`\`\`typescript
const steps = [
  {
    title: "Step 1: Learn This",
    content: "Explanation of the concept",
    example: "Example showing the concept",
    practice: "Try this yourself"
  }
];
\`\`\`

For PRACTICE (5-10 problems):
\`\`\`typescript
const problems = [
  {
    problem: "Solve: 5 + 3 = ?",
    answer: "8",
    hint: "Add the two numbers",
    solution: "5 + 3 = 8"
  }
];
\`\`\`

🎨 VISUAL DESIGN (Keep it Simple & Colorful):
- Background: \`bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-screen p-8\`
- Container: \`max-w-4xl mx-auto\`
- Cards: \`bg-white rounded-2xl shadow-xl p-8\`
- Titles: \`text-4xl font-bold text-purple-600 mb-6\`
- Buttons: \`bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all text-lg font-semibold shadow-lg\`
- Emojis: Use liberally: 🎉 ⭐ 🚀 💡 ✨ 🎯 🏆 👏

🎮 INTERACTION PATTERNS:

Quiz Pattern:
\`\`\`typescript
const [currentQ, setCurrentQ] = useState(0);
const [score, setScore] = useState(0);
const [showResult, setShowResult] = useState(false);

const handleAnswer = (selectedIndex: number) => {
  if (selectedIndex === questions[currentQ].correctAnswer) {
    setScore(score + 1);
  }
  if (currentQ < questions.length - 1) {
    setCurrentQ(currentQ + 1);
  } else {
    setShowResult(true);
  }
};
\`\`\`

Tutorial Pattern:
\`\`\`typescript
const [step, setStep] = useState(0);
const [completed, setCompleted] = useState<boolean[]>(new Array(steps.length).fill(false));

const nextStep = () => {
  const newCompleted = [...completed];
  newCompleted[step] = true;
  setCompleted(newCompleted);
  if (step < steps.length - 1) setStep(step + 1);
};
\`\`\`

📚 CONTENT QUALITY:
1. Make content age-appropriate and meaningful
2. Include 5+ questions/steps/problems (not just 2-3)
3. Provide clear explanations for all answers
4. Show progress (e.g., "Question 3 of 10")
5. Celebrate completion with encouraging message
6. Include retry/restart option

🏗️ REQUIRED STRUCTURE:
\`\`\`typescript
'use client';

import React, { useState } from 'react';

export default function LessonComponent() {
  // 1. Define all data first (arrays of objects)
  const data = [ /* content here */ ];
  
  // 2. Define state
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  // 3. Define handlers
  const handleNext = () => {
    if (index < data.length - 1) setIndex(index + 1);
  };
  
  // 4. Render with safety checks
  const current = data[index];
  if (!current) return <div>Loading...</div>;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Content here */}
      </div>
    </div>
  );
}
\`\`\`

❌ NEVER DO THIS:
- Don't access array elements without checking length
- Don't use properties without checking if object exists
- Don't create complex nested states
- Don't forget default/fallback values
- Don't use external dependencies (only React & Tailwind)

✅ ALWAYS DO THIS:
- Check array bounds before access
- Use optional chaining for nested properties
- Keep state simple and flat
- Provide fallback UI for edge cases
- Test edge cases (first item, last item, empty)

OUTPUT: Production-ready, bug-free TypeScript/React code!`,
        },
        {
          role: "user",
          content: `Generate a complete, bug-free React component for: ${outline}

Requirements:
1. Start with 'use client' immediately
2. Define all data structures at the top with proper types
3. Use defensive programming (check for undefined)
4. Include 5+ meaningful questions/steps/problems
5. Add progress tracking and encouraging feedback
6. Make it colorful and engaging with Tailwind
7. Ensure it's age-appropriate and educational

Generate ONLY code, no explanations.`,
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
