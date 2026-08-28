// components/GlobalPopup.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getActivePopup } from "../lib/actions";
import { supabase } from "../lib/supabase";

export default function GlobalPopup() {
  const [popup, setPopup] = useState<{ id: string; title: string; message: string } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [closedPopups, setClosedPopups] = useState<string[]>([]);

  const checkPopup = async () => {
    try {
      const activePopup = await getActivePopup();
      console.log("Checked Active Popup:", activePopup); // Debugging ke liye

      if (activePopup && !closedPopups.includes(activePopup.id)) {
        setPopup(activePopup);
        setIsVisible(true);
      } else if (!activePopup) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error("Popup check failed:", error);
    }
  };

  useEffect(() => {
    // 1. Page load hote hi check karo
    checkPopup();

    // 2. Real-time Subscription suno
    const subscription = supabase
      .channel('public:popups')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'popups' },
        (payload) => {
          console.log("Realtime event received:", payload); // Pata chalega ki Supabase ne data bheja!
          checkPopup();
        }
      )
      .subscribe((status) => {
        console.log("Realtime Subscription Status:", status);
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [closedPopups]);

  const handleClose = () => {
    setIsVisible(false);
    if (popup) {
      setClosedPopups((prev) => [...prev, popup.id]);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && popup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#220849]/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="bg-white max-w-md w-full rounded-3xl p-8 relative shadow-[0_20px_50px_rgba(199,166,243,0.5)] border-2 border-[#5f2396]"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#5f2396] text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
              <span>🔔</span> Announcement
            </div>
            
            <h3 className="text-3xl font-bold font-heading text-[#220849] mt-4 mb-4 text-center">
              {popup.title}
            </h3>
            
            <p className="text-[#220849]/80 font-body text-center mb-8 text-lg leading-relaxed">
              {popup.message}
            </p>
            
            <button
              onClick={handleClose}
              className="w-full bg-[#220849] hover:bg-[#5f2396] text-white py-3 rounded-xl font-bold transition-all"
            >
              Got it!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}