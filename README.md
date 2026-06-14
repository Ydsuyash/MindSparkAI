# MindSpark AI 🧠✨

> A high-fidelity, premium cognitive training ecosystem designed specifically for children with ADHD. 

MindSpark AI is an adaptive, gamified learning platform that blends engaging cognitive training exercises with an AI-powered insights engine to deliver a personalized, supportive, and fun experience for children, while providing meaningful, actionable analytics for parents.

## 🌟 Key Features

### For Children (The Explorers)
- **Interactive Training Library:** 15 highly engaging, interactive cognitive training games designed to improve focus, working memory, and executive function.
- **Global Adaptive Difficulty Engine:** An intelligent system that continuously analyzes the child's performance and seamlessly scales the challenge level up or down to keep them in the optimal "flow state" without frustration.
- **Gamified Identity Dashboard:** A vibrant, child-centric profile page featuring character progression ranks, a rich trophy cabinet to celebrate achievements, and dynamic rewards.
- **Virtual Companion Relationship Tracker:** Children interact with and build a relationship with a digital companion, encouraging daily check-ins and consistent training habits.

### For Parents (The Guides)
- **Comprehensive Analytics Dashboard:** A dedicated space to track the child's progress, strengths, and areas for improvement over time.
- **AI-Driven Insights:** Powered by **Google Gemini AI**, the dashboard translates complex behavioral and performance data into easy-to-understand, actionable insights and tailored recommendations for parents.

## 🛠️ Technology Stack

MindSpark AI is built using a modern, scalable, and highly performant web development stack:

- **Frontend Framework:** React 19, Vite
- **Routing & State:** TanStack Router, TanStack Query, Zustand
- **Styling & UI:** Tailwind CSS (v4), Framer Motion (for fluid animations), shadcn/ui (Radix primitives)
- **Backend & Database:** Supabase (PostgreSQL, Authentication, RLS)
- **AI Integration:** Google Generative AI (Gemini) SDK
- **Package Manager:** Bun (recommended) / npm

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- Node.js (v22+ recommended)
- [Bun](https://bun.sh/) (recommended for fastest dependency installation and execution)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "MindSpark FYP"
   ```

2. **Install dependencies:**
   Using Bun:
   ```bash
   bun install
   ```
   *Alternatively, using npm:*
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory (you can copy `.env.example` if available) and add your respective API keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Run the Development Server:**
   ```bash
   bun run dev
   ```
   *Or using npm:*
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📂 Project Structure

```
.
├── src/
│   ├── components/       # Reusable UI components (shadcn, etc.)
│   ├── routes/           # TanStack file-based routing
│   ├── lib/              # Utility functions and configurations
│   ├── store/            # Zustand global state stores
│   ├── hooks/            # Custom React hooks
│   └── assets/           # Static assets (images, icons, etc.)
├── supabase/             # Supabase edge functions, migrations, and types
├── public/               # Publicly accessible static assets
└── package.json          # Project dependencies and scripts
```

## 📜 Available Scripts

- `bun run dev` - Starts the Vite development server.
- `bun run build` - Builds the application for production.
- `bun run lint` - Runs ESLint to check for code quality issues.
- `bun run format` - Formats the codebase using Prettier.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
