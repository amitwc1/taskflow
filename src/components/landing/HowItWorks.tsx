"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { LayoutDashboard, ListPlus, Users } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: LayoutDashboard,
    title: "Create your board",
    description: "Set up a workspace and create boards for every project. Customize backgrounds and invite members.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    step: "02",
    icon: ListPlus,
    title: "Add tasks & organize",
    description: "Create lists, add cards, attach files, set due dates, and add labels. Drag and drop to prioritize.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    step: "03",
    icon: Users,
    title: "Collaborate in real-time",
    description: "Assign members, leave comments, track activity, and see live updates as your team works together.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Up and running in minutes
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
            Three simple steps to transform how your team manages work.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-20 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-blue-300 via-violet-300 to-emerald-300 dark:from-blue-500/30 dark:via-violet-500/30 dark:to-emerald-500/30" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                className="relative text-center"
              >
                {/* Step circle */}
                <div className="relative inline-flex mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 shadow-sm">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
