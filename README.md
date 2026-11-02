# ⚡ Skill2Bills — Modern Side Hustle & Digital Revenue LMS

> **Skill2Bills** is a high-performance Learning Management System (LMS) and educational platform designed to empower creators, entrepreneurs, and side-hustlers with actionable, high-ticket digital skills. From AI Virtual Influencer creation and Fanvue monetization to Twitch streaming and automated digital product pipelines, Skill2Bills delivers zero-fluff video curriculums, structured lesson guides, performance analytics frameworks, and interactive learning tools.

---

## 🚀 Key Features

### 🎓 Interactive Learning Management System (LMS)
- **Structured Lesson Experience**: Interactive lesson player featuring embedded video walkthroughs (optimized with zero-distraction controls), clean dark-mode UI, and formatted **Core Concept Breakdown** modules.
- **AI Virtual Influencer Masterclass**: Full 18-lesson curriculum covering niche selection, content generation, direct fan monetization, brand sponsorships, performance tracking, A/B testing with Instagram Trial Reels, and future-proofing in the AI era.
- **Progression & Analytics**: Real-time progress tracking, course completion status, quizzes, and learner feedback popups.
- **Resource Downloads**: Attached checklists, DOCX/PDF guides, and step-by-step monetization toolkits.

### 💼 Creator Monetization & Strategy Frameworks
- **Direct Fan Monetization**: Direct-to-consumer offer structures, affiliate strategies, and comment-to-DM conversion funnels.
- **Brand Partnerships & Sponsorships**: Spec ad workflows, media kit builder, and pitch strategy shifts.
- **Performance Tracking & A/B Testing**: Tracking account vs. content metrics (Reach, Retention, Engagement, Clicks) and running structured hook tests.

### 🔒 Modern Architecture & Security
- **Authentication & User Management**: Integrated Supabase Auth & Row Level Security (RLS) for secure student and admin role access.
- **Admin Control Panel**: Course management, student analytics, program customization, and content publishing tools.
- **Responsive & Dynamic UI**: Built with React 19, TypeScript, Vite, Tailwind CSS v4, and Lucide React icons.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL & Auth)
- **Icons & Motion**: [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **AI Integration**: [@google/genai](https://www.npmjs.com/package/@google/genai) SDK

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **bun**

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/chriscode-cloud/skilltobills.git
   cd skilltobills
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your configuration:
   ```bash
   cp .env.example .env
   ```
   *Required variables:*
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

- `npm run dev` — Starts the local Vite development server on port 3000.
- `npm run build` — Compiles and bundles production-ready code.
- `npm run preview` — Previews the production build locally.
- `npm run lint` — Runs TypeScript type-checking (`tsc --noEmit`).

---

## 📂 Project Structure

```text
├── components/          # Reusable UI components (Radix UI, buttons, modals)
├── public/              # Static assets, guide downloads, media attachments
├── src/
│   ├── components/      # Core app views
│   │   ├── lms/         # LMS Classroom, Lesson Player, Course Data & Types
│   │   ├── admin/       # Admin Dashboard & Guard components
│   │   ├── auth/        # Authentication pages & modals
│   │   └── navigation/  # AppShell & PublicShell navigation layouts
│   ├── data/            # Course curriculums & video metadata
│   ├── lib/             # Supabase client, auth helpers, utility functions
│   ├── App.tsx          # Main application routing & view coordinator
│   └── main.tsx         # React entry point
├── supabase/            # SQL database schemas & migration files
├── package.json         # Project dependencies & build scripts
└── README.md            # Project documentation
```

---

## 📄 License

This project is licensed under the MIT License.
