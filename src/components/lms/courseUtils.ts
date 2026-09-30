import { LMS_COURSES } from "./lmsData";
import { Course, Lesson } from "./types";

/**
 * Normalizes any legacy or alternative slug to the canonical course slug
 */
export const normalizeCourseSlug = (raw?: string): string => {
  if (!raw) return "content-clipping";
  const lower = raw.trim().toLowerCase();
  
  const SLUG_ALIASES: Record<string, string> = {
    "clipping-mastery": "content-clipping",
    "content-creation": "content-clipping",
    "course-clipping": "content-clipping",
    "course-clip-mastery": "content-clipping",
    "clipping": "content-clipping",
    
    "ai-influencer": "ai-virtual-influencers",
    "ai-influencers": "ai-virtual-influencers",
    "ai-influncer": "ai-virtual-influencers",
    "ai influncer": "ai-virtual-influencers",
    "ai influencer": "ai-virtual-influencers",
    "ai_influencer": "ai-virtual-influencers",
    "ai_influncer": "ai-virtual-influencers",
    "virtual-influencer": "ai-virtual-influencers",
    "virtual-influencers": "ai-virtual-influencers",
    "course-ai-influencer": "ai-virtual-influencers",
    
    "stream-engineer": "live-streaming",
    "streaming": "live-streaming",
    "live-broadcast": "live-streaming",
    "course-streaming": "live-streaming",
    "course-stream-engine": "live-streaming",
    
    "youtube": "youtube-automation",
    "faceless-youtube": "youtube-automation",
    "course-youtube": "youtube-automation",
  };

  return SLUG_ALIASES[lower] || lower;
};

/**
 * Robustly find a course by slug, alias, or id with guaranteed fallback
 */
export const findCourseBySlugOrId = (identifier?: string): Course => {
  if (!identifier) return LMS_COURSES[0];
  const normalized = normalizeCourseSlug(identifier);
  
  const found = LMS_COURSES.find(
    (c) =>
      c.slug === normalized ||
      c.id === normalized ||
      c.slug === identifier ||
      c.id === identifier
  );

  return found || LMS_COURSES[0];
};

/**
 * Returns the course(s) corresponding to the user's selected track, or default track.
 * Guaranteed to never return empty list so the LMS page never falls back to an error state.
 */
export const getUserEnrolledCourses = (currentUser?: { track?: string } | null): Course[] => {
  const trackIdentifier = currentUser?.track && currentUser.track !== "none" ? currentUser.track : "content-clipping";
  const primary = findCourseBySlugOrId(trackIdentifier);
  return [primary];
};

/**
 * Converts a raw videoUrl (which might be an ID like 'M7lc1UVf-VE', full YouTube URL, or MP4)
 * into a safe, valid embeddable URL that will NEVER trigger a relative-path SPA fallback.
 */
export const getSafeEmbedUrl = (rawUrl?: string): string => {
  if (!rawUrl || !rawUrl.trim()) {
    return "https://www.youtube.com/embed/M7lc1UVf-VE?rel=0&modestbranding=1";
  }

  const trimmed = rawUrl.trim();

  // If already an embed URL
  if (trimmed.includes("youtube.com/embed/") || trimmed.includes("youtube-nocookie.com/embed/")) {
    return trimmed.includes("?") ? `${trimmed}&rel=0` : `${trimmed}?rel=0`;
  }

  // If standard YouTube watch URL
  if (trimmed.includes("youtube.com/watch")) {
    try {
      const urlObj = new URL(trimmed);
      const v = urlObj.searchParams.get("v");
      if (v) {
        return `https://www.youtube.com/embed/${v}?rel=0&modestbranding=1`;
      }
    } catch {
      // parse fallback
    }
  }

  // If short youtu.be URL
  if (trimmed.includes("youtu.be/")) {
    const parts = trimmed.split("youtu.be/")[1]?.split("?")[0];
    if (parts) {
      return `https://www.youtube.com/embed/${parts}?rel=0&modestbranding=1`;
    }
  }

  // If Vimeo
  if (trimmed.includes("vimeo.com/")) {
    const parts = trimmed.split("vimeo.com/")[1]?.split("?")[0];
    if (parts) {
      return `https://player.vimeo.com/video/${parts}`;
    }
  }

  // If it's a plain YouTube Video ID (e.g. "M7lc1UVf-VE" or alphanumeric 8-16 chars)
  if (/^[a-zA-Z0-9_-]{8,16}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}?rel=0&modestbranding=1`;
  }

  // If it's an external absolute URL (https://)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Safety fallback
  return `https://www.youtube.com/embed/M7lc1UVf-VE?rel=0&modestbranding=1`;
};
