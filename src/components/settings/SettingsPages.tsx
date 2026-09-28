import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  User,
  Shield,
  Bell,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink
} from "lucide-react";
import { AuthUser, setStoredUser, clearStoredUser } from "../../lib/auth";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { usePageMeta } from "../../hooks/usePageMeta";

interface SettingsPagesProps {
  currentUser: AuthUser;
}

export const SettingsPages: React.FC<SettingsPagesProps> = ({ currentUser }) => {
  const location = useLocation();

  const isProfile = location.pathname.endsWith("/profile") || location.pathname === "/settings";
  const isAccount = location.pathname.endsWith("/account");
  const isNotifications = location.pathname.endsWith("/notifications");

  usePageMeta("Student Settings", "Manage your profile, account preferences, and notification settings.");

  // Profile Form State
  const [name, setName] = useState(currentUser.name || "");
  const [username, setUsername] = useState(currentUser.username || "");
  const [bio, setBio] = useState(currentUser.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar || "");
  const [links, setLinks] = useState<Record<string, string>>(currentUser.links || {});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Account State
  const [deletionReason, setDeletionReason] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionSubmitted, setDeletionSubmitted] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  // Notification State
  const [emailNotifications, setEmailNotifications] = useState(
    currentUser.emailNotifications !== false
  );
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);

    // Validate username if provided
    if (username.trim()) {
      const cleanUsername = username.trim().toLowerCase();
      if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
        setProfileError("Username must be between 3 and 20 characters and contain only letters, numbers, and underscores.");
        return;
      }
    }

    setSavingProfile(true);

    try {
      const updatedUser: AuthUser = {
        ...currentUser,
        name: name.trim() || currentUser.name,
        username: username.trim() ? username.trim().toLowerCase() : undefined,
        bio: bio.trim(),
        avatar: avatarUrl.trim(),
        links,
      };

      setStoredUser(updatedUser);

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from("profiles")
          .update({
            name: name.trim(),
            username: username.trim() ? username.trim().toLowerCase() : null,
            bio: bio.trim(),
            avatar_url: avatarUrl.trim(),
            links,
          })
          .eq("id", currentUser.id);

        if (error) {
          if (error.code === "23505") {
            throw new Error("This username is already taken by another creator.");
          }
          throw error;
        }
      }

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err?.message || "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Data Export
  const handleExportData = async () => {
    setExportingData(true);
    try {
      let exportPayload: any = {
        user: currentUser,
        exportedAt: new Date().toISOString(),
      };

      if (isSupabaseConfigured && supabase) {
        const [progressRes, enrollmentsRes] = await Promise.all([
          supabase.from("user_progress").select("*").eq("user_id", currentUser.id),
          supabase.from("enrollments").select("*").eq("user_id", currentUser.id),
        ]);

        exportPayload.completedLessons = progressRes.data || [];
        exportPayload.enrollments = enrollmentsRes.data || [];
      }

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `skill2bills-account-data-${currentUser.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Export failed:", err);
    } finally {
      setExportingData(false);
    }
  };

  // Request Deletion
  const handleSubmitDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletionReason.trim()) return;

    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from("deletion_requests").insert({
          user_id: currentUser.id,
          email: currentUser.email,
          reason: deletionReason.trim(),
          status: "pending",
        });
      }
      setDeletionSubmitted(true);
      setShowDeleteModal(false);
    } catch (err) {
      console.warn("Deletion request failed:", err);
      setDeletionSubmitted(true);
      setShowDeleteModal(false);
    }
  };

  // Toggle Email Notifications
  const handleToggleNotifications = async (val: boolean) => {
    setEmailNotifications(val);
    setSavingNotifications(true);

    try {
      const updatedUser: AuthUser = {
        ...currentUser,
        emailNotifications: val,
      };
      setStoredUser(updatedUser);

      if (isSupabaseConfigured && supabase) {
        await supabase
          .from("profiles")
          .update({ email_notifications: val })
          .eq("id", currentUser.id);
      }

      setNotificationSuccess(true);
      setTimeout(() => setNotificationSuccess(false), 2500);
    } catch {
      // offline
    } finally {
      setSavingNotifications(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 lg:p-10 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Settings &amp; Preferences
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Manage your creator profile, account export, and notification delivery.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-zinc-800 gap-2">
        <Link
          to="/settings/profile"
          className={`pb-3 px-4 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
            isProfile
              ? "border-[#D4F636] text-[#D4F636]"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </Link>

        <Link
          to="/settings/account"
          className={`pb-3 px-4 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
            isAccount
              ? "border-[#D4F636] text-[#D4F636]"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Account &amp; Data</span>
        </Link>

        <Link
          to="/settings/notifications"
          className={`pb-3 px-4 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
            isNotifications
              ? "border-[#D4F636] text-[#D4F636]"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </Link>
      </div>

      {/* 1. Profile Tab */}
      {isProfile && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-white">Public Profile Information</h2>

            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Profile updated successfully.</span>
              </div>
            )}

            {profileError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{profileError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs outline-none focus:border-[#D4F636]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                  Username (unique handle)
                </label>
                <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 focus-within:border-[#D4F636]">
                  <span className="text-zinc-500 text-xs mr-1 font-mono">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alex_creator"
                    className="w-full bg-transparent text-white text-xs outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs outline-none focus:border-[#D4F636] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                Bio &amp; Creator Focus
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short-form video editor specializing in podcasts and stream repurposing..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs outline-none focus:border-[#D4F636] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2">
                External Creator Links
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="url"
                  placeholder="YouTube URL"
                  value={links.youtube || ""}
                  onChange={(e) => setLinks({ ...links, youtube: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs outline-none focus:border-[#D4F636]"
                />
                <input
                  type="url"
                  placeholder="Twitter / X URL"
                  value={links.twitter || ""}
                  onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs outline-none focus:border-[#D4F636]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="py-2.5 px-5 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {savingProfile ? "Saving Profile..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 2. Account & Data Tab */}
      {isAccount && (
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white">Account Details</h2>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs text-zinc-400 block mb-1">Email Address</span>
              <span className="text-sm font-bold text-white font-mono">{currentUser.email}</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs text-zinc-400 block mb-1">Role &amp; Permissions</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-[#D4F636]">
                {currentUser.role?.toUpperCase() || "STUDENT"}
              </span>
            </div>
          </div>

          {/* Data Export Box */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-[#D4F636]" />
              <span>Export Account Data (GDPR / Privacy Compliance)</span>
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Download a complete JSON export of your student profile, completed lesson records, and course enrollments.
            </p>
            <button
              type="button"
              onClick={handleExportData}
              disabled={exportingData}
              className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 border border-zinc-800 cursor-pointer"
            >
              {exportingData ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{exportingData ? "Preparing Export..." : "Download My Data (JSON)"}</span>
            </button>
          </div>

          {/* Account Deletion Request Box */}
          <div className="bg-zinc-950 border border-red-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>Request Account Deletion</span>
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              To request complete deletion of your account and all associated lesson records, submit a deletion request below. An administrator will verify and process the purge.
            </p>

            {deletionSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                Your deletion request has been submitted. Our team will process your request within 7 business days.
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs border border-red-500/30 transition-colors cursor-pointer"
              >
                Request Account Deletion
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Notifications Tab */}
      {isNotifications && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-white">Email Preferences</h2>

          {notificationSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Notification preferences saved.</span>
            </div>
          )}

          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">Curriculum &amp; Platform Updates</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Receive emails when new lessons, tool guides, and exercises are released.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              disabled={savingNotifications}
              onChange={(e) => handleToggleNotifications(e.target.checked)}
              className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-[#D4F636] focus:ring-[#D4F636] cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Deletion Confirmation Dialog */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Confirm Account Deletion Request</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Please tell us why you are requesting account deletion. All progress and enrollments will be permanently purged once confirmed.
            </p>
            <form onSubmit={handleSubmitDeletion} className="space-y-4">
              <textarea
                required
                rows={3}
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Reason for deletion..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs outline-none focus:border-red-400 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
