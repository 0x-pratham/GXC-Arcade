// components/Features.tsx
"use client";

import { motion, type Variants } from "framer-motion";
import { Zap, Trophy, BrainCircuit } from "lucide-react";

export default function Features() {
  const featuresList = [
    {
      title: "Lightning Fast",
      desc: "Zero lag, high-precision latency tracking and real-time response metrics.",
      icon: <Zap size={28} strokeWidth={2} />,
      color: "text-[#eab308]",
      bg: "bg-[#eab308]/10",
      border: "border-[#eab308]/20",
    },
    {
      title: "Global Ranks",
      desc: "Distributed real-time leaderboards. Compete against top-tier players globally.",
      icon: <Trophy size={28} strokeWidth={2} />,
      color: "text-[#5f2396]",
      bg: "bg-[#5f2396]/10",
      border: "border-[#5f2396]/20",
    },
    {
      title: "Cognitive Load",
      desc: "Advanced neurological puzzles designed to stress-test your working memory.",
      icon: <BrainCircuit size={28} strokeWidth={2} />,
      color: "text-[#f97316]",
      bg: "bg-[#f97316]/10",
      border: "border-[#f97316]/20",
    },
  ];

  // Explicitly typed as Variants so Framer Motion
  // correctly understands the animation configuration.
  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.8,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 15,
      },
    },
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-6 mb-24 relative z-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
      >
        {featuresList.map((feature, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group relative bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-[#c7a6f3]/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(95,35,150,0.1)] transition-all duration-500 overflow-hidden flex flex-col"
          >
            {/* Hover Bottom Line Glow */}
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-[#5f2396] to-[#a855f7] group-hover:w-full transition-all duration-500 ease-out" />

            {/* Minimal Header */}
            <div className="mb-8">
              <div
                className={`inline-flex p-4 rounded-2xl ${feature.bg} ${feature.border} border shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
              >
                <div className={feature.color}>{feature.icon}</div>
              </div>
            </div>

            {/* Content */}
            <div className="mt-auto">
              <h3 className="text-xl font-bold font-heading text-[#220849] mb-3 group-hover:text-[#5f2396] transition-colors">
                {feature.title}
              </h3>

              <p className="text-[#220849]/60 text-sm font-medium leading-relaxed">
                {feature.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}