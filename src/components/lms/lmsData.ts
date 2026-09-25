import { Course } from "./types";

export const LMS_COURSES: Course[] = [
  {
    id: "course-clipping",
    slug: "content-clipping",
    title: "Content Clipping & Short-Form Video",
    description: "Build an automated high-velocity clipping studio. Repurpose long-form podcasts into viral TikToks and YouTube Shorts.",
    badge: "Most Popular",
    discordUrl: "https://discord.gg",
    modules: [
      {
        id: "mod-clip-1",
        courseId: "course-clipping",
        title: "Phase 1: Foundations & Architecture",
        orderIndex: 1,
        lessons: [
          {
            id: "les-clip-1",
            moduleId: "mod-clip-1",
            title: "Welcome to the Clipping Academy",
            duration: "2:45",
            videoUrl: "M7lc1UVf-VE", // Clean embed friendly ID
            orderIndex: 1,
            bodyContent: "Welcome to the official Skill2Bills Content Clipping pathway. In this curriculum, we ignore outdated YouTube video editing theories and focus strictly on 2026 high-retention short-form pipelines that convert views into affiliate dollars and client retainers.",
            resources: [
              { name: "Creator Onboarding Checklist (PDF)", type: "download", url: "#" },
              { name: "Creator Community Lounge", type: "link", url: "https://discord.gg" }
            ],
            quiz: {
              question: "What is the primary objective of high-retention short-form video in 2026?",
              options: [
                "Making 10-minute cinematic documentaries",
                "Capturing viewer attention in under 3 seconds and delivering condensed value",
                "Adding as many 3D transitions as possible"
              ],
              answerIndex: 1,
              explanation: "Short-form algorithms prioritize retention and watch time within the first 3 seconds above all else."
            }
          },
          {
            id: "les-clip-2",
            moduleId: "mod-clip-1",
            title: "Selecting Your Content Niche",
            duration: "3:18",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 2,
            bodyContent: "Not all podcasts are clippable. Discover the 3 core criteria for selecting streams: high controversy, clear punchlines, and high speaker authority.",
            resources: [
              { name: "Top 50 Clippable Podcasts Spreadsheet", type: "template", url: "#" }
            ],
            quiz: {
              question: "Which podcast format yields the highest organic clip velocity?",
              options: [
                "Unedited 4-hour ambient coding streams",
                "High-energy debate or counter-intuitive founder interviews",
                "Silent unboxings"
              ],
              answerIndex: 1,
              explanation: "Debates and provocative founder lessons have strong emotional hooks that drive instant comments and shares."
            }
          },
          {
            id: "les-clip-3",
            moduleId: "mod-clip-1",
            title: "Workstation Setup & CapCut Engine",
            duration: "4:12",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 3,
            bodyContent: "Configure your timeline, auto-caption presets, typography hierarchy, and export settings to ensure TikTok and Reels upload at crisp 1080x1920 60fps without bitrate compression.",
            resources: [
              { name: "Skill2Bills CapCut Color Preset (.cube)", type: "download", url: "#" },
              { name: "Dynamic Subtitle Font Bundle", type: "download", url: "#" }
            ]
          }
        ]
      },
      {
        id: "mod-clip-2",
        courseId: "course-clipping",
        title: "Phase 2: The Viral Hook Engine",
        orderIndex: 2,
        lessons: [
          {
            id: "les-clip-4",
            moduleId: "mod-clip-2",
            title: "Isolating the 3-Second Retention Hook",
            duration: "3:50",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 1,
            bodyContent: "Learn how to scrap long-form video archives to isolate viral moments before the host even finishes their sentence. We study pattern interrupts and text placement.",
            resources: [
              { name: "Viral Hook Formula Matrix (Notion)", type: "template", url: "#" }
            ],
            quiz: {
              question: "Where should the visual hook text be placed on a 9:16 mobile canvas?",
              options: [
                "At the very bottom behind the caption area",
                "In the center-upper third, above TikTok UI elements",
                "In the top-right corner"
              ],
              answerIndex: 1,
              explanation: "Placing text in the center-upper third avoids the description text, like buttons, and sound discs."
            }
          },
          {
            id: "les-clip-5",
            moduleId: "mod-clip-2",
            title: "Dynamic B-Roll & Visual Pacing",
            duration: "4:45",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 2,
            bodyContent: "Never let a video remain static for more than 2.5 seconds. Layering sound effects (whooshes, vinyl stops) and subtle zoom cuts.",
            resources: [
              { name: "Royalty-Free SFX Essential Pack (100+ Sounds)", type: "download", url: "#" }
            ]
          },
          {
            id: "les-clip-6",
            moduleId: "mod-clip-2",
            title: "Exporting & Multi-Platform Batching",
            duration: "5:20",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 3,
            bodyContent: "How to schedule 30 clips in under 45 minutes using batch tools and native schedulers across TikTok, Instagram Reels, and YouTube Shorts.",
            resources: [
              { name: "Batch Uploading SOP Guide", type: "download", url: "#" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "course-ai",
    slug: "ai-virtual-influencers",
    title: "AI & Virtual Influencers",
    description: "Generate photorealistic, consistent digital creators. Monetize virtual talent through brand deals and digital merch.",
    badge: "High Growth",
    discordUrl: "https://discord.gg",
    modules: [
      {
        id: "mod-ai-1",
        courseId: "course-ai",
        title: "Introduction",
        orderIndex: 1,
        lessons: [
          {
            id: "les-ai-1",
            moduleId: "mod-ai-1",
            title: "Welcome to the Future of Influence",
            duration: "2:57",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 1,
            bodyContent: "Discover how AI-generated virtual talent is disrupting traditional creator partnerships and operating at 95% profit margins.",
            resources: [{ name: "AI Influencer Starter Kit", type: "download", url: "#" }]
          },
          {
            id: "les-ai-2",
            moduleId: "mod-ai-1",
            title: "Before You Start",
            duration: "3:40",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 2,
            bodyContent: "Legal compliance, ethical disclosures, platform safety guidelines, and setup requirements.",
            resources: [{ name: "FTC & AI Platform Disclosure Guide", type: "download", url: "#" }]
          }
        ]
      },
      {
        id: "mod-ai-2",
        courseId: "course-ai",
        title: "Creating Your Model",
        orderIndex: 2,
        lessons: [
          {
            id: "les-ai-3",
            moduleId: "mod-ai-2",
            title: "Select Your Niche",
            duration: "2:08",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 1,
            bodyContent: "Fitness, tech lifestyle, gaming, or high fashion. How to choose a lucrative niche with active brand budgets.",
            resources: [{ name: "Niche Monetization Calculator", type: "template", url: "#" }]
          },
          {
            id: "les-ai-4",
            moduleId: "mod-ai-2",
            title: "Create Your Character & Facial Consistency",
            duration: "5:15",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 2,
            bodyContent: "The master method for generating consistent face meshes across multiple scenes, outfits, and lighting conditions.",
            resources: [
              { name: "Face-Lock LoRA Prompts (.txt)", type: "prompt", content: "photorealistic 8k portrait, symmetrical lighting, consistent seed #8921" }
            ],
            quiz: {
              question: "What tool or technique ensures facial features do not morph between images?",
              options: [
                "Random seeds every render",
                "Fixed seeds combined with FaceID LoRAs or IP-Adapters",
                "Low resolution renders"
              ],
              answerIndex: 1,
              explanation: "IP-Adapter and trained LoRAs preserve identical facial bone structure across different prompts."
            }
          }
        ]
      }
    ]
  }
];
