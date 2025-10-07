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
  const [sandboxError, setSandboxError] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [recreating, setRecreating] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/lessons/${params.id}`);

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Lesson not found"
              : "Failed to fetch lesson"
          );
        }

        const data = await response.json();
        setLesson(data.lesson);
      } catch (err) {
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
      } catch {}
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [lesson, params.id]);

  useEffect(() => {
    // Start countdown whenever lesson is generated (regardless of sandbox_url)
    if (lesson?.status === "generated" && !sandboxError) {
      setSandboxLoading(true);
      setCountdown(15);

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
    } else if (lesson?.status !== "generated") {
      // Reset countdown and loading state when lesson is not generated
      setSandboxLoading(false);
      setCountdown(15);
    }
  }, [lesson?.status, sandboxError]);

  const handleRecreateSandbox = async () => {
    if (!lesson?.content) return;

    setRecreating(true);
    setSandboxError(false);
    setSandboxLoading(true);
    setCountdown(15);

    try {
      const response = await fetch("/api/inngest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "lesson/execute",
          data: { lessonId: lesson.id },
        }),
      });

      if (response.ok) {
        setTimeout(async () => {
          const lessonResponse = await fetch(`/api/lessons/${params.id}`);
          if (lessonResponse.ok) {
            const data = await lessonResponse.json();
            setLesson(data.lesson);
          }
          setRecreating(false);
        }, 5000);
      } else {
        setRecreating(false);
        alert("Failed to recreate sandbox. Please try refreshing the page.");
      }
    } catch (err) {
      console.error("Failed to recreate sandbox:", err);
      setRecreating(false);
      alert("Failed to recreate sandbox. Please try refreshing the page.");
    }
  };

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
              <div className="text-center max-w-lg mx-auto">
                <div className="relative w-40 h-40 mx-auto mb-8">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl animate-bounce">🤖</div>
                  </div>
                  <div className="absolute top-4 left-4 text-2xl animate-ping">
                    ⭐
                  </div>
                  <div className="absolute top-8 right-6 text-xl animate-pulse">
                    ✨
                  </div>
                  <div className="absolute bottom-6 left-6 text-lg animate-bounce">
                    🌟
                  </div>
                  <div className="absolute bottom-4 right-4 text-xl animate-ping">
                    💫
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-purple-700 mb-4 animate-pulse">
                  🎉 Creating Your Amazing Lesson! 🎉
                </h3>
                <p className="text-lg text-gray-700 mb-6">
                  Our smart AI robot is working hard to create something special
                  for:{" "}
                  <strong className="text-purple-600">{lesson.outline}</strong>
                </p>

                <div className="space-y-3 text-left bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg border-4 border-blue-200 mb-6">
                  <div className="flex items-center text-blue-600">
                    <span className="text-2xl mr-3 animate-spin">🧠</span>
                    <span className="text-lg font-semibold">
                      AI is thinking of fun ideas...
                    </span>
                  </div>
                  <div className="flex items-center text-purple-600">
                    <span className="text-2xl mr-3 animate-pulse">🎨</span>
                    <span className="text-lg font-semibold">
                      Adding colors and animations...
                    </span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <span className="text-2xl mr-3 animate-bounce">🎮</span>
                    <span className="text-lg font-semibold">
                      Making it super interactive...
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-200 to-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-700 font-medium">
                    ⚡ <strong>Cool Fact:</strong> Our AI can create thousands
                    of different lesson ideas in just seconds! It&apos;s like
                    having a super creative teacher that never gets tired! 🚀
                  </p>
                </div>

                <p className="text-sm text-gray-500">
                  This usually takes 20-40 seconds... Perfect time to do a
                  little dance! 💃
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
              {sandboxError ? (
                <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl p-12 border-4 border-orange-300">
                  <div className="max-w-lg mx-auto text-center">
                    <div className="text-8xl mb-6 animate-bounce">🤖</div>
                    <h3 className="text-3xl font-bold text-orange-600 mb-4">
                      Oops! Our robot helpers need a break! 🤖
                    </h3>
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                      Sometimes our magical learning machines get a little tired
                      and need to restart. Don&apos;t worry - this happens to
                      everyone!
                    </p>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border-4 border-orange-200 mb-6">
                      <p className="text-gray-700 mb-4">
                        <span className="text-2xl mr-2">💡</span>
                        <strong>What happened?</strong> Our lesson builder is
                        taking a little longer than usual to get ready.
                      </p>
                      <p className="text-gray-600">
                        <span className="text-2xl mr-2">🔄</span>
                        Let&apos;s give it another try!
                      </p>
                    </div>

                    <Button
                      onClick={handleRecreateSandbox}
                      disabled={recreating}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      {recreating ? (
                        <span className="flex items-center">
                          <div className="animate-spin mr-3 text-2xl">🎪</div>
                          <span>Our helpers are working hard...</span>
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <span className="text-2xl mr-2">🚀</span>
                          <span>Let&apos;s Try Again!</span>
                        </span>
                      )}
                    </Button>

                    <div className="mt-6 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl p-4">
                      <p className="text-sm text-gray-700">
                        <span className="text-xl mr-2">⏰</span>
                        <strong>Don&apos;t worry!</strong> We&apos;re giving it
                        15 seconds to get ready. Perfect time to do a little
                        dance! 💃
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="relative bg-gray-50 rounded-lg overflow-hidden"
                  style={{ height: "700px" }}
                >
                  {sandboxLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 z-10">
                      <div className="text-center max-w-lg px-6">
                        <div className="relative w-40 h-40 mx-auto mb-8">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-8xl animate-bounce">🎨</div>
                          </div>
                          <div className="absolute top-4 left-4 text-2xl animate-ping">
                            ⭐
                          </div>
                          <div className="absolute top-8 right-6 text-xl animate-pulse">
                            ✨
                          </div>
                          <div className="absolute bottom-6 left-6 text-lg animate-bounce">
                            🌟
                          </div>
                          <div className="absolute bottom-4 right-4 text-xl animate-ping">
                            💫
                          </div>
                        </div>

                        <h3 className="text-3xl font-bold text-purple-700 mb-4 animate-pulse">
                          🎉 Getting Your Lesson Ready! 🎉
                        </h3>
                        <p className="text-lg text-gray-700 mb-6">
                          Our magical learning helpers are preparing something
                          amazing for you!
                        </p>

                        <div className="space-y-3 text-left bg-white rounded-2xl p-6 shadow-lg border-4 border-yellow-200">
                          <div className="flex items-center text-green-600">
                            <span className="text-2xl mr-3">✅</span>
                            <span className="text-lg font-semibold">
                              Lesson created with love!
                            </span>
                          </div>
                          <div className="flex items-center text-green-600">
                            <span className="text-2xl mr-3">🏗️</span>
                            <span className="text-lg font-semibold">
                              Building your interactive playground!
                            </span>
                          </div>
                          <div className="flex items-center text-purple-600">
                            <span className="text-2xl mr-3 animate-spin">
                              🎪
                            </span>
                            <span className="text-lg font-semibold">
                              Adding fun animations and colors...
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 bg-gradient-to-r from-yellow-200 to-pink-200 rounded-xl p-4">
                          <p className="text-sm text-gray-700 font-medium">
                            🧠 <strong>Fun Fact:</strong> Did you know that
                            learning with colors and animations helps your brain
                            remember things better? That&apos;s why we make
                            everything so colorful! 🌈
                          </p>
                        </div>

                        <div className="mt-6">
                          <div className="text-4xl font-bold text-purple-600 mb-2">
                            {countdown}
                          </div>
                          <p className="text-gray-600">
                            {countdown > 10
                              ? "Getting everything ready..."
                              : countdown > 5
                              ? "Almost ready!"
                              : "Just a few more seconds!"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={lesson.sandbox_url}
                      className="w-full h-full border-0"
                      title="Interactive Lesson"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      onError={() => {
                        console.error(
                          "Iframe failed to load - sandbox might be dead"
                        );
                        setSandboxError(true);
                      }}
                    />
                  )}
                </div>
              )}

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
                      This interactive lesson runs in a live E2B sandbox with a{" "}
                      <strong>24-hour lifetime</strong>. You can interact with
                      all elements. If the sandbox expires, just click the
                      restart button above!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="py-16">
              <div className="text-center max-w-lg mx-auto">
                <div className="relative w-40 h-40 mx-auto mb-8">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl animate-bounce">🎨</div>
                  </div>
                  <div className="absolute top-4 left-4 text-2xl animate-ping">
                    ⭐
                  </div>
                  <div className="absolute top-8 right-6 text-xl animate-pulse">
                    ✨
                  </div>
                  <div className="absolute bottom-6 left-6 text-lg animate-bounce">
                    🌟
                  </div>
                  <div className="absolute bottom-4 right-4 text-xl animate-ping">
                    💫
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-purple-700 mb-4 animate-pulse">
                  🎉 Getting Your Lesson Ready! 🎉
                </h3>
                <p className="text-lg text-gray-700 mb-6">
                  Our magical learning helpers are preparing something amazing
                  for you!
                </p>

                <div className="space-y-3 text-left bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border-4 border-purple-200 mb-6">
                  <div className="flex items-center text-green-600">
                    <span className="text-2xl mr-3">✅</span>
                    <span className="text-lg font-semibold">
                      Lesson created with love!
                    </span>
                  </div>
                  <div className="flex items-center text-purple-600">
                    <span className="text-2xl mr-3 animate-spin">🎪</span>
                    <span className="text-lg font-semibold">
                      Building your interactive playground...
                    </span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <span className="text-2xl mr-3 animate-pulse">🎨</span>
                    <span className="text-lg font-semibold">
                      Adding fun animations and colors...
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-200 to-pink-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700 font-medium">
                    🧠 <strong>Fun Fact:</strong> Did you know that learning
                    with colors and animations helps your brain remember things
                    better? That&apos;s why we make everything so colorful! 🌈
                  </p>
                </div>

                <div className="mt-6">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {countdown}
                  </div>
                  <p className="text-gray-600">
                    {countdown > 10
                      ? "Getting everything ready..."
                      : countdown > 5
                      ? "Almost ready!"
                      : "Just a few more seconds!"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
