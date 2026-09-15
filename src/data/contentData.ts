export interface CourseTrack {
  id: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  bgColor: string; // Tailwind class
  bgHex: string;
  badge: string;
  image: string;
  earningsRange: string;
  duration: string;
  difficulty: string;
  studentsCount: string;
  curriculum: string[];
  keyTools: string[];
}

export interface TransformationStory {
  id: string;
  title: string;
  creatorName: string;
  role: string;
  platform: string;
  whatTheyBuilt: string;
  beforeIncome?: string;
  currentIncome?: string;
  quote: string;
  image: string;
  videoLength?: string;
}

export interface BlogArticle {
  id: string;
  category: string;
  title: string;
  readTime: string;
  date: string;
  image: string;
  summary: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
}

export const COURSE_TRACKS: CourseTrack[] = [
  {
    id: "ai-influencer",
    title: "AI & Virtual Influencers",
    category: "Faceless Creators & Digital Personas",
    tagline: "Build a consistent virtual character from scratch — no experience needed.",
    description:
      "Start with zero design or AI experience and walk through the exact process of building a virtual creator: character identity, visual consistency across posts, a content calendar, and how to actually pitch that character to a brand. You'll work with the same tools real virtual creator agencies use in 2026 — and you'll understand why each step matters, not just which buttons to click.",
    bgColor: "bg-[#D4F79E]",
    bgHex: "#D4F79E",
    badge: "Trending 2026",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    earningsRange: "$6,500 – $28,000 / month",
    duration: "4 Weeks • Self-Paced",
    difficulty: "Beginner to Pro",
    studentsCount: "14,820 enrolled",
    curriculum: [
      "Midjourney & Flux Hyper-Realistic Face Consistency",
      "Setting up Monetized Fanvue & Instagram Creator Funnels",
      "Automated Chatting & Direct Message AI Assistants",
      "Brand Sponsorship Pitching for Virtual Ambassadors",
      "Legal Compliance & AI Disclosures for Maximum Longevity"
    ],
    keyTools: [
      "Higgsfield AI Influencer Studio",
      "Midjourney",
      "Kling AI / HeyGen Avatar IV",
      "Canva",
      "ComfyUI"
    ]
  },
  {
    id: "content-creation",
    title: "Content Clipping",
    category: "Short-Form & UGC",
    tagline: "Turn someone else's long-form content into short clips that actually get watched.",
    description:
      "Learn the real workflow behind content clipping finding the right source material, using AI tools to identify and cut the strongest moments, captioning and formatting for each platform, and understanding the legal and platform rules that separate a legitimate clipping operation from copyright trouble.",
    bgColor: "bg-[#EADFF5]",
    bgHex: "#EADFF5",
    badge: "High Demand",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop",
    earningsRange: "$4,200 – $19,500 / month",
    duration: "6 Weeks • Live Workshops",
    difficulty: "All Levels",
    studentsCount: "22,410 enrolled",
    curriculum: [
      "Understanding the Clipping Ecosystem",
      "Content Rights & What You're Allowed to Clip",
      "Finding the Moment: What Makes a Clip Worth Cutting",
      "AI-Assisted Clipping Workflow",
      "Manual Editing Fundamentals (CapCut)",
      "Platform-Specific Formatting",
      "Building a Clip Portfolio & Sample Reel",
      "Understanding Campaigns & Realistic Expectations"
    ],
    keyTools: [
      "CapCut",
      "Opus Clip",
      "Vizard",
      "Klap",
      "Submagic",
      "Platform-provided tools"
    ]
  },
  {
    id: "live-streaming",
    title: "Live Streaming & Gaming",
    category: "Twitch, Kick & YouTube",
    tagline: "Build a stream and a community that holds up on its own, starting from zero.",
    description:
      "Learn to choose the right platform, set up your broadcast properly, go live for the first time, and build real (if small) viewer engagement, the retention techniques that matter more than expensive gear.",
    bgColor: "bg-[#FAECE1]",
    bgHex: "#FAECE1",
    badge: "Community Favorite",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    earningsRange: "$3,800 – $24,000 / month",
    duration: "5 Weeks • Masterclass",
    difficulty: "Beginner Friendly",
    studentsCount: "18,950 enrolled",
    curriculum: [
      "Choosing Your Platform",
      "Platform Setup From Zero",
      "Platform Requirements & Compliance",
      "Genuine Viewer Engagement (Including at Zero Viewers)",
      "Discord & Community Infrastructure",
      "Clipping Your Own Content for Discovery",
      "Multi-Platform Repurposing",
      "Building a Media Kit & Approaching Sponsors",
      "FTC Compliance & Disclosure",
      "Optional Path: Clipping for Other Creators"
    ],
    keyTools: [
      "OBS Studio",
      "Twitch Studio",
      "Streamlabs",
      "StreamElements",
      "Discord",
      "Eklipse",
      "Postiz",
      "Voicemod"
    ]
  },
  {
    id: "youtube-automation",
    title: "Faceless YouTube Automation",
    category: "Long-Form Automation & Channel Systems",
    tagline: "Scale automated cash-cow YouTube channels with AI workflows",
    description:
      "Learn how faceless YouTube channels are structured — research, scripting, AI voiceovers, and editing workflows that generate reliable AdSense and affiliate revenue.",
    bgColor: "bg-[#DDEBFA]",
    bgHex: "#DDEBFA",
    badge: "Trending 2026",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop",
    earningsRange: "$5,000 – $32,000 / month",
    duration: "6 Weeks • Project-Based",
    difficulty: "Beginner to Intermediate",
    studentsCount: "12,300 enrolled",
    curriculum: [
      "High-CPM Niche Selection & Competitor Intelligence",
      "AI Scripting Workflows for Maximum Viewer Retention",
      "ElevenLabs Voice Generation & Human-Like Cadence",
      "Thumbnail Psychology & Click-Through Rate Mastery",
      "Monetization Beyond AdSense: Affiliates & Digital Sponsorships"
    ],
    keyTools: ["ElevenLabs", "CapCut Pro", "Midjourney", "VidIQ", "YouTube Studio"]
  }
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "twitch-affiliate-blueprint",
    category: "TWITCH & KICK, STREAMING INCOME, SPONSORSHIPS",
    title: "How Beginners Are Hitting Twitch Affiliate and Signing $2k Brand Deals in 30 Days",
    readTime: "5 min read",
    date: "May 24, 2026",
    image: "https://images.unsplash.com/photo-1598550476439-6847785fdd52?q=80&w=800&auto=format&fit=crop",
    summary:
      "Breaking down the exact raid schedules, Discord funnel strategies, and warm-outreach email templates our members used to secure their first paid hardware partnerships.",
    author: {
      name: "Tariq Vance",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
      role: "Partnered Twitch Creator"
    }
  },
  {
    id: "anatomy-of-ai-influencer",
    category: "FANVUE & AI PERSONAS, PROMPT PACKS, CASE STUDIES",
    title: "The Step-by-Step Anatomy of a $10,000/Month Faceless AI Influencer on Fanvue",
    readTime: "7 min read",
    date: "June 02, 2026",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    summary:
      "From LoRA training and lighting prompts in Midjourney to high-converting subscriber tiers and automated DM messaging on Fanvue.",
    author: {
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
      role: "AI Agency Director"
    }
  },
  {
    id: "ai-video-tools-algorithm",
    category: "TIKTOK CREATOR REWARDS, VIRAL SHORT-FORM, AUTOMATION",
    title: "AI Tools for Viral Video Creation: What Matters for 2026 Algorithms?",
    readTime: "6 min read",
    date: "June 08, 2026",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
    summary:
      "Why pacing, sound design, and automated b-roll generators are outperforming traditional high-budget production setups on TikTok and Reels.",
    author: {
      name: "Devon Chen",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop",
      role: "Short-Form Growth Hacker"
    }
  }
];

export const TRANSFORMATION_STORIES: TransformationStory[] = [
  {
    id: "khadija-alex-ugc",
    title: "From No Gigs to $18,400 in Brand Deals in 3 Weeks",
    creatorName: "Khadija & Alex",
    role: "UGC Agency Partners",
    platform: "TikTok & Instagram",
    whatTheyBuilt: "From No Gigs to $18,400 in Brand Deals in 3 Weeks",
    beforeIncome: "$0 in freelance work",
    currentIncome: "$18,400 / month across 6 retainers",
    quote:
      "Brands don't care about your resume; they care if you can make a video stop thumbs scrolling. Skill2Bills gave us the exact pitch decks and lighting tricks.",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop",
    videoLength: "3:48"
  },
  {
    id: "ahmed-virtual-influencer",
    title: "4 Digital Avatars Generating Over $22k/month",
    creatorName: "Ahmed E.",
    role: "Agency Founder • Top 0.1% Fanvue Creator",
    platform: "Fanvue & Twitch",
    whatTheyBuilt: "4 digital avatars generating recurring subscriber revenue",
    beforeIncome: "$0 prior AI experience",
    currentIncome: "$22,000+ / month recurring",
    quote:
      "What started as learning AI persona creation grew into coaching others and eventually managing 4 digital avatars generating over $22k/month in recurring subscriber revenue.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    videoLength: "4:15"
  }
];
