// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { logoutUser } from "../lib/actions";
import { motion } from "framer-motion";
import AuthModal from "./AuthModal";
import { Trophy } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  
  // Modal State Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

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

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const openModal = (isLogin: boolean) => {
    setIsLoginView(isLogin);
    setIsModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-[#c7a6f3]/30 transition-all duration-300">
        {/* Adjusted height and padding for mobile optimization */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex justify-between items-center">
          
          {/* Logo Section */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/" className="flex items-center gap-2 md:gap-3 group">
              {/* Logo Size */}
              <img 
                src="/icon.svg" 
                alt="Arcade Logo" 
                className="w-10 h-10 md:w-12 md:h-12 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500"
              />
              {/* Minimal Text */}
              <h1 className="text-2xl md:text-3xl font-black tracking-widest text-[#220849] group-hover:text-[#5f2396] transition-colors font-heading uppercase mt-0.5 md:mt-1">
                ARCADE
              </h1>
            </Link>
          </motion.div>

          {/* Navigation / User Controls */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-4 md:gap-8"
          >
            
            {/* Leaderboard Link (Visible to everyone) */}
            <Link 
              href="/leaderboard" 
              className="flex items-center gap-1.5 text-[#220849] hover:text-[#5f2396] font-bold text-xs md:text-sm transition-colors"
            >
              <Trophy size={16} className="text-[#a855f7]" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>

            {/* Auth Controls */}
            {user ? (
              <div className="flex items-center gap-4 md:gap-6">
                <Link href="/profile" className="hidden sm:flex items-center gap-2 group cursor-pointer">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span className="text-[#220849] font-bold text-xs md:text-sm tracking-wide group-hover:text-[#5f2396] transition-colors">
                    {user.email?.split("@")[0]}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-xs md:text-sm font-bold border-2 border-[#e2d4f8] text-[#220849] hover:bg-[#220849] hover:text-white hover:border-[#220849] px-4 md:px-6 py-1.5 md:py-2 rounded-full transition-all duration-300 shadow-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={() => openModal(true)} 
                  className="text-xs md:text-sm font-bold text-[#220849] hover:text-[#5f2396] px-3 md:px-4 py-2 transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => openModal(false)} 
                  className="text-xs md:text-sm font-bold bg-[#220849] hover:bg-[#5f2396] text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Register
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </header>

      {/* Auth Modal Component */}
      <AuthModal 
        key={isModalOpen ? (isLoginView ? 'login' : 'register') : 'closed'}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultIsLogin={isLoginView} 
      />
    </>
  );
}