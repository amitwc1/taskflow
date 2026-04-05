"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individuals and small teams getting started.",
    features: [
      "Up to 5 boards",
      "Unlimited cards",
      "Basic automation",
      "1 GB storage",
      "Community support",
    ],
    cta: "Get Started",
    highlighted: false,
    gradient: "",
  },
  {
    name: "Pro",
    price: "$12",
    period: "per user / month",
    description: "For growing teams that need advanced features.",
    features: [
      "Unlimited boards",
      "Unlimited cards",
      "Advanced automation",
      "25 GB storage",
      "Priority support",
      "AI task suggestions",
      "Custom fields",
      "Advanced views",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    gradient: "from-blue-600 to-violet-600",
  },
  {
    name: "Enterprise",
    price: "$39",
    period: "per user / month",
    description: "For organizations with advanced security needs.",
    features: [
      "Everything in Pro",
      "SSO / SAML",
      "Audit logs",
      "Unlimited storage",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Admin controls",
    ],
    cta: "Contact Sales",
    highlighted: false,
    gradient: "",
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Plans for every team size
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
            Start free and upgrade as your team grows. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              className={`relative rounded-2xl p-6 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-blue-600 to-violet-700 text-white shadow-2xl shadow-blue-500/25 scale-[1.03] border border-blue-500/50"
                  : "bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-white/5 shadow-sm"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-white text-blue-600 px-3 py-1 rounded-full shadow-md">
                  Most Popular
                </span>
              )}

              <h3 className={`text-lg font-bold ${plan.highlighted ? "text-white" : "text-gray-900 dark:text-white"}`}>
                {plan.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className={`text-4xl font-extrabold ${plan.highlighted ? "text-white" : "text-gray-900 dark:text-white"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlighted ? "text-white/60" : "text-gray-500 dark:text-gray-400"}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`mt-2 text-sm ${plan.highlighted ? "text-white/70" : "text-gray-600 dark:text-gray-400"}`}>
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check size={16} className={plan.highlighted ? "text-emerald-300 shrink-0" : "text-emerald-500 shrink-0"} />
                    <span className={plan.highlighted ? "text-white/90" : "text-gray-700 dark:text-gray-300"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block text-center mt-8 text-sm font-semibold py-3 rounded-xl transition-all ${
                  plan.highlighted
                    ? "bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                    : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
