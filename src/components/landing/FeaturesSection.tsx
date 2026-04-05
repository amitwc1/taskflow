"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  GripVertical, Users, Zap, CalendarDays, Activity, Sparkles,
} from "lucide-react";

const features = [
  {
    icon: GripVertical,
    title: "Drag & Drop Tasks",
    description: "Effortlessly organize your tasks with intuitive drag and drop. Move cards between lists in seconds.",
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    icon: Users,
    title: "Real-Time Collaboration",
    description: "Work with your team in real-time. See who's online, track changes, and stay in sync effortlessly.",
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-500/10",
  },
  {
    icon: Zap,
    title: "Smart Automation",
    description: "Automate repetitive workflows with powerful rules. Trigger actions when cards move, dates change, and more.",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    icon: CalendarDays,
    title: "Advanced Views",
    description: "Switch between Board, Calendar, Timeline, and Table views to see your work from every angle.",
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    icon: Activity,
    title: "Activity Tracking",
    description: "Full audit trail of every action. Know who did what and when with a detailed activity log.",
    gradient: "from-pink-500 to-rose-500",
    bg: "bg-pink-50 dark:bg-pink-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Task Suggestions",
    description: "Let AI analyze your workflow and suggest task breakdowns, priorities, and improvements automatically.",
    gradient: "from-indigo-500 to-blue-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Hover glow */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />

      <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
        <Icon size={22} className={`bg-gradient-to-br ${feature.gradient} bg-clip-text`} style={{ color: "transparent", backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
        {/* Fallback: just use the gradient colors directly */}
        <Icon size={22} className="absolute text-blue-600 opacity-0" />
      </div>
      {/* Icon with proper gradient */}
      <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 -mt-16`}>
        <div className={`bg-gradient-to-br ${feature.gradient} p-2 rounded-lg`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>

      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: "-60px" });

  return (
    <section id="features" className="py-24 relative">
      {/* Subtle bg */}
      <div className="absolute inset-0 -z-10 bg-gray-50/50 dark:bg-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Everything you need to ship faster
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
            Powerful features that help your team manage projects, automate workflows, and collaborate — all in one place.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
