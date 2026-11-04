import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  PieChart as PieChartIcon,
  Settings,
  LogOut,
  Search,
  Download,
  ArrowUpRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
  FileSpreadsheet,
  Trash2,
  Mail,
  Compass,
  Sliders,
  Database,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  ShieldCheck,
  Check,
  X,
  MessageSquare,
  Star,
  Key,
  FileText,
  UploadCloud,
  Copy,
  CheckCheck,
  Shield,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import {
  getAllProfiles,
  getAllFeedbacks,
  fetchSupabaseAuthUsers,
  syncAuthUsersToProfiles,
  batchImportEmails,
  DEFAULT_SQL_SYNC_SCRIPT,
  SupabaseProfile,
  FeedbackEntry,
  isSupabaseConfigured,
  supabase,
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  setCustomSupabaseCredentials,
  setCustomServiceRoleKey,
  clearCustomServiceRoleKey,
  clearCustomSupabaseCredentials,
} from "../lib/supabase";
import { COURSE_TRACKS } from "../data/contentData";
import {
  getAllLearnerActivity,
  LearnerProgressItem,
  LearnerActivityMetrics,
  COURSE_LESSONS_INFO,
} from "../lib/superbase/courses";

interface AdminDashboardProps {
  onBackToWebsite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToWebsite }) => {
  const [profiles, setProfiles] = useState<SupabaseProfile[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrackFilter, setSelectedTrackFilter] = useState("all");
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "6M" | "1Y">("6M");
  const [inputUrl, setInputUrl] = useState(supabaseUrl || "");
  const [inputKey, setInputKey] = useState(supabaseAnonKey || "");
  const [inputServiceKey, setInputServiceKey] = useState(supabaseServiceRoleKey || "");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "tracks" | "feedback" | "activity" | "settings">("overview");

  // Learner Activity Tracking State (14-Day AI Content Creation Mini-Launch)
  const [selectedPathway, setSelectedPathway] = useState<string>("ai-virtual-influencers");
  const [learnerActivityList, setLearnerActivityList] = useState<LearnerProgressItem[]>([]);
  const [learnerMetrics, setLearnerMetrics] = useState<LearnerActivityMetrics>({
    enrolledLearners: 0,
    startedLearning: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
  });
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityStatusFilter, setActivityStatusFilter] = useState<"all" | "started" | "not_started" | "in_progress" | "completed">("all");
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newTrack, setNewTrack] = useState(COURSE_TRACKS[0]?.title || "AI & Virtual Influencers");
  const [newGoal, setNewGoal] = useState("Scale my personal brand");
  const [newTime, setNewTime] = useState("5-15");
  const [newExp, setNewExp] = useState("Beginner");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Supabase Auth Sync Hub State
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [batchImportModalOpen, setBatchImportModalOpen] = useState(false);
  const [batchInputText, setBatchInputText] = useState("");
  const [batchTrackChoice, setBatchTrackChoice] = useState("AI & Virtual Influencers");
  const [serviceKeyTesting, setServiceKeyTesting] = useState(false);
  const [serviceKeyMessage, setServiceKeyMessage] = useState("");
  const [authUsersList, setAuthUsersList] = useState<SupabaseProfile[]>([]);
  const [isSyncingToProfiles, setIsSyncingToProfiles] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Load actual profiles & feedback with silent background refresh support
  const fetchProfiles = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [data, fbData] = await Promise.all([
        getAllProfiles(),
        getAllFeedbacks(),
      ]);
      setProfiles((prev) => {
        if (prev.length > 0 && data.length > prev.length) {
          triggerNotice(`🎉 New creator signup recorded! (${data.length} total)`);
        }
        return data;
      });
      setFeedbacks(fbData);
    } catch (err) {
      console.error("Failed to load profiles/feedback in admin:", err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  // Fetch real learner activity from Supabase user_progress & profiles
  const fetchLearnerActivity = async (pathwaySlug = selectedPathway, silent = false) => {
    if (!silent) setActivityLoading(true);
    try {
      const res = await getAllLearnerActivity(pathwaySlug);
      setLearnerActivityList(res.items);
      setLearnerMetrics(res.metrics);
    } catch (err) {
      console.warn("Failed to load learner activity:", err);
    } finally {
      if (!silent) setActivityLoading(false);
    }
  };

  // Sync learner activity on pathway change or custom activity event
  useEffect(() => {
    fetchLearnerActivity(selectedPathway, false);

    const handleActivityUpdated = () => {
      fetchLearnerActivity(selectedPathway, true);
    };

    window.addEventListener("skill2bills_activity_updated", handleActivityUpdated);
    window.addEventListener("skill2bills_profile_updated", handleActivityUpdated);

    // Auto-refresh learner metrics every 5 seconds to ensure live sync
    const activityPoll = setInterval(() => {
      fetchLearnerActivity(selectedPathway, true);
    }, 5000);

    return () => {
      window.removeEventListener("skill2bills_activity_updated", handleActivityUpdated);
      window.removeEventListener("skill2bills_profile_updated", handleActivityUpdated);
      clearInterval(activityPoll);
    };
  }, [selectedPathway]);

  // Filtered learner activity items for table
  const filteredLearnerActivity = useMemo(() => {
    let list = learnerActivityList;

    if (activityStatusFilter === "started") {
      list = list.filter((item) => item.status === "In Progress" || item.status === "Completed");
    } else if (activityStatusFilter === "not_started") {
      list = list.filter((item) => item.status === "Not Started");
    } else if (activityStatusFilter === "in_progress") {
      list = list.filter((item) => item.status === "In Progress");
    } else if (activityStatusFilter === "completed") {
      list = list.filter((item) => item.status === "Completed");
    }

    if (activitySearchTerm.trim()) {
      const q = activitySearchTerm.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q)
      );
    }

    return list;
  }, [learnerActivityList, activityStatusFilter, activitySearchTerm]);

  // Formatter for learner last active timestamp
  const formatLastActive = (iso: string | null) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "—";
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));

      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) {
        if (diffMin < 2) return "Just now";
        if (diffMin < 60) return `${diffMin}m ago`;
        return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      }

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday =
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear();

      if (isYesterday) {
        return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      }

      return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return "—";
    }
  };

  // Export Learner Activity to CSV
  const handleExportLearnerActivityCSV = () => {
    const pathwayInfo = COURSE_LESSONS_INFO[selectedPathway] || { title: selectedPathway, totalLessons: 19 };
    const headers = [
      "Learner Name",
      "Email Address",
      "Programme Pathway",
      "Lessons Completed",
      "Total Lessons",
      "Progress %",
      "Status",
      "Started At",
      "Last Active At"
    ];
    const rows = filteredLearnerActivity.map((item) => [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.email.replace(/"/g, '""')}"`,
      `"${pathwayInfo.title}"`,
      item.completedCount,
      item.totalLessons,
      `${item.progressPercent}%`,
      `"${item.status}"`,
      item.startedAt ? `"${item.startedAt}"` : '"—"',
      item.lastActiveAt ? `"${item.lastActiveAt}"` : '"—"',
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `skill2bills_${selectedPathway}_learner_activity_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerNotice(`Exported ${filteredLearnerActivity.length} learner records to CSV`);
  };

  useEffect(() => {
    fetchProfiles(true);

    // 1. Live Supabase Realtime channel subscription on 'profiles' table
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel("realtime-admin-profiles-sync")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "profiles",
            },
            (payload) => {
              console.log("Supabase Realtime profile change detected:", payload);
              fetchProfiles(false);
              fetchLearnerActivity(selectedPathway, true);
            }
          )
          .subscribe();
      } catch (err) {
        console.warn("Realtime subscription error:", err);
      }
    }

    // 2. Local broadcast listener for instant cross-tab & component updates
    const handleLocalUpdate = () => {
      fetchProfiles(false);
      fetchLearnerActivity(selectedPathway, true);
    };
    window.addEventListener("skill2bills_profile_updated", handleLocalUpdate);
    window.addEventListener("skill2bills_auth_changed", handleLocalUpdate);
    window.addEventListener("storage", handleLocalUpdate);

    // 3. Fast auto-poll fallback (every 3.5s) to guarantee instant updates
    const pollTimer = setInterval(() => {
      fetchProfiles(false);
    }, 3500);

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener("skill2bills_profile_updated", handleLocalUpdate);
      window.removeEventListener("skill2bills_auth_changed", handleLocalUpdate);
      window.removeEventListener("storage", handleLocalUpdate);
      clearInterval(pollTimer);
    };
  }, [selectedPathway]);

  // Compute live analytics from real profiles
  const analytics = useMemo(() => {
    const totalSignups = profiles.length;

    // Track counts
    const trackCounts: Record<string, number> = {};
    profiles.forEach((p) => {
      const t = p.track || "Unselected Track";
      trackCounts[t] = (trackCounts[t] || 0) + 1;
    });

    // Top track
    let topTrack = "Pending Selection";
    let topCount = 0;
    Object.entries(trackCounts).forEach(([track, count]) => {
      if (count > topCount) {
        topCount = count;
        topTrack = track;
      }
    });

    const topTrackPercentage = totalSignups > 0 ? Math.round((topCount / totalSignups) * 100) : 0;

    // Experience breakdown
    const expCounts: Record<string, number> = {};
    profiles.forEach((p) => {
      const exp = p.experience_level || "Beginner";
      expCounts[exp] = (expCounts[exp] || 0) + 1;
    });

    // Time commitment breakdown
    const timeCounts: Record<string, number> = {};
    profiles.forEach((p) => {
      const time = p.time_commitment || "Flexible";
      timeCounts[time] = (timeCounts[time] || 0) + 1;
    });

    return {
      totalSignups,
      trackCounts,
      topTrack,
      topCount,
      topTrackPercentage,
      expCounts,
      timeCounts,
    };
  }, [profiles]);

  // Filtered leads
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchesSearch =
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.track && p.track.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.goal && p.goal.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTrack =
        selectedTrackFilter === "all" || p.track === selectedTrackFilter;

      return matchesSearch && matchesTrack;
    });
  }, [profiles, searchTerm, selectedTrackFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    if (profiles.length === 0) {
      triggerNotice("No registered creator leads to export yet.");
      return;
    }
    const headers = ["Email", "Track", "Goal", "Time Commitment (hrs/wk)", "Experience Level", "Date Signed Up"];
    const rows = profiles.map((p) => [
      `"${p.email}"`,
      `"${p.track || ""}"`,
      `"${p.goal || ""}"`,
      `"${p.time_commitment || ""}"`,
      `"${p.experience_level || ""}"`,
      `"${p.created_at ? new Date(p.created_at).toLocaleString() : ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `skill2bills-pilot-leads-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotice(`Exported ${profiles.length} leads to CSV`);
  };

  const handleCopy = (emailText: string) => {
    navigator.clipboard.writeText(emailText);
    setCopiedEmail(emailText);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Add a manual lead directly
  const handleAddManualLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      triggerNotice("Please enter a valid email address");
      return;
    }

    const newLead: SupabaseProfile = {
      id: "manual-" + Math.random().toString(36).substring(2, 9),
      email: newEmail.trim().toLowerCase(),
      track: newTrack,
      goal: newGoal,
      time_commitment: newTime,
      experience_level: newExp,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem("skill2bill_creator_leads") || "[]");
      const updated = [newLead, ...existing.filter((item: SupabaseProfile) => item.email !== newLead.email)];
      localStorage.setItem("skill2bill_creator_leads", JSON.stringify(updated));
      setProfiles(updated);
      setNewEmail("");
      setShowAddLeadModal(false);
      triggerNotice(`Added creator ${newLead.email} to pilot roster`);
    } catch {
      triggerNotice("Could not save to local storage");
    }
  };

  // Fetch users directly from Supabase Auth via Service Role key
  const handleFetchAuthUsers = async (customKey?: string) => {
    const keyToUse = customKey || inputServiceKey;
    if (!keyToUse || !keyToUse.trim()) {
      setServiceKeyMessage("Please enter your Supabase service_role secret key.");
      return;
    }
    setServiceKeyTesting(true);
    setServiceKeyMessage("");
    try {
      const res = await fetchSupabaseAuthUsers(keyToUse.trim());
      if (res.error) {
        setServiceKeyMessage(`Supabase Auth error: ${res.error}`);
      } else {
        setAuthUsersList(res.users);
        setServiceKeyMessage(`Found ${res.users.length} registered accounts in Supabase Auth!`);
        setCustomServiceRoleKey(keyToUse.trim());
        await fetchProfiles(false);
        triggerNotice(`Identified ${res.users.length} registered creator accounts!`);
      }
    } catch (err: any) {
      setServiceKeyMessage(`Failed to query Supabase Auth: ${err?.message || err}`);
    } finally {
      setServiceKeyTesting(false);
    }
  };

  // Synchronize auth users into public.profiles database table
  const handleSyncToProfiles = async () => {
    if (authUsersList.length === 0) return;
    setIsSyncingToProfiles(true);
    try {
      const res = await syncAuthUsersToProfiles(authUsersList);
      triggerNotice(`Successfully synchronized ${res.count} users into public.profiles!`);
      await fetchProfiles(false);
    } catch (err: any) {
      triggerNotice(`Sync error: ${err?.message || err}`);
    } finally {
      setIsSyncingToProfiles(false);
    }
  };

  // Batch import pasted emails (e.g. from Supabase dashboard table)
  const handleBatchImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchInputText.trim()) return;
    try {
      const imported = await batchImportEmails(batchInputText, batchTrackChoice);
      if (imported.length > 0) {
        triggerNotice(`Imported & registered ${imported.length} creator emails!`);
        setBatchInputText("");
        setBatchImportModalOpen(false);
        await fetchProfiles(false);
      } else {
        triggerNotice("No valid email addresses found in text.");
      }
    } catch (err: any) {
      triggerNotice(`Import error: ${err?.message || err}`);
    }
  };

  // Copy 1-Click SQL script
  const handleCopySql = () => {
    navigator.clipboard.writeText(DEFAULT_SQL_SYNC_SCRIPT);
    setCopiedSql(true);
    triggerNotice("Copied 1-Click SQL Sync Script to clipboard!");
    setTimeout(() => setCopiedSql(false), 3000);
  };


  // Clear all local leads
  const handleClearLocalRoster = () => {
    if (window.confirm("Are you sure you want to clear all locally cached signups?")) {
      localStorage.removeItem("skill2bill_creator_leads");
      localStorage.removeItem("skill2bill_creator_profile");
      setProfiles([]);
      triggerNotice("Local roster cleared");
    }
  };

  const renderLearnerActivitySection = (isFullPage = false) => {
    const currentPathwayInfo = COURSE_LESSONS_INFO[selectedPathway] || {
      title: "AI & Virtual Influencers",
      totalLessons: 19,
      lessonPrefix: "les-ai-",
    };

    return (
      <section className={`bg-[#0f0f13] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-xl text-white ${isFullPage ? "min-h-[700px]" : ""}`}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4F636] animate-pulse" />
              <span className="text-[10px] uppercase font-black tracking-widest text-black bg-[#D4F636] px-2.5 py-0.5 rounded-full shadow-xs">
                14-Day Mini-Launch Tracker
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Learner Activity &amp; Pathway Analytics
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Live engagement across <strong>{currentPathwayInfo.title}</strong> ({currentPathwayInfo.totalLessons} lessons total). Synced with Supabase <code className="text-[#D4F636] font-mono text-[11px]">user_progress</code>.
            </p>
          </div>

          {/* Pathway Selector & Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 bg-[#17171d] border border-white/10 rounded-2xl px-3 py-1.5 shadow-xs">
              <span className="text-[11px] font-bold text-zinc-400">Programme:</span>
              <select
                value={selectedPathway}
                onChange={(e) => setSelectedPathway(e.target.value)}
                className="bg-transparent text-xs font-black text-[#D4F636] focus:outline-none cursor-pointer"
              >
                <option value="ai-virtual-influencers" className="bg-[#121216] text-white">
                  AI Content Creation (19 Lessons — Mini-Launch)
                </option>
                <option value="all" className="bg-[#121216] text-white">
                  All Programmes (Combined Roster — 29 Lessons)
                </option>
                <option value="content-clipping" className="bg-[#121216] text-white">
                  Content Clipping &amp; Short-Form (6 Lessons)
                </option>
                <option value="live-streaming" className="bg-[#121216] text-white">
                  Live Streaming Mastery (2 Lessons)
                </option>
                <option value="youtube-automation" className="bg-[#121216] text-white">
                  Faceless YouTube Automation (2 Lessons)
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => fetchLearnerActivity(selectedPathway, false)}
              disabled={activityLoading}
              title="Refresh Learner Progress"
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${activityLoading ? "animate-spin text-[#D4F636]" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleExportLearnerActivityCSV}
              className="bg-[#D4F636] hover:bg-[#c2e42b] text-black text-xs font-black px-3.5 py-2 rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-black" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 5 Metric Cards matching Task Specification */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 my-6">
          {/* 1. Enrolled Learners */}
          <div className="bg-[#16161c] border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
              <span>Enrolled Learners</span>
              <Users className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="my-2.5">
              <div className="text-3xl font-black text-white tracking-tight">
                {learnerMetrics.enrolledLearners}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Enrolled in programme</p>
            </div>
            <div className="text-[10px] text-zinc-300 font-semibold bg-white/5 px-2 py-0.5 rounded-md inline-block w-fit">
              100% verified accounts
            </div>
          </div>

          {/* 2. Started Learning */}
          <div className="bg-[#16161c] border border-[#D4F636]/20 rounded-2xl p-4 flex flex-col justify-between hover:border-[#D4F636]/40 transition-all">
            <div className="flex items-center justify-between text-[#D4F636] text-xs font-bold">
              <span>Started Learning</span>
              <BookOpen className="w-4 h-4 text-[#D4F636]" />
            </div>
            <div className="my-2.5">
              <div className="text-3xl font-black text-[#D4F636] tracking-tight">
                {learnerMetrics.startedLearning}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Opened ≥ 1 lesson</p>
            </div>
            <div className="text-[10px] text-[#D4F636] font-semibold bg-[#D4F636]/10 px-2 py-0.5 rounded-md inline-block w-fit">
              {learnerMetrics.enrolledLearners > 0
                ? `${Math.round((learnerMetrics.startedLearning / learnerMetrics.enrolledLearners) * 100)}% of learners`
                : "0% of learners"}
            </div>
          </div>

          {/* 3. Not Started */}
          <div className="bg-[#16161c] border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
              <span>Not Started</span>
              <Clock className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="my-2.5">
              <div className="text-3xl font-black text-zinc-300 tracking-tight">
                {learnerMetrics.notStarted}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">0 lessons opened</p>
            </div>
            <div className="text-[10px] text-zinc-400 font-semibold bg-white/5 px-2 py-0.5 rounded-md inline-block w-fit">
              Awaiting first view
            </div>
          </div>

          {/* 4. In Progress */}
          <div className="bg-[#16161c] border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
              <span>In Progress</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="my-2.5">
              <div className="text-3xl font-black text-amber-300 tracking-tight">
                {learnerMetrics.inProgress}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Active but &lt; 100%</p>
            </div>
            <div className="text-[10px] text-amber-300 font-semibold bg-amber-400/10 px-2 py-0.5 rounded-md inline-block w-fit">
              Lessons underway
            </div>
          </div>

          {/* 5. Completed */}
          <div className="bg-[#16161c] border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between col-span-2 sm:col-span-1 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
              <span>Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-2.5">
              <div className="text-3xl font-black text-emerald-400 tracking-tight">
                {learnerMetrics.completed}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">All {currentPathwayInfo.totalLessons} lessons done</p>
            </div>
            <div className="text-[10px] text-emerald-300 font-semibold bg-emerald-400/10 px-2 py-0.5 rounded-md inline-block w-fit">
              {learnerMetrics.enrolledLearners > 0
                ? `${Math.round((learnerMetrics.completed / learnerMetrics.enrolledLearners) * 100)}% pathway completion`
                : "0% completed"}
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 pb-4">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActivityStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activityStatusFilter === "all"
                  ? "bg-[#D4F636] text-black shadow-xs font-black"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              All Learners ({learnerActivityList.length})
            </button>
            <button
              type="button"
              onClick={() => setActivityStatusFilter("started")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activityStatusFilter === "started"
                  ? "bg-[#D4F636] text-black shadow-xs font-black"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Started ({learnerMetrics.startedLearning})
            </button>
            <button
              type="button"
              onClick={() => setActivityStatusFilter("not_started")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activityStatusFilter === "not_started"
                  ? "bg-[#D4F636] text-black shadow-xs font-black"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Not Started ({learnerMetrics.notStarted})
            </button>
            <button
              type="button"
              onClick={() => setActivityStatusFilter("in_progress")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activityStatusFilter === "in_progress"
                  ? "bg-[#D4F636] text-black shadow-xs font-black"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              In Progress ({learnerMetrics.inProgress})
            </button>
            <button
              type="button"
              onClick={() => setActivityStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activityStatusFilter === "completed"
                  ? "bg-[#D4F636] text-black shadow-xs font-black"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Completed ({learnerMetrics.completed})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative shrink-0 sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search learner name or email..."
              value={activitySearchTerm}
              onChange={(e) => setActivitySearchTerm(e.target.value)}
              className="w-full bg-[#121216] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4F636] transition-colors"
            />
          </div>
        </div>

        {/* Learner Activity Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#121216]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 uppercase text-[10px] font-black tracking-wider">
                <th className="py-3 px-4">Learner</th>
                <th className="py-3 px-4 text-center">Completed</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLearnerActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <BookOpen className="w-7 h-7 text-zinc-600 mb-1" />
                      <span className="font-bold text-zinc-300">No learner records found</span>
                      <span className="text-[11px] text-zinc-500">
                        {activitySearchTerm ? "No learners match your search query." : "No learners in this status filter yet."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLearnerActivity.map((learner) => (
                  <tr key={learner.id} className="hover:bg-white/[0.03] transition-colors">
                    {/* Learner */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 flex items-center justify-center text-xs font-black text-[#D4F636] shrink-0">
                          {learner.name ? learner.name.charAt(0).toUpperCase() : learner.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate max-w-[220px]">
                          <div className="font-bold text-white truncate flex items-center gap-1.5">
                            <span>{learner.name}</span>
                            {learner.role === "admin" && (
                              <span className="bg-[#D4F636]/20 text-[#D4F636] text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-[#D4F636]/30">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono truncate">
                            {learner.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Completed */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      <span className="text-white text-sm">{learner.completedCount}</span>
                      <span className="text-zinc-500 text-xs"> / {learner.totalLessons}</span>
                    </td>

                    {/* Progress */}
                    <td className="py-3.5 px-4 min-w-[140px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-zinc-200">{learner.progressPercent}%</span>
                          <span className="text-zinc-500 text-[10px]">
                            {learner.completedCount === learner.totalLessons ? "Done" : `${learner.totalLessons - learner.completedCount} left`}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              learner.progressPercent === 100
                                ? "bg-emerald-400"
                                : learner.progressPercent > 0
                                ? "bg-[#D4F636]"
                                : "bg-transparent"
                            }`}
                            style={{ width: `${learner.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {learner.status === "Completed" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      ) : learner.status === "In Progress" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D4F636] bg-[#D4F636]/15 border border-[#D4F636]/30 px-2.5 py-0.5 rounded-full">
                          <Flame className="w-3 h-3" />
                          In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-400 bg-zinc-800/80 border border-zinc-700 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          Not Started
                        </span>
                      )}
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="text-xs font-semibold text-zinc-200">
                        {formatLastActive(learner.lastActiveAt)}
                      </div>
                      {learner.startedAt && (
                        <div className="text-[10px] text-zinc-500 font-mono">
                          Started: {formatLastActive(learner.startedAt)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  const todayDateFormatted = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#070708] text-white p-3 sm:p-5 md:p-8 flex justify-center items-start selection:bg-[#D4F636] selection:text-black font-sans">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed top-6 right-6 z-50 bg-[#16161c] text-[#D4F636] border border-[#D4F636]/30 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-[#D4F636]" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Manual Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Pilot Creator Lead</h3>
              <button
                type="button"
                onClick={() => setShowAddLeadModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddManualLead} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Creator Email</label>
                <input
                  type="email"
                  required
                  placeholder="creator@launchpad.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Track</label>
                <select
                  value={newTrack}
                  onChange={(e) => setNewTrack(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  <option value="AI & Virtual Influencers">AI &amp; Virtual Influencers</option>
                  <option value="Content Clipping & Short-Form Video">Content Clipping &amp; Short-Form Video</option>
                  <option value="Live Streaming Mastery">Live Streaming Mastery</option>
                  <option value="TikTok Shop & Faceless Affiliate">TikTok Shop &amp; Faceless Affiliate</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Commitment</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    <option value="1-5">1-5 hrs/wk</option>
                    <option value="5-15">5-15 hrs/wk</option>
                    <option value="15+">15+ hrs/wk</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Experience</label>
                  <select
                    value={newExp}
                    onChange={(e) => setNewExp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Supabase Auth Service Role Key Sync Modal */}
      {syncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-[#D4F636] flex items-center justify-center shadow-xs">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Supabase Auth Direct Sync</h3>
                  <p className="text-[11px] text-slate-500">Fetch all 11 registered creator accounts from auth.users</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSyncModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] leading-relaxed text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">Where to get your Supabase Service Role Key:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-slate-600">
                  <li>Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">Supabase Project Dashboard</a></li>
                  <li>Navigate to <strong>Project Settings → API</strong></li>
                  <li>Under <strong>Project API keys</strong>, copy the <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-900">service_role secret</code> key</li>
                </ol>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Supabase Service Role Secret Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={inputServiceKey}
                  onChange={(e) => setInputServiceKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>

              {serviceKeyMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium border ${
                    serviceKeyMessage.includes("Found") || serviceKeyMessage.includes("Successfully")
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-red-50 text-red-800 border-red-200"
                  }`}
                >
                  {serviceKeyMessage}
                </div>
              )}

              {authUsersList.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 max-h-48 overflow-y-auto space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 pb-1 border-b border-slate-200">
                    <span>{authUsersList.length} Accounts Identified</span>
                    <span className="text-emerald-600">Ready to sync</span>
                  </div>
                  {authUsersList.map((u) => (
                    <div key={u.id} className="flex items-center justify-between text-[11px] py-0.5 text-slate-600">
                      <span className="font-mono truncate max-w-[240px]">{u.email}</span>
                      <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full font-bold">{u.role}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSyncModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Close
                </button>

                {authUsersList.length > 0 ? (
                  <button
                    type="button"
                    disabled={isSyncingToProfiles}
                    onClick={handleSyncToProfiles}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSyncingToProfiles ? "Syncing..." : `Sync All ${authUsersList.length} to Profiles`}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={serviceKeyTesting || !inputServiceKey.trim()}
                    onClick={() => handleFetchAuthUsers()}
                    className="bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {serviceKeyTesting ? "Connecting to Supabase..." : "Fetch Auth Accounts"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. 1-Click SQL Sync Script Modal */}
      {sqlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-[#D4F636] flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">1-Click Supabase SQL Sync Script</h3>
                  <p className="text-[11px] text-slate-500">Backfills all 11 auth accounts into profiles &amp; configures auto-sync</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSqlModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Permanent 2-Step Solution:</p>
                  <p className="text-emerald-800 mt-0.5">
                    1. Click <strong>"Copy SQL Script"</strong> below.<br/>
                    2. Go to your <a href="https://supabase.com/dashboard/project/_/sql" target="_blank" rel="noreferrer" className="font-bold underline text-emerald-950">Supabase SQL Editor</a>, paste and click <strong>"Run"</strong>. Done!
                  </p>
                </div>
              </div>

              <div className="relative">
                <pre className="text-[10px] font-mono bg-slate-900 text-slate-100 p-4 rounded-2xl overflow-x-auto max-h-64 leading-relaxed border border-slate-800">
                  {DEFAULT_SQL_SYNC_SCRIPT}
                </pre>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="absolute top-3 right-3 bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md cursor-pointer"
                >
                  {copiedSql ? <CheckCheck className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black" />}
                  <span>{copiedSql ? "Copied!" : "Copy SQL"}</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <a
                  href="https://supabase.com/dashboard/project/_/sql"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Open Supabase SQL Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSqlModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="bg-slate-900 hover:bg-black text-[#D4F636] font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    {copiedSql ? "Copied to Clipboard!" : "Copy Full SQL Script"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Batch Import 11 Emails Modal */}
      {batchImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-[#D4F636] flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Quick Paste 11 Supabase Emails</h3>
                  <p className="text-[11px] text-slate-500">Instantly populate your pilot roster with your 11 emails</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBatchImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBatchImport} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Paste emails (separated by commas, lines, or spaces)
                </label>
                <textarea
                  rows={6}
                  placeholder={`user1@example.com\nuser2@example.com\nuser3@example.com`}
                  value={batchInputText}
                  onChange={(e) => setBatchInputText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Default Assigned Programme
                </label>
                <select
                  value={batchTrackChoice}
                  onChange={(e) => setBatchTrackChoice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
                >
                  <option value="AI & Virtual Influencers">AI &amp; Virtual Influencers (Primary Programme)</option>
                  <option value="Content Clipping & Short-Form Video">Content Clipping &amp; Short-Form Video</option>
                  <option value="Live Streaming Mastery">Live Streaming Mastery</option>
                  <option value="TikTok Shop & Faceless Affiliate">TikTok Shop &amp; Faceless Affiliate</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setBatchImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!batchInputText.trim()}
                  className="bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Import All Emails
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Outer Shell container */}
      <div className="w-full max-w-7xl bg-[#0e0e11] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[860px]">
        
        {/* Left Side Icon Navigation Bar */}
        <aside className="w-full md:w-20 bg-[#121216] border-b md:border-b-0 md:border-r border-white/5 flex md:flex-col items-center justify-between p-4 md:py-8 z-20 shrink-0">
          {/* Top Brand Mark */}
          <div className="flex md:flex-col items-center gap-6">
            <button
              onClick={onBackToWebsite}
              title="Return to Skill2Bills Website"
              className="group relative cursor-pointer"
            >
              <BrandLogo className="w-10 h-10 rounded-2xl shadow-lg group-hover:scale-105 transition-transform" />
              <span className="sr-only">Skill2Bills</span>
            </button>

            {/* Nav Icon List */}
            <nav className="flex md:flex-col items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`p-3 rounded-2xl transition-all cursor-pointer relative ${
                  activeTab === "overview"
                    ? "bg-[#D4F636] text-black shadow-lg shadow-[#D4F636]/20 font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
                title="Dashboard Overview"
              >
                <LayoutDashboard className="w-5 h-5" />
                {activeTab === "overview" && (
                  <span className="absolute right-1 bottom-1 w-1.5 h-1.5 rounded-full bg-black"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("leads")}
                className={`p-3 rounded-2xl transition-all cursor-pointer relative ${
                  activeTab === "leads"
                    ? "bg-[#D4F636] text-black shadow-lg shadow-[#D4F636]/20 font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
                title="Creator Leads & Emails"
              >
                <Users className="w-5 h-5" />
                {profiles.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4F636] text-black font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {profiles.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("tracks")}
                className={`p-3 rounded-2xl transition-all cursor-pointer relative ${
                  activeTab === "tracks"
                    ? "bg-[#D4F636] text-black shadow-lg shadow-[#D4F636]/20 font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
                title="Track Performance"
              >
                <PieChartIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("feedback")}
                className={`p-3 rounded-2xl transition-all cursor-pointer relative ${
                  activeTab === "feedback"
                    ? "bg-[#D4F636] text-black shadow-lg shadow-[#D4F636]/20 font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
                title="Learner Feedback Responses"
              >
                <MessageSquare className="w-5 h-5" />
                {feedbacks.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-sky-400 text-black font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {feedbacks.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("activity")}
                className={`p-3 rounded-2xl transition-all cursor-pointer relative ${
                  activeTab === "activity"
                    ? "bg-[#D4F636] text-black shadow-lg shadow-[#D4F636]/20 font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
                title="14-Day Mini-Launch Learner Activity Tracking"
              >
                <GraduationCap className="w-5 h-5" />
                {learnerMetrics.startedLearning > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4F636] text-black font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {learnerMetrics.startedLearning}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`p-3 rounded-2xl transition-all cursor-pointer relative ${
                  activeTab === "settings"
                    ? "bg-[#D4F636] text-black shadow-lg shadow-[#D4F636]/20 font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
                title="System Settings & Database Config"
              >
                <Settings className="w-5 h-5" />
              </button>
            </nav>
          </div>

          {/* Bottom Controls */}
          <div className="flex md:flex-col items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="p-3 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              title="Quick Download CSV"
            >
              <FileSpreadsheet className="w-5 h-5" />
            </button>

            <button
              onClick={onBackToWebsite}
              className="p-3 rounded-2xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
              title="Exit Dashboard to Main Site"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* Main Dashboard Canvas */}
        <main className="flex-1 p-5 sm:p-7 md:p-9 flex flex-col gap-6 overflow-y-auto bg-white text-slate-900 font-sans">
          {/* Top Bar: Greetings, Search, Actions */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hello Chris
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {todayDateFormatted}
              </p>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Realtime Active</span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search emails, tracks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#D4F636] focus:bg-white w-40 sm:w-52 transition-colors font-sans"
                />
              </div>

              <button
                type="button"
                onClick={() => fetchProfiles(true)}
                title="Refresh Real Signups"
                className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:text-black hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-black" : ""}`} />
              </button>

              <button
                type="button"
                onClick={() => setShowAddLeadModal(true)}
                title="Manually Add Lead"
                className="bg-[#D4F636] hover:bg-[#c2e42b] text-black p-2 rounded-full font-bold transition-all cursor-pointer shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top Row Widgets: 3 Cards matching design */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Widget 1: Pilot Signups & Growth (Left 4-col) */}
                <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      Total Signups
                    </span>
                    <span className="text-[11px] text-black bg-[#D4F636] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-xs">
                      <TrendingUp className="w-3 h-3" /> Real-time
                    </span>
                  </div>

                  <div className="my-5">
                    <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
                      {analytics.totalSignups}
                      <span className="text-xs font-semibold text-slate-500 tracking-normal">
                        confirmed {analytics.totalSignups === 1 ? "creator" : "creators"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      {analytics.totalSignups === 0
                        ? "No real signups yet. Fill in the login form or click '+' to test."
                        : `${analytics.totalSignups} verified emails locked in for the October 15th pilot.`}
                    </p>
                  </div>

                  {/* Sparkline Visual Curve */}
                  <div className="pt-2">
                    <svg viewBox="0 0 300 60" className="w-full h-12 stroke-slate-900 fill-none" strokeWidth="2.5" strokeLinecap="round">
                      <path d={analytics.totalSignups > 0 ? "M 0,45 Q 30,50 60,35 T 120,40 T 180,25 T 240,28 T 300,10" : "M 0,55 L 300,55"} />
                      <defs>
                        <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D4F636" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#D4F636" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      <path d={analytics.totalSignups > 0 ? "M 0,45 Q 30,50 60,35 T 120,40 T 180,25 T 240,28 T 300,10 L 300,60 L 0,60 Z" : "M 0,55 L 300,55 L 300,60 L 0,60 Z"} fill="url(#glowGrad)" stroke="none" />
                    </svg>
                  </div>
                </div>

                {/* Widget 2: Track Concentration Gauge (Middle 3-col) */}
                <div className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col justify-between items-center text-center shadow-sm relative">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500">
                      Top Track Share
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Pilot Cohort</span>
                  </div>

                  {/* Semi-circular gauge */}
                  <div className="relative w-36 h-36 flex items-center justify-center my-2">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-slate-200"
                        strokeWidth="9"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-slate-900"
                        strokeWidth="9"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * analytics.topTrackPercentage) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black text-slate-900">{analytics.topTrackPercentage}%</span>
                      <span className="text-[10px] text-slate-500 font-bold">Demand</span>
                    </div>
                  </div>

                  <div className="w-full text-center">
                    <div className="text-xs font-extrabold text-slate-900 truncate px-2" title={analytics.topTrack}>
                      {analytics.topTrack}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {analytics.topCount} creator{analytics.topCount === 1 ? "" : "s"} selected this
                    </div>
                  </div>
                </div>

                {/* Widget 3: Time-Series Registration Chart (Right 5-col) */}
                <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500">
                        Registration Velocity
                      </span>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        Launch Surge Trend
                      </div>
                    </div>

                    <button
                      onClick={handleExportCSV}
                      className="bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                  </div>

                  {/* Chart Visual with Marker */}
                  <div className="my-3 relative">
                    <div className="absolute top-1 left-2/3 -translate-x-1/2 bg-[#D4F636] text-black text-[10px] font-black px-2 py-0.5 rounded shadow-xs pointer-events-none">
                      Live
                    </div>
                    <svg viewBox="0 0 400 90" className="w-full h-24 stroke-slate-900 fill-none" strokeWidth="2" strokeLinecap="round">
                      <path d="M 0,65 Q 40,70 80,55 T 160,45 T 240,60 T 320,25 T 400,35" />
                      <line x1="267" y1="0" x2="267" y2="90" stroke="#000" strokeDasharray="3 3" strokeWidth="1.5" />
                      <circle cx="267" cy="40" r="4.5" fill="#D4F636" stroke="#000" strokeWidth="1.5" />
                    </svg>
                  </div>

                  {/* Time Range Pills */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px] font-semibold text-slate-500">
                    {(["1D", "1W", "1M", "3M", "6M", "1Y"] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setTimeRange(range);
                          triggerNotice(`Filter set to ${range}`);
                        }}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                          timeRange === range ? "bg-slate-900 text-white font-bold" : "hover:text-slate-900"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 14-Day Mini-Launch Learner Activity Tracking & Metrics Overview */}
              {renderLearnerActivitySection(false)}

              {/* Overview Quick Sync Callout Bar */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-black text-white p-4 sm:p-5 rounded-2xl border border-[#D4F636]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#D4F636] text-black flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Supabase Auth: 11 Registered Accounts Sitting in Database</span>
                      <span className="text-[10px] text-[#D4F636] font-semibold bg-[#D4F636]/10 px-2 py-0.5 rounded-full border border-[#D4F636]/20">
                        {profiles.length} Active in Pilot
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Supabase stores registered emails in <code className="text-[#D4F636] font-mono">auth.users</code>. Use Direct Key Sync or the 1-Click SQL Script to identify all 11 creators.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSyncModalOpen(true)}
                    className="bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Sync 11 Accounts
                  </button>
                  <button
                    type="button"
                    onClick={() => setSqlModalOpen(true)}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    1-Click SQL
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchImportModalOpen(true)}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Paste Emails
                  </button>
                </div>
              </div>

              {/* Bottom Row: Track Leaderboard & Recent Leads */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Lower: Track Selection Breakdown Leaderboard (5-col) */}
                <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-slate-900" />
                      <h3 className="text-base font-bold text-slate-900">Track Popularity</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("tracks")}
                      className="text-xs text-slate-900 hover:underline font-semibold cursor-pointer"
                    >
                      View Details &rarr;
                    </button>
                  </div>

                  {/* Leaderboard rows */}
                  <div className="space-y-4">
                    {Object.entries(analytics.trackCounts).length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        No track selections recorded yet.
                      </div>
                    ) : (
                      (Object.entries(analytics.trackCounts) as [string, number][])
                        .sort((a, b) => Number(b[1]) - Number(a[1]))
                        .map(([trackName, count], idx) => {
                          const countNum = Number(count);
                          const pct = analytics.totalSignups > 0 ? Math.round((countNum / analytics.totalSignups) * 100) : 0;
                          return (
                            <div key={trackName} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 font-bold text-slate-900 truncate max-w-[220px]">
                                  <span className="text-slate-900 font-black w-4">{idx + 1}.</span>
                                  <span className="truncate">{trackName}</span>
                                </div>
                                <div className="font-mono text-slate-700 font-bold">
                                  {countNum} <span className="text-slate-500 font-normal">({pct}%)</span>
                                </div>
                              </div>
                              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-slate-900 rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>Active tracks chosen: <strong>{Object.keys(analytics.trackCounts).length}</strong></span>
                    <span className="text-slate-900 font-semibold">100% Real Records</span>
                  </div>
                </div>

                {/* Right Lower: Quick Leads Preview (7-col) */}
                <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Recent Real Signups</h3>
                      <p className="text-xs text-slate-500">Directly from the beta registration flow</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("leads")}
                      className="text-xs text-slate-900 hover:underline font-semibold cursor-pointer"
                    >
                      See All Leads ({profiles.length}) &rarr;
                    </button>
                  </div>

                  {filteredProfiles.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
                      <Mail className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="font-semibold text-slate-700">No leads registered yet</p>
                      <p className="text-slate-500 text-[11px] mt-1 max-w-xs">
                        Use the "Join the Launchpad" login page or click the "+" button above to add a creator.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredProfiles.slice(0, 5).map((lead) => (
                        <div
                          key={lead.id}
                          className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between hover:border-slate-300 transition-colors shadow-xs"
                        >
                          <div className="truncate max-w-[240px]">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs truncate">
                                {lead.email}
                              </span>
                              {copiedEmail === lead.email && (
                                <span className="text-[10px] text-emerald-600 font-bold">
                                  Copied!
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-600 truncate block font-medium">
                              {lead.track || "General Pilot"}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-slate-700 font-mono bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                              {lead.time_commitment ? `${lead.time_commitment}h/wk` : "5-15h"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(lead.email)}
                              className="text-xs text-slate-500 hover:text-black p-1 font-semibold"
                              title="Copy email"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>Filtered total: {filteredProfiles.length}</span>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="text-slate-900 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Export CSV</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEADS DIRECTORY */}
          {activeTab === "leads" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-slate-900" />
                      Creator Leads &amp; Email Roster
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Showing real users who completed the Skill2Bills Launchpad onboarding
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <select
                      value={selectedTrackFilter}
                      onChange={(e) => setSelectedTrackFilter(e.target.value)}
                      className="bg-white border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-slate-900 shadow-xs"
                    >
                      <option value="all">All Tracks ({profiles.length})</option>
                      {Object.keys(analytics.trackCounts).map((t) => (
                        <option key={t} value={t}>
                          {t} ({analytics.trackCounts[t]})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setShowAddLeadModal(true)}
                      className="bg-[#D4F636] hover:bg-[#c2e42b] text-black text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Creator</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Supabase 11 Auth Users Live Sync Hub Banner */}
                <div className="mb-6 bg-gradient-to-r from-slate-950 via-slate-900 to-black text-white border border-[#D4F636]/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-80 h-80 bg-[#D4F636]/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#D4F636] text-black text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-3 h-3 text-black" /> Supabase Auth Integration
                        </span>
                        <span className="text-xs text-zinc-300 font-bold">
                          11 Registered Accounts in Supabase Auth
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-white tracking-tight">
                        Identify &amp; Sync All 11 Supabase Registered Learners
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Supabase Auth stores registered user accounts in the internal <code className="text-[#D4F636] font-mono font-semibold">auth.users</code> system. Use one of our 3 instant sync methods to populate your pilot roster with all 11 registered creator accounts.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSyncModalOpen(true)}
                        className="bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Service Key Sync</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSqlModalOpen(true)}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>1-Click SQL Script</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBatchImportModalOpen(true)}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Paste 11 Emails</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold text-xs">
                        <th className="pb-3 font-semibold">Creator Email &amp; Role</th>
                        <th className="pb-3 font-semibold">Assigned Track</th>
                        <th className="pb-3 font-semibold">Goal &amp; Focus</th>
                        <th className="pb-3 font-semibold text-center">Commitment</th>
                        <th className="pb-3 font-semibold text-center">Exp. Level</th>
                        <th className="pb-3 font-semibold text-right">Verification &amp; Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-900" />
                            Loading verified database records...
                          </td>
                        </tr>
                      ) : filteredProfiles.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            <Mail className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                            <p className="font-semibold text-slate-700">No leads recorded yet</p>
                            <p className="text-slate-500 text-[11px] mt-1">
                              Click "Service Key Sync", "1-Click SQL Script", or "Paste 11 Emails" above to populate the roster.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredProfiles.map((lead) => {
                          const isAdmin =
                            ["christianaboagye06@gmail.com", "christianaaboagye06@gmail.com"].includes(
                              lead.email.toLowerCase().trim()
                            ) || lead.role === "admin";

                          const dateString = lead.created_at
                            ? new Date(lead.created_at).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Recent";

                          return (
                            <tr key={lead.id} className="hover:bg-slate-100/60 transition-colors">
                              <td className="py-4 pr-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(lead.email)}
                                    title="Click to copy email"
                                    className="font-bold text-slate-900 hover:text-black hover:underline transition-colors truncate max-w-[220px] text-left cursor-pointer"
                                  >
                                    {lead.email}
                                  </button>
                                  {isAdmin ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-slate-900 text-[#D4F636] border border-[#D4F636]/40 px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                                      <Shield className="w-2.5 h-2.5 text-[#D4F636]" /> Admin
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full shrink-0">
                                      Student
                                    </span>
                                  )}
                                  {copiedEmail === lead.email && (
                                    <span className="text-[10px] text-emerald-600 font-bold shrink-0">
                                      Copied!
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-slate-500 font-mono">{dateString}</span>
                                  {lead.source && (
                                    <span className="text-[9px] text-slate-400 font-medium">• {lead.source}</span>
                                  )}
                                </div>
                              </td>

                              <td className="py-4 px-3">
                                <span className="text-slate-800 font-semibold truncate block max-w-[200px]">
                                  {lead.track || "AI & Virtual Influencers"}
                                </span>
                              </td>

                              <td className="py-4 px-3">
                                <span className="text-slate-600 truncate block max-w-[160px]">
                                  {lead.goal || "Growth Target"}
                                </span>
                              </td>

                              <td className="py-4 px-3 text-center">
                                <span className="font-mono bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-2xs">
                                  {lead.time_commitment ? `${lead.time_commitment}h` : "Flexible"}
                                </span>
                              </td>

                              <td className="py-4 px-3 text-center">
                                <span className="text-slate-600 font-medium">
                                  {lead.experience_level || "Beginner"}
                                </span>
                              </td>

                              <td className="py-4 pl-3 text-right">
                                {isAdmin ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-black bg-[#D4F636] px-2.5 py-1 rounded-full shadow-2xs">
                                    <CheckCircle2 className="w-3 h-3" /> Super Admin
                                  </span>
                                ) : lead.source === "Supabase Auth" ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2.5 py-1 rounded-full shadow-2xs">
                                    <Sparkles className="w-3 h-3 text-emerald-600" /> Supabase Auth
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 bg-slate-200/80 px-2.5 py-1 rounded-full shadow-2xs">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pilot Confirmed
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                  <span>
                    Total Registered Leads: <strong>{filteredProfiles.length}</strong> (All verified emails)
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="text-slate-900 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download All Emails (.CSV)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRACK STATS */}
          {activeTab === "tracks" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Track popularity detailed card */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-slate-900" />
                    Track Demand Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Distribution of selections across all {analytics.totalSignups} users
                  </p>

                  <div className="space-y-5">
                    {COURSE_TRACKS.map((t) => {
                      const count = analytics.trackCounts[t.title] || 0;
                      const pct = analytics.totalSignups > 0 ? Math.round((count / analytics.totalSignups) * 100) : 0;

                      return (
                        <div key={t.id} className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">{t.title}</span>
                            <span className="font-mono text-slate-900 font-bold">
                              {count} creators ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-900 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Experience & Time Commitment cards */}
                <div className="space-y-5">
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      Experience Levels
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Self-reported skill breakdown of incoming students
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                      {["Beginner", "Intermediate", "Advanced"].map((lvl) => {
                        const count = analytics.expCounts[lvl] || 0;
                        const pct = analytics.totalSignups > 0 ? Math.round((count / analytics.totalSignups) * 100) : 0;
                        return (
                          <div key={lvl} className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
                            <div className="text-2xl font-black text-slate-900">{count}</div>
                            <div className="text-xs font-bold text-slate-700 mt-1">{lvl}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{pct}% of cohort</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      Weekly Time Commitment
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Hours creators can invest per week
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                      {["1-5", "5-15", "15+"].map((hrs) => {
                        const count = analytics.timeCounts[hrs] || 0;
                        const pct = analytics.totalSignups > 0 ? Math.round((count / analytics.totalSignups) * 100) : 0;
                        return (
                          <div key={hrs} className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
                            <div className="text-2xl font-black text-slate-900">{count}</div>
                            <div className="text-xs font-bold text-slate-700 mt-1">{hrs} hrs/wk</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{pct}% of cohort</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LEARNER FEEDBACK */}
          {activeTab === "feedback" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-slate-900" />
                      Learner Course Feedback
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Real-time feedback submitted by creators after completing lesson modules
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (feedbacks.length === 0) {
                          triggerNotice("No feedback entries available to export yet.");
                          return;
                        }
                        const headers = ["Email", "Track", "Rating", "Pacing", "Difficulty", "Comments", "Metadata", "Date"];
                        const rows = feedbacks.map((fb) => [
                          `"${fb.user_email}"`,
                          `"${fb.track_title || fb.track_slug || ""}"`,
                          `"${fb.rating}/5"`,
                          `"${fb.pacing || ""}"`,
                          `"${fb.priority || ""}"`,
                          `"${(fb.comments || "").replace(/"/g, '""')}"`,
                          `"${JSON.stringify(fb.metadata || {}).replace(/"/g, '""')}"`,
                          `"${new Date(fb.created_at).toLocaleString()}"`,
                        ]);
                        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `skill2bills-learner-feedback-${new Date().toISOString().split("T")[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        triggerNotice(`Exported ${feedbacks.length} feedback responses to CSV`);
                      }}
                      className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Feedback CSV</span>
                    </button>
                  </div>
                </div>

                {/* Feedback Overview Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                      <Star className="w-6 h-6 fill-amber-400 stroke-amber-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">
                        {feedbacks.length > 0
                          ? (
                              feedbacks.reduce((acc, curr) => acc + (curr.rating || 5), 0) / feedbacks.length
                            ).toFixed(1)
                          : "5.0"}
                        <span className="text-xs text-slate-500 font-semibold"> / 5</span>
                      </div>
                      <div className="text-xs font-bold text-slate-700">Average Rating</div>
                      <div className="text-[10px] text-slate-500">From {feedbacks.length} total response{feedbacks.length === 1 ? "" : "s"}</div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
                    <div className="w-12 h-12 bg-[#D4F636]/30 text-black rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">
                        {feedbacks.filter((f) => f.pacing === "About right" || !f.pacing).length}
                      </div>
                      <div className="text-xs font-bold text-slate-700">Optimal Pacing</div>
                      <div className="text-[10px] text-slate-500">Learners satisfied with pace</div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
                    <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center shrink-0">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">{feedbacks.length}</div>
                      <div className="text-xs font-bold text-slate-700">Feedback Records</div>
                      <div className="text-[10px] text-slate-500">Saved in Supabase &amp; Local DB</div>
                    </div>
                  </div>
                </div>

                {/* Feedback Entries Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold text-xs">
                        <th className="pb-3 font-semibold">Learner Email</th>
                        <th className="pb-3 font-semibold">Track / Module</th>
                        <th className="pb-3 font-semibold text-center">Rating</th>
                        <th className="pb-3 font-semibold">Pacing &amp; Ease</th>
                        <th className="pb-3 font-semibold">Learner Comments &amp; Suggestions</th>
                        <th className="pb-3 font-semibold text-right">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {feedbacks.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                            <p className="font-semibold text-slate-700">No learner feedback recorded yet</p>
                            <p className="text-slate-500 text-[11px] mt-1 max-w-sm mx-auto">
                              When students complete their first 2 lessons, the Learner Feedback popup allows them to rate their experience. Responses automatically save here and in Supabase.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        feedbacks.map((fb) => (
                          <tr key={fb.id || `${fb.user_email}-${fb.created_at}`} className="hover:bg-slate-100/60 transition-colors">
                            <td className="py-4 pr-3">
                              <span className="font-bold text-slate-900 block truncate max-w-[180px]">
                                {fb.user_email}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Device: {fb.metadata?.deviceUsed || "Laptop/Desktop"}
                              </span>
                            </td>

                            <td className="py-4 px-3">
                              <span className="text-slate-800 font-semibold truncate block max-w-[180px]">
                                {fb.track_title || fb.track_slug || "Skill2Bills"}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Completed: {fb.metadata?.completedCount ?? (fb as any).completed_count ?? (fb as any).completedCount ?? "—"} lessons
                              </span>
                            </td>

                            <td className="py-4 px-3 text-center">
                              <span className="inline-flex items-center gap-1 font-bold text-slate-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-xs">
                                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                                {fb.rating}/5
                              </span>
                            </td>

                            <td className="py-4 px-3">
                              <span className="text-slate-800 font-medium block">
                                {fb.pacing || "About right"}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {fb.metadata?.easeLevel || "Very easy"}
                              </span>
                            </td>

                            <td className="py-4 px-3 max-w-xs">
                              <p className="text-slate-700 text-[11px] leading-relaxed line-clamp-2">
                                {fb.comments || "(No additional comments entered)"}
                              </p>
                            </td>

                            <td className="py-4 pl-3 text-right">
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(fb.created_at).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4.5: LEARNER ACTIVITY TRACKING (14-DAY MINI-LAUNCH) */}
          {activeTab === "activity" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {renderLearnerActivitySection(true)}
            </div>
          )}

          {/* TAB 5: SETTINGS & DATABASE CONFIG */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm max-w-3xl">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-slate-900" />
                  Database &amp; Supabase Integration Status
                </h2>
                <p className="text-xs text-slate-500 mb-6">
                  Verify your connection to Supabase for multi-device live lead synchronization.
                </p>

                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Supabase Connection Status</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {isSupabaseConfigured
                          ? `Endpoint: ${supabaseUrl || "Configured"}`
                          : "Running in local storage fallback mode (offline-safe)"}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        isSupabaseConfigured
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {isSupabaseConfigured ? "Active Cloud" : "Local Mode"}
                    </span>
                  </div>

                  {/* Supabase Configuration Form (Gated strictly to Local Dev Mode) */}
                  {import.meta.env.DEV && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">Supabase Project Settings</h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">DEV ONLY</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Configure project URL and anon key during development.
                          </p>
                        </div>
                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          Supabase Dashboard
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Project URL or Project ID
                          </label>
                          <input
                            type="text"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            placeholder="e.g. https://your-project.supabase.co or your-project-id"
                            className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Anon / Publishable API Key
                          </label>
                          <input
                            type="password"
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Service Role Secret Key (Enables Direct auth.users Sync)
                          </label>
                          <input
                            type="password"
                            value={inputServiceKey}
                            onChange={(e) => setInputServiceKey(e.target.value)}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role secret)"
                            className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 outline-none transition-all"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Found in Supabase Dashboard → Settings → API → Project API keys → service_role. Required to identify all 11 auth accounts.
                          </p>
                        </div>

                        {testMessage && (
                          <div
                            className={`p-3 rounded-xl text-xs font-medium border ${
                              testStatus === "success"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-red-50 text-red-800 border-red-200"
                            }`}
                          >
                            {testMessage}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            disabled={!inputUrl.trim() || testStatus === "testing"}
                            onClick={async () => {
                              setTestStatus("testing");
                              setTestMessage("");
                              let testTarget = inputUrl.trim();
                              if (/^[a-z0-9_-]+$/i.test(testTarget) && !testTarget.includes(".")) {
                                testTarget = `https://${testTarget}.supabase.co`;
                              } else if (!/^https?:\/\//i.test(testTarget)) {
                                testTarget = `https://${testTarget.replace(/^\/+/, "")}`;
                              }
                              try {
                                const res = await fetch(`${testTarget}/auth/v1/health`);
                                if (res.ok || res.status < 500) {
                                  setTestStatus("success");
                                  setTestMessage("Domain is live! Supabase Auth service responded successfully.");
                                } else {
                                  setTestStatus("error");
                                  setTestMessage(`Supabase returned HTTP ${res.status}. Check your project settings.`);
                                }
                              } catch (err: any) {
                                setTestStatus("error");
                                setTestMessage(
                                  `Server IP address could not be found (${err?.message || "ENOTFOUND"}). Make sure this project is unpaused or active in your Supabase dashboard.`
                                );
                              }
                            }}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {testStatus === "testing" ? "Testing DNS & Ping..." : "Test Connection"}
                          </button>

                          <button
                            type="button"
                            disabled={!inputUrl.trim() || !inputKey.trim()}
                            onClick={() => {
                              setCustomSupabaseCredentials(inputUrl, inputKey, inputServiceKey);
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D4F636] hover:bg-[#c2e42b] text-black transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                          >
                            Save Credentials &amp; Reload
                          </button>

                          {Boolean(localStorage.getItem("skill2bills_supabase_url")) && (
                            <button
                              type="button"
                              onClick={() => {
                                clearCustomSupabaseCredentials();
                              }}
                              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                            >
                              Reset to Default
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">Supabase Auth Synchronization Tools</div>
                        <p className="text-[11px] text-slate-500">
                          Tools to identify and synchronize your 11 registered creator accounts.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSyncModalOpen(true)}
                          className="bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                          Direct API Sync
                        </button>
                        <button
                          type="button"
                          onClick={() => setSqlModalOpen(true)}
                          className="bg-slate-900 hover:bg-black text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                          View SQL Script
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleClearLocalRoster}
                      className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear Local Test Leads</span>
                    </button>

                    <button
                      type="button"
                      onClick={onBackToWebsite}
                      className="bg-slate-900 hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      Return to Website
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
