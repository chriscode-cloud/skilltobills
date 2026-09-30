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
        title: "Module 1: Foundations of AI Influencer Marketing",
        orderIndex: 1,
        lessons: [
          {
            id: "les-ai-1",
            moduleId: "mod-ai-1",
            title: "Introduction to AI Influencers",
            duration: "7:47.9",
            videoUrl: "https://www.youtube.com/embed/vRPO57Qhg4U?si=qO39NYrFoiM0mywr&start=0&end=468&controls=1",
            orderIndex: 1,
            bodyContent: `Core Concept Overview
This foundational lesson explores the rapid evolution of virtual creators and breaks down how modern generative models allow creators to build 24/7 scalable AI influencers. Rather than treating an AI persona as simple viral content, successful creators treat them as automated digital assets that solve specific audience problems and capture leads.

Key Takeaways & Chapter Breakdown

1. The Technological Paradigm Shift
- Model Breakthroughs: Recent generative updates have eliminated legacy issues like robotic speech, unnatural lip-sync, and uncanny facial expressions.
- Scalability: AI influencers operate as digital extensions that can publish daily across multiple platforms (Instagram, TikTok, YouTube Shorts) without requiring on-camera presence, studio lighting, or physical filming.

2. Real-World Case Studies & Personas
- Lifestyle & Wealth Personas: High-engagement profiles (e.g., Omar Wisman, Jing Chen) leverage aspirational storytelling to sell courses, software, or digital products via bio links.
- Niche Habit & Transformation Personas: Accounts focused on physical fitness or self-improvement drive multi-million view virality by tapping into dramatic transformation arcs.
- Archetype Niches: Storytelling and wisdom-driven accounts (e.g., philosophical or spiritual personas) generate massive organic reach by creating emotional connections with viewers.

3. The 3 Archetypes of AI Influencers
• Archetype 1: Entertainment
  - Focus & Content Style: Memes, funny clips, viral stories
  - Reach Potential: Very High
  - Monetization Viability: Low (Viewers scroll past without converting)
• Archetype 2: Aesthetic / Lifestyle
  - Focus & Content Style: Visual models, fashion, aesthetic renders
  - Reach Potential: High
  - Monetization Viability: Moderate (High competition, relies heavily on brand deals)
• Archetype 3: Problem-Solving
  - Focus & Content Style: Targeted advice (dating, finance, fitness, habits)
  - Reach Potential: Targeted / Niche
  - Monetization Viability: Extremely High (Builds deep trust and direct monetization)

Strategic Rule: Always build around a Problem-Solving Archetype. High-intent views that solve a specific problem are significantly more valuable than generic viral views.

Why 99% of AI Influencers Fail
- Generic Quality: Relying on default prompts results in generic faces, unnatural vocal cadences, and recycled scripts that viewers scroll past immediately.
- Lack of Direction: Posting random, disconnected topics instead of sticking to a tight niche persona destroys audience retention and platform authority.
- Chasing Views Instead of Systems: Treating the page as "content-first" rather than a structured conversion funnel with a call-to-action (CTA) results in high view counts with zero revenue.`
          },
          {
            id: "les-ai-2",
            moduleId: "mod-ai-1",
            title: "Defining Your AI Persona",
            duration: "5:47",
            videoUrl: "https://www.youtube.com/embed/z6FZGXKCF50?si=6BD2R0NKXjzvYMXg&start=0&end=347&controls=1",
            orderIndex: 2,
            bodyContent: "Develop a detailed identity for your AI influencer, including backstory, personality traits, and target audience, crucial for building a loyal following and maintaining engagement. \"If she drifts between photos, the fan who notices is the fan who stops paying.\""
          },
          {
            id: "les-ai-3",
            moduleId: "mod-ai-1",
            title: "Legal & Ethical Frameworks",
            duration: "3:10",
            videoUrl: "https://www.youtube.com/embed/TJ5Ixwp-59c?si=NThilcsDjyoDD7yp&start=0&controls=1",
            orderIndex: 3,
            bodyContent: "Publishing AI content requires adherence to evolving international regulations, disclosure mandates, and intellectual property standards. Understanding watermarking rules, creator disclosures, and legal boundaries prevents account penalties, copyright disputes, and regulatory enforcement."
          }
        ]
      },
      {
        id: "mod-ai-2",
        courseId: "course-ai",
        title: "Module 2: Advanced Character Design & Consistency",
        orderIndex: 2,
        lessons: [
          {
            id: "les-ai-4",
            moduleId: "mod-ai-2",
            title: "Casting Your AI Model",
            duration: "6:40",
            videoUrl: "https://www.youtube.com/embed/wsszCSX0EtE?si=OIk04wS4v2C924jQ&start=45&end=445&controls=1",
            orderIndex: 1,
            bodyContent: "The core process of creating a consistent AI influencer revolves around generating a multi-angle character board to serve as a persistent reference image, paired with scene swapping and free 4K upscaling to generate unlimited photorealistic content."
          },
          {
            id: "les-ai-5",
            moduleId: "mod-ai-2",
            title: "Achieving Visual Consistency",
            duration: "8:12",
            videoUrl: "https://www.youtube.com/embed/zV8EPHM1d4c?si=I-RP4av0kOxODIxF&start=67&controls=1",
            orderIndex: 2,
            bodyContent: "Implement advanced techniques for maintaining facial geometry and overall appearance across diverse poses, outfits, and lighting conditions. \"One face that stays identical in every image. That's the whole technical problem.\""
          },
          {
            id: "les-ai-6",
            moduleId: "mod-ai-2",
            title: "Wardrobe, Styling & Environment Design",
            duration: "4:05",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 3,
            bodyContent: "Develop a consistent aesthetic for your AI's attire and background environments to enhance realism and brand identity."
          }
        ]
      },
      {
        id: "mod-ai-3",
        courseId: "course-ai",
        title: "Module 3: Dynamic Content Creation",
        orderIndex: 3,
        lessons: [
          {
            id: "les-ai-7",
            moduleId: "mod-ai-3",
            title: "Image-to-Video Animation",
            duration: "4:40",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 1,
            bodyContent: "Learn to transform static images into dynamic video clips using tools like Kling AI and Runway Gen-3, emphasizing realistic motion and minimal distortion."
          },
          {
            id: "les-ai-8",
            moduleId: "mod-ai-3",
            title: "Realistic Voice & Lip-Sync",
            duration: "5:10",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 2,
            bodyContent: "Integrate AI-generated voices from platforms like ElevenLabs with precise lip-sync animation using tools such as Hedra or HeyGen for compelling spoken content."
          },
          {
            id: "les-ai-9",
            moduleId: "mod-ai-3",
            title: "Motion Control & Special Effects",
            duration: "4:15",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 3,
            bodyContent: "Utilize advanced tools like Viggle AI for specific motion control and explore techniques for adding special effects and seamless transitions in video editing software."
          }
        ]
      },
      {
        id: "mod-ai-4",
        courseId: "course-ai",
        title: "Module 4: Audience Engagement & Platform Strategy",
        orderIndex: 4,
        lessons: [
          {
            id: "les-ai-10",
            moduleId: "mod-ai-4",
            title: "Building a Multi-Platform Presence",
            duration: "3:55",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 1,
            bodyContent: "Strategize content distribution across key platforms like Instagram, TikTok, and Facebook, understanding each platform's unique audience and algorithm. \"It's Instagram, and it's a numbers game with rules.\""
          },
          {
            id: "les-ai-11",
            moduleId: "mod-ai-4",
            title: "Crafting Engaging Narratives",
            duration: "4:20",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 2,
            bodyContent: "Develop compelling storylines and content series that resonate with your target audience, fostering community and driving interaction."
          },
          {
            id: "les-ai-12",
            moduleId: "mod-ai-4",
            title: "Community Management & Interaction",
            duration: "3:30",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 3,
            bodyContent: "Learn best practices for responding to comments, managing direct messages, and building an engaged community around your AI influencer."
          }
        ]
      },
      {
        id: "mod-ai-5",
        courseId: "course-ai",
        title: "Module 5: Monetization & Business Acumen",
        orderIndex: 5,
        lessons: [
          {
            id: "les-ai-13",
            moduleId: "mod-ai-5",
            title: "Direct Fan Monetization",
            duration: "5:05",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 1,
            bodyContent: "Explore strategies for converting followers into paying subscribers on platforms like Fanvue, focusing on exclusive content and pay-per-view interactions. \"The money actually is... from chat messages. Subscriptions are about a seventh.\""
          },
          {
            id: "les-ai-14",
            moduleId: "mod-ai-5",
            title: "Brand Partnerships & Sponsorships",
            duration: "4:35",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 2,
            bodyContent: "Identify potential brand collaborations and learn how to pitch your AI influencer for paid endorsements and sponsored content."
          },
          {
            id: "les-ai-15",
            moduleId: "mod-ai-5",
            title: "Diversified Income Streams",
            duration: "3:50",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 3,
            bodyContent: "Discover alternative monetization methods, such as offering AI-generated product photography services or selling digital assets created by your AI."
          }
        ]
      },
      {
        id: "mod-ai-6",
        courseId: "course-ai",
        title: "Module 6: Analytics, Optimization & Future Trends",
        orderIndex: 6,
        lessons: [
          {
            id: "les-ai-16",
            moduleId: "mod-ai-6",
            title: "Performance Tracking & Analytics",
            duration: "4:00",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 1,
            bodyContent: "Utilize analytics tools to monitor engagement, identify successful content, and optimize your strategy for continuous growth."
          },
          {
            id: "les-ai-17",
            moduleId: "mod-ai-6",
            title: "Iterative Improvement & A/B Testing",
            duration: "3:45",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 2,
            bodyContent: "Implement a data-driven approach to content creation, constantly testing and refining your methods based on audience feedback and performance metrics."
          },
          {
            id: "les-ai-18",
            moduleId: "mod-ai-6",
            title: "Staying Ahead of the Curve",
            duration: "4:10",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 3,
            bodyContent: "Explore emerging AI tools, evolving platform policies, and future trends in the AI influencer space to adapt and innovate."
          }
        ]
      },
      {
        id: "mod-ai-7",
        courseId: "course-ai",
        title: "Module 7: The UGC Brand Pitch Pipeline",
        orderIndex: 7,
        lessons: [
          {
            id: "les-ai-19",
            moduleId: "mod-ai-7",
            title: "Understanding AI-Powered UGC",
            duration: "4:20",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 1,
            bodyContent: "Differentiate between traditional UGC and AI-generated UGC, highlighting the advantages in terms of speed, cost, and testing efficiency for brands."
          },
          {
            id: "les-ai-20",
            moduleId: "mod-ai-7",
            title: "Building Your AI UGC Portfolio",
            duration: "4:45",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 2,
            bodyContent: "Learn to create a compelling portfolio showcasing your AI influencer's UGC capabilities, focusing on quality, variety, and ease of review for potential brands. \"I’d rather have 6 good videos than 20 average ones.\""
          },
          {
            id: "les-ai-21",
            moduleId: "mod-ai-7",
            title: "Proactive Brand Outreach & Pitching",
            duration: "5:15",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 3,
            bodyContent: "Master techniques for identifying target brands, finding key contacts, and crafting personalized pitches that highlight the value of AI-generated UGC. \"Proactive outreach beats platforms.\""
          }
        ]
      }
    ]
  },
  {
    id: "course-streaming",
    slug: "live-streaming",
    title: "Live Streaming & Broadcast Engineering",
    description: "Master OBS Studio, multi-camera audio routing, Twitch alerts, and hardware encoders to manage top streamers' live shows.",
    badge: "Tech Heavy",
    discordUrl: "https://discord.gg",
    modules: [
      {
        id: "mod-stream-1",
        courseId: "course-streaming",
        title: "Broadcast Architecture & Hardware Setup",
        orderIndex: 1,
        lessons: [
          {
            id: "les-stream-1",
            moduleId: "mod-stream-1",
            title: "OBS Studio Master Configuration",
            duration: "3:45",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 1,
            bodyContent: "Optimal canvas resolutions, bitrate calculations for Twitch vs YouTube, NVENC encoding settings, and zero-dropped-frame configurations.",
            resources: [{ name: "OBS 60FPS Optimization Checklist", type: "download", url: "#" }],
            quiz: {
              question: "What is the recommended audio sample rate across all devices to prevent drift?",
              options: ["44.1 kHz", "48.0 kHz", "96.0 kHz"],
              answerIndex: 1,
              explanation: "48.0 kHz is the universal standard for video broadcast sync."
            }
          },
          {
            id: "les-stream-2",
            moduleId: "mod-stream-1",
            title: "Audio Routing & Noise Gate Filters",
            duration: "4:30",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 2,
            bodyContent: "Setup virtual audio cables (Voicemeeter / Elgato Wavelink) to separate Discord voices, game sound, Spotify, and microphone tracks.",
            resources: [{ name: "Audio Routing Preset Guide", type: "template", url: "#" }]
          }
        ]
      }
    ]
  },
  {
    id: "course-youtube",
    slug: "youtube-automation",
    title: "Faceless YouTube Automation",
    description: "Build scalable content systems using AI research, dynamic voice synthesis, automated stock b-roll, and high-CTR thumbnail psychology.",
    badge: "High Retainer",
    discordUrl: "https://discord.gg",
    modules: [
      {
        id: "mod-yt-1",
        courseId: "course-youtube",
        title: "Niche Selection & Automated Scriptwriting",
        orderIndex: 1,
        lessons: [
          {
            id: "les-yt-1",
            moduleId: "mod-yt-1",
            title: "Identifying High-RPM Faceless Niches",
            duration: "3:10",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 1,
            bodyContent: "Why finance, tech, documentary, and luxury niches command $15-$35 RPMs compared to gaming's $2 RPM.",
            resources: [{ name: "Top 25 High-RPM Niches 2026", type: "download", url: "#" }],
            quiz: {
              question: "What metric determines the ad revenue earned per 1,000 views?",
              options: ["CTR", "RPM (Revenue Per Mille)", "Retention Graph"],
              answerIndex: 1,
              explanation: "RPM measures the net creator revenue per thousand views after YouTube take-rate."
            }
          },
          {
            id: "les-yt-2",
            moduleId: "mod-yt-1",
            title: "Scriptwriting Engine with Structured Retention Curves",
            duration: "4:20",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 2,
            bodyContent: "How to structure 8-12 minute video scripts with 30-second loop payoffs that keep viewer retention above 55%.",
            resources: [{ name: "Documentary Script Master Template", type: "prompt", content: "Act 1: The Inciting Incident, Act 2: The Hidden Truth, Act 3: The Resolution" }]
          }
        ]
      }
    ]
  }
];
