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
  content: string;
  status: "generating" | "generated";
  created_at: string;
  updated_at: string;
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
        const mockLesson: Lesson = {
          id: params.id as string,
          title: "10-question pop quiz on Florida",
          outline:
            "A comprehensive quiz covering Florida's geography, history, culture, and notable landmarks",
          content: `// Florida Geography Quiz
import React, { useState } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const FloridaQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const questions: Question[] = [
    {
      id: 1,
      question: "What is the capital of Florida?",
      options: ["Miami", "Orlando", "Tallahassee", "Jacksonville"],
      correct: 2,
      explanation: "Tallahassee has been Florida's capital since 1824."
    },
    {
      id: 2,
      question: "Which body of water borders Florida to the east?",
      options: ["Gulf of Mexico", "Atlantic Ocean", "Caribbean Sea", "Lake Okeechobee"],
      correct: 1,
      explanation: "Florida is bordered by the Atlantic Ocean to the east and the Gulf of Mexico to the west."
    },
    {
      id: 3,
      question: "What is Florida's nickname?",
      options: ["The Sunshine State", "The Orange State", "The Beach State", "The Alligator State"],
      correct: 0,
      explanation: "Florida is known as 'The Sunshine State' due to its warm, sunny climate."
    },
    {
      id: 4,
      question: "Which famous theme park is located in Orlando?",
      options: ["Universal Studios", "Disney World", "SeaWorld", "All of the above"],
      correct: 3,
      explanation: "Orlando is home to Disney World, Universal Studios, and SeaWorld."
    },
    {
      id: 5,
      question: "What is the largest city in Florida by population?",
      options: ["Miami", "Tampa", "Orlando", "Jacksonville"],
      correct: 3,
      explanation: "Jacksonville is Florida's most populous city with over 900,000 residents."
    }
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setQuizComplete(false);
  };

  if (quizComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Complete!</h2>
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-purple-600 mb-2">
            {score}/{questions.length}
          </div>
          <p className="text-gray-600">
            You scored {Math.round((score / questions.length) * 100)}%
          </p>
        </div>
        <div className="space-y-2 mb-6">
          {questions.map((q, index) => (
            <div key={q.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Question {index + 1}</span>
              <span className="text-sm text-gray-600">{q.question}</span>
            </div>
          ))}
        </div>
        <Button 
          onClick={resetQuiz}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          Take Quiz Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Florida Geography Quiz</h1>
        <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {questions[currentQuestion].question}
        </h2>
        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={\`w-full p-4 text-left border-2 rounded-lg transition-colors \${
                selectedAnswer === index
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }\`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {selectedAnswer !== null && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Explanation:</strong> {questions[currentQuestion].explanation}
          </p>
        </div>
      )}

      <Button 
        onClick={handleNext}
        disabled={selectedAnswer === null}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
      >
        {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
      </Button>
    </div>
  );
};

export default FloridaQuiz;`,
          status: "generated",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:35:00Z",
        };

        setLesson(mockLesson);
      } catch (err) {
        setError("Failed to load lesson");
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
            <Badge className="bg-green-100 text-green-800">
              {lesson.status === "generated" ? "Ready" : "Generating..."}
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
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {lesson.status === "generated" ? "Ready" : "Generating..."}
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

                    {/* Rendered Component */}
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
