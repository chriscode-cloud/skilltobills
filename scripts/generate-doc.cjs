const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require("docx");

const markdownContent = `# SIDEHUSTLE.COM - COMPLETE WEBSITE CONTENT DOCUMENTATION
Generated: 2026

---

## 1. GLOBAL ANNOUNCEMENT / TELECAST TICKER
- **Ticker Eyebrow:** BREAKING
- **Announcement Text:** 4,120 creators crossed $10,000/month in Q2 2026 across Fanvue, TikTok Shop & Twitch. Cohort 2026 applications now live.

---

## 2. TOP UTILITY BAR (TOPBAR)
- **Report Link:** 2026 AI Hustle Index Report
- **Live Stream Status:** Live Telecast (5,400+ online)
- **News Link:** News & Press
- **Community Dropdown:**
  - Header: Community
  - Top Action: All Community Hubs
  - Section Header: EXPLORE BY CATEGORY
  - Items:
    1. Discord Creator Hub (42,000+ active hustlers)
    2. Learners Voices & Proof (Verified income proofs)
    3. Live AMAs & Workshops (Weekly creator workshops)
    4. Creator Mentorship Network (1-on-1 career guidance)
- **Auth Actions:**
  - Sign In (Opens authentication modal)
  - Create Free Account (Opens registration modal)

---

## 3. MAIN NAVIGATION BAR (NAVBAR)
- **Brand Logo:** [sh] sidehustle.com
- **Pathways Dropdown Menu:**
  - Label: Pathways
  - Top Action: All Programmes
  - Section Header: EXPLORE BY TRACK
  - Program Items:
    1. AI & Virtual Influencers
    2. Viral Content & Short-Form UGC
    3. Live Streaming & Gaming
    4. Faceless YouTube Automation
    5. Digital Product Arbitrage
    6. Creator Agency & Management
- **Main Nav Links:**
  - Viral UGC
  - Live Streaming
  - Success Stories
  - The Latest
- **Primary CTA Button:**
  - Text: Join The Cohort

---

## 4. HERO SECTION
- **Section Eyebrow:** ACADEMY OF DIGITAL LEVERAGE • COHORT 2026 NOW OPEN
- **Main Heading:** Online Wealth Is Already Here
- **Hero Subtitle:** Learn what actually generates income in 2026. Watch the viral breakdown of 17 modern AI side hustles every student and beginner should know about.
- **Primary Call to Action:** Explore Hustle Pathways
- **Featured Video Player:**
  - Title: 17 AI Side Hustles Every Student Should Know About (Tier List Breakdown)
  - Creator: JustMoneyMinded
  - Core Message: "AI is not the business, it is simply leverage. Most people waste time on gimmicks like trading bots and prompt packs that make zero money."

---

## 5. PATHWAYS & CURRICULUM SECTION (PROGRAMMES)
- **Section Heading:** Find your digital leverage pathway
- **Section Subtitle:** Battle-tested blueprints engineered for aggressive income generation. No fluff, no useless theory—just direct monetization systems.

### Track 1: AI & Virtual Influencers
- **Category:** Fanvue & Digital Models
- **Badge:** Trending 2026
- **Earnings Potential:** $6,500 – $28,000 / month
- **Duration & Format:** 4 Weeks • Self-Paced • Beginner to Pro
- **Enrolled Count:** 14,820 enrolled
- **Tagline:** Build 5-figure faceless revenue streams with hyper-realistic AI avatars.
- **Description:** Design hyper-realistic AI personas, build loyal Fanvue & Instagram subscriber bases, and automate 5-figure monthly sponsorships without ever showing your face.
- **Core Curriculum:**
  1. Midjourney & Flux Hyper-Realistic Face Consistency
  2. Setting up Monetized Fanvue & Instagram Creator Funnels
  3. Automated Chatting & Direct Message AI Assistants
  4. Brand Sponsorship Pitching for Virtual Ambassadors
  5. Legal Compliance & AI Disclosures for Maximum Longevity
- **Key Tools:** Fanvue, Midjourney v6, ComfyUI, Magnific AI, ManyChat

### Track 2: Viral Content Creation
- **Category:** Short-Form & UGC
- **Badge:** High Demand
- **Earnings Potential:** $4,200 – $19,500 / month
- **Duration & Format:** 6 Weeks • Live Workshops • All Levels
- **Enrolled Count:** 22,410 enrolled
- **Tagline:** Turn 15-second smartphone edits into brand deals & algorithmic dominance.
- **Description:** Get hired as a professional creator or start earning independently with a portfolio that shows what you can do across TikTok, YouTube Shorts, and UGC brand contracts.
- **Core Curriculum:**
  1. Psychology of the 3-Second Hook & Retention Curve
  2. CapCut Pro & Premiere Viral Pacing Workflows
  3. Landing $1,500/video UGC Contracts with Global Brands
  4. YouTube Automation & Faceless Channel Scaling
  5. TikTok Creator Rewards Program & RPM Optimization
- **Key Tools:** CapCut, TikTok Shop, Notion Creator Hub, ElevenLabs, Epidemic Sound

### Track 3: Live Streaming & Gaming
- **Category:** Twitch, Kick & YouTube
- **Badge:** Community Favorite
- **Earnings Potential:** $3,800 – $24,000 / month
- **Duration & Format:** 5 Weeks • Masterclass • Beginner Friendly
- **Enrolled Count:** 18,950 enrolled
- **Tagline:** Monetize your passion with loyal viewer bases and high-margin affiliate streams.
- **Description:** Launch your stream career, start a community, or build income streams that don't depend on anyone else deciding you're ready on Twitch, Kick, and YouTube Live.
- **Core Curriculum:**
  1. OBS Studio Setup, Audio Compression & Dynamic Overlays
  2. Speedrunning to Twitch Affiliate & Kick Creator Program
  3. Engaging Dead Chats: Viewer Retention Techniques
  4. Securing Energy Drink, Tech & VPN Sponsorship Contracts
  5. Merchandising & Multi-Platform VOD Repurposing
- **Key Tools:** OBS Studio, Streamlabs, Discord, Kick Studio, Voicemod

---

## 6. TRANSFORMATION IN ACTION (VERIFIED PROOF & CASE STUDIES)
- **Section Heading:** Transformation in Action
- **Card 1 (Featured Video Proof):**
  - Title: From No Gigs to $18,400 in Brand Deals in 3 Weeks
  - Tag: Verified Earnings Proof
  - Creator: Khadija & Alex (UGC Agency Partners)
  - Platform: TikTok & Instagram
  - Before: $0 in freelance work
  - Current: $18,400 / month across 6 retainers
  - Quote: "Brands don't care about your resume; they care if you can make a video stop thumbs scrolling. sidehustle.com gave us the exact pitch decks and lighting tricks."
- **Card 2 (Partner Testimonial):**
  - Partner Brand: FANVUE / TWITCH PARTNER
  - Quote: "What started as learning AI persona creation grew into coaching others and eventually managing 4 digital avatars generating over $22k/month in recurring subscriber revenue."
  - Author: Ahmed E. (Agency Founder • Top 0.1% Fanvue Creator)
- **Platform Metric Stats:**
  - 347.1K: Total Active Hustlers Trained
  - 43.4K: Young Creators Supported in 2026
  - 257.9K: Monetized Channels & Accounts
  - 60.1K: Full-Time Exits from 9-to-5s

---

## 7. THE LATEST (EDITORIAL & STRATEGY GUIDES)
- **Section Heading:** The Latest
- **Section Link:** Visit Our Blog

### Article 1
- **Category:** TWITCH & KICK, STREAMING INCOME, SPONSORSHIPS
- **Title:** How Beginners Are Hitting Twitch Affiliate and Signing $2k Brand Deals in 30 Days
- **Read Time & Date:** 5 min read • May 24, 2026
- **Author:** Tariq Vance (Partnered Twitch Creator)
- **Summary:** Breaking down the exact raid schedules, Discord funnel strategies, and warm-outreach email templates our members used to secure their first paid hardware partnerships.

### Article 2
- **Category:** FANVUE & AI PERSONAS, PROMPT PACKS, CASE STUDIES
- **Title:** The Step-by-Step Anatomy of a $10,000/Month Faceless AI Influencer on Fanvue
- **Read Time & Date:** 7 min read • June 02, 2026
- **Author:** Elena Rostova (AI Agency Director)
- **Summary:** From LoRA training and lighting prompts in Midjourney to high-converting subscriber tiers and automated DM messaging on Fanvue.

### Article 3
- **Category:** TIKTOK CREATOR REWARDS, VIRAL SHORT-FORM, AUTOMATION
- **Title:** AI Tools for Viral Video Creation: What Matters for 2026 Algorithms?
- **Read Time & Date:** 6 min read • June 08, 2026
- **Author:** Devon Chen (Short-Form Growth Hacker)
- **Summary:** Why pacing, sound design, and automated b-roll generators are outperforming traditional high-budget production setups on TikTok and Reels.

---

## 8. SUBSCRIBE BANNER (NEWSLETTER)
- **Heading:** Subscribe to sidehustle Updates
- **Description:** We bring together industry leaders to share insights, spark ideas, and help you level up.
- **Input Placeholder:** Enter your creator email...
- **CTA Button:** Join
- **Success State:** "You're on the insider list!"

---

## 9. SITE FOOTER
- **Brand & Mission:**
  - Brand: sidehustle.com
  - Mission Statement: The premier education accelerator for the modern creator economy. Mastering live streaming on Twitch, AI personas on Fanvue, and short-form viral automation.
  - Social Proof: Trusted by 340,000+ creators across 85 countries worldwide.
- **Hustle Tracks Links:**
  - AI & Fanvue Models
  - Viral Content & UGC
  - Twitch & Kick Streaming
  - Faceless YouTube & Reels
  - Digital Product Arbitrage
- **Community Links:**
  - Our Community
  - Learners Voices
  - Creator AMAs & Events
  - Earnings Proof Hub
  - Discord Server (42k+)
- **About Links:**
  - Blog & Guides
  - Support & FAQ
  - About Us
  - News & Press
  - Careers @ sidehustle
- **Legal & Copyright:**
  - Legal
  - Cookie Policy
  - © Copyright 2026 sidehustle.com. All rights reserved.
- **Social Media Channels:** Facebook, Instagram, X (Twitter), LinkedIn, YouTube
`;

// 1. Write Markdown file
const publicDir = path.join(__dirname, "..", "public");
fs.writeFileSync(path.join(publicDir, "sidehustle-website-content.md"), markdownContent);
fs.writeFileSync(path.join(publicDir, "sidehustle-website-content.txt"), markdownContent);

// 2. Generate DOCX file
async function generateDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "SIDEHUSTLE.COM - COMPLETE WEBSITE CONTENT DOCUMENTATION",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
          new Paragraph({
            text: "Official copy, curriculum pathways, transformation proofs, and structural texts.",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Section 1
          new Paragraph({
            text: "1. Global Announcement & Telecast",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Eyebrow: ", bold: true }),
              new TextRun("BREAKING\n"),
              new TextRun({ text: "Announcement: ", bold: true }),
              new TextRun("4,120 creators crossed $10,000/month in Q2 2026 across Fanvue, TikTok Shop & Twitch. Cohort 2026 applications now live."),
            ],
            spacing: { after: 200 },
          }),

          // Section 2
          new Paragraph({
            text: "2. Top Utility Bar (TopBar)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun("• Report: 2026 AI Hustle Index Report\n"),
              new TextRun("• Live Stream: Live Telecast (5,400+ online)\n"),
              new TextRun("• News & Press\n"),
              new TextRun("• Community: Discord Hub (42k+), Learners Voices, Live AMAs, Mentorship Network\n"),
              new TextRun("• Account Actions: Sign In, Create Free Account"),
            ],
            spacing: { after: 200 },
          }),

          // Section 3
          new Paragraph({
            text: "3. Main Navigation (Navbar)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun("• Brand: sidehustle.com\n"),
              new TextRun("• Pathways Dropdown: All Programmes, AI & Virtual Influencers, Viral Content & Short-Form UGC, Live Streaming & Gaming, Faceless YouTube Automation, Digital Product Arbitrage, Creator Agency & Management\n"),
              new TextRun("• Links: Viral UGC, Live Streaming, Success Stories, The Latest\n"),
              new TextRun("• CTA Button: Join The Cohort"),
            ],
            spacing: { after: 200 },
          }),

          // Section 4
          new Paragraph({
            text: "4. Hero Section",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Headline: ", bold: true }),
              new TextRun("Online Wealth Is Already Here\n"),
              new TextRun({ text: "Subtitle: ", bold: true }),
              new TextRun("Learn what actually generates income in 2026. Watch the viral breakdown of 17 modern AI side hustles every student and beginner should know about.\n"),
              new TextRun({ text: "Primary Action: ", bold: true }),
              new TextRun("Explore Hustle Pathways\n"),
              new TextRun({ text: "Featured Video: ", bold: true }),
              new TextRun("17 AI Side Hustles Every Student Should Know About (By JustMoneyMinded)"),
            ],
            spacing: { after: 200 },
          }),

          // Section 5
          new Paragraph({
            text: "5. Pathways & Programmes",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            text: "Track 1: AI & Virtual Influencers",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun("• Category: Fanvue & Digital Models (Trending 2026)\n"),
              new TextRun("• Earnings: $6,500 – $28,000 / mo | Duration: 4 Weeks Self-Paced (14,820 enrolled)\n"),
              new TextRun("• Tagline: Build 5-figure faceless revenue streams with hyper-realistic AI avatars.\n"),
              new TextRun("• Modules:\n"),
              new TextRun("  1. Midjourney & Flux Hyper-Realistic Face Consistency\n"),
              new TextRun("  2. Setting up Monetized Fanvue & Instagram Creator Funnels\n"),
              new TextRun("  3. Automated Chatting & Direct Message AI Assistants\n"),
              new TextRun("  4. Brand Sponsorship Pitching for Virtual Ambassadors\n"),
              new TextRun("  5. Legal Compliance & AI Disclosures for Maximum Longevity\n"),
              new TextRun("• Tools: Fanvue, Midjourney v6, ComfyUI, Magnific AI, ManyChat"),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "Track 2: Viral Content Creation",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun("• Category: Short-Form & UGC (High Demand)\n"),
              new TextRun("• Earnings: $4,200 – $19,500 / mo | Duration: 6 Weeks Live Workshops (22,410 enrolled)\n"),
              new TextRun("• Tagline: Turn 15-second smartphone edits into brand deals & algorithmic dominance.\n"),
              new TextRun("• Modules:\n"),
              new TextRun("  1. Psychology of the 3-Second Hook & Retention Curve\n"),
              new TextRun("  2. CapCut Pro & Premiere Viral Pacing Workflows\n"),
              new TextRun("  3. Landing $1,500/video UGC Contracts with Global Brands\n"),
              new TextRun("  4. YouTube Automation & Faceless Channel Scaling\n"),
              new TextRun("  5. TikTok Creator Rewards Program & RPM Optimization\n"),
              new TextRun("• Tools: CapCut, TikTok Shop, Notion Creator Hub, ElevenLabs, Epidemic Sound"),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "Track 3: Live Streaming & Gaming",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun("• Category: Twitch, Kick & YouTube (Community Favorite)\n"),
              new TextRun("• Earnings: $3,800 – $24,000 / mo | Duration: 5 Weeks Masterclass (18,950 enrolled)\n"),
              new TextRun("• Tagline: Monetize your passion with loyal viewer bases and high-margin affiliate streams.\n"),
              new TextRun("• Modules:\n"),
              new TextRun("  1. OBS Studio Setup, Audio Compression & Dynamic Overlays\n"),
              new TextRun("  2. Speedrunning to Twitch Affiliate & Kick Creator Program\n"),
              new TextRun("  3. Engaging Dead Chats: Viewer Retention Techniques\n"),
              new TextRun("  4. Securing Energy Drink, Tech & VPN Sponsorship Contracts\n"),
              new TextRun("  5. Merchandising & Multi-Platform VOD Repurposing\n"),
              new TextRun("• Tools: OBS Studio, Streamlabs, Discord, Kick Studio, Voicemod"),
            ],
            spacing: { after: 200 },
          }),

          // Section 6
          new Paragraph({
            text: "6. Transformation in Action & Statistics",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Featured Story: ", bold: true }),
              new TextRun("From No Gigs to $18,400 in Brand Deals in 3 Weeks (Khadija & Alex)\n"),
              new TextRun("“Brands don't care about your resume; they care if you can make a video stop thumbs scrolling. sidehustle.com gave us the exact pitch decks and lighting tricks.”\n\n"),
              new TextRun({ text: "Partner Testimonial: ", bold: true }),
              new TextRun("Ahmed E. (Agency Founder • Top 0.1% Fanvue Creator)\n"),
              new TextRun("“What started as learning AI persona creation grew into coaching others and eventually managing 4 digital avatars generating over $22k/month in recurring subscriber revenue.”\n\n"),
              new TextRun({ text: "Key Statistics:\n", bold: true }),
              new TextRun("• 347.1K: Total Active Hustlers Trained\n"),
              new TextRun("• 43.4K: Young Creators Supported in 2026\n"),
              new TextRun("• 257.9K: Monetized Channels & Accounts\n"),
              new TextRun("• 60.1K: Full-Time Exits from 9-to-5s"),
            ],
            spacing: { after: 200 },
          }),

          // Section 7
          new Paragraph({
            text: "7. The Latest - Strategy Guides",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "1. Twitch Affiliate & $2k Brand Deals in 30 Days\n", bold: true }),
              new TextRun("Author: Tariq Vance • 5 min read\nBreaking down raid schedules, Discord funnel strategies, and warm-outreach email templates.\n\n"),
              new TextRun({ text: "2. The Step-by-Step Anatomy of a $10,000/Month Faceless AI Influencer\n", bold: true }),
              new TextRun("Author: Elena Rostova • 7 min read\nLoRA training, Midjourney lighting prompts, subscriber tiers, and automated Fanvue DMs.\n\n"),
              new TextRun({ text: "3. AI Tools for Viral Video Creation: 2026 Algorithms\n", bold: true }),
              new TextRun("Author: Devon Chen • 6 min read\nPacing, sound design, and automated b-roll generators for TikTok and Reels."),
            ],
            spacing: { after: 200 },
          }),

          // Section 8 & 9
          new Paragraph({
            text: "8. Newsletter & Community",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            text: "Subscribe to sidehustle Updates: We bring together industry leaders to share insights, spark ideas, and help you level up.",
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "9. Footer & Brand Assets",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun("• Mission: The premier education accelerator for the modern creator economy.\n"),
              new TextRun("• Global Community: Trusted by 340,000+ creators across 85 countries worldwide.\n"),
              new TextRun("• Copyright: © 2026 sidehustle.com. All rights reserved."),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(publicDir, "sidehustle-website-content.docx"), buffer);
  console.log("Successfully generated sidehustle-website-content.docx, .txt, and .md in /public");
}

generateDocx().catch((err) => {
  console.error("Error generating docx:", err);
  process.exit(1);
});
