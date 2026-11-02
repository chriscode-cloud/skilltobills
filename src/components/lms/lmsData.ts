import { Course } from "./types";

export const LMS_COURSES: Course[] = [
  {
    id: "course-clipping",
    slug: "content-clipping",
    title: "Content Clipping & Short-Form Video",
    description: "Build an automated high-velocity clipping studio. Repurpose long-form podcasts into viral TikToks and YouTube Shorts.",
    badge: "Coming Soon",
    isComingSoon: true,
    comingSoonMessage: "The Content Clipping & Short-Form Video curriculum is currently under production and launching soon for 2026 platform algorithms!",
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
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 1,
            bodyContent: `Core Concept Overview
Welcome to the official Skill2Bills Content Clipping pathway. In this curriculum, we ignore outdated YouTube video editing theories and focus strictly on 2026 high-retention short-form pipelines that convert views into affiliate dollars and client retainers.

Key Takeaways & Chapter Breakdown

1. The Short-Form Economy Shift
- Algorithmic Velocity: Short-form distribution platforms prioritize watch time within the first 3 seconds above all traditional cinematic metrics.
- Monetization Architecture: Transform raw video clips into high-converting affiliate funnels and monthly creator retainers.

2. Workflow Mastery
- Automated Pipelines: Build streamlined editing workflows that allow you to produce and schedule dozens of viral clips per week.

Strategic Rule: Always prioritize viewer retention and hook strength over complex 3D transitions.`,
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
            bodyContent: `Core Concept Overview
Not all podcasts are clippable. Discover the 3 core criteria for selecting streams: high controversy, clear punchlines, and high speaker authority.

Key Takeaways & Chapter Breakdown

1. Criteria for Clippable Streams
- Emotional Resonance: Select interviews and debates that trigger immediate emotional reactions (curiosity, anger, inspiration).
- Speaker Authority: Partner with recognized industry leaders whose quotes carry weight and instant credibility.

Strategic Rule: Focus on content with strong counter-intuitive arguments that drive instant comments and shares.`,
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
            bodyContent: `Core Concept Overview
Configure your timeline, auto-caption presets, typography hierarchy, and export settings to ensure TikTok and Reels upload at crisp 1080x1920 60fps without bitrate compression.

Key Takeaways & Chapter Breakdown

1. Timeline & Typography Architecture
- Auto-Caption Styling: Use bold, high-contrast subtitles positioned in the upper-middle third of the canvas to avoid overlay UI.
- Color Grading & Export: Apply subtle sharpening and export at 60fps with maximum bitrate.

Strategic Rule: Technical fidelity matters. Clean exports prevent platform compression blur.`,
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
            bodyContent: `Core Concept Overview
Learn how to scrape long-form video archives to isolate viral moments before the host even finishes their sentence. We study pattern interrupts and text placement.

Key Takeaways & Chapter Breakdown

1. Hook Engineering
- Pattern Interrupts: Start clips mid-sentence or with a shocking statement to reset viewer attention.

Strategic Rule: Never start a short with introductory greetings or sponsor reads. Start directly at the climax of the quote.`,
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
            bodyContent: `Core Concept Overview
Never let a video remain static for more than 2.5 seconds. Layering sound effects (whooshes, vinyl stops) and subtle zoom cuts.

Key Takeaways & Chapter Breakdown

1. Visual Pacing & SFX
- Cut Frequency: Introduce punch-ins, graphics, or B-roll every 2 to 3 seconds to reset viewer focus.

Strategic Rule: Sound design carries 50% of the visual weight. Always layer subtle whooshes on zoom transitions.`,
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
            bodyContent: `Core Concept Overview
How to schedule 30 clips in under 45 minutes using batch tools and native schedulers across TikTok, Instagram Reels, and YouTube Shorts.

Key Takeaways & Chapter Breakdown

1. Batch Workflow Systems
- Scheduling Infrastructure: Use multi-platform bulk upload tools to syndicate content seamlessly.

Strategic Rule: Consistency beats perfection. Batch production is the only way to scale output sustainably.`,
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
            duration: "7:48",
            videoUrl: "https://www.youtube.com/embed/vRPO57Qhg4U?si=qO39NYrFoiM0mywr&start=0&end=468&controls=0",
            orderIndex: 1,
            bodyContent: `Core Concept Overview
This foundational lesson explores the rapid evolution of virtual creators and breaks down how modern generative models allow creators to build 24/7 scalable AI influencers. Rather than treating an AI persona as simple viral content, successful creators treat them as automated digital assets that solve specific audience problems and capture leads.

Key Takeaways & Chapter Breakdown

1. The Technological Paradigm Shift
- Model Breakthroughs: Recent generative updates have eliminated legacy issues like robotic speech, unnatural lip-sync, and uncanny facial expressions.
- Scalability: AI influencers operate as digital extensions that can publish daily across multiple platforms (Instagram, TikTok, YouTube Shorts) without requiring on-camera presence, studio lighting, or physical filming.

2. Real-World Case Studies & Personas
- Lifestyle & Wealth Personas: High-engagement profiles leverage aspirational storytelling to sell courses, software, or digital products via bio links.
- Niche Habit & Transformation Personas: Accounts focused on physical fitness or self-improvement drive multi-million view virality by tapping into dramatic transformation arcs.

3. The 3 Archetypes of AI Influencers
• Archetype 1: Entertainment (Memes, funny clips - Low monetization)
• Archetype 2: Aesthetic / Lifestyle (Visual models - Moderate monetization)
• Archetype 3: Problem-Solving (Targeted advice, finance, fitness - Extremely High monetization)

Strategic Rule: Always build around a Problem-Solving Archetype. High-intent views that solve a specific problem are significantly more valuable than generic viral views.`
          },
          {
            id: "les-ai-2",
            moduleId: "mod-ai-1",
            title: "Defining Your AI Persona",
            duration: "5:47",
            videoUrl: "https://www.youtube.com/embed/z6FZGXKCF50?si=6BD2R0NKXjzvYMXg&start=0&end=347&controls=0",
            orderIndex: 2,
            bodyContent: `Core Concept Overview
Develop a detailed, unshakeable identity for your virtual influencer, including backstory, psychological traits, and target audience alignment. In 2026, consistency is currency—if your character's facial features or niche messaging drift between posts, viewer trust and subscription retention drop to zero.

Key Takeaways & Chapter Breakdown

1. Crafting the Backstory & Aesthetic Identity
- Core Narrative: Define where your AI persona lives, their profession, hobbies, and personal struggles to create instant emotional resonance.
- Visual DNA: Lock in hair color, eye shape, signature wardrobe style, and distinctive physical markers that remain identical across all generations.

2. Audience Alignment & Monetization Intent
- Target Demographics: Tailor your persona's aesthetic and voice to match the exact desires of high-intent followers.

Strategic Rule: Treat your AI persona as a permanent brand. Every photo and video must reinforce the exact same character identity.`
          },
          {
            id: "les-ai-3",
            moduleId: "mod-ai-1",
            title: "Legal & Ethical Frameworks",
            duration: "3:10",
            videoUrl: "https://www.youtube.com/embed/TJ5Ixwp-59c?si=NThilcsDjyoDD7yp&start=0&controls=0",
            orderIndex: 3,
            bodyContent: `Core Concept Overview
Publishing AI-generated content requires rigorous adherence to evolving international regulations, platform disclosure mandates, and intellectual property standards. Mastering watermarking rules and legal boundaries protects your account from bans and copyright strikes.

Key Takeaways & Chapter Breakdown

1. Platform Disclosures & FTC Guidelines
- Mandatory Labeling: Learn how to properly toggle "AI-generated content" badges on TikTok, Instagram, and YouTube Shorts to maintain compliance.
- Commercial Rights: Understand the difference between open-source models and commercial licenses when monetizing AI-generated likenesses.

Strategic Rule: Transparency builds long-term creator longevity. Always comply with platform AI disclosure guidelines to prevent algorithmic throttling or account termination.`
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
            videoUrl: "https://www.youtube.com/embed/wsszCSX0EtE?si=OIk04wS4v2C924jQ&start=45&end=445&controls=0",
            orderIndex: 1,
            bodyContent: `Core Concept Overview
The core process of creating a consistent AI influencer revolves around generating a multi-angle character board to serve as a persistent reference image, paired with scene swapping and free 4K upscaling to generate unlimited photorealistic content.

Step-by-Step Execution Guide

1. Step 1: Character Generation & Prompt Engineering
- Prompt Formulation: Use detailed descriptive prompts specifying facial structure, ethnic features, lighting, and camera lens type.
- Multi-Angle Board: Generate front, side, and three-quarter profile views of your character in a single batch.

2. Step 2: Reference Locking & Upscaling
- Reference Embedding: Upload your master character sheet into your generator's image-to-image or character reference parameter.

Strategic Rule: Never skip the character board phase. High-fidelity reference assets are the foundation of consistent video generation.`
          },
          {
            id: "les-ai-5",
            moduleId: "mod-ai-2",
            title: "Achieving Visual Consistency",
            duration: "8:12",
            videoUrl: "https://www.youtube.com/embed/zV8EPHM1d4c?si=I-RP4av0kOxODIxF&start=67&controls=0",
            orderIndex: 2,
            bodyContent: `Core Concept Overview
Implement advanced techniques for maintaining exact facial geometry, lighting, and appearance across diverse poses, outfits, and dynamic environments. "One face that stays identical in every image. That's the whole technical problem."

Key Takeaways & Chapter Breakdown

1. Fixing Face Morphing & Drift
- LoRA Training: Train lightweight custom model weights (LoRA) on your character sheet to lock facial features permanently.
- Inpainting & Face-Swapping: Use tools like ReActor or Stable Diffusion inpainting to correct minor facial anomalies in generated frames.

Strategic Rule: Inspect every generated frame for subtle eye or jaw drift before sending assets to video animation tools.`,
            resources: [
              { name: "ReActor Face-Swap Extension Guide", type: "link", url: "https://github.com/Gourieff/sd-webui-reactor" },
              { name: "Character Seed & Consistency Matrix (.xlsx)", type: "template", url: "#" }
            ]
          },
          {
            id: "les-ai-6",
            moduleId: "mod-ai-2",
            title: "Wardrobe, Styling & Environment Design",
            duration: "9:01",
            videoUrl: "https://www.youtube.com/embed/Npy7H2_pEzM?si=jDlEXaSRL7Jj0PG9&start=184&end=725&controls=0",
            orderIndex: 3,
            bodyContent: `Core Concept Overview
Develop a cohesive aesthetic for your AI's attire, accessories, and background environments to enhance visual realism and reinforce brand identity across every published post.

Key Takeaways & Chapter Breakdown

1. Wardrobe Palettes & Signature Looks
- Color Theory: Limit your character's signature wardrobe to a recognizable 3-color palette that stands out in social media feeds.
- Scene Context: Match clothing choices to the environment (e.g., athletic wear in a gym, professional attire in a modern glass office).

Strategic Rule: High-end environment design elevates an AI influencer from "synthetic render" to aspirational digital creator.`,
            resources: [
              { name: "Pinterest Aesthetic Boards Hub", type: "link", url: "https://www.pinterest.com" },
              { name: "Lighting & Color Palette Checklist (PDF)", type: "download", url: "#" }
            ]
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
            duration: "4:39",
            videoUrl: "https://www.youtube.com/embed/3qe3IEPWnB4?si=p7YP9_nO7JRIOAa3&start=46&end=325&controls=0",
            orderIndex: 1,
            bodyContent: `Core Concept Overview
Learn to transform static character images into fluid, dynamic video clips using state-of-the-art animation models like Kling AI and Runway Gen-3, emphasizing realistic motion and minimal distortion.

Step-by-Step Execution Guide

1. Step 1: Image Import & Motion Prompting
- Upload Base Asset: Load your 4K upscaled character image into the animation platform.
- Camera Motion Control: Define subtle camera pans, zooms, or character micro-expressions using prompt parameters.

2. Step 2: Refining & Exporting
- Motion Brush / Region Selection: Isolate moving elements to prevent background warping.

Strategic Rule: Keep motion prompts subtle and natural to prevent uncanny valley distortions.`,
            resources: [
              { name: "Kling AI Video Studio", type: "link", url: "https://klingai.com" },
              { name: "Runway Gen-3 Alpha Platform", type: "link", url: "https://runwayml.com" },
              { name: "Camera Motion Prompt Cheat Sheet", type: "download", url: "#" }
            ]
          },
          {
            id: "les-ai-8",
            moduleId: "mod-ai-3",
            title: "Realistic Voice & Lip-Sync",
            duration: "5:11",
            videoUrl: "https://www.youtube.com/embed/PxVMN5qpSMU?start=239&end=550&controls=0",
            orderIndex: 2,
            bodyContent: `Core Concept Overview
Integrate hyper-realistic AI-generated voices from platforms like ElevenLabs with precise lip-sync animation using tools such as Hedra or HeyGen to produce compelling, speech-driven video content.

Step-by-Step Execution Guide

1. Step 1: Voice Cloning & Script Generation
- Script Optimization: Write punchy, high-retention scripts optimized for short-form viewing.
- Voice Generation: Configure ElevenLabs stability and clarity settings for natural vocal cadence.

Strategic Rule: Voice tone and cadence must match the character's visual age, personality, and backstory.`,
            resources: [
              { name: "ElevenLabs Voice Generation", type: "link", url: "https://elevenlabs.io" },
              { name: "Hedra Character Lip-Sync Studio", type: "link", url: "https://www.hedra.com" }
            ]
          },
          {
            id: "les-ai-9",
            moduleId: "mod-ai-3",
            title: "Motion Control & Special Effects",
            duration: "1:33",
            videoUrl: "https://www.youtube.com/embed/bcIGa8F2l9o?si=HAItr5UqJCm2UVkg&start=7&end=100&controls=0",
            orderIndex: 3,
            bodyContent: `Core Concept Overview
Master the complete workflow for transferring motion from reference videos onto your AI character using node-based platforms like Weevi AI and Cling Motion Control. This pipeline enables precise choreography, natural gesture transfer, and professional-grade rigging without traditional motion capture suits.

Step-by-Step Execution Guide

1. Step 1: Asset Preparation & Platform Setup
- Character Asset: Generate a full-body AI image with a clean, uncluttered background using a generator like ChatGPT or Nano Banana 2.
- Access Weevi AI: Sign in using a Figma account to claim 150 free monthly credits.
- Canvas Initialization: Create a new project file to open the node-based editing canvas. Right-click anywhere on the workspace, search for Cling Motion Control, and add the node block to the canvas.

2. Step 2: Asset Loading & Node Routing
- Upload Reference Files: Drag and drop your static full-body AI image and your reference motion video (a walk, dance, or gesture clip under 10 seconds) onto the canvas.
- Wire the Node Connections:
  • Connect the output dot of the reference video file to the Video Input terminal on the Cling node.
  • Connect the output dot of the AI character image to the Image Input terminal on the Cling node.

3. Step 3: Parameter Configuration & Execution
- Select Model Engine: Choose your model version (Kling 2.6 or 3.0) on the right sidebar parameters panel.
- Orientation & Audio:
  • Set Character Orientation to Video.
  • Toggle Keep Original Sound ON if you want the reference clip's audio track preserved in the final output.
- Render: Click Run Model to process the motion transfer.

Resource & Credit Allocation
• Cost Per Generation: Each render consumes 50 credits.
• Monthly Allowance: 150 credits per account provides 3 full motion-controlled video renders per month.`,
            resources: [
              { name: "Weevi AI Studio Canvas", type: "link", url: "https://weevi.ai" },
              { name: "Kling Motion Control Node Workflow", type: "download", url: "#" }
            ]
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
            duration: "5:17",
            videoUrl: "https://www.youtube.com/embed/dFc-nyasqhQ?si=P8Wp_D1vt8g7KN9X&start=73&end=390&controls=0",
            orderIndex: 1,
            bodyContent: `Core Concept Overview
Strategize content distribution across key platforms like Instagram, TikTok, and Facebook, understanding each platform's unique audience and algorithm. "It's Instagram, and it's a numbers game with rules."

Key Takeaways & Chapter Breakdown

1. Platform-Specific Growth Tactics
- Instagram Reels: Focus on high-aesthetic lifestyle imagery, bio links, and direct message (DM) automation funnels.
- TikTok & YouTube Shorts: Leverage high-velocity storytelling, controversy, and problem-solving hooks to drive viral reach.

Strategic Rule: Tailor your call-to-action (CTA) to match the platform's native monetization tools.`,
            resources: [
              { name: "Multi-Platform Syndication Calendar", type: "template", url: "#" },
              { name: "ManyChat Instagram DM Automation Guide", type: "link", url: "https://manychat.com" }
            ]
          },
          {
            id: "les-ai-11",
            moduleId: "mod-ai-4",
            title: "Crafting Engaging Narratives",
            duration: "4:20",
            videoUrl: "https://www.youtube.com/embed/z6FZGXKCF50?si=6BD2R0NKXjzvYMXg&start=0&end=347&controls=0",
            orderIndex: 2,
            bodyContent: `Core Concept Overview
Develop compelling storylines and recurring content series that resonate with your target audience, fostering deep community loyalty and driving continuous viewer interaction.

Key Takeaways & Chapter Breakdown

1. Story Arc Frameworks
- The Transformation Arc: Document your AI persona learning a new skill, overcoming a challenge, or achieving a milestone.

Strategic Rule: People follow characters, not just pictures. Invest heavily in narrative storytelling.`
          },
          {
            id: "les-ai-12",
            moduleId: "mod-ai-4",
            title: "Community Management & Interaction",
            duration: "3:30",
            videoUrl: "https://www.youtube.com/embed/TJ5Ixwp-59c?si=NThilcsDjyoDD7yp&start=0&controls=0",
            orderIndex: 3,
            bodyContent: `Core Concept Overview
Master best practices for responding to comments, managing direct messages, and building an engaged, loyal community around your virtual influencer to maximize long-term retention and revenue conversion.

Key Takeaways & Chapter Breakdown

1. Automated Engagement Funnels
- DM Automation: Use automated response tools to send free guides, checklists, or affiliate links directly to followers who comment specific keywords.

Strategic Rule: High community engagement signals algorithm authority and directly boosts your conversion rates.`
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
            duration: "8:18",
            videoUrl: "https://www.youtube.com/embed/bt081ouSB_0?si=BCQUmF3HpcE1xgiM&start=782&end=1280&controls=0",
            orderIndex: 1,
            bodyContent: `Core Concept Overview
Align your synthetic avatar with high-converting physical and digital affiliate products across Amazon Associates and TikTok Shop. By pairing short-form AI video reels with automated comment-to-DM triggers, creators eliminate physical inventory and shipping overhead while securing high-intent product click-throughs and scalable commissions.

1. Core Concept Breakdown
- Niche & Product Alignment: Align your synthetic avatar with physical or digital products that naturally match its visual identity and target lifestyle. For example, pair a fitness character with gym apparel, or a lifestyle avatar with beauty and tech accessories.
- E-Commerce Affiliate Revenue (Amazon Associates): Register as an affiliate partner to generate trackable product links. You earn standard commissions (up to 10%) on qualifying sales generated from your links without having to store inventory, manage customer service, or handle shipping logistics.
- Automated Comment-to-DM Funnels (Instagram): Social media platforms restrict clickable links inside video reels and post captions. Work around this by prompting viewers in your video to leave a specific trigger word in the comments (e.g., "COMMENT 'STYLE' FOR THE LINK"). Automated chat software detects this keyword, posts an automated public reply, and immediately sends a direct message containing your affiliate link to the user's inbox. This mechanism dramatically increases algorithmic post engagement while securing direct click-throughs.
- In-App Store Integration (TikTok Shop): Attach product tags directly onto short-form AI video reels using TikTok's built-in seller marketplace. Once an AI creator profile hits baseline platform requirements (typically around 5,000 followers), you can earn higher-tier sales commissions (up to 30%) directly from seamless in-app checkouts.

2. Practical Step-by-Step Execution Workflow
- Product Selection: Select 3 to 5 trending physical or digital products on Amazon or TikTok Shop that suit your AI persona's visual niche.
- Affiliate Link Setup: Generate custom trackable affiliate links for each product inside your Amazon Associates or TikTok Shop creator dashboard.
- Short-Form Content Creation: Produce short-form video reels featuring your AI character using image-to-video tools (such as Wan AI or Kling) alongside voice synthesis (such as ElevenLabs). Ensure the video explicitly showcases the product or aesthetic.
- On-Screen Call-to-Action (CTA): Include clear text overlays on your video telling viewers to comment a specific keyword to get the featured items.
- Chatbot Automation Setup: Connect an automated messaging platform (such as ManyChat) to your Instagram creator profile. Program a trigger rule so whenever a user comments your keyword, the bot automatically replies on the post and sends a private direct message containing your affiliate link.

Strategic Rule: Never post unclickable affiliate links directly in video captions. Always deploy automated comment-to-DM triggers to maximize algorithmic watch velocity and ensure 100% private link delivery.`,
            resources: [
              { name: "Amazon Associates Program", type: "link", url: "https://affiliate-program.amazon.com" },
              { name: "TikTok Shop Creator Center", type: "link", url: "https://seller.tiktok.com" },
              { name: "ManyChat Social DM Automation", type: "link", url: "https://manychat.com" },
              { name: "Link-in-Bio Setup Guide (Whop / Linktree)", type: "template", url: "https://whop.com" }
            ]
          },
          {
            id: "les-ai-14",
            moduleId: "mod-ai-5",
            title: "Brand Partnerships & Sponsorships",
            duration: "2:45",
            videoUrl: "https://www.youtube.com/embed/S3Xdu0WIdfY?si=L3JJwutQlITHtVM-&start=72&end=237&controls=0",
            orderIndex: 2,
            bodyContent: `Core Concept Overview
Shift your creator outreach from passive pitches to high-value solutions engineering. Brands do not partner based on personal passion—they invest in assets that drive conversions. By auditing competitor media gaps, producing AI spec ad samples, and pitching tailored creative briefs, virtual creators can close recurring commercial licensing deals and sponsored integrations.

1. Core Concept Breakdown
- The Pitch Dynamic Shift: Most creator pitches fail because they rely on "fan energy"—expressing personal love for a product or listing generic creator stats. Brands do not hire partners based on passion; they invest in solutions that drive conversions and revenue.
- Problem-Solving Positioning: Frame your AI virtual persona as a high-value content asset studio. Instead of asking to be picked, pitch strategic content ideas that address gaps in the brand’s current marketing or outpace their top competitors.
- The 4-Step Pre-Pitch Research Strategy: Formulate your pitch through structured market research before sending any outreach:
  • Audit Current Brand Media: Review the brand's short-form videos across TikTok, Instagram Reels, and Shorts to evaluate what hooks work and where content quality falls short.
  • Identify Competitor Opportunity Gaps: Analyze 2 to 3 competing brands to pinpoint high-performing formats (such as before-and-after transformations, trend remixes, or daily lifestyle integrations) that your target brand is missing.
  • Draft a Mini Creative Brief: Formulate 3 to 5 tailored video concepts specifically designed to increase the brand's engagement and conversion rates.
  • Send a Concise Value-First Cold Email: Present your creative brief directly in the email body without asking for upfront commitments or burying the message under lengthy attachments.

2. Practical Step-by-Step Execution Workflow
- Brand & Competitor Audit: Select a target brand in your AI persona's niche (e.g., tech accessories, streetwear, wellness). Identify 3 content formats working well for their direct competitors that the target brand currently lacks.
- Develop AI Spec Ads (Mock Collaborations): Before sending your pitch, use tools like Kling, Wan AI, or ElevenLabs to generate 1 to 2 high-quality short-form concept videos showing your AI character featuring or using the brand's product.
- Draft the Strategic Pitch Email: Keep outreach short, professional, and outcome-oriented. Present solutions like Daily Lifestyle Integrations, Trend Remix Campaigns, and Before & After Demonstrations.
- Negotiate Asset Usage & Licensing: When the brand responds, offer two revenue models: flat-fee Feed Post Integration for organic reach, and recurring Commercial Ad Licensing for their paid ad campaigns.

Strategic Rule: Never pitch brands asking for sponsorships. Pitch strategic creative briefs with pre-made AI spec ads that solve conversion problems and license your assets for paid media.`,
            resources: [
              { name: "Meta Ad Library & TikTok Creative Center", type: "link", url: "https://www.facebook.com/ads/library" },
              { name: "Apollo.io & LinkedIn Contact Discovery", type: "link", url: "https://www.apollo.io" },
              { name: "Creator Spec Ad & Pitch Deck Template (Notion)", type: "template", url: "#" },
              { name: "Commercial Licensing & Rate Card Agreement", type: "download", url: "#" }
            ]
          },
          {
            id: "les-ai-15",
            moduleId: "mod-ai-5",
            title: "Diversified Income Streams",
            duration: "7:04",
            videoUrl: "https://www.youtube.com/embed/jxdzjyTIq1I?si=2sqg_yBtwpqU_mxe&start=91&end=515&controls=0",
            orderIndex: 3,
            bodyContent: `Core Concept Overview
The Faceless Business Model: You do not need to show a physical face, hop on video vlogs, or use high-pressure sales tactics to build a profitable online brand. AI characters and digital creators can scale multiple passive revenue streams entirely behind the scenes by mastering the 7 passive income pillars and climbing the low-ticket to high-ticket ladder.

1. Core Concept Breakdown
- The Faceless Business Model: You do not need to show a physical face, hop on video vlogs, or use high-pressure sales tactics to build a profitable online brand. AI characters and digital creators can scale multiple passive revenue streams entirely behind the scenes.
- Low-Ticket to High-Ticket Ladder: Start with accessible, low-friction digital products ($7–$15 guides or planners) to validate your market and prove to yourself that online monetization works. Once traction is established, scale up to higher-priced courses, templates, or subscriptions.

2. The 7 Passive Income Pillars
- Digital Products (Ebooks, Planners & Guides): Turn simple content assets (like popular blog posts or social threads) into low-ticket PDFs, checklists, or workbooks. Price them affordably ($7–$15) to drive volume and build initial customer trust.
- Strategic Affiliate Marketing: Don't just drop random links. Promote tools and resources you actively use via a dedicated resource page, review articles, and automated email marketing funnels to earn ongoing commissions (5% to 50%).
- Templatized Workflows: Package the exact operational frameworks you use daily—such as Notion dashboards, email swipe files, or project management boards—and sell them as plug-and-play digital assets.
- Print on Demand (Merch & Branding): Use your AI persona's signature catchphrases, graphics, or brand aesthetics to sell custom merchandise (mugs, journals, apparel) with zero upfront inventory or physical warehousing required.
- Text-Based & Slide Online Courses: Your educational content doesn't require a camera. High-value courses can be delivered entirely through structured text lessons, downloadable workbooks, PDF guides, or simple voice-over slide decks.
- Audio Products & Private Podcasts: Monetize auditory experiences by launching private podcast subscriptions, guided meditation tracks, daily affirmations, or audio-first masterclasses.
- Stock Assets & Digital Art: Package rendered AI visual assets, custom graphics, or stock photography bundles to sell directly through your online storefront or marketplace platforms.

3. Recommended Execution Workflow
- Audit Your Assets: Review what digital tools, templates, or prompts you already use to build your AI creator brand.
- Launch a Low-Ticket Item: Package one specific solution into a $7–$10 PDF guide or template bundle.
- Automate the Sales Funnel: Link your digital store or checkout page directly in your social bio and configure an automated DM or email sequence to drive hands-off conversions.

Strategic Rule: Always validate with a low-ticket $7–$15 digital product first. Proving market demand early builds the buyer list and momentum needed to scale into high-ticket courses and memberships.`,
            resources: [
              { name: "Whop Digital Creator Marketplace", type: "link", url: "https://whop.com" },
              { name: "Gumroad Digital Storefront", type: "link", url: "https://gumroad.com" },
              { name: "Stan Store Creator Funnel", type: "link", url: "https://stan.store" },
              { name: "Printify Print-on-Demand Hub", type: "link", url: "https://printify.com" },
              { name: "7 Passive Income Pillars Implementation Matrix", type: "template", url: "#" }
            ]
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
            duration: "5:30",
            videoUrl: "https://www.youtube.com/embed/aRnK_UQc3wY?controls=0",
            orderIndex: 1,
            bodyContent: `Core Concept Overview
Tracking data isn't about staring at vanity numbers or crossing your fingers for algorithmic luck. True analytics answer one core question: Is what you are posting working, and how can you systematically repeat or fix it? By tracking account trajectory and dissecting the 5 core content metrics, creators can optimize watch retention, drive conversions, and eliminate guesswork.

1. Core Concept Breakdown
- Metrics with Intention: Tracking data isn't about staring at random numbers or crossing your fingers for viral luck. True analytics answer one core question: Is what I'm posting working, and how can I repeat or fix it?
- Account Metrics vs. Content Metrics: Account metrics (follower growth, profile visits, overall reach) act like a car dashboard showing general momentum. Content metrics (individual video performance) tell you exactly which engine parts need tuning.

2. The 5 Core Content Metrics to Track
- Visibility (Reach vs. Impressions): Impressions measure total screen displays; Reach measures unique viewers reached. (One person watching your video 50 times = 50 impressions, 1 reach).
- Interactions & Intent (Likes, Comments, Saves, Shares): Saves indicate high-value educational reference material; Shares show emotional connection or relatable storytelling; Comments provide qualitative insights into what your audience is actually thinking.
- Engagement Rate (The Strategy Filter): Calculated by adding Likes + Comments + Saves, dividing by Reach, and multiplying by 100. This reveals whether performance stems from a genuine strategy or just algorithmic luck.
- Retention (The Algorithm Key): Tracks how long viewers stick around. If viewers drop off in the first 3 seconds, your hook, pacing, or opening visual needs immediate adjustment. Low retention signals algorithms to stop pushing your content.
- Clicks & Conversion (Call-to-Action): Measures whether your video sparks enough curiosity for someone to visit your link-in-bio, buy a digital product, or comment for an automated DM. Always use specific, benefit-driven CTAs like "Grab the step-by-step checklist at the link in my bio" instead of generic phrases.

3. Setting Trackable Weekly Goals
- Retention Targets: "Increase video retention by 10% this week by tightening the 3-second visual hook."
- Conversion Targets: "Optimize video hooks and clear benefit-driven CTAs to hit 30 link clicks on my digital product offer."

Strategic Rule: Data must dictate your creative calendar. Dissect retention drop-offs and save rates weekly to eliminate creative fatigue and double down on proven content formats.`,
            resources: [
              { name: "Metricool Analytics & Scheduling Hub", type: "link", url: "https://metricool.com" },
              { name: "Notion Content Performance Tracker (.template)", type: "template", url: "#" },
              { name: "Weekly Retention & Hook Audit Matrix (.pdf)", type: "download", url: "#" }
            ]
          },
          {
            id: "les-ai-17",
            moduleId: "mod-ai-6",
            title: "Iterative Improvement & A/B Testing",
            duration: "1:53",
            videoUrl: "https://www.youtube.com/embed/UdGVsH0x1ZE?si=AdJ2EDdApgzZTjuH&start=24&end=137&controls=0",
            orderIndex: 2,
            bodyContent: `Core Concept Overview
Eliminate creative guesswork by split-testing variables before publishing to your core audience grid. Native features like Instagram Trial Reels allow creators to deploy identical AI video renders with alternating text hooks, visual opening frames, and audio pairings exclusively to non-followers. Once performance data reveals the clear algorithmic winner, you can confidently share the top performer to your main profile.

1. Core Concept Breakdown
- The Trial Reels Revolution: Instagram's native Trial Reels feature lets you test content without cluttering your main grid or spamming existing followers. The video is pushed purely to non-followers for 24 to 48 hours to collect unbiased retention data.
- Single-Variable Isolation (The Scientific Method): When A/B testing short-form videos, only change ONE element at a time—either the text hook, the opening 3-second avatar action, or the background audio. If you change multiple variables at once, you will never know which factor drove the performance difference.
- The 3-Second Hook Differential: The first 3 seconds dictate 80% of short-form reach. Testing curiosity-inducing questions against bold counter-intuitive claims on the exact same video asset reveals what psychological trigger captivates your niche.

2. Step-by-Step Trial Reel Testing Pipeline
- Step 1: Produce Your Base AI Video Asset: Generate your primary 9:16 character video render using Wan AI, Kling, or Midjourney + Hedra.
- Step 2: Draft 2 to 3 Contrasting Hook Variations: Create Variant A (curiosity hook), Variant B (bold counter-intuitive statement), and Variant C (direct benefit promise).
- Step 3: Enable 'Trial Reel' Toggle: During the Instagram upload flow, toggle ON the "Trial Reel" setting. The post will distribute exclusively to non-followers without appearing on your public grid.
- Step 4: Monitor 24-Hour Retention & Interaction: Check the insights dashboard after 24 hours. Compare average percentage viewed, 3-second completion rate, and profile visits.
- Step 5: Publish the Winner to Main Grid: Once the algorithmic winner is determined, share that specific variant to your primary follower feed and story for maximum organic reach.

Strategic Rule: Never publish a critical video blindly to your main grid. Test text hooks using Trial Reels on non-followers first to let raw retention data decide which variant deserves your profile grid.`,
            resources: [
              { name: "Instagram Native Trial Reels Guide", type: "link", url: "https://help.instagram.com" },
              { name: "A/B Split Testing Retention Tracker (.template)", type: "template", url: "#" },
              { name: "50 High-Converting Hook Formulas & Swipe File (.pdf)", type: "download", url: "#" }
            ]
          },
          {
            id: "les-ai-18",
            moduleId: "mod-ai-6",
            title: "Staying Ahead of the Curve",
            duration: "4:21",
            videoUrl: "https://www.youtube.com/embed/ceRZVxO8KF8?si=foyjfXSwnO9impbm&start=323&end=584&controls=0",
            orderIndex: 3,
            bodyContent: `Core Concept Overview
As artificial intelligence scales, low-effort content and generic "slop" flood social media feeds, creating a crowded "sea of sameness" where easy, automated tactics get competed away instantly. In an era of infinite supply, doing the minimum no longer works. To win long-term, you must aim to be the absolute gold standard in your micro-niche—delivering superior information, novel perspectives, crystal-clear language, and polished execution.

1. Core Concept Breakdown
- The Post-AI Shift: As artificial intelligence scales, low-effort content and generic "slop" flood social media feeds. This creates a "sea of sameness" where easy, automated tactics get competed away instantly.
- The Gold Standard Mindset: In an era of infinite supply, doing the minimum no longer works. To win long-term, you must aim to be the absolute gold standard in your micro-niche—delivering superior information, novel perspectives, crystal-clear language, and polished execution.

2. Key Strategies for Future-Proofing Your Brand
- Combating "Flashbang Brain" & Capturing Leads: Audiences suffer from extreme short-term memory online—they rarely remember what they watched five minutes ago. Treat every single video as an individual standalone marketing agent. Rather than hoping people binge your entire profile, design each video to immediately deliver value and drive viewers to a low-friction Call-to-Action (CTA) to capture their email or move them off public feeds into your own owned ecosystem.
- Owning a Strict Micro-Niche: Stop trying to appeal to everyone. Focus on the minimum-sized category aligned directly with your digital product or offer. Ask yourself: Does this specific piece of content help my buyer get one step closer to the outcome they want?
- Focusing on Durability Over Viral Luck: Viral anomalies happen, but anchoring your business to overnight explosions often leads to burnout. True success comes from compounding consistent weekly reps and building a sustainable, long-term brand (the Lindy Effect).

Strategic Rule: Treat every single video as a standalone marketing agent. Rather than relying on fleeting social platform memory, capture audience attention into an owned ecosystem through immediate value and clear, benefit-driven CTAs.`,
            resources: [
              { name: "FutureTools AI Model Radar", type: "link", url: "https://www.futuretools.io" },
              { name: "Gold Standard Micro-Niche Audit (.template)", type: "template", url: "#" },
              { name: "The Lindy Effect for Content Longevity (.pdf)", type: "download", url: "#" }
            ]
          }
        ]
      },
      {
        id: "mod-ai-7",
        courseId: "course-ai",
        title: "Module 7: Portfolio & Creator Showcase",
        orderIndex: 7,
        lessons: [
          {
            id: "les-ai-19",
            moduleId: "mod-ai-7",
            title: "Building a High-Impact AI Portfolio",
            duration: "5:15",
            videoUrl: "M7lc1UVf-VE",
            orderIndex: 1,
            bodyContent: `Core Concept Overview
Learn how to build a high-converting digital portfolio and creator media kit that showcases your AI avatar's visual consistency, high-performing spec video renders, and brand collaboration samples. In 2026, brands and agencies evaluate creators on visual fidelity and portfolio clarity—having a tight 6-video showcase converts dramatically higher than a cluttered folder of raw files.

1. Portfolio Architecture & Asset Curation
- Selecting Hero Renders: Feature 4 to 6 of your highest-fidelity video clips demonstrating diverse poses, expressions, and lighting conditions.
- Showcase Formatting: Organize assets into clear categories (Product Demonstrations, Lifestyle Reels, Concept Specs) for rapid partner evaluation.
- Media Kit Integration: Embed your audience demographics, past engagement metrics, and contact information into a single shareable link.

2. Step-by-Step Portfolio Setup
- Step 1: Select Your Top 6 Video Renders: Filter your generated character clips to keep only flawless 4K upscaled outputs with crisp audio and natural movement.
- Step 2: Build a Notion or Web Showcase: Organize your videos with clean headings, brief concept descriptions, and target audience notes.
- Step 3: Publish a Mobile-Friendly Link: Host your portfolio on a clean domain or link-in-bio page so potential partners can review your work in under 30 seconds on any device.

Strategic Rule: Quality over quantity. A tight, curated 6-video portfolio closes brand deals and client retainers significantly faster than a disorganized dump of clips.`,
            resources: [
              { name: "AI Creator Portfolio Master Template (Notion)", type: "template", url: "#" },
              { name: "Digital Media Kit & Rate Card Checklist (.pdf)", type: "download", url: "#" }
            ]
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
    badge: "Coming Soon",
    isComingSoon: true,
    comingSoonMessage: "The Live Streaming & Broadcast Engineering curriculum is currently under production and releasing soon!",
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
            bodyContent: `Core Concept Overview
Optimal canvas resolutions, bitrate calculations for Twitch vs YouTube, NVENC encoding settings, and zero-dropped-frame configurations.

Key Takeaways & Chapter Breakdown

1. Encoder Optimization
- Hardware Encoding: Utilize dedicated NVENC chips to prevent CPU throttling during intense gaming streams.

Strategic Rule: Always test your broadcast bitrate using local recordings before going live.`,
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
            bodyContent: `Core Concept Overview
Setup virtual audio cables (Voicemeeter / Elgato Wavelink) to separate Discord voices, game sound, Spotify, and microphone tracks.

Key Takeaways & Chapter Breakdown

1. Multi-Track Audio Separation
- Noise Gate Tuning: Eliminate keyboard clicks and background hums without clipping your voice.

Strategic Rule: Clean audio is more important than 4K video quality for live retention.`,
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
            bodyContent: `Core Concept Overview
Why finance, tech, documentary, and luxury niches command $15-$35 RPMs compared to gaming's $2 RPM.

Key Takeaways & Chapter Breakdown

1. RPM Optimization
- Advertiser Demand: Target high-intent advertiser categories to maximize revenue per thousand views.

Strategic Rule: Niche selection dictates 80% of your channel's ultimate revenue potential.`,
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
            bodyContent: `Core Concept Overview
How to structure 8-12 minute video scripts with 30-second loop payoffs that keep viewer retention above 55%.

Key Takeaways & Chapter Breakdown

1. Retention Engineering
- Open Loops: Introduce unresolved questions every 90 seconds to maintain viewer engagement.

Strategic Rule: Never allow the narrative tension to drop during the middle act of the video.`,
            resources: [{ name: "Documentary Script Master Template", type: "prompt", content: "Act 1: The Inciting Incident, Act 2: The Hidden Truth, Act 3: The Resolution" }]
          }
        ]
      }
    ]
  }
];
