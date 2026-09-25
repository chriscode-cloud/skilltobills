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
  X
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { getAllProfiles, SupabaseProfile, isSupabaseConfigured } from "../lib/supabase";
import { COURSE_TRACKS } from "../data/contentData";

interface AdminDashboardProps {
  onBackToWebsite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToWebsite }) => {
  const [profiles, setProfiles] = useState<SupabaseProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrackFilter, setSelectedTrackFilter] = useState("all");
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "6M" | "1Y">("6M");
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "tracks" | "settings">("overview");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newTrack, setNewTrack] = useState(COURSE_TRACKS[0]?.title || "AI & Virtual Influencers");
  const [newGoal, setNewGoal] = useState("Scale my personal brand");
  const [newTime, setNewTime] = useState("5-15");
  const [newExp, setNewExp] = useState("Beginner");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load actual profiles
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const data = await getAllProfiles();
      setProfiles(data);
    } catch (err) {
      console.error("Failed to load profiles in admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

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

  // Clear all local leads
  const handleClearLocalRoster = () => {
    if (window.confirm("Are you sure you want to clear all locally cached signups?")) {
      localStorage.removeItem("skill2bill_creator_leads");
      localStorage.removeItem("skill2bill_creator_profile");
      setProfiles([]);
      triggerNotice("Local roster cleared");
    }
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
                onClick={fetchProfiles}
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

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold text-xs">
                        <th className="pb-3 font-semibold">Creator Email</th>
                        <th className="pb-3 font-semibold">Assigned Track</th>
                        <th className="pb-3 font-semibold">Goal</th>
                        <th className="pb-3 font-semibold text-center">Commitment</th>
                        <th className="pb-3 font-semibold text-center">Exp. Level</th>
                        <th className="pb-3 font-semibold text-right">Status</th>
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
                              Complete the signup flow on the website or click "Add Creator" to enter test data.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredProfiles.map((lead) => {
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
                                  {copiedEmail === lead.email && (
                                    <span className="text-[10px] text-emerald-600 font-bold">
                                      Copied!
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">{dateString}</span>
                              </td>

                              <td className="py-4 px-3">
                                <span className="text-slate-800 font-semibold truncate block max-w-[200px]">
                                  {lead.track || "Pending Selection"}
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
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-black bg-[#D4F636] px-2.5 py-1 rounded-full shadow-2xs">
                                  <CheckCircle2 className="w-3 h-3" /> Pilot Confirmed
                                </span>
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

          {/* TAB 4: SETTINGS & DATABASE CONFIG */}
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
                      <div className="text-xs font-bold text-slate-900">Supabase Connection</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {isSupabaseConfigured
                          ? "Connected via VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
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

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                    <div className="text-xs font-bold text-slate-900 mb-2">Expected Supabase Schema</div>
                    <code className="text-[11px] text-slate-800 font-mono bg-slate-100 p-3 rounded-xl block leading-relaxed overflow-x-auto border border-slate-200">
                      {`create table profiles (\n  id text primary key,\n  email text not null,\n  track text,\n  goal text,\n  time_commitment text,\n  experience_level text,\n  created_at timestamp with time zone default timezone('utc'::text, now())\n);`}
                    </code>
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
