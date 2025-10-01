"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Lesson {
  id: string;
  title: string;
  status: "generating" | "generated";
  outline: string;
  created_at: string;
}

export default function LandingPage() {
  const [outline, setOutline] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const loadLessons = async () => {
      console.log("🔍 Loading lessons on component mount...");
      try {
        console.log("🔍 Making request to /api/lessons...");
        const response = await fetch("/api/lessons");
        console.log("📡 Response status:", response.status);
        console.log("📡 Response headers:", response.headers);

        if (response.ok) {
          console.log("✅ Response is OK, parsing JSON...");
          const data = await response.json();
          console.log("📝 Parsed data:", data);
          setLessons(data.lessons);
          console.log(
            "✅ Lessons loaded successfully:",
            data.lessons?.length || 0,
            "lessons"
          );
        } else {
          console.error(
            "❌ Response not OK:",
            response.status,
            response.statusText
          );
          const text = await response.text();
          console.error("❌ Response body:", text);
        }
      } catch (error) {
        console.error("❌ Error loading lessons:", error);
      }
    };

    loadLessons();
  }, []);

  const handleGenerateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outline.trim()) return;

    console.log("🔍 Starting lesson generation...");
    setIsGenerating(true);

    try {
      console.log("🔍 Making POST request to /api/lessons...");
      console.log("📝 Sending outline:", outline.trim());

      const response = await fetch("/api/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ outline: outline.trim() }),
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", response.headers);

      if (!response.ok) {
        console.error(
          "❌ Response not OK:",
          response.status,
          response.statusText
        );
        const text = await response.text();
        console.error("❌ Response body:", text);
        throw new Error("Failed to create lesson");
      }

      console.log("✅ Response is OK, parsing JSON...");
      const data = await response.json();
      console.log("📝 Parsed data:", data);
      const { lesson } = data;

      setLessons((prev) => [lesson, ...prev]);
      setOutline("");
      console.log("✅ Lesson added to list successfully");

      setTimeout(() => {
        console.log("🔄 Simulating lesson completion...");
        setLessons((prev) =>
          prev.map((l) =>
            l.id === lesson.id ? { ...l, status: "generated" as const } : l
          )
        );
        setIsGenerating(false);
        console.log("✅ Lesson status updated to generated");
      }, 3000);
    } catch (error) {
      console.error("❌ Error creating lesson:", error);
      setIsGenerating(false);
      // TODO: Show error message to user
    }
  };

  const handleViewLesson = (lessonId: string) => {
    window.location.href = `/lessons/${lessonId}`;
  };

  return (
    <div className="min-h-screen bg-purple-900">
      <header className="bg-purple-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-semibold text-white">
                  Digital Lessons
                </h1>
              </div>
            </div>
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a
                  href="#"
                  className="text-purple-200 hover:text-white px-3 py-2 text-sm font-medium"
                >
                  About
                </a>
                <a
                  href="#"
                  className="text-purple-200 hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Examples
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            Create Interactive
            <span className="block bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Learning Materials
            </span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-purple-200">
            Transform any topic into engaging, interactive lessons. Just
            describe what you need, and let AI handle the rest.
          </p>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-white mb-4">
            What lesson do you want to create?
          </h2>
          <form
            onSubmit={handleGenerateLesson}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <input
                type="text"
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                placeholder="Ask anything..."
                disabled={isGenerating}
                className="w-full px-6 py-4 pr-16 text-lg bg-gray-100 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!outline.trim() || isGenerating}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors duration-200"
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              {
                text: "10-question pop quiz on Florida",
                category: "Geography",
              },
              { text: "Long division explanation", category: "Math" },
              { text: "Counting numbers test", category: "Math" },
              { text: "Cartesian Grid tutorial", category: "Math" },
              { text: "Photosynthesis basics", category: "Science" },
              { text: "World War II timeline", category: "History" },
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setOutline(suggestion.text)}
                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200 transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{suggestion.text}</span>
                  <span className="text-gray-400 text-xs">
                    {suggestion.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {lessons.length > 0 ? (
          <div>
            <h3 className="text-2xl font-semibold text-white mb-6">
              Your Lessons
            </h3>
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  className={`bg-white border-0 shadow-lg transition-all duration-200 ${
                    lesson.status === "generated"
                      ? "hover:shadow-xl cursor-pointer"
                      : ""
                  }`}
                  onClick={() =>
                    lesson.status === "generated" && handleViewLesson(lesson.id)
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {lesson.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Created{" "}
                          {new Date(lesson.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lesson.status === "generating"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {lesson.status === "generating"
                            ? "Generating..."
                            : "Ready"}
                        </span>
                        {lesson.status === "generated" && (
                          <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white border-0"
                            size="sm"
                          >
                            View Lesson
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="text-center py-16 bg-white shadow-lg border-0">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No lessons yet
              </h3>
              <p className="text-gray-500">
                Create your first lesson by entering a description above
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="border-t border-purple-800 mt-16 bg-purple-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-purple-200 text-sm">
            <p>&copy; 2024 Digital Lessons. Built with Next.js and Supabase.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
