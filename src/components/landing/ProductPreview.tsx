"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/* Interactive board mockup showing a polished product screenshot */
export default function ProductPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const lists = [
    {
      title: "Backlog",
      dot: "bg-gray-400",
      cards: [
        { title: "User onboarding flow redesign", labels: [{ color: "bg-violet-500", w: "w-8" }, { color: "bg-pink-500", w: "w-6" }], members: 2, date: "Jan 15" },
        { title: "Performance audit", labels: [{ color: "bg-orange-500", w: "w-7" }], members: 1, date: null },
      ],
    },
    {
      title: "In Progress",
      dot: "bg-blue-500",
      cards: [
        { title: "Implement dark mode toggle", labels: [{ color: "bg-emerald-500", w: "w-8" }, { color: "bg-blue-500", w: "w-6" }], members: 3, date: "Jan 12" },
        { title: "Dashboard analytics widget", labels: [{ color: "bg-amber-500", w: "w-7" }], members: 2, date: "Jan 14" },
        { title: "Fix notification service", labels: [{ color: "bg-red-500", w: "w-6" }], members: 1, date: "Jan 10" },
      ],
    },
    {
      title: "Review",
      dot: "bg-amber-500",
      cards: [
        { title: "API rate limiting middleware", labels: [{ color: "bg-indigo-500", w: "w-8" }], members: 2, date: "Jan 11" },
        { title: "E2E test coverage", labels: [{ color: "bg-teal-500", w: "w-7" }, { color: "bg-cyan-500", w: "w-5" }], members: 1, date: null },
      ],
    },
    {
      title: "Completed",
      dot: "bg-emerald-500",
      cards: [
        { title: "Setup project repo", labels: [{ color: "bg-sky-500", w: "w-6" }], members: 2, date: "Jan 8" },
        { title: "Configure CI pipeline", labels: [{ color: "bg-purple-500", w: "w-8" }], members: 1, date: "Jan 9" },
      ],
    },
  ];

  const avatarGradients = [
    "from-blue-400 to-cyan-400",
    "from-violet-400 to-pink-400",
    "from-amber-400 to-orange-400",
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-r from-blue-400/10 via-violet-400/10 to-purple-400/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
            Product Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            See TaskFlow in action
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
            A powerful, flexible board that adapts to the way your team works.
          </p>
        </motion.div>

        {/* Board frame */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-purple-500/10 rounded-3xl blur-xl" />

          <div className="relative bg-gradient-to-br from-blue-600 to-violet-700 rounded-2xl shadow-2xl shadow-blue-500/20 overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-black/20">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">Product Roadmap</span>
                <span className="text-[10px] text-white/50 px-2 py-0.5 rounded bg-white/10">workspace</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {avatarGradients.map((g, i) => (
                    <div key={i} className={`w-6 h-6 rounded-full bg-gradient-to-br ${g} border-2 border-white/20`} />
                  ))}
                </div>
                <span className="text-[10px] text-white/40 ml-1">+5 more</span>
              </div>
            </div>

            {/* Board content */}
            <div className="flex gap-3 p-4 overflow-x-auto pb-6">
              {lists.map((list, li) => (
                <motion.div
                  key={list.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + li * 0.1 }}
                  className="w-56 shrink-0 bg-white/10 backdrop-blur-sm rounded-xl p-3"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2 h-2 rounded-full ${list.dot}`} />
                    <span className="text-[11px] font-semibold text-white/90">{list.title}</span>
                    <span className="text-[10px] text-white/40 ml-auto">{list.cards.length}</span>
                  </div>
                  <div className="space-y-2">
                    {list.cards.map((card, ci) => (
                      <motion.div
                        key={card.title}
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="bg-white dark:bg-slate-800 rounded-lg p-2.5 shadow-sm cursor-default"
                      >
                        <div className="flex gap-1 mb-1.5">
                          {card.labels.map((l, k) => (
                            <span key={k} className={`h-1.5 ${l.w} rounded-full ${l.color}`} />
                          ))}
                        </div>
                        <p className="text-[11px] font-medium text-gray-700 dark:text-gray-200 leading-tight mb-2">{card.title}</p>
                        <div className="flex items-center justify-between">
                          {card.date && (
                            <span className="text-[9px] text-gray-400 dark:text-gray-500">{card.date}</span>
                          )}
                          <div className="flex -space-x-1 ml-auto">
                            {Array.from({ length: Math.min(card.members, 3) }).map((_, mi) => (
                              <div
                                key={mi}
                                className={`w-4.5 h-4.5 rounded-full bg-gradient-to-br ${avatarGradients[mi % avatarGradients.length]} border border-white dark:border-slate-800`}
                                style={{ width: 18, height: 18 }}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
