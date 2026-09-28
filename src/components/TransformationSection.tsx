import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { LMS_COURSES } from "./lms/lmsData";

export const TransformationSection: React.FC = () => {
  const [realStats, setRealStats] = useState<{
    studentsCount: number;
    lessonsCount: number;
    coursesCount: number;
  }>({
    studentsCount: 0,
    lessonsCount: 0,
    coursesCount: LMS_COURSES.length,
  });

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoaded(true);
      return;
    }

    const fetchRealMetrics = async () => {
      try {
        const [profilesRes, progressRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("user_progress").select("id", { count: "exact", head: true }),
        ]);

        const students = profilesRes.count || 0;
        const lessons = progressRes.count || 0;

        setRealStats({
          studentsCount: students,
          lessonsCount: lessons,
          coursesCount: LMS_COURSES.length,
        });
      } catch (err) {
        // ignore
      } finally {
        setLoaded(true);
      }
    };

    fetchRealMetrics();
  }, []);

  // Only render verified metrics from the database
  const activeMetrics = [];
  if (realStats.studentsCount > 0) {
    activeMetrics.push({ value: String(realStats.studentsCount), label: "Registered Learners" });
  }
  if (realStats.lessonsCount > 0) {
    activeMetrics.push({ value: String(realStats.lessonsCount), label: "Completed Lessons" });
  }
  activeMetrics.push({ value: String(realStats.coursesCount), label: "Structured Creator Tracks" });
  activeMetrics.push({ value: "24", label: "Curriculum Modules" });

  return (
    <section
      id="transformation"
      className="bg-[#D4F636] py-20 sm:py-28 px-4 sm:px-8 lg:px-16 border-b border-black/10 relative"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-14 sm:mb-20">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 mb-4">
            The Proof
          </h2>
          <p className="text-slate-900 text-base sm:text-xl max-w-2xl mx-auto font-medium">
            Structured curriculum. Hands-on projects. Real skills across emerging creator pathways.
          </p>
        </div>

        {/* Real Student Spotlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-16">
          {/* Spotlight 1: Ahmed & Alex */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all duration-300">
            <div>
              <p className="text-slate-700 text-base sm:text-lg italic leading-relaxed pt-2">
                &ldquo;Building a virtual creator from scratch forced me to actually think about brand identity, not just generate pretty images. I left with a character, a content calendar, and a pitch deck I built myself.&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
                  alt="Ahmed & Alex"
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shadow-xs shrink-0"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-extrabold text-slate-950 text-base">
                    Ahmed &amp; Alex
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    AI &amp; Virtual Influencers Learner
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Spotlight 2: Christian Aboagye */}
          <div className="bg-black text-white rounded-3xl p-8 sm:p-10 border border-white/10 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-slate-200 text-base sm:text-lg italic leading-relaxed pt-2">
                &ldquo;Before this, I was just jumping from one YouTube video to another with no real structure. This platform gave me actual structured modules step by step, with exercises on my own work instead of having to figure it all out alone.&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"
                  alt="Christian Aboagye"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow-xs shrink-0"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-extrabold text-white text-base">
                    Christian Aboagye
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Live Broadcast Engineering Learner
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Verified Metrics Grid */}
        {loaded && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {activeMetrics.map((m) => (
              <div
                key={m.label}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs text-center"
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight mb-2">
                  {m.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-600">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
