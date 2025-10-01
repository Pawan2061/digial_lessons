"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Lesson {
  id: string;
  title: string;
  outline: string;
  content?: string;
  status: "generating" | "generated" | "failed";
  created_at: string;
  updated_at: string;
  error_message?: string;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        console.log("🔍 Fetching lesson with ID:", params.id);

        const response = await fetch(`/api/lessons/${params.id}`);
        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Lesson not found");
          }
          throw new Error("Failed to fetch lesson");
        }

        const data = await response.json();
        console.log("📝 Fetched lesson data:", data);
        const lesson = data.lesson;
        setLesson(lesson);
      } catch (err) {
        console.error("❌ Error fetching lesson:", err);
        setError(err instanceof Error ? err.message : "Failed to load lesson");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchLesson();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Lesson Not Found
          </h1>
          <p className="text-purple-200 mb-6">
            The lesson youre looking for doesnt exist.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-semibold"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-900">
      <header className="bg-purple-900 border-b border-purple-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="text-white hover:text-purple-200 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-white">
                Digital Lessons
              </h1>
            </div>
            <Badge
              className={
                lesson.status === "generated"
                  ? "bg-green-100 text-green-800"
                  : lesson.status === "failed"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }
            >
              {lesson.status === "generated"
                ? "Ready"
                : lesson.status === "failed"
                ? "Failed"
                : "Generating..."}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Lesson Outline
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Original request and lesson details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Title</h3>
                  <p className="text-gray-700 text-sm">{lesson.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 text-sm">{lesson.outline}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Created</h3>
                  <p className="text-gray-700 text-sm">
                    {new Date(lesson.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                  <Badge
                    className={
                      lesson.status === "generated"
                        ? "bg-green-100 text-green-800"
                        : lesson.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {lesson.status === "generated"
                      ? "Ready"
                      : lesson.status === "failed"
                      ? "Failed"
                      : "Generating..."}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Generated Lesson
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Interactive lesson content rendered as TypeScript
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lesson.status === "generating" ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Generating your lesson...</p>
                    <p className="text-sm text-gray-500 mt-2">
                      This may take a few moments
                    </p>
                  </div>
                ) : lesson.status === "failed" ? (
                  <div className="text-center py-12">
                    <div className="text-red-500 mb-4">
                      <svg
                        className="mx-auto h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Generation Failed
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {lesson.error_message ||
                        "There was an error generating your lesson. Please try again."}
                    </p>
                    <Button
                      onClick={() => window.location.reload()}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Retry
                    </Button>
                  </div>
                ) : !lesson.content ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="mx-auto h-12 w-12"
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
                      No Content Available
                    </h3>
                    <p className="text-gray-600">
                      This lesson doesn&apos;t have any generated content yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Code Preview */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        TypeScript Code
                      </h3>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-green-400 text-sm">
                          <code>{lesson.content}</code>
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        Live Preview
                      </h3>
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="text-center py-8">
                          <div className="text-gray-500 mb-4">
                            <svg
                              className="mx-auto h-12 w-12"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                              />
                            </svg>
                          </div>
                          <p className="text-gray-600 mb-4">
                            Interactive lesson will render here
                          </p>
                          <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => {
                              // In a real app, this would execute the TypeScript code
                              alert("Lesson execution would happen here!");
                            }}
                          >
                            Run Lesson
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
