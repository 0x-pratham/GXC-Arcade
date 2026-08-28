// components/Hero.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import PurpleEliteSoldier from "./PurpleEliteSoldier";
import AuthModal from "./AuthModal";

export default function Hero() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleStartSequence = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      setIsModalOpen(true);
    }
  };

  // ---------------------------------------------------------------------------
  // Framer Motion variants
  // ---------------------------------------------------------------------------
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 12,
      },
    },
  };

  return (
    <>
      <section className="w-full max-w-7xl mx-auto px-6 pt-10 pb-16 md:pt-16 md:pb-24 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden">
        {/* ------------------------------------------------------------------ */}
        {/* BACKGROUND ELEMENTS                                                */}
        {/* ------------------------------------------------------------------ */}

        {/* Left ambient background */}
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-[#c7a6f3]/20 rounded-full blur-[100px] -z-10 pointer-events-none"
          aria-hidden="true"
        />

        {/* Right ambient background */}
        <div
          className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#5f2396]/10 rounded-full blur-[120px] -z-10 pointer-events-none"
          aria-hidden="true"
        />

        {/* ------------------------------------------------------------------ */}
        {/* LEFT: HERO CONTENT                                                  */}
        {/* ------------------------------------------------------------------ */}

        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-20">
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="text-6xl md:text-7xl xl:text-8xl font-black mb-6 font-heading text-[#220849] tracking-tight leading-[1.05]"
          >
            <motion.span variants={textVariants} className="block">
              Master Your
            </motion.span>

            <motion.span
              variants={textVariants}
              className="block text-transparent bg-clip-text bg-gradient-to-r from-[#5f2396] via-[#8b5cf6] to-[#a855f7]"
            >
              Reflexes & Mind
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.4,
              duration: 0.8,
            }}
            className="text-lg md:text-xl max-w-xl mb-10 text-[#220849]/70 font-medium leading-relaxed lg:border-l-4 border-[#c7a6f3] lg:pl-5 py-1"
          >
            A premium collection of high-latency, brain-teasing arcade modules.
            Analyze patterns, react instantly, and dominate the global
            leaderboards.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.6,
              duration: 0.5,
            }}
            className="relative group"
          >
            <div
              className="absolute -inset-1 bg-gradient-to-r from-[#5f2396] to-[#a855f7] rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={handleStartSequence}
              className="relative bg-[#220849] hover:bg-[#1a0630] text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-3 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Initialize Sequence
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>

              <div
                className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12 z-0"
                aria-hidden="true"
              />
            </button>
          </motion.div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT: 3D CHARACTER                                                 */}
        {/* Hidden on mobile intentionally.                                    */}
        {/* ------------------------------------------------------------------ */}

        <div className="hidden lg:flex w-full lg:w-1/2 relative z-20 justify-center items-center mt-8 lg:mt-0">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
            }}
            className="w-full max-w-[600px] h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center relative -right-4 lg:-right-8"
          >
            <PurpleEliteSoldier />
          </motion.div>
        </div>
      </section>

      {/* Trigger the AuthModal if user is not logged in */}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultIsLogin={true} 
      />
    </>
  );
}