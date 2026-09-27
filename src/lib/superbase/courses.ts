// src/lib/courses.ts
// Read access to courses/modules/lessons (all public per RLS),
// plus per-user progress tracking against user_progress.

import { supabase } from "./client";

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  badge: string | null;
  created_at: string;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  duration: string | null;
  video_url: string;
  body_content: string | null;
  quiz_json: unknown;
  resources_json: unknown;
  order_index: number;
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
};

export type ModuleWithLessons = Module & { lessons: Lesson[] };
export type CourseWithModules = Course & { modules: ModuleWithLessons[] };


export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as Course[];
}


export async function getCourseBySlug(slug: string): Promise<CourseWithModules | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("*, modules(*, lessons(*))")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const course = data as CourseWithModules;
  course.modules.sort((a, b) => a.order_index - b.order_index);
  course.modules.forEach((m) =>
    m.lessons.sort((a, b) => a.order_index - b.order_index)
  );

  return course;
}


export async function getLesson(lessonId: string): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .maybeSingle();

  if (error) throw error;
  return data as Lesson | null;
}



export async function markLessonComplete(lessonId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to track progress.");

  const { error } = await supabase
    .from("user_progress")
    .upsert(
      { user_id: user.id, lesson_id: lessonId },
      { onConflict: "user_id,lesson_id", ignoreDuplicates: true }
    );

  if (error) throw error;
}


export async function markLessonIncomplete(lessonId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to track progress.");

  const { error } = await supabase
    .from("user_progress")
    .delete()
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId);

  if (error) throw error;
}

export async function getCompletedLessonIds(courseId: string): Promise<Set<string>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await supabase
    .from("user_progress")
    .select("lesson_id, lessons!inner(module_id, modules!inner(course_id))")
    .eq("user_id", user.id)
    .eq("lessons.modules.course_id", courseId);

  if (error) throw error;
  return new Set((data as { lesson_id: string }[]).map((row) => row.lesson_id));
}


export async function getCourseProgressPercent(course: CourseWithModules): Promise<number> {
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  if (totalLessons === 0) return 0;

  const completed = await getCompletedLessonIds(course.id);
  const completedInCourse = course.modules
    .flatMap((m) => m.lessons)
    .filter((lesson) => completed.has(lesson.id)).length;

  return Math.round((completedInCourse / totalLessons) * 100);
}