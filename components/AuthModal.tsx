// components/AuthModal.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser, registerUser } from "../lib/actions";
import { useRouter } from "next/navigation";
import { Mail, Key, User, ArrowRight, X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIsLogin?: boolean;
}

export default function AuthModal({ isOpen, onClose, defaultIsLogin = true }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter(); // <-- Added for Dashboard redirection

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(email, password, username);
      }
      onClose();
      router.push("/dashboard"); // <-- Success pe Dashboard redirect
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#110320]/50 backdrop-blur-md px-4">
          {/* Background Overlay */}
          <div className="absolute inset-0" onClick={onClose}></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[2rem] p-8 relative shadow-[0_0_50px_rgba(95,35,150,0.15)] border border-[#c7a6f3]/40 overflow-hidden"
          >
            {/* Top Engineering Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5f2396] to-[#a855f7]"></div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-[#220849]/40 hover:text-[#5f2396] transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-3xl font-black text-[#220849] mb-6 mt-2 font-heading tracking-tight">
              {isLogin ? "Access Terminal" : "Initialize User"}
            </h2>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-mono font-bold tracking-wide text-center uppercase">
                ERROR: {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-body">
              {!isLogin && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#220849]/40 group-focus-within:text-[#5f2396] transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Operator Alias (Username)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-[#c7a6f3]/40 focus:border-[#5f2396] outline-none pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium text-[#220849] bg-white transition-all shadow-sm focus:shadow-md"
                    required
                  />
                </div>
              )}
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#220849]/40 group-focus-within:text-[#5f2396] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Transmission ID (Email)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#c7a6f3]/40 focus:border-[#5f2396] outline-none pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium text-[#220849] bg-white transition-all shadow-sm focus:shadow-md"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#220849]/40 group-focus-within:text-[#5f2396] transition-colors">
                  <Key size={18} />
                </div>
                <input
                  type="password"
                  placeholder="Access Code (Password)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-[#c7a6f3]/40 focus:border-[#5f2396] outline-none pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium text-[#220849] bg-white transition-all shadow-sm focus:shadow-md"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#220849] hover:bg-[#5f2396] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider mt-2 transition-all disabled:opacity-70 flex items-center justify-center gap-2 group shadow-[0_5px_15px_rgba(95,35,150,0.2)] hover:shadow-[0_10px_25px_rgba(95,35,150,0.3)]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    {isLogin ? "Establish Connection" : "Create Profile"}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#c7a6f3]/20 flex flex-col items-center gap-2 text-xs">
              <p className="text-[#220849]/60 font-medium">
                {isLogin ? "No access credentials?" : "Already hold clearance?"}
              </p>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-[#5f2396] font-bold uppercase tracking-wider hover:text-[#220849] transition-colors"
              >
                {isLogin ? "Request Registration" : "Initiate Login"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}