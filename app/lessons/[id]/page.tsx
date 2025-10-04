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
  sandbox_url?: string;
  sandbox_id?: string;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);

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

  useEffect(() => {
    if (!lesson || lesson.status !== "generating") return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/lessons/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setLesson(data.lesson);
        }
      } catch (err) {
        console.error("Error polling lesson:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [lesson, params.id]);

  useEffect(() => {
    if (!lesson?.sandbox_url || lesson.status !== "generated") return;

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setSandboxLoading(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [lesson?.sandbox_url, lesson?.status]);

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
            The lesson you&apos;re looking for doesn&apos;t exist.
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="text-white hover:text-purple-200 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-white">
                {lesson.title}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {lesson.status === "generating" ? (
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Generating Your Lesson
                </h3>
                <p className="text-gray-600 mb-4">
                  AI is creating an interactive lesson for:{" "}
                  <strong>{lesson.outline}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  This usually takes 20-40 seconds...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : lesson.status === "failed" ? (
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg
                    className="mx-auto h-16 w-16"
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
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Generation Failed
                </h3>
                <p className="text-gray-600 mb-6">
                  {lesson.error_message ||
                    "There was an error generating your lesson. Please try again."}
                </p>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Create New Lesson
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : lesson.sandbox_url ? (
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Interactive Lesson
              </CardTitle>
              <CardDescription className="text-gray-600">
                {lesson.outline}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="relative bg-gray-50 rounded-lg overflow-hidden"
                style={{ height: "700px" }}
              >
                {sandboxLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 z-10">
                    <div className="text-center max-w-lg px-6">
                      <div className="relative w-32 h-32 mx-auto mb-8">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#7c3aed"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${
                              (countdown / 10) * 351.86
                            } 351.86`}
                            className="transition-all duration-1000 ease-linear"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-5xl font-bold text-purple-600">
                              {countdown}
                            </div>
                            <div className="text-sm text-gray-600">seconds</div>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                        Starting Your Sandbox
                      </h3>
                      <p className="text-gray-600 mb-4">
                        We&apos;re booting up the Next.js dev server and
                        compiling your interactive lesson...
                      </p>

                      {/* Progress indicators */}
                      <div className="space-y-2 text-sm text-left bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center text-green-600">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Lesson generated</span>
                        </div>
                        <div className="flex items-center text-green-600">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Sandbox created</span>
                        </div>
                        <div className="flex items-center text-purple-600">
                          <svg
                            className="animate-spin w-5 h-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>
                            Starting dev server & compiling React components...
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-6">
                        💡 First-time loads may take a bit longer while
                        everything initializes
                      </p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={lesson.sandbox_url}
                    className="w-full h-full border-0"
                    title="Interactive Lesson"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                )}
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">About this lesson</p>
                    <p>
                      This is an interactive lesson running in a live E2B
                      sandbox. You can interact with all the elements. If it
                      doesn&apos;t load after the countdown, please refresh the
                      page.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="py-16">
              <div className="text-center">
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
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  No Sandbox URL Available
                </h3>
                <p className="text-gray-600 mb-6">
                  This lesson doesn&apos;t have a sandbox URL yet. Try
                  refreshing the page.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
