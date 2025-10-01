export interface Lesson {
  id: string;
  title: string;
  outline: string;
  content?: string;
  status: "generating" | "generated" | "failed";
  created_at: string;
  ai_prompt?: string;
  ai_response?: string;
  generation_trace?: any;
}

export interface CreateLessonRequest {
  outline: string;
}

export interface UpdateLessonRequest {
  title?: string;
  outline?: string;
  content?: string;
  status?: "generating" | "generated" | "failed";
  ai_prompt?: string;
  ai_response?: string;
  generation_trace?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
