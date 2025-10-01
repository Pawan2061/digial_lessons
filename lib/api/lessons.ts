import {
  Lesson,
  CreateLessonRequest,
  UpdateLessonRequest,
} from "@/lib/types/lesson";

const API_BASE = "/api/lessons";

export class LessonsAPI {
  static async getAll(): Promise<Lesson[]> {
    const response = await fetch(API_BASE);

    if (!response.ok) {
      throw new Error("Failed to fetch lessons");
    }

    const data = await response.json();
    return data.lessons;
  }

  static async getById(id: string): Promise<Lesson> {
    const response = await fetch(`${API_BASE}/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Lesson not found");
      }
      throw new Error("Failed to fetch lesson");
    }

    const data = await response.json();
    return data.lesson;
  }

  static async create(lessonData: CreateLessonRequest): Promise<Lesson> {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lessonData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create lesson");
    }

    const data = await response.json();
    return data.lesson;
  }

  static async update(
    id: string,
    updates: UpdateLessonRequest
  ): Promise<Lesson> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update lesson");
    }

    const data = await response.json();
    return data.lesson;
  }
}
