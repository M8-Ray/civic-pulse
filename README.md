# 🏛️ CiviLog

> **An AI-powered live registry and routing console for community-driven hazard reporting.**

CiviLog bridges the gap between citizens, local neighborhoods, and municipal bodies. It empowers residents to document, verify, and resolve local street grievances (potholes, broken streetlights, water leaks, trash overflows) by automating media verification, proximity locks, and dispatch channels.

---

## 💡 The Problem CiviLog Solves

Traditional civic complaint processes are heavily fragmented:
1. **Inefficient Reporting:** Citizens struggle with complex portals or don't know which municipal authority to contact.
2. **Lack of Transparency:** Once reported, complaints fall into a black box with zero visibility on progress.
3. **Data Pollution & Spam:** Duplicate reports, false coordinates, and off-topic media clutter municipal queues, draining local repair resources.
4. **Poor Coordination:** No unified, open map exists for neighbors to upvote existing issues to highlight local demand.

**CiviLog solves this** by offering a verified, publicly transparent vector map registry that uses on-device GPS validation, Gemini Vision AI scanner checks, duplicate prevention, and automated dispatch routing.

---

## ✨ Core Features

### 1. 🤖 Vision AI Autofill
- Powered by **Google Gemini API** integration.
- Citizens snap a photo of street damage; CiviLog detects the issue category (e.g., *Infrastructure*, *Sanitation*), estimates severity (*High*, *Medium*, *Low*), and drafts structural details instantly.

### 2. 📍 GPS Proximity Lock
- Restricts issue marker pin positioning to a strict **100-meter zone** surrounding the submitter's device coordinates, preventing false remote submissions.

### 3. 👥 Citizen Resolve & Priority Upvoting
- Neighbors can view and upvote local reports.
- Reports gain urgency based on vote counts. Accumulating a **3-vote threshold** automatically updates the ticket's progress and moves it to a resolved state.

### 4. 📯 Municipal Dispatch Router
- Auto-addresses formal grievance letters directly to commissioners across **21 Indian municipal corporations** (including PMC, BMC, MCD, BBMP, and more).

### 5. 🛡️ Duplicate Prevention
- Actively scans coordinate quadrants. If an unresolved ticket of the same category exists nearby, the system flags it, prompting users to upvote the existing marker instead of creating duplicate records.

### 6. 📢 Instant Broadcast Intents
- Auto-drafts formatted templates optimized for one-click sharing across **WhatsApp** and **X (Twitter)**, accelerating community awareness.

### 7. 🏆 Gamification Profile
- Reward system tracking citizen actions. Submitting reports and voting on resolutions earns experience points (**XP**), unlocking profile levels and badges (e.g., *Local Watchdog* to *Neighborhood Hero*).

### 8. 💬 Integrated AI Assistant
- Built-in floating chat bubble querying Pune municipal guidelines, reporting policies, coordinate limits, and general platform guides.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16 (Turbopack)** | Core Framework & App Routing |
| **React 19** | Component Architecture & Client Hooks |
| **Supabase (PostgreSQL)** | Database Registry & Real-Time Storage Buckets |
| **Gemini-3.1-Flash API** | Vision AI media scans & conversational Chatbot queries |
| **Framer Motion** | Micro-animations, slide guides, and card transits |
| **Vanilla CSS Modules** | Custom design tokens, glassmorphism UI, & responsive dark modes |
| **Lucide React** | Cohesive vector typography icon sets |

---

## 🏢 Supported Local Bodies (21 Cities)
CiviLog dynamically routes grievances to the matching commissioner desks of major corporations including:
- **Pune Municipal Corporation (PMC)**
- **Brihanmumbai Municipal Corporation (BMC)**
- **Bruhat Bengaluru Mahanagara Palike (BBMP)**
- **Municipal Corporation of Delhi (MCD)**
- **Kolkata Municipal Corporation (KMC)**
- *And 16 other regional urban local bodies.*

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- NPM, Yarn, or PNPM

### Environment Setup
Create a `.env.local` file in the root directory and configure the following:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd civilog
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 📂 Project Architecture
```text
├── src/
│   ├── app/                 # Next.js App router pages (map, report, feed, api)
│   ├── components/          # Reusable UI widgets (TopBar, CivicBot, AuthModal)
│   ├── context/             # Location & Theme providers
│   ├── data/                # Seed issues and city center data
│   ├── lib/                 # Supabase client setup
│   └── styles/              # Global variables, tokens, and CSS modules
├── public/                  # Static image assets and icons
├── package.json             # Build configurations & script entries
└── README.md                # Platform documentation
```

---

## 📜 License
CiviLog is open-source software licensed under the MIT License.
