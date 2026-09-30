export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface LessonResource {
  name: string;
  type: "template" | "link" | "prompt" | "download";
  url?: string;
  content?: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  duration: string;
  videoUrl: string; // YouTube Video ID or embed URL
  orderIndex: number;
  bodyContent: string;
  resources?: LessonResource[];
  quiz?: QuizQuestion;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  badge: string;
  discordUrl?: string;
  modules: Module[];
}

export interface UserProgressState {
  completedLessonIds: string[];
  lastActiveLessonId?: string;
}
