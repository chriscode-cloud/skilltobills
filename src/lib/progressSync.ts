import { supabase, isSupabaseConfigured, getSupabaseAdminClient } from "./superbase/client";
import { findCourseBySlugOrId } from "../components/lms/courseUtils";
import { Lesson } from "../components/lms/types";
import { AuthUser, ADMIN_EMAILS } from "./auth";
import { getLessonPathway } from "./superbase/courses";

export const STORAGE_KEY_PROGRESS = "skill2bills_lms_progress_v2";
export const EVENT_PROGRESS_SYNCED = "skill2bills_progress_synced";
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
 * Robust cloud & local progress sync (reciprocal across mobile phone, PC, and any browser):
 * 1. Resolves all strictly validated auth UUIDs associated with this user.
 * 2. Fetches user_progress from Supabase without invalid type syntax errors.
 * 3. Unions cloud and local storage records.
 * 4. Pushes any locally completed lessons to Supabase so the other devices immediately have it.
 * 5. Updates localStorage and broadcasts update events to active UI components.
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
      if (authData?.user?.id && UUID_REGEX.test(authData.user.id)) {
        realAuthUserId = authData.user.id;
      }
    } catch {
      // offline
    }
  }

  // Collect strictly validated UUIDs ONLY (never pass non-UUID emails into PostgreSQL uuid columns)
  const validUuids = new Set<string>();
  if (realAuthUserId) validUuids.add(realAuthUserId);
  if (user?.id && UUID_REGEX.test(user.id)) validUuids.add(user.id);

  // Look up profile in Supabase to resolve real UUID
  if (cleanEmail && isSupabaseConfigured && supabase) {
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (prof?.id && UUID_REGEX.test(prof.id)) {
        validUuids.add(prof.id);
      }
    } catch {
      // ignore
    }
  }

  // Look up auth user via admin client if available
  const adminClient = getSupabaseAdminClient();
  if (adminClient && cleanEmail) {
    try {
      const { data: listRes } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listRes?.users) {
        listRes.users.forEach((u: any) => {
          const ue = u.email?.toLowerCase().trim();
          if (ue === cleanEmail && UUID_REGEX.test(u.id)) {
            validUuids.add(u.id);
          }
          if (ADMIN_EMAILS.includes(cleanEmail) && ue && ADMIN_EMAILS.includes(ue) && UUID_REGEX.test(u.id)) {
            validUuids.add(u.id);
          }
        });
      }
    } catch {
      // ignore
    }
  }

  const cloudCompletedIds = new Set<string>();
  let latestLessonId: string | null = cached.lastActiveLessonId;
  let latestTimestamp = 0;

  const uuidList = Array.from(validUuids);

  // 1. Fetch from Supabase using strictly validated UUIDs
  if (isSupabaseConfigured && supabase && uuidList.length > 0) {
    try {
      // A. Query standard client
      let query = supabase.from("user_progress").select("*");
      if (uuidList.length === 1) {
        query = query.eq("user_id", uuidList[0]);
      } else {
        query = query.in("user_id", uuidList);
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

      // B. Query admin client if available
      if (adminClient) {
        try {
          const { data: adminRows } = await adminClient
            .from("user_progress")
            .select("*")
            .in("user_id", uuidList);

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

  // Check user ID and email local keys
  const localKeysToCheck = new Set<string>();
  if (user?.id) localKeysToCheck.add(user.id);
  if (realAuthUserId) localKeysToCheck.add(realAuthUserId);
  if (cleanEmail) localKeysToCheck.add(cleanEmail);
  uuidList.forEach((uid) => localKeysToCheck.add(uid));

  localKeysToCheck.forEach((uid) => {
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

  // 3. Union cloud & local (cross-device source of truth)
  const unionCompleted = Array.from(new Set([...cloudCompletedIds, ...localCompletedIds]));

  // 4. Promote any local completions up to Supabase so other devices receive them
  const activeTargetUuid = (realAuthUserId && UUID_REGEX.test(realAuthUserId)) ? realAuthUserId : uuidList[0];
  if (isSupabaseConfigured && supabase && activeTargetUuid) {
    const missingInCloud = unionCompleted.filter((id) => !cloudCompletedIds.has(id));
    if (missingInCloud.length > 0) {
      try {
        const rowsToInsert = missingInCloud.map((id) => ({
          user_id: activeTargetUuid,
          lesson_id: id,
          course_slug: getLessonPathway(id),
          is_completed: true,
          completed_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        }));

        const { error: upsertErr } = await supabase
          .from("user_progress")
          .upsert(rowsToInsert, { onConflict: "user_id,lesson_id" });

        if (upsertErr && adminClient) {
          await adminClient
            .from("user_progress")
            .upsert(rowsToInsert, { onConflict: "user_id,lesson_id" });
        }
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
    userId: activeTargetUuid || user?.id,
    syncedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(payloadToCache));

    localKeysToCheck.forEach((uid) => {
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

/**
 * Enables cross-device reciprocal synchronization:
 * Whenever the user switches back to this tab / window on phone or PC,
 * or on an 8-second background heartbeat, it pulls the latest progress
 * from Supabase so both devices stay in sync reciprocally.
 */
let isCrossDeviceSyncInitialized = false;
export function initCrossDeviceProgressSync(userProvider: () => AuthUser | null): () => void {
  if (typeof window === "undefined" || isCrossDeviceSyncInitialized) {
    return () => {};
  }
  isCrossDeviceSyncInitialized = true;

  const triggerSync = () => {
    const currentUser = userProvider();
    if (currentUser) {
      syncUserProgress(currentUser).catch(() => {});
    }
  };

  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      triggerSync();
    }
  };

  window.addEventListener("focus", triggerSync);
  document.addEventListener("visibilitychange", handleVisibility);

  // Background heartbeat poll every 8 seconds to guarantee cross-device sync if user leaves both open
  const interval = setInterval(triggerSync, 8000);

  return () => {
    window.removeEventListener("focus", triggerSync);
    document.removeEventListener("visibilitychange", handleVisibility);
    clearInterval(interval);
    isCrossDeviceSyncInitialized = false;
  };
}
