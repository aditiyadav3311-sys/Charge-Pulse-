# Campus Pulse — AI Campus Life Intelligence & Announcement Workspace

Campus Pulse gives university students a single, intelligent command center to turn chaotic WhatsApp forwards, emails, and poster captions into structured, priority-ranked events and deadlines with automated calendar sync and weekly digests.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The application is tailored directly to the "Campus Pulse" buildathon specification. Please review the core workflow and architecture decisions below:

- **Full-Stack Gemini Integration via Server Proxy**: Unstructured notice parsing and weekly digests are processed server-side via Express and the official `@google/genai` TypeScript SDK (`gemini-3.8-flash`). A resilient client-side heuristic fallback is bundled so evaluators get seamless performance even if an offline sandbox or rate limit occurs.
- **Immediate Evaluation Readiness**: Pre-loaded with 5 realistic college notices across Academic, Placement, Hackathon, Cultural Club, and Sports categories, plus 4 one-click sample messy WhatsApp/email notices in the intake modal for effortless judge evaluation.
- **Calendar & Action Tooling**: Beyond static cards, students can export to `.ics` (Apple/Outlook Calendar), open 1-click Google Calendar links, pin notices, mark them as completed, and search/filter dynamically.

---

### 1. Overview & Core Concept

- **What It Does**: Solves college announcement clutter. Students paste messy, chaotic forwards (e.g. from WhatsApp batch groups, faculty emails, student council Telegrams). Campus Pulse automatically extracts the event title, category, date, time, venue, key instructions, and links, classifying its urgency (Urgent, Upcoming, Expired, or Needs Attention Today).
- **Target Audience**: University undergraduates, graduate students, club leads, and campus ambassadors juggling academic deadlines, placement drives, club meetings, and campus festivals.
- **Key Value**: Eliminates missed deadlines and WhatsApp scroll fatigue. Provides one-click calendar export, today's immediate priorities, and a "What do I need to know this week?" AI weekly digest.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Dashboard & Triage**: Student lands on the dashboard; instantly sees today's immediate priorities banner, statistics (Total, Needs Attention Today, Academic, Events), and the active announcement grid.
  2. **Smart Notice Intake**: Clicking "Paste Notice" or "Quick Sample" opens the AI Parser panel. The student can paste raw messy WhatsApp text or pick a sample notice. Clicking "Extract & Add" triggers Gemini to extract structured JSON and insert the new notice into the dashboard.
  3. **Weekly Digest Generation**: Clicking "What do I need to know this week?" triggers Gemini to synthesize all current notices into an executive 3-bullet student action plan.
  4. **Organization & Calendar**: Student filters by category (Academic, Events, Clubs, Placement), switches between Grid and Timeline views, searches by keyword, stars critical notices, and clicks "Add to Calendar".

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Modern collegiate executive workspace. Crisp slate surfaces, deep navy backgrounds (`#0B1120` canvas), subtle glassmorphism headers, and warm emerald/amber priority accents.
  - *Color Palette & Tokens*:
    - Neutral Canvas: Dark slate `#090D16` / Light clean `#F8FAFC`
    - Structural Cards: Elevated surfaces `#111827` with hairline border `#1F2937`
    - Priority Statuses: Urgent/Today `#EF4444` (Crimson), Approaching `#F59E0B` (Amber), Standard `#10B981` (Emerald), Academic `#6366F1` (Indigo)
  - *Typography*: `Plus Jakarta Sans` for clean, confident display headlines and UI controls; `DM Sans` for body copy; `tabular-nums` monospace for dates, times, and countdowns.
  - *Anti-Slop Discipline*: Zero fake scorecards, zero static pill tags (clean unboxed typographic metadata with `·` dividers), no broken icons, clean single-line controls.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack Express Server Route vs Client Direct API**:
  - *Chosen Approach*: Expose `/api/extract-notice` and `/api/weekly-digest` on an Express backend powered by `@google/genai` using the server's `process.env.GEMINI_API_KEY`.
  - *Why*: Never exposes secrets to the browser, protects API keys, complies with platform security guidelines, and enables strict JSON schema validation.
  - *Alternatives Considered*: Client-side Gemini SDK was rejected due to API key exposure risks.

- **Decision 2: Dual Extraction Engine (Gemini + Local NLP Fallback)**:
  - *Chosen Approach*: Server queries Gemini `gemini-3.8-flash` with a strict JSON response schema. If the network or API key is unavailable, a client-side regex/heuristic parser seamlessly steps in.
  - *Why*: Guarantees 100% zero-crash reliability during high-stakes buildathon live demos and judge evaluations.

- **Decision 3: Zero-Setup Persistence**:
  - *Chosen Approach*: Browser `localStorage` with initial seed state and an explicit "Reset to Demo Data" option.
  - *Why*: Instant setup, zero database latency, fully operable in any browser environment, allowing judges to test creating, editing, and deleting items immediately.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       Campus Pulse UI                       │
│  ┌───────────────────────┐  ┌────────────────────────────┐  │
│  │ Top Bar: Brand, Stats │  │ Action: "What to know?" AI │  │
│  └───────────────────────┘  └────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Control Bar: Category Filters, Search, View Switcher  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────┐   ┌─────────────────────────┐  │
│  │ Quick Intake Form/Modal │   │ Priority Notice Grid    │  │
│  │ (Raw text + sample tabs)│   │ (Urgent / Upcoming / ..)│  │
│  └───────────┬─────────────┘   └────────────┬────────────┘  │
└──────────────┼──────────────────────────────┼───────────────┘
               │ fetch("/api/extract-notice") │
               │ fetch("/api/weekly-digest")  │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend API                      │
│             server.ts (Node / tsx, Port 3000)               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ @google/genai SDK (gemini-3.8-flash, responseSchema)  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### Core Data Entities

```typescript
export interface CampusNotice {
  id: string;
  title: string;
  category: 'Academic' | 'Events' | 'Clubs' | 'Placement' | 'General';
  date: string;          // ISO string YYYY-MM-DD
  time?: string;         // e.g. "10:30 AM - 1:00 PM"
  venue?: string;        // e.g. "Audi 2, Main Campus"
  summary: string;       // 1-2 sentence core requirement
  rawSourceText?: string;// original pasted snippet
  urgency: 'urgent' | 'upcoming' | 'expired';
  isToday?: boolean;
  isStarred?: boolean;
  isCompleted?: boolean;
  createdAt: number;
}
```

#### Verification & QA Plan
1. **Compilation Check**: Run `compile_applet` and verify no TypeScript or Vite build errors.
2. **Extraction Accuracy**: Test sample chaotic WhatsApp messages (e.g. abbreviations like "tmrw", "audi 3", messy emojis) and verify parsed fields.
3. **Digest Validation**: Confirm "What do I need to know this week?" returns structured, legible insights.
4. **Calendar Integration**: Verify `.ics` download and Google Calendar URL generation with proper date-time encoding.
5. **Responsiveness**: Verify desktop (1440px) and mobile viewport layouts.
