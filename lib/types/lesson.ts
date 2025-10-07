export interface GenerationTrace {
  step: string;
  timestamp: string;
  details?: string;
  error?: string;
}

export interface Lesson {
  id: string;
  title: string;
  outline: string;
  content?: string;
  status: "generating" | "generated" | "failed";
  created_at: string;
  ai_prompt?: string;
  ai_response?: string;
  generation_trace?: GenerationTrace[];
  sandbox_id?: string;
  sandbox_url?: string;
  executed_at?: string;
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
  generation_trace?: GenerationTrace[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
