import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generateLessonContent } from "@/lib/ai/generate-lesson";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: lessons, error } = await supabase
      .from("lessons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase error fetching lessons:", error);
      return NextResponse.json(
        { error: "Failed to fetch lessons", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error("❌ Unexpected error in GET /api/lessons:", error);
    console.error("❌ Error details:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { outline } = await request.json();

    if (!outline) {
      return NextResponse.json(
        { error: "Outline is required" },
        { status: 400 }
      );
    }

    const title = generateTitleFromOutline(outline);

    const supabase = await createClient();

    const { data: lesson, error } = await supabase
      .from("lessons")
      .insert({
        title,
        outline,
        status: "generating",
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase error creating lesson:", error);
      return NextResponse.json(
        { error: "Failed to create lesson" },
        { status: 500 }
      );
    }

    console.log("✅ Successfully created lesson:", lesson);

    console.log("🤖 Starting AI generation...");
    const aiResult = await generateLessonContent(outline);

    if (aiResult.success && aiResult.content) {
      console.log("✅ AI generation successful, updating lesson...");

      const { data: updatedLesson, error: updateError } = await supabase
        .from("lessons")
        .update({
          content: aiResult.content,
          status: "generated",
          ai_prompt: `Create an interactive educational lesson for: ${outline}`,
          ai_response: aiResult.content,
          generation_trace: {
            usage: aiResult.usage,
            generated_at: new Date().toISOString(),
            model: "gpt-4",
          },
        })
        .eq("id", lesson.id)
        .select()
        .single();

      if (updateError) {
        console.error(
          "❌ Failed to update lesson with AI content:",
          updateError
        );
        return NextResponse.json({ lesson }, { status: 201 });
      }

      console.log("✅ Lesson updated with AI content:", updatedLesson);
      return NextResponse.json({ lesson: updatedLesson }, { status: 201 });
    } else {
      console.error("❌ AI generation failed:", aiResult.error);

      // Update lesson with error status
      await supabase
        .from("lessons")
        .update({
          status: "failed",
          error_message: aiResult.error || "AI generation failed",
        })
        .eq("id", lesson.id);

      return NextResponse.json({ lesson }, { status: 201 });
    }
  } catch (error) {
    console.error("❌ Unexpected error in POST /api/lessons:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateTitleFromOutline(outline: string): string {
  const words = outline.trim().split(" ");

  if (words.length <= 6) {
    return outline;
  }

  return words.slice(0, 6).join(" ") + "...";
}
