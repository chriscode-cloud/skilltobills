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
    category: "Fanvue & Digital Models",
    tagline: "Build 5-figure faceless revenue streams with hyper-realistic AI avatars",
    description:
      "Design hyper-realistic AI personas, build loyal Fanvue & Instagram subscriber bases, and automate 5-figure monthly sponsorships without ever showing your face.",
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
    keyTools: ["Fanvue", "Midjourney v6", "ComfyUI", "Magnific AI", "ManyChat"]
  },
  {
    id: "content-creation",
    title: "Viral Content & Short-Form UGC",
    category: "Short-Form & UGC",
    tagline: "Turn 15-second smartphone edits into brand deals & algorithmic dominance",
    description:
      "Get hired as a professional creator or start earning independently with a portfolio that shows what you can do across TikTok, YouTube Shorts, and UGC brand contracts.",
    bgColor: "bg-[#EADFF5]",
    bgHex: "#EADFF5",
    badge: "High Demand",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop",
    earningsRange: "$4,200 – $19,500 / month",
    duration: "6 Weeks • Live Workshops",
    difficulty: "All Levels",
    studentsCount: "22,410 enrolled",
    curriculum: [
      "Psychology of the 3-Second Hook & Retention Curve",
      "CapCut Pro & Premiere Viral Pacing Workflows",
      "Landing $1,500/video UGC Contracts with Global Brands",
      "YouTube Automation & Faceless Channel Scaling",
      "TikTok Creator Rewards Program & RPM Optimization"
    ],
    keyTools: ["CapCut", "TikTok Shop", "Notion Creator Hub", "ElevenLabs", "Epidemic Sound"]
  },
  {
    id: "live-streaming",
    title: "Live Streaming & Gaming",
    category: "Twitch, Kick & YouTube",
    tagline: "Monetize your passion with loyal viewer bases and high-margin affiliate streams",
    description:
      "Launch your stream career, start a community, or build income streams that don't depend on anyone else deciding you're ready on Twitch, Kick, and YouTube Live.",
    bgColor: "bg-[#FAECE1]",
    bgHex: "#FAECE1",
    badge: "Community Favorite",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    earningsRange: "$3,800 – $24,000 / month",
    duration: "5 Weeks • Masterclass",
    difficulty: "Beginner Friendly",
    studentsCount: "18,950 enrolled",
    curriculum: [
      "OBS Studio Setup, Audio Compression & Dynamic Overlays",
      "Speedrunning to Twitch Affiliate & Kick Creator Program",
      "Engaging Dead Chats: Viewer Retention Techniques",
      "Securing Energy Drink, Tech & VPN Sponsorship Contracts",
      "Merchandising & Multi-Platform VOD Repurposing"
    ],
    keyTools: ["OBS Studio", "Streamlabs", "Discord", "Kick Studio", "Voicemod"]
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
