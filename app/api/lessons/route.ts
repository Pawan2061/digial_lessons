import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

    return NextResponse.json({ lesson }, { status: 201 });
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
