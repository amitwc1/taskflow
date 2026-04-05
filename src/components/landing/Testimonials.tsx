"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "TaskFlow completely transformed how our engineering team manages sprints. The real-time collaboration is game-changing — we cut our meeting time by 40%.",
    name: "Sarah Chen",
    role: "Engineering Lead at Vercel",
    avatar: "from-blue-400 to-cyan-400",
    stars: 5,
  },
  {
    quote: "We moved from three different tools to just TaskFlow. The automation features alone save us hours every week. Best project management tool I've used.",
    name: "Marcus Rodriguez",
    role: "Product Manager at Stripe",
    avatar: "from-violet-400 to-purple-400",
    stars: 5,
  },
  {
    quote: "The AI task suggestions are incredibly accurate. It's like having a smart assistant that knows exactly how to break down complex projects into actionable steps.",
    name: "Elena Kovalenko",
    role: "CTO at Figma",
    avatar: "from-emerald-400 to-teal-400",
    stars: 5,
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 -z-10 bg-gray-50/50 dark:bg-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Loved by teams worldwide
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
            See what leaders at top companies say about TaskFlow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              className="relative p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <Star key={si} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatar} flex items-center justify-center text-white text-sm font-bold`}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
