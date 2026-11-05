import { supabase, isSupabaseConfigured, getSupabaseAdminClient } from "./superbase/client";
import { findCourseBySlugOrId } from "../components/lms/courseUtils";
import { Lesson } from "../components/lms/types";
import { AuthUser, ADMIN_EMAILS } from "./auth";
import { getLessonPathway } from "./superbase/courses";

export const STORAGE_KEY_PROGRESS = "skill2bills_lms_progress_v2";
export const EVENT_PROGRESS_SYNCED = "skill2bills_progress_synced";

export interface ProgressCacheData {
  completedLessonIds: string[];
  lastActiveLessonId: string | null;
  userEmail?: string;
  userId?: string;
  syncedAt?: string;
}

/**
 * Safely read cached progress from localStorage
 */
export function getUserProgressCache(): ProgressCacheData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
        lastActiveLessonId: parsed.lastActiveLessonId || null,
        userEmail: parsed.userEmail,
        userId: parsed.userId,
        syncedAt: parsed.syncedAt,
      };
    }
  } catch {
    // ignore
  }
  return { completedLessonIds: [], lastActiveLessonId: null };
}

/**
 * Clear cached progress on logout so that another user or guest does not see stale progress
 */
export function clearUserProgressCache(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PROGRESS);
    window.dispatchEvent(
      new CustomEvent(EVENT_PROGRESS_SYNCED, {
        detail: { completedLessonIds: [], lastActiveLessonId: null, continueLessonId: "les-ai-1" },
      })
    );
  } catch {
    // ignore
  }
}

/**
 * Compute the exact lesson where the student should continue:
 * 1. If lastActiveId exists and is incomplete, continue with it.
 * 2. If lastActiveId exists and was completed, continue with the next sequential lesson.
 * 3. Otherwise, pick the first incomplete lesson in the course.
 * 4. If all lessons are completed, pick the last lesson.
 */
export function getContinueLesson(
  courseSlug: string = "ai-virtual-influencers",
  completedIds: string[] = [],
  lastActiveId?: string | null
): Lesson {
  const course = findCourseBySlugOrId(courseSlug);
  const allLessons = course.modules.flatMap((m) => m.lessons);
  if (allLessons.length === 0) {
    return {
      id: "les-ai-1",
      moduleId: "mod-ai-1",
      title: "Introduction",
      duration: "10 mins",
      videoUrl: "",
      orderIndex: 0,
      bodyContent: "",
    };
  }

  const completedSet = new Set(completedIds);

  if (lastActiveId) {
    const activeIndex = allLessons.findIndex((l) => l.id === lastActiveId);
    if (activeIndex !== -1) {
      if (!completedSet.has(lastActiveId)) {
        return allLessons[activeIndex];
      }
      if (activeIndex + 1 < allLessons.length) {
        return allLessons[activeIndex + 1];
      }
    }
  }

  const firstIncomplete = allLessons.find((l) => !completedSet.has(l.id));
  if (firstIncomplete) {
    return firstIncomplete;
  }

  return allLessons[allLessons.length - 1];
}

/**
 * Robust cloud & local progress sync:
 * Fetches user_progress from Supabase across auth UUID and email aliases,
 * merges with local storage caches, pushes any offline completions to the cloud,
 * updates localStorage, and broadcasts an update event.
 */
export async function syncUserProgress(
  user?: AuthUser | { id?: string; email?: string; track?: string } | null
): Promise<{ completedLessonIds: string[]; lastActiveLessonId: string | null; continueLessonId: string }> {
  const cached = getUserProgressCache();
  const cleanEmail = (user?.email || cached.userEmail || "").toLowerCase().trim();
  const trackSlug = user?.track || "ai-virtual-influencers";

  if (!user && !cleanEmail) {
    const fallbackContinue = getContinueLesson(trackSlug, cached.completedLessonIds, cached.lastActiveLessonId);
    return {
      completedLessonIds: cached.completedLessonIds,
      lastActiveLessonId: cached.lastActiveLessonId,
      continueLessonId: fallbackContinue.id,
    };
  }

  let realAuthUserId: string | null = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        realAuthUserId = authData.user.id;
      }
    } catch {
      // offline
    }
  }

  const candidateIds = new Set<string>();
  if (user?.id) candidateIds.add(user.id);
  if (realAuthUserId) candidateIds.add(realAuthUserId);
  if (cleanEmail) candidateIds.add(cleanEmail);

  if (ADMIN_EMAILS.includes(cleanEmail)) {
    ADMIN_EMAILS.forEach((adm) => candidateIds.add(adm.toLowerCase().trim()));
  }

  const cloudCompletedIds = new Set<string>();
  let latestLessonId: string | null = cached.lastActiveLessonId;
  let latestTimestamp = 0;

  // 1. Fetch from Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      // A. Query standard client
      const idsArray = Array.from(candidateIds);
      let query = supabase.from("user_progress").select("*");
      if (idsArray.length === 1) {
        query = query.eq("user_id", idsArray[0]);
      } else {
        query = query.in("user_id", idsArray);
      }

      const { data: progressRows, error: progressErr } = await query;
      if (!progressErr && progressRows) {
        progressRows.forEach((r: any) => {
          const isDone = r.is_completed === true || Boolean(r.completed_at);
          if (isDone) {
            cloudCompletedIds.add(r.lesson_id);
          }

          const ts = Math.max(
            r.last_active_at ? new Date(r.last_active_at).getTime() : 0,
            r.completed_at ? new Date(r.completed_at).getTime() : 0,
            r.started_at ? new Date(r.started_at).getTime() : 0
          );
          if (ts > latestTimestamp) {
            latestTimestamp = ts;
            latestLessonId = r.lesson_id;
          }
        });
      }

      // B. Query admin client if available (for complete admin roster sync)
      const adminClient = getSupabaseAdminClient();
      if (adminClient && idsArray.length > 0) {
        try {
          const { data: adminRows } = await adminClient
            .from("user_progress")
            .select("*")
            .in("user_id", idsArray);

          if (adminRows) {
            adminRows.forEach((r: any) => {
              const isDone = r.is_completed === true || Boolean(r.completed_at);
              if (isDone) {
                cloudCompletedIds.add(r.lesson_id);
              }
              const ts = Math.max(
                r.last_active_at ? new Date(r.last_active_at).getTime() : 0,
                r.completed_at ? new Date(r.completed_at).getTime() : 0,
                r.started_at ? new Date(r.started_at).getTime() : 0
              );
              if (ts > latestTimestamp) {
                latestTimestamp = ts;
                latestLessonId = r.lesson_id;
              }
            });
          }
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn("Could not fetch user_progress from Supabase:", err);
    }
  }

  // 2. Fetch from local storage caches
  const localCompletedIds = new Set<string>(cached.completedLessonIds);

  candidateIds.forEach((uid) => {
    try {
      const userKey = `skill2bills_user_progress_${uid}`;
      const raw = localStorage.getItem(userKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.values(parsed).forEach((les: any) => {
          if (les?.isCompleted || les?.completedAt) {
            localCompletedIds.add(les.lessonId || les.lesson_id);
          }
        });
      }
    } catch {
      // ignore
    }
  });

  // 3. Union cloud & local
  const unionCompleted = Array.from(new Set([...cloudCompletedIds, ...localCompletedIds]));

  // 4. Promote any local completions up to Supabase if logged in
  if (isSupabaseConfigured && supabase && realAuthUserId) {
    const missingInCloud = unionCompleted.filter((id) => !cloudCompletedIds.has(id));
    if (missingInCloud.length > 0) {
      try {
        const rowsToInsert = missingInCloud.map((id) => ({
          user_id: realAuthUserId,
          lesson_id: id,
          course_slug: getLessonPathway(id),
          is_completed: true,
          completed_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        }));
        await supabase.from("user_progress").upsert(rowsToInsert, { onConflict: "user_id,lesson_id" });
      } catch (err) {
        console.warn("Could not promote local completions to Supabase:", err);
      }
    }
  }

  // 5. Determine continue lesson
  const continueLesson = getContinueLesson(trackSlug, unionCompleted, latestLessonId);

  // 6. Write back to localStorage
  const payloadToCache: ProgressCacheData = {
    completedLessonIds: unionCompleted,
    lastActiveLessonId: continueLesson.id,
    userEmail: cleanEmail,
    userId: realAuthUserId || user?.id,
    syncedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(payloadToCache));

    candidateIds.forEach((uid) => {
      const userKey = `skill2bills_user_progress_${uid}`;
      const existingRaw = localStorage.getItem(userKey);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      unionCompleted.forEach((lid) => {
        if (!existing[lid]) {
          existing[lid] = {
            userId: uid,
            userEmail: cleanEmail,
            lessonId: lid,
            isCompleted: true,
            completedAt: new Date().toISOString(),
          };
        } else {
          existing[lid].isCompleted = true;
        }
      });
      localStorage.setItem(userKey, JSON.stringify(existing));
    });
  } catch {
    // ignore
  }

  // 7. Broadcast sync event to all components
  window.dispatchEvent(
    new CustomEvent(EVENT_PROGRESS_SYNCED, {
      detail: {
        completedLessonIds: unionCompleted,
        lastActiveLessonId: continueLesson.id,
        continueLessonId: continueLesson.id,
        courseSlug: trackSlug,
      },
    })
  );

  return {
    completedLessonIds: unionCompleted,
    lastActiveLessonId: continueLesson.id,
    continueLessonId: continueLesson.id,
  };
}
