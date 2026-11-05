import { supabase, isSupabaseConfigured, getSupabaseAdminClient } from "./client";
import { getAllProfiles, Profile } from "./supabase";

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

export interface UserProgressRecord {
  id?: string;
  user_id: string;
  lesson_id: string;
  course_slug?: string;
  started_at?: string;
  last_active_at?: string;
  completed_at?: string | null;
  is_completed?: boolean;
}

export interface LearnerProgressItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  completedCount: number;
  startedCount: number;
  totalLessons: number;
  progressPercent: number;
  status: "Completed" | "In Progress" | "Not Started";
  lastActiveAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  courseSlug: string;
  courseTitle: string;
  source: string;
}

export interface LearnerActivityMetrics {
  enrolledLearners: number;
  startedLearning: number;
  notStarted: number;
  inProgress: number;
  completed: number;
}

export const COURSE_LESSONS_INFO: Record<string, { title: string; totalLessons: number; lessonPrefix: string }> = {
  "ai-virtual-influencers": {
    title: "AI & Virtual Influencers",
    totalLessons: 19,
    lessonPrefix: "les-ai-",
  },
  "content-clipping": {
    title: "Content Clipping & Short-Form Video",
    totalLessons: 6,
    lessonPrefix: "les-clip-",
  },
  "live-streaming": {
    title: "Live Streaming & Broadcast Engineering",
    totalLessons: 2,
    lessonPrefix: "les-stream-",
  },
  "youtube-automation": {
    title: "Faceless YouTube Automation",
    totalLessons: 2,
    lessonPrefix: "les-yt-",
  },
};

/**
 * Determines which learning pathway a lesson belongs to
 */
export function getLessonPathway(lessonId: string): string {
  if (lessonId.startsWith("les-ai-")) return "ai-virtual-influencers";
  if (lessonId.startsWith("les-clip-")) return "content-clipping";
  if (lessonId.startsWith("les-stream-")) return "live-streaming";
  if (lessonId.startsWith("les-yt-")) return "youtube-automation";
  return "ai-virtual-influencers";
}

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

/**
 * Records that a learner has opened/viewed a lesson.
 * Crucial rules:
 * - Does NOT create duplicate records (uses unique user_id + lesson_id constraint).
 * - Reopening a completed lesson NEVER resets its completion status.
 * - Updates last_active_at timestamp.
 */
export async function recordLessonOpen(
  lessonId: string,
  courseSlug: string = "ai-virtual-influencers",
  userOverride?: { id: string; email?: string; name?: string } | null
): Promise<void> {
  const now = new Date().toISOString();

  let user = userOverride;
  if (!user?.id && supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        user = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "Learner",
        };
      }
    } catch {
      // offline
    }
  }

  const userId = user?.id || "anonymous-learner";
  const userEmail = (user?.email || "student@skill2bills.com").toLowerCase().trim();
  const userName = user?.name || userEmail.split("@")[0] || "Learner";

  // 1. Resilient local activity storage update
  try {
    const localKey = `skill2bills_user_progress_${userId}`;
    const existingRaw = localStorage.getItem(localKey);
    const existing: Record<string, any> = existingRaw ? JSON.parse(existingRaw) : {};

    const current = existing[lessonId] || {};
    const isAlreadyCompleted = Boolean(current.isCompleted || current.completedAt || current.completed_at);

    existing[lessonId] = {
      userId,
      userEmail,
      userName,
      lessonId,
      courseSlug,
      startedAt: current.startedAt || current.started_at || now,
      lastActiveAt: now,
      isCompleted: isAlreadyCompleted,
      completedAt: isAlreadyCompleted ? (current.completedAt || current.completed_at || now) : null,
    };
    localStorage.setItem(localKey, JSON.stringify(existing));

    // Update global activity map for instant admin viewing
    const allActivityRaw = localStorage.getItem("skill2bills_all_learner_progress") || "{}";
    const allActivity = JSON.parse(allActivityRaw);
    if (!allActivity[userId]) {
      allActivity[userId] = { userId, userEmail, userName, lessons: {} };
    }
    allActivity[userId].userEmail = userEmail;
    allActivity[userId].userName = userName;
    allActivity[userId].lastActiveAt = now;
    allActivity[userId].lessons[lessonId] = existing[lessonId];
    localStorage.setItem("skill2bills_all_learner_progress", JSON.stringify(allActivity));

    // Also update lms progress legacy key
    const lmsProgressRaw = localStorage.getItem("skill2bills_lms_progress_v2");
    const lmsProgress = lmsProgressRaw ? JSON.parse(lmsProgressRaw) : { completedLessonIds: [] };
    lmsProgress.lastActiveLessonId = lessonId;
    localStorage.setItem("skill2bills_lms_progress_v2", JSON.stringify(lmsProgress));

    window.dispatchEvent(new CustomEvent("skill2bills_activity_updated", { detail: { userId, lessonId, now } }));
  } catch {
    // ignore
  }

  // 2. Persist to Supabase user_progress table
  if (isSupabaseConfigured && supabase) {
    try {
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let targetUserId = userId;
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id && UUID_REGEX.test(authData.user.id)) {
          targetUserId = authData.user.id;
        }
      } catch {
        // ignore
      }

      if (!UUID_REGEX.test(targetUserId) && userEmail) {
        try {
          const { data: prof } = await supabase.from("profiles").select("id").eq("email", userEmail).maybeSingle();
          if (prof?.id && UUID_REGEX.test(prof.id)) {
            targetUserId = prof.id;
          }
        } catch {}
      }

      if (targetUserId && UUID_REGEX.test(targetUserId)) {
        // First check if row exists to avoid resetting completed_at
        const { data: existingRows } = await supabase
          .from("user_progress")
          .select("id, completed_at, started_at, is_completed")
          .eq("user_id", targetUserId)
          .eq("lesson_id", lessonId)
          .limit(1);

        const existingRow = existingRows?.[0];

        if (existingRow) {
          // Reopening an existing lesson: update last_active_at without touching completed_at
          const updatePayload: any = {
            last_active_at: now,
          };
          if (!existingRow.started_at) {
            updatePayload.started_at = now;
          }

          const { error: updateErr } = await supabase
            .from("user_progress")
            .update(updatePayload)
            .eq("id", existingRow.id);

          if (updateErr) {
            const adminClient = getSupabaseAdminClient();
            if (adminClient) {
              await adminClient.from("user_progress").update(updatePayload).eq("id", existingRow.id);
            }
          }
        } else {
          // First time opening this lesson: insert with started_at and is_completed = false
          const insertPayload: any = {
            user_id: targetUserId,
            lesson_id: lessonId,
            started_at: now,
            last_active_at: now,
            is_completed: false,
            course_slug: courseSlug,
          };

          const { error: insertErr } = await supabase
            .from("user_progress")
            .insert(insertPayload);

          if (insertErr) {
            const adminClient = getSupabaseAdminClient();
            if (adminClient) {
              await adminClient.from("user_progress").insert(insertPayload);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Supabase recordLessonOpen error:", err);
    }
  }
}

/**
 * Records that a learner completed a lesson.
 * Updates the existing progress record without creating duplicates.
 */
export async function recordLessonComplete(
  lessonId: string,
  courseSlug: string = "ai-virtual-influencers",
  userOverride?: { id: string; email?: string; name?: string } | null
): Promise<void> {
  const now = new Date().toISOString();

  let user = userOverride;
  if (!user?.id && supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        user = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "Learner",
        };
      }
    } catch {
      // offline
    }
  }

  const userId = user?.id || "anonymous-learner";
  const userEmail = (user?.email || "student@skill2bills.com").toLowerCase().trim();
  const userName = user?.name || userEmail.split("@")[0] || "Learner";

  // 1. Update local storage
  try {
    const localKey = `skill2bills_user_progress_${userId}`;
    const existingRaw = localStorage.getItem(localKey);
    const existing: Record<string, any> = existingRaw ? JSON.parse(existingRaw) : {};

    const current = existing[lessonId] || {};
    existing[lessonId] = {
      userId,
      userEmail,
      userName,
      lessonId,
      courseSlug,
      startedAt: current.startedAt || current.started_at || now,
      lastActiveAt: now,
      isCompleted: true,
      completedAt: now,
    };
    localStorage.setItem(localKey, JSON.stringify(existing));

    const allActivityRaw = localStorage.getItem("skill2bills_all_learner_progress") || "{}";
    const allActivity = JSON.parse(allActivityRaw);
    if (!allActivity[userId]) {
      allActivity[userId] = { userId, userEmail, userName, lessons: {} };
    }
    allActivity[userId].userEmail = userEmail;
    allActivity[userId].userName = userName;
    allActivity[userId].lastActiveAt = now;
    allActivity[userId].lessons[lessonId] = existing[lessonId];
    localStorage.setItem("skill2bills_all_learner_progress", JSON.stringify(allActivity));

    // Update completedLessonIds in legacy LMS cache
    const lmsProgressRaw = localStorage.getItem("skill2bills_lms_progress_v2");
    const lmsProgress = lmsProgressRaw ? JSON.parse(lmsProgressRaw) : { completedLessonIds: [] };
    const currentCompleted: string[] = lmsProgress.completedLessonIds || [];
    if (!currentCompleted.includes(lessonId)) {
      lmsProgress.completedLessonIds = [...currentCompleted, lessonId];
    }
    lmsProgress.lastActiveLessonId = lessonId;
    localStorage.setItem("skill2bills_lms_progress_v2", JSON.stringify(lmsProgress));

    if (userEmail && userEmail !== userId) {
      try {
        localStorage.setItem(`skill2bills_user_progress_${userEmail}`, JSON.stringify(existing));
      } catch {}
    }

    window.dispatchEvent(new CustomEvent("skill2bills_activity_updated", { detail: { userId, lessonId, now } }));
    window.dispatchEvent(
      new CustomEvent("skill2bills_progress_synced", {
        detail: {
          completedLessonIds: lmsProgress.completedLessonIds,
          lastActiveLessonId: lessonId,
          continueLessonId: lessonId,
        },
      })
    );
  } catch {
    // ignore
  }

  // 2. Persist to Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let targetUserId = userId;
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id && UUID_REGEX.test(authData.user.id)) {
          targetUserId = authData.user.id;
        }
      } catch {
        // ignore
      }

      if (!UUID_REGEX.test(targetUserId) && userEmail) {
        try {
          const { data: prof } = await supabase.from("profiles").select("id").eq("email", userEmail).maybeSingle();
          if (prof?.id && UUID_REGEX.test(prof.id)) {
            targetUserId = prof.id;
          }
        } catch {}
      }

      if (targetUserId && UUID_REGEX.test(targetUserId)) {
        const upsertPayload: any = {
          user_id: targetUserId,
          lesson_id: lessonId,
          completed_at: now,
          last_active_at: now,
          is_completed: true,
          course_slug: courseSlug,
        };

        const { error } = await supabase
          .from("user_progress")
          .upsert(upsertPayload, { onConflict: "user_id,lesson_id" });

        if (error) {
          const adminClient = getSupabaseAdminClient();
          if (adminClient) {
            await adminClient
              .from("user_progress")
              .upsert(upsertPayload, { onConflict: "user_id,lesson_id" });
          }
        }
      }
    } catch (err) {
      console.warn("Supabase recordLessonComplete error:", err);
    }
  }
}

/**
 * Toggles a completed lesson back to incomplete.
 */
export async function recordLessonIncomplete(
  lessonId: string,
  courseSlug: string = "ai-virtual-influencers",
  userOverride?: { id: string; email?: string; name?: string } | null
): Promise<void> {
  const now = new Date().toISOString();
  let user = userOverride;
  if (!user?.id && supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        user = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "Learner",
        };
      }
    } catch {}
  }
  const userId = user?.id || "anonymous-learner";
  const userEmail = (user?.email || "").toLowerCase().trim();

  // 1. Update local storage
  try {
    const localKey = `skill2bills_user_progress_${userId}`;
    const existingRaw = localStorage.getItem(localKey);
    if (existingRaw) {
      const existing = JSON.parse(existingRaw);
      if (existing[lessonId]) {
        existing[lessonId].isCompleted = false;
        existing[lessonId].completedAt = null;
        existing[lessonId].lastActiveAt = now;
        localStorage.setItem(localKey, JSON.stringify(existing));
      }
    }

    const allActivityRaw = localStorage.getItem("skill2bills_all_learner_progress") || "{}";
    const allActivity = JSON.parse(allActivityRaw);
    if (allActivity[userId]?.lessons?.[lessonId]) {
      allActivity[userId].lessons[lessonId].isCompleted = false;
      allActivity[userId].lessons[lessonId].completedAt = null;
      allActivity[userId].lessons[lessonId].lastActiveAt = now;
      allActivity[userId].lastActiveAt = now;
      localStorage.setItem("skill2bills_all_learner_progress", JSON.stringify(allActivity));
    }

    let nextCompletedIds: string[] = [];
    const lmsProgressRaw = localStorage.getItem("skill2bills_lms_progress_v2");
    if (lmsProgressRaw) {
      const lmsProgress = JSON.parse(lmsProgressRaw);
      lmsProgress.completedLessonIds = (lmsProgress.completedLessonIds || []).filter((id: string) => id !== lessonId);
      nextCompletedIds = lmsProgress.completedLessonIds;
      localStorage.setItem("skill2bills_lms_progress_v2", JSON.stringify(lmsProgress));
    }

    window.dispatchEvent(new CustomEvent("skill2bills_activity_updated", { detail: { userId, lessonId, now } }));
    window.dispatchEvent(
      new CustomEvent("skill2bills_progress_synced", {
        detail: {
          completedLessonIds: nextCompletedIds,
          lastActiveLessonId: lessonId,
          continueLessonId: lessonId,
        },
      })
    );
  } catch {}

  // 2. Update Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let targetUserId = userId;
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id && UUID_REGEX.test(authData.user.id)) {
          targetUserId = authData.user.id;
        }
      } catch {
        // ignore
      }

      if (!UUID_REGEX.test(targetUserId) && userEmail) {
        try {
          const { data: prof } = await supabase.from("profiles").select("id").eq("email", userEmail).maybeSingle();
          if (prof?.id && UUID_REGEX.test(prof.id)) {
            targetUserId = prof.id;
          }
        } catch {}
      }

      if (targetUserId && UUID_REGEX.test(targetUserId)) {
        const { error } = await supabase
          .from("user_progress")
          .update({ is_completed: false, completed_at: null, last_active_at: now })
          .eq("user_id", targetUserId)
          .eq("lesson_id", lessonId);

        if (error) {
          const adminClient = getSupabaseAdminClient();
          if (adminClient) {
            await adminClient
              .from("user_progress")
              .update({ is_completed: false, completed_at: null, last_active_at: now })
              .eq("user_id", targetUserId)
              .eq("lesson_id", lessonId);
          }
        }
      }
    } catch {}
  }
}

/**
 * Legacy mark complete wrapper
 */
export async function markLessonComplete(lessonId: string): Promise<void> {
  await recordLessonComplete(lessonId);
}

/**
 * Legacy mark incomplete wrapper
 */
export async function markLessonIncomplete(lessonId: string): Promise<void> {
  await recordLessonIncomplete(lessonId);
}

export async function getCompletedLessonIds(courseId: string): Promise<Set<string>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("lesson_id, is_completed, completed_at")
      .eq("user_id", user.id);

    if (!error && data) {
      const completed = data
        .filter((d: any) => d.is_completed === true || d.completed_at !== null)
        .map((d: any) => d.lesson_id);
      return new Set(completed);
    }
  } catch {
    // fallback
  }

  // Local fallback
  try {
    const lmsProgress = JSON.parse(localStorage.getItem("skill2bills_lms_progress_v2") || "{}");
    return new Set(lmsProgress.completedLessonIds || []);
  } catch {
    return new Set();
  }
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

/**
 * Comprehensive Learner Activity Tracker for Admin Dashboard.
 * Queries Supabase user_progress and profiles, merges with local activity,
 * and calculates exact metrics and per-learner progress for any selected pathway.
 */
export async function getAllLearnerActivity(
  targetCourseSlug: string = "ai-virtual-influencers"
): Promise<{ metrics: LearnerActivityMetrics; learners: LearnerProgressItem[]; items: LearnerProgressItem[] }> {
  const normalizedSlug = targetCourseSlug === "all" ? "all" : (targetCourseSlug || "ai-virtual-influencers");
  const courseInfo = COURSE_LESSONS_INFO[normalizedSlug] || COURSE_LESSONS_INFO["ai-virtual-influencers"];
  const totalLessonsForPathway = normalizedSlug === "all"
    ? Object.values(COURSE_LESSONS_INFO).reduce((sum, c) => sum + c.totalLessons, 0)
    : courseInfo.totalLessons;

  // 1. Fetch all registered learner profiles
  const profiles: Profile[] = await getAllProfiles();

  // 2. Fetch progress records from Supabase user_progress
  const progressRecords: any[] = [];
  const seenRecordKeys = new Set<string>();

  if (isSupabaseConfigured && supabase) {
    // A. Check if Service Role admin client is available
    const adminClient = getSupabaseAdminClient();
    if (adminClient) {
      try {
        const { data: adminRows, error } = await adminClient
          .from("user_progress")
          .select("*");
        if (!error && adminRows) {
          adminRows.forEach((r: any) => {
            const key = `${r.user_id}-${r.lesson_id}`;
            if (!seenRecordKeys.has(key)) {
              seenRecordKeys.add(key);
              progressRecords.push(r);
            }
          });
        }
      } catch (err) {
        console.warn("Admin client user_progress query error:", err);
      }
    }

    // B. Check standard client query (merge any records visible to active session)
    try {
      const { data: userRows, error } = await supabase
        .from("user_progress")
        .select("*");
      if (!error && userRows) {
        userRows.forEach((r: any) => {
          const key = `${r.user_id}-${r.lesson_id}`;
          if (!seenRecordKeys.has(key)) {
            seenRecordKeys.add(key);
            progressRecords.push(r);
          }
        });
      }
    } catch (err) {
      console.warn("Standard client user_progress query error:", err);
    }
  }

  // 3. Merge local storage progress caches
  try {
    const allActivityRaw = localStorage.getItem("skill2bills_all_learner_progress") || "{}";
    const allActivity = JSON.parse(allActivityRaw);
    Object.values(allActivity).forEach((userAct: any) => {
      if (userAct?.lessons) {
        Object.values(userAct.lessons).forEach((l: any) => {
          const key = `${l.userId}-${l.lessonId}`;
          if (!seenRecordKeys.has(key)) {
            seenRecordKeys.add(key);
            progressRecords.push({
              user_id: l.userId,
              user_email: l.userEmail || userAct?.userEmail,
              user_name: l.userName || userAct?.userName,
              lesson_id: l.lessonId,
              course_slug: l.courseSlug,
              started_at: l.startedAt,
              last_active_at: l.lastActiveAt,
              completed_at: l.completedAt,
              is_completed: l.isCompleted,
            });
          }
        });
      }
    });

    // Also check current active session in localStorage & Supabase Auth
    let currentSessionEmail = "christianaboagye06@gmail.com";
    let currentSessionId = "christianaboagye06@gmail.com";
    let currentSessionName = "Christian";

    try {
      const authUserRaw =
        localStorage.getItem("skill2bills_auth_user_v2") ||
        localStorage.getItem("skill2bills_auth_user_v1");
      if (authUserRaw) {
        const au = JSON.parse(authUserRaw);
        if (au?.email) currentSessionEmail = au.email.toLowerCase().trim();
        if (au?.id) currentSessionId = au.id;
        if (au?.name) currentSessionName = au.name;
      }
    } catch {
      // ignore
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: suData } = await supabase.auth.getUser();
        if (suData?.user) {
          if (suData.user.email) currentSessionEmail = suData.user.email.toLowerCase().trim();
          if (suData.user.id) currentSessionId = suData.user.id;
          if (suData.user.user_metadata?.name) currentSessionName = suData.user.user_metadata.name;
        }
      } catch {
        // ignore
      }
    }

    const lmsProgressRaw = localStorage.getItem("skill2bills_lms_progress_v2");
    if (lmsProgressRaw) {
      try {
        const lms = JSON.parse(lmsProgressRaw);
        const completedIds: string[] = lms.completedLessonIds || [];
        const nowIso = new Date().toISOString();

        completedIds.forEach((lesId) => {
          const pathway = getLessonPathway(lesId);
          const targetKeys = [
            `${currentSessionId}-${lesId}`,
            `${currentSessionEmail}-${lesId}`,
          ];

          // If session is an admin account, guarantee both common alias spellings connect
          if (
            currentSessionEmail === "christianaboagye06@gmail.com" ||
            currentSessionEmail === "christianaaboagye06@gmail.com"
          ) {
            targetKeys.push(`christianaboagye06@gmail.com-${lesId}`);
            targetKeys.push(`christianaaboagye06@gmail.com-${lesId}`);
          }

          targetKeys.forEach((key) => {
            if (!seenRecordKeys.has(key)) {
              seenRecordKeys.add(key);
              const targetUid = key.substring(0, key.lastIndexOf(`-${lesId}`));
              progressRecords.push({
                user_id: targetUid,
                user_email: currentSessionEmail,
                user_name: currentSessionName,
                lesson_id: lesId,
                course_slug: pathway,
                started_at: nowIso,
                last_active_at: nowIso,
                completed_at: nowIso,
                is_completed: true,
              });
            }
          });
        });
      } catch {
        // ignore
      }
    }

    // Also check individual user progress keys in local storage
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("skill2bills_user_progress_")) {
        const uid = k.replace("skill2bills_user_progress_", "");
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          Object.values(parsed).forEach((l: any) => {
            const key = `${uid}-${l.lessonId}`;
            if (!seenRecordKeys.has(key)) {
              seenRecordKeys.add(key);
              progressRecords.push({
                user_id: uid,
                user_email: l.userEmail,
                user_name: l.userName,
                lesson_id: l.lessonId,
                course_slug: l.courseSlug,
                started_at: l.startedAt,
                last_active_at: l.lastActiveAt,
                completed_at: l.completedAt,
                is_completed: l.isCompleted,
              });
            }
          });
        }
      }
    }
  } catch {
    // ignore
  }

  // 4. Index progress records by user ID and email
  const userProgressMap = new Map<string, any[]>();
  progressRecords.forEach((rec) => {
    const uid = rec.user_id;
    if (!userProgressMap.has(uid)) {
      userProgressMap.set(uid, []);
    }
    userProgressMap.get(uid)!.push(rec);
  });

  // 5. Build learner items
  const learners: LearnerProgressItem[] = [];

  // Guarantee non-empty list by using all registered profiles
  profiles.forEach((profile) => {
    const userRecords: any[] = [];
    if (userProgressMap.has(profile.id)) {
      userRecords.push(...userProgressMap.get(profile.id)!);
    }

    // Union merge by email as well to combine records logged under auth UUID or email
    if (profile.email) {
      const emailLower = profile.email.toLowerCase().trim();
      for (const [uid, recs] of userProgressMap.entries()) {
        if (uid === profile.id) continue;
        recs.forEach((r) => {
          if (
            (r.user_email && r.user_email.toLowerCase().trim() === emailLower) ||
            uid.toLowerCase().trim() === emailLower
          ) {
            userRecords.push(r);
          }
        });
      }
    }

    // Filter records belonging strictly to target pathway
    const pathwayRecords = userRecords.filter((rec) => {
      if (normalizedSlug === "all") return true;
      const lessonPathway = getLessonPathway(rec.lesson_id);
      return lessonPathway === normalizedSlug || rec.course_slug === normalizedSlug;
    });

    // Completed count: strictly lessons marked completed or with valid completed_at
    const completedSet = new Set<string>();
    const startedSet = new Set<string>();
    let latestActivityTimestamp: number = 0;
    let earliestStartTimestamp: number = 0;
    let latestCompletedTimestamp: number = 0;

    pathwayRecords.forEach((r) => {
      const isDone = r.is_completed === true || Boolean(r.completed_at);
      if (isDone) {
        completedSet.add(r.lesson_id);
      }
      startedSet.add(r.lesson_id);

      const tsActive = r.last_active_at ? new Date(r.last_active_at).getTime() : 0;
      const tsDone = r.completed_at ? new Date(r.completed_at).getTime() : 0;
      const tsStart = r.started_at ? new Date(r.started_at).getTime() : 0;

      const newest = Math.max(tsActive, tsDone, tsStart);
      if (newest > latestActivityTimestamp) {
        latestActivityTimestamp = newest;
      }
      if (tsStart > 0 && (earliestStartTimestamp === 0 || tsStart < earliestStartTimestamp)) {
        earliestStartTimestamp = tsStart;
      }
      if (tsDone > latestCompletedTimestamp) {
        latestCompletedTimestamp = tsDone;
      }
    });

    const completedCount = completedSet.size;
    const startedCount = startedSet.size;
    const progressPercent = totalLessonsForPathway > 0
      ? Math.min(100, Math.round((completedCount / totalLessonsForPathway) * 100))
      : 0;

    // Determine status
    let status: "Completed" | "In Progress" | "Not Started" = "Not Started";
    if (completedCount >= totalLessonsForPathway && totalLessonsForPathway > 0) {
      status = "Completed";
    } else if (startedCount > 0 || completedCount > 0) {
      status = "In Progress";
    }

    // If never opened a lesson, lastActive is null
    const lastActiveAt = latestActivityTimestamp > 0
      ? new Date(latestActivityTimestamp).toISOString()
      : null;

    const startedAt = earliestStartTimestamp > 0
      ? new Date(earliestStartTimestamp).toISOString()
      : null;

    const completedAt = latestCompletedTimestamp > 0 && status === "Completed"
      ? new Date(latestCompletedTimestamp).toISOString()
      : null;

    learners.push({
      id: profile.id,
      userId: profile.id,
      name: profile.name || profile.email.split("@")[0],
      email: profile.email,
      role: profile.role || "student",
      completedCount,
      startedCount,
      totalLessons: totalLessonsForPathway,
      progressPercent,
      status,
      lastActiveAt,
      startedAt,
      completedAt,
      courseSlug: normalizedSlug,
      courseTitle: courseInfo.title,
      source: profile.source || "Supabase",
    });
  });

  // Also include any learners found in activity who are not yet in profiles
  const processedUserIds = new Set(learners.map((l) => l.userId));
  const processedEmails = new Set(learners.map((l) => l.email.toLowerCase().trim()));

  for (const [uid, userRecords] of userProgressMap.entries()) {
    const firstRec = userRecords[0] || {};
    const email = (firstRec.user_email || `${uid}@skill2bills.com`).toLowerCase().trim();
    if (processedUserIds.has(uid) || processedEmails.has(email)) continue;
    processedUserIds.add(uid);
    processedEmails.add(email);

    const name = firstRec.user_name || email.split("@")[0] || "Learner";

    const pathwayRecords = userRecords.filter((rec) => {
      if (normalizedSlug === "all") return true;
      const lessonPathway = getLessonPathway(rec.lesson_id);
      return lessonPathway === normalizedSlug || rec.course_slug === normalizedSlug;
    });

    const completedSet = new Set<string>();
    const startedSet = new Set<string>();
    let latestActivityTimestamp: number = 0;
    let earliestStartTimestamp: number = 0;
    let latestCompletedTimestamp: number = 0;

    pathwayRecords.forEach((r) => {
      const isDone = r.is_completed === true || Boolean(r.completed_at);
      if (isDone) completedSet.add(r.lesson_id);
      startedSet.add(r.lesson_id);

      const tsActive = r.last_active_at ? new Date(r.last_active_at).getTime() : 0;
      const tsDone = r.completed_at ? new Date(r.completed_at).getTime() : 0;
      const tsStart = r.started_at ? new Date(r.started_at).getTime() : 0;

      const newest = Math.max(tsActive, tsDone, tsStart);
      if (newest > latestActivityTimestamp) latestActivityTimestamp = newest;
      if (tsStart > 0 && (earliestStartTimestamp === 0 || tsStart < earliestStartTimestamp)) {
        earliestStartTimestamp = tsStart;
      }
      if (tsDone > latestCompletedTimestamp) latestCompletedTimestamp = tsDone;
    });

    const completedCount = completedSet.size;
    const startedCount = startedSet.size;
    const progressPercent = totalLessonsForPathway > 0
      ? Math.min(100, Math.round((completedCount / totalLessonsForPathway) * 100))
      : 0;

    let status: "Completed" | "In Progress" | "Not Started" = "Not Started";
    if (completedCount >= totalLessonsForPathway && totalLessonsForPathway > 0) {
      status = "Completed";
    } else if (startedCount > 0 || completedCount > 0) {
      status = "In Progress";
    }

    const lastActiveAt = latestActivityTimestamp > 0
      ? new Date(latestActivityTimestamp).toISOString()
      : null;

    const startedAt = earliestStartTimestamp > 0
      ? new Date(earliestStartTimestamp).toISOString()
      : null;

    const completedAt = latestCompletedTimestamp > 0 && status === "Completed"
      ? new Date(latestCompletedTimestamp).toISOString()
      : null;

    learners.push({
      id: uid,
      userId: uid,
      name,
      email,
      role: "student",
      completedCount,
      startedCount,
      totalLessons: totalLessonsForPathway,
      progressPercent,
      status,
      lastActiveAt,
      startedAt,
      completedAt,
      courseSlug: normalizedSlug,
      courseTitle: courseInfo.title,
      source: "Active Learner",
    });
  }

  // Calculate metrics
  const enrolledLearners = learners.length;
  const startedLearning = learners.filter((l) => l.startedCount > 0 || l.completedCount > 0).length;
  const notStarted = learners.filter((l) => l.status === "Not Started").length;
  const inProgress = learners.filter((l) => l.status === "In Progress").length;
  const completed = learners.filter((l) => l.status === "Completed").length;

  const metrics: LearnerActivityMetrics = {
    enrolledLearners,
    startedLearning,
    notStarted,
    inProgress,
    completed,
  };

  // Sort learners: active learners with newest activity first, then by completed count
  learners.sort((a, b) => {
    // Admin on top if desired, or sort by last active date
    if (a.lastActiveAt && b.lastActiveAt) {
      return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
    }
    if (a.lastActiveAt && !b.lastActiveAt) return -1;
    if (!a.lastActiveAt && b.lastActiveAt) return 1;
    return b.completedCount - a.completedCount;
  });

  return { metrics, learners, items: learners };
}

