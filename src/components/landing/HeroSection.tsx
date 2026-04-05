"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, Sparkles, Users, Zap } from "lucide-react";

/* Animated floating badge */
function FloatingBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 mb-8"
    >
      <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
        Now with AI-powered task suggestions
      </span>
    </motion.div>
  );
}

/* Mock board preview */
function BoardPreview() {
  const lists = [
    {
      title: "To Do",
      color: "bg-blue-500",
      cards: [
        { title: "Design new landing page", labels: ["Design", "UI"], hasAvatar: true },
        { title: "Research competitors", labels: ["Research"], hasAvatar: false },
        { title: "Write API docs", labels: ["Docs"], hasAvatar: true },
      ],
    },
    {
      title: "In Progress",
      color: "bg-amber-500",
      cards: [
        { title: "Build auth flow", labels: ["Backend", "Priority"], hasAvatar: true },
        { title: "Mobile responsive", labels: ["Frontend"], hasAvatar: false },
      ],
    },
    {
      title: "Done",
      color: "bg-emerald-500",
      cards: [
        { title: "Setup CI/CD pipeline", labels: ["DevOps"], hasAvatar: true },
        { title: "Database schema", labels: ["Backend"], hasAvatar: true },
      ],
    },
  ];

  const labelColors: Record<string, string> = {
    Design: "bg-violet-500",
    UI: "bg-pink-500",
    Research: "bg-cyan-500",
    Docs: "bg-sky-500",
    Backend: "bg-orange-500",
    Priority: "bg-red-500",
    Frontend: "bg-emerald-500",
    DevOps: "bg-indigo-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
      className="relative mt-16 lg:mt-0 perspective-1000"
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-purple-500/20 rounded-3xl blur-2xl" />

      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-white/10 shadow-2xl shadow-blue-500/10 p-4 overflow-hidden">
        {/* Board header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">TaskFlow Board</span>
        </div>

        {/* Lists */}
        <div className="flex gap-3">
          {lists.map((list, li) => (
            <motion.div
              key={list.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + li * 0.15, duration: 0.5 }}
              className="w-48 shrink-0"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${list.color}`} />
                <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{list.title}</span>
                <span className="text-[10px] text-gray-400 ml-auto">{list.cards.length}</span>
              </div>
              <div className="space-y-2">
                {list.cards.map((card, ci) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + li * 0.15 + ci * 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-lg p-2.5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow cursor-default"
                  >
                    <div className="flex gap-1 mb-1.5">
                      {card.labels.map((l) => (
                        <span key={l} className={`h-1.5 w-6 rounded-full ${labelColors[l] || "bg-gray-400"}`} />
                      ))}
                    </div>
                    <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 leading-tight">{card.title}</p>
                    {card.hasAvatar && (
                      <div className="flex items-center justify-end mt-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-violet-400" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-blue-400/20 via-violet-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left content */}
          <div>
            <FloatingBadge />

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
            >
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                Organize Your Work.
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Collaborate Smarter.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="mt-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg"
            >
              TaskFlow helps teams manage tasks, track progress, and work together in real-time. The modern workspace your team deserves.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                Get Started Free
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all">
                <Play size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-10 flex items-center gap-6"
            >
              <div className="flex -space-x-2">
                {["from-blue-400 to-cyan-400", "from-violet-400 to-pink-400", "from-amber-400 to-orange-400", "from-emerald-400 to-teal-400"].map((g, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-white dark:border-slate-900`} />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Loved by 10,000+ teams</p>
              </div>
            </motion.div>
          </div>

          {/* Right — Board preview */}
          <BoardPreview />
        </div>
      </div>
    </section>
  );
}
