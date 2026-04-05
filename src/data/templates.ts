import type { BoardTemplate } from "@/types";

// ========================
// Common label set (shared across all templates)
// ========================
const COMMON_LABELS = [
  { name: "High Priority", color: "#eb5a46" },
  { name: "Medium Priority", color: "#f2d600" },
  { name: "Low Priority", color: "#61bd4f" },
  { name: "Urgent", color: "#ff9f1a" },
  { name: "Review", color: "#89609e" },
];

// ========================
// Template category constants
// ========================
export const TEMPLATE_CATEGORIES = [
  "Design",
  "Marketing",
  "Education",
  "Software Development",
  "Personal Productivity",
  "Startup / Business",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

/**
 * Pre-built board templates (premium set).
 * Each template defines lists, sample cards, and default labels
 * matching the common label system.
 *
 * To add a new template, append to the TEMPLATES array below.
 */
export const TEMPLATES: BoardTemplate[] = [
  // ─────────────────────────────────────
  // 1. Design Workflow
  // ─────────────────────────────────────
  {
    id: "design-workflow",
    name: "Design Workflow",
    description:
      "End-to-end design pipeline from initial inspiration through wireframes, UI design, review, revisions, and final asset delivery.",
    category: "Design",
    icon: "🎨",
    background: "#89609e",
    lists: [
      {
        title: "Ideas / Inspiration",
        cards: [
          { title: "Collect design references", description: "Gather visual references from Dribbble, Behance, and Pinterest" },
          { title: "Create mood board", description: "Compile colors, typography, and imagery into a mood board" },
        ],
      },
      {
        title: "Research",
        cards: [
          { title: "Analyze competitors", description: "Review competitor design patterns and UX flows" },
          { title: "Define target audience", description: "Create user personas and audience profiles" },
        ],
      },
      {
        title: "Wireframes",
        cards: [
          { title: "Create low-fidelity wireframes", description: "Sketch page layouts and user flows" },
          { title: "Review layout structure", description: "Validate information architecture" },
        ],
      },
      {
        title: "UI Design",
        cards: [
          { title: "Design homepage UI", description: "Create high-fidelity homepage mockup" },
          { title: "Design mobile screens", description: "Responsive design for mobile breakpoints" },
          { title: "Apply color system and typography", description: "Finalize brand colors and type scale" },
        ],
      },
      {
        title: "Review / Feedback",
        cards: [
          { title: "Client feedback session", description: "Present designs and collect client notes" },
          { title: "Internal design review", description: "Team critique and QA pass" },
        ],
      },
      {
        title: "Revisions",
        cards: [
          { title: "Implement feedback changes", description: "Apply all approved revision requests" },
          { title: "Polish UI details", description: "Fine-tune spacing, shadows, and micro-interactions" },
        ],
      },
      {
        title: "Final Assets",
        cards: [
          { title: "Export design files", description: "Export production-ready assets (SVG, PNG, etc.)" },
          { title: "Prepare developer handoff", description: "Create specs and component documentation" },
        ],
      },
      {
        title: "Completed",
        cards: [],
      },
    ],
    labels: [...COMMON_LABELS],
  },

  // ─────────────────────────────────────
  // 2. Marketing Campaign
  // ─────────────────────────────────────
  {
    id: "marketing-campaign",
    name: "Marketing Campaign",
    description:
      "Plan, create, schedule, and analyze marketing campaigns across channels with built-in analytics tracking.",
    category: "Marketing",
    icon: "📢",
    background: "#d29034",
    lists: [
      {
        title: "Campaign Ideas",
        cards: [
          { title: "Define campaign goal", description: "Set clear, measurable campaign objectives" },
          { title: "Brainstorm campaign themes", description: "Generate creative angles and messaging ideas" },
        ],
      },
      {
        title: "Planning",
        cards: [
          { title: "Identify target audience", description: "Define audience segments and personas" },
          { title: "Set budget and timeline", description: "Allocate resources and set milestones" },
        ],
      },
      {
        title: "Content Creation",
        cards: [
          { title: "Create social media posts", description: "Write copy and design visuals for each platform" },
          { title: "Design ad creatives", description: "Build display, story, and video ad assets" },
          { title: "Write email sequences", description: "Draft email nurture and announcement campaigns" },
        ],
      },
      {
        title: "Design Assets",
        cards: [
          { title: "Design banner images", description: "Create web and social media banners" },
          { title: "Create video thumbnails", description: "Design eye-catching video covers" },
        ],
      },
      {
        title: "Scheduling",
        cards: [
          { title: "Schedule posts", description: "Queue content across all social channels" },
          { title: "Set up email automation", description: "Configure drip campaigns and triggers" },
        ],
      },
      {
        title: "Publishing",
        cards: [
          { title: "Launch campaign", description: "Go live across all planned channels" },
          { title: "Monitor initial performance", description: "Track first 24-48hr metrics" },
        ],
      },
      {
        title: "Analytics",
        cards: [
          { title: "Track engagement", description: "Monitor clicks, shares, and conversions" },
          { title: "Write campaign report", description: "Summarize performance and learnings" },
        ],
      },
      {
        title: "Completed",
        cards: [],
      },
    ],
    labels: [...COMMON_LABELS],
  },

  // ─────────────────────────────────────
  // 3. Study Planner (Education)
  // ─────────────────────────────────────
  {
    id: "study-planner",
    name: "Study Planner",
    description:
      "Organize subjects, track study progress, manage revisions, and prepare for tests and exams.",
    category: "Education",
    icon: "📚",
    background: "#519839",
    lists: [
      {
        title: "Subjects",
        cards: [
          { title: "Math Chapter 1", description: "Algebra fundamentals and equations" },
          { title: "Science Notes", description: "Physics — motion and forces" },
        ],
      },
      {
        title: "To Study",
        cards: [
          { title: "History essay outline", description: "Draft outline for WWII essay" },
          { title: "Literature reading", description: "Complete chapters 5-8" },
        ],
      },
      {
        title: "In Progress",
        cards: [
          { title: "Practice questions", description: "Solve 20 problems from workbook" },
          { title: "Lab report", description: "Write up chemistry experiment results" },
        ],
      },
      {
        title: "Revision",
        cards: [
          { title: "Review flashcards", description: "Go through vocabulary flash cards" },
          { title: "Summarize key concepts", description: "Create one-page concept summaries" },
        ],
      },
      {
        title: "Tests / Exams",
        cards: [
          { title: "Mock test", description: "Timed practice exam under test conditions" },
          { title: "Final exam prep", description: "Review all topics and past papers" },
        ],
      },
      {
        title: "Completed",
        cards: [],
      },
    ],
    labels: [...COMMON_LABELS],
  },

  // ─────────────────────────────────────
  // 4. Development Workflow (Software Development)
  // ─────────────────────────────────────
  {
    id: "development-workflow",
    name: "Development Workflow",
    description:
      "Agile-inspired board for managing the full software development lifecycle from backlog through deployment.",
    category: "Software Development",
    icon: "💻",
    background: "#0079bf",
    lists: [
      {
        title: "Backlog",
        cards: [
          { title: "Fix login bug", description: "Users unable to login with Google OAuth on mobile" },
          { title: "API integration", description: "Integrate third-party payment gateway" },
        ],
      },
      {
        title: "Planning",
        cards: [
          { title: "Write user stories", description: "Define acceptance criteria for sprint items" },
          { title: "Estimate story points", description: "Team estimation session for backlog items" },
        ],
      },
      {
        title: "In Progress",
        cards: [
          { title: "Build dashboard UI", description: "Implement analytics dashboard with charts" },
          { title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for auto-deploy" },
        ],
      },
      {
        title: "Code Review",
        cards: [
          { title: "Review pull requests", description: "Review and approve pending PRs" },
        ],
      },
      {
        title: "Testing",
        cards: [
          { title: "Write unit tests", description: "Achieve 80%+ coverage on core modules" },
          { title: "Integration testing", description: "End-to-end test critical user flows" },
        ],
      },
      {
        title: "Deployment",
        cards: [
          { title: "Stage release", description: "Deploy to staging environment for QA" },
          { title: "Production deploy", description: "Release to production with rollback plan" },
        ],
      },
      {
        title: "Done",
        cards: [],
      },
    ],
    labels: [...COMMON_LABELS],
  },

  // ─────────────────────────────────────
  // 5. Personal Tasks (Personal Productivity)
  // ─────────────────────────────────────
  {
    id: "personal-tasks",
    name: "Personal Tasks",
    description:
      "Simple personal productivity board to organize daily tasks, habits, and goals.",
    category: "Personal Productivity",
    icon: "✅",
    background: "#4bbf6b",
    lists: [
      {
        title: "Ideas",
        cards: [
          { title: "Start a journal", description: "Begin daily journaling habit" },
          { title: "Learn a new skill", description: "Research online courses" },
        ],
      },
      {
        title: "To Do",
        cards: [
          { title: "Morning routine", description: "Exercise, meditate, and plan the day" },
          { title: "Grocery shopping", description: "Buy weekly groceries from the list" },
          { title: "Workout plan", description: "Create a 4-week fitness schedule" },
        ],
      },
      {
        title: "Doing",
        cards: [
          { title: "Read 20 pages", description: "Continue reading current book" },
        ],
      },
      {
        title: "Waiting",
        cards: [
          { title: "Package delivery", description: "Tracking number: awaiting shipment" },
        ],
      },
      {
        title: "Completed",
        cards: [],
      },
    ],
    labels: [...COMMON_LABELS],
  },

  // ─────────────────────────────────────
  // 6. Startup Roadmap (Startup / Business)
  // ─────────────────────────────────────
  {
    id: "startup-roadmap",
    name: "Startup Roadmap",
    description:
      "End-to-end startup planning board from idea validation through MVP, launch, and growth.",
    category: "Startup / Business",
    icon: "🚀",
    background: "#00aecc",
    lists: [
      {
        title: "Ideas",
        cards: [
          { title: "Market research", description: "Analyze TAM, SAM, and SOM for target market" },
          { title: "Identify pain points", description: "Interview 20 potential users about their problems" },
        ],
      },
      {
        title: "Validation",
        cards: [
          { title: "Customer surveys", description: "Distribute survey to validate assumptions" },
          { title: "Competitor analysis", description: "Map competitive landscape and differentiators" },
        ],
      },
      {
        title: "MVP Development",
        cards: [
          { title: "Build MVP", description: "Develop minimum viable product with core features" },
          { title: "Landing page", description: "Create conversion-focused landing page" },
        ],
      },
      {
        title: "Marketing",
        cards: [
          { title: "Social media presence", description: "Set up brand accounts on key platforms" },
          { title: "Content strategy", description: "Plan blog posts and launch announcements" },
        ],
      },
      {
        title: "Launch",
        cards: [
          { title: "Beta launch", description: "Release to early adopters and collect feedback" },
          { title: "Product Hunt launch", description: "Prepare and schedule Product Hunt listing" },
        ],
      },
      {
        title: "Growth",
        cards: [
          { title: "User acquisition", description: "Run paid ads and referral campaigns" },
          { title: "Analyze metrics", description: "Track MRR, churn, and activation rates" },
        ],
      },
      {
        title: "Completed",
        cards: [],
      },
    ],
    labels: [...COMMON_LABELS],
  },
];

/** Look up a single template by ID */
export function getTemplateById(id: string): BoardTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
