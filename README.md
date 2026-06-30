# 🏛️ CiviLog

> **An AI-powered live registry and routing console for community-driven hazard reporting.**
>
> 🌐 **Live Demo:** [CiviLog App](https://civic-pulse-1063460291701.asia-south1.run.app/)

CiviLog bridges the gap between citizens, local neighborhoods, and municipal bodies. It empowers residents to document, verify, and resolve local street grievances (potholes, broken streetlights, water leaks, trash overflows) by automating media verification, proximity locks, and dispatch channels.

---

## 📸 App Previews

<div align="center">
  <h3>1. Landing Page</h3>
  <img src="screenshots/Screenshot 2026-06-30 160141.png" alt="Landing Page" width="700" style="border-radius: 12px; margin-bottom: 24px;" />
  
  <table width="100%">
    <tr>
      <td width="50%" align="center">
        <strong>2. Issue Feed</strong><br/>
        <img src="screenshots/Screenshot 2026-06-30 160425.png" alt="Issue Feed" width="100%" style="border-radius: 10px; margin-top: 8px;" />
      </td>
      <td width="50%" align="center">
        <strong>3. Map Dashboard</strong><br/>
        <img src="screenshots/Screenshot 2026-06-30 160524.png" alt="Map Dashboard" width="100%" style="border-radius: 10px; margin-top: 8px;" />
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <strong>4. Report Issue</strong><br/>
        <img src="screenshots/Screenshot 2026-06-30 160537.png" alt="Report Issue" width="100%" style="border-radius: 10px; margin-top: 8px;" />
      </td>
      <td width="50%" align="center">
        <strong>5. AI chatbot</strong><br/>
        <img src="screenshots/Screenshot 2026-06-30 160836.png" alt="AI chatbot" width="100%" style="border-radius: 10px; margin-top: 8px;" />
      </td>
    </tr>
  </table>
</div>

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
- Citizens snap a photo of street damage; CiviLog detects the issue category (e.g., *Infrastructure*, *Sanitation*), estimates severity (*High*, *Medium*, *Low*), and drafts structural details instantly. AI also rejects photos that are not related to the issue.

### 2. 📢 Share Issue to Social Media
- Auto-drafts formatted templates optimized for one-click sharing across **WhatsApp** and **X (Twitter)**, accelerating community awareness.

### 3. 📯 Auto Email Municipal Corporations
- Auto-addresses formal grievance letters directly to commissioners across **21 Indian municipal corporations** (including PMC, BMC, MCD, BBMP, and more).

### 4. 👥 Citizen Voting
- Neighbors can view and upvote local reports.
- Reports gain urgency based on vote counts. Accumulating a **3-vote threshold** automatically updates the ticket's progress and moves it to a resolved state.

### 5. 🛡️ Duplicate Issues Prevention
- Actively scans coordinate quadrants. If an unresolved ticket of the same category exists nearby, the system flags it, prompting users to upvote the existing marker instead of creating duplicate records.

### 6. 📍 GPS Proximity Lock
- Restricts issue marker pin positioning to a strict **100-meter zone** surrounding the submitter's device coordinates, preventing false remote submissions.

### 7. 🏆 Gamification Profile
- Reward system tracking citizen actions. Submitting reports and voting on resolutions earns experience points (**XP**), unlocking profile levels and badges (e.g., *Local Watchdog* to *Neighborhood Hero*).

### 8. 💬 Integrated AI Assistant
- Built-in floating chat bubble for answering user queries.

### 9. 🏛️ Municipal Authority Management Dashboard
- A dedicated administrative interface for urban local bodies and municipal engineers to review queued issues, update dispatch statuses, change severities, and log official resolution updates.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16 (Turbopack)** | Core Framework & App Routing |
| **React 19** | Component Architecture & Client Hooks |
| **Leaflet & OpenStreetMap** | Interactive mapping tile layers, coordinates pinning, and zone locks |
| **Supabase (PostgreSQL)** | Database Registry & Real-Time Media Storage Buckets |
| **Gemini-3.1-Flash API** | Vision AI media scans & conversational Chatbot queries |
| **Framer Motion** | Micro-animations, entrance cues, sliders, and card transitions |
| **OGL (WebGL Canvas)** | Hardware-accelerated dynamic interactive background layers (fluid auroras) |
| **Lenis** | Core fluid smooth-scroll physics wrapper |
| **Vanilla CSS Modules** | Custom theme tokens, glassmorphism UI layouts, and styling |
| **Lucide React** | Cohesive vector iconography sets |

Additional development & infrastructure toolchains:
- **Google Antigravity IDE**: Development workspace environment
- **Google AI Studio**: Gemini system instructions profiling and prototyping
- **Google Cloud Run**: Managed docker container deployment hosting platform
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

