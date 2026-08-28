// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { 
  getAllProfiles, 
  createGlobalPopup, 
  disableGlobalPopup,
  addCredits,
  getAllDetailedScores // <-- Make sure to import this
} from "../../lib/actions";
import { useRouter } from "next/navigation";
import { Zap, Activity, ShieldAlert } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [scoreLogs, setScoreLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "logs">("users");
  const router = useRouter();

  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    async function checkAdminAndLoadData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        alert("Access Denied! Only admins can view this page.");
        router.push('/');
        return;
      }

      setIsAdmin(true);
      await refreshData();
    }
    
    checkAdminAndLoadData();
  }, [router]);

  const refreshData = async () => {
    const fetchedUsers = await getAllProfiles();
    const fetchedLogs = await getAllDetailedScores();
    setUsers(fetchedUsers);
    setScoreLogs(fetchedLogs);
    setLoading(false);
  };

  const showActionMessage = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 4000);
  };

  const handleAddCredits = async (userId: string, username: string) => {
    const amountStr = window.prompt(`How many credits do you want to add for ${username}?`, "5");
    
    if (!amountStr) return; 
    
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      showActionMessage("❌ Invalid amount. Please enter a positive number.");
      return;
    }

    try {
      showActionMessage(`Adding ${amount} credits to ${username}...`);
      await addCredits(userId, amount);
      showActionMessage(`✅ Successfully added ${amount} credits to ${username}!`);
      await refreshData(); 
    } catch (error: any) {
      showActionMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcasting(true);
    try {
      await createGlobalPopup(popupTitle, popupMessage);
      showActionMessage(`📢 Announcement broadcasted to all players!`);
      setPopupTitle("");
      setPopupMessage("");
    } catch (error: any) {
      showActionMessage(`❌ Broadcast Error: ${error.message}`);
    } finally {
      setBroadcasting(false);
    }
  };

  const handleStopBroadcast = async () => {
    try {
      await disableGlobalPopup();
      showActionMessage(`🔇 All active announcements stopped.`);
    } catch (error: any) {
      showActionMessage(`❌ Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4effc] flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#5f2396]"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#f4effc] text-[#220849] font-body p-4 md:p-12 relative z-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10"
        >
          <div>
            <div className="flex items-center gap-3">
              <ShieldAlert size={32} className="text-[#5f2396]" />
              <h1 className="text-3xl md:text-4xl font-bold font-heading text-[#220849]">Admin Terminal</h1>
            </div>
            <p className="text-[#5f2396] font-bold mt-2">Manage Users, Credits & Accountability Logs</p>
          </div>

          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-[#c7a6f3]/40">
            <button 
              onClick={() => setActiveTab("users")}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "users" ? "bg-[#220849] text-white shadow-md" : "text-[#220849]/60 hover:text-[#5f2396]"}`}
            >
              Player Registry
            </button>
            <button 
              onClick={() => setActiveTab("logs")}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "logs" ? "bg-[#220849] text-white shadow-md" : "text-[#220849]/60 hover:text-[#5f2396]"}`}
            >
              Score Logs
            </button>
          </div>
        </motion.div>

        {actionMessage && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-white border-l-4 border-[#5f2396] text-[#220849] font-bold shadow-md rounded-r-lg flex items-center gap-2"
          >
            {actionMessage}
          </motion.div>
        )}

        {/* TAB 1: USER REGISTRY & BROADCAST */}
        {activeTab === "users" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Broadcast Studio */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[2rem] shadow-[0_5px_20px_rgba(199,166,243,0.3)] overflow-hidden border border-[#c7a6f3]/40">
                <div className="p-6 border-b border-[#c7a6f3]/40 bg-[#c7a6f3]/20">
                  <h2 className="text-2xl font-bold text-[#220849] font-heading">📢 Broadcast Studio</h2>
                </div>
                <div className="p-6">
                  <form onSubmit={handleBroadcast} className="flex flex-col gap-4">
                    <input
                      type="text"
                      placeholder="Announcement Title"
                      value={popupTitle}
                      onChange={(e) => setPopupTitle(e.target.value)}
                      className="w-full border-2 border-[#c7a6f3]/50 focus:border-[#5f2396] outline-none p-3 rounded-xl text-[#220849] bg-[#f4effc]/50 font-bold transition-colors"
                      required
                    />
                    <textarea
                      placeholder="Message to all players..."
                      value={popupMessage}
                      onChange={(e) => setPopupMessage(e.target.value)}
                      className="w-full border-2 border-[#c7a6f3]/50 focus:border-[#5f2396] outline-none p-3 rounded-xl text-[#220849] bg-[#f4effc]/50 h-32 resize-none transition-colors"
                      required
                    />
                    <button
                      type="submit"
                      disabled={broadcasting}
                      className="w-full bg-[#5f2396] hover:bg-[#220849] text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-sm"
                    >
                      {broadcasting ? "Sending..." : "Send to All Players"}
                    </button>
                  </form>
                  
                  <button
                    onClick={handleStopBroadcast}
                    className="w-full mt-3 border-2 border-red-300 text-red-600 hover:bg-red-50 py-4 rounded-xl font-bold transition-all"
                  >
                    Stop Active Popup
                  </button>
                </div>
              </div>
            </div>

            {/* User Management Table */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-[0_5px_20px_rgba(199,166,243,0.3)] overflow-hidden border border-[#c7a6f3]/40">
              <div className="p-6 border-b border-[#c7a6f3]/40 bg-[#f4effc]/50 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#220849] font-heading">Registered Players</h2>
                <span className="bg-[#5f2396] text-white text-xs font-bold px-3 py-1 rounded-full">
                  Total: {users.length}
                </span>
              </div>
              
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="sticky top-0 bg-[#f4effc] shadow-sm">
                    <tr className="text-[#5f2396]">
                      <th className="p-4 font-bold border-b border-[#c7a6f3]/40">Username</th>
                      <th className="p-4 font-bold border-b border-[#c7a6f3]/40">Status</th>
                      <th className="p-4 font-bold border-b border-[#c7a6f3]/40 text-center">Credits</th>
                      <th className="p-4 font-bold border-b border-[#c7a6f3]/40 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-[#f4effc]/50 transition-colors border-b border-[#c7a6f3]/20 last:border-0"
                      >
                        <td className="p-4">
                          <p className="font-bold text-[#220849]">{user.username || "Unknown"}</p>
                          <p className="text-[10px] uppercase font-bold text-[#5f2396]/60 tracking-wider">{user.role}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest ${
                            user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-[#c7a6f3]/30 font-bold text-[#220849] shadow-sm">
                            <Zap size={14} className="text-[#5f2396]" />
                            {user.credits || 0}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleAddCredits(user.id, user.username)}
                            disabled={user.status !== 'active'}
                            className="bg-[#220849] hover:bg-[#5f2396] text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            + Credits
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCORE ACCOUNTABILITY LOGS */}
        {activeTab === "logs" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] shadow-[0_5px_20px_rgba(199,166,243,0.3)] overflow-hidden border border-[#c7a6f3]/40"
          >
            <div className="p-6 border-b border-[#c7a6f3]/40 bg-[#c7a6f3]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#220849] font-heading flex items-center gap-2">
                  <Activity size={24} className="text-[#5f2396]" />
                  Global Activity Ledger
                </h2>
                <p className="text-sm font-medium text-[#220849]/60 mt-1">Raw, unfiltered log of every module executed.</p>
              </div>
              <span className="bg-[#5f2396] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md">
                {scoreLogs.length} Records Found
              </span>
            </div>

            <div className="overflow-x-auto max-h-[700px] overflow-y-auto bg-[#f4effc]/20">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="sticky top-0 bg-white shadow-sm z-10 border-b border-[#c7a6f3]/40">
                  <tr className="text-[#5f2396] text-sm uppercase tracking-widest font-mono">
                    <th className="p-5 font-bold">Timestamp</th>
                    <th className="p-5 font-bold">Operator</th>
                    <th className="p-5 font-bold">Module Executed</th>
                    <th className="p-5 font-bold text-right">Score Logged</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreLogs.map((log, index) => (
                    <tr 
                      key={log.id || index}
                      className="hover:bg-[#f4effc] transition-colors border-b border-[#c7a6f3]/10 last:border-0"
                    >
                      <td className="p-5 text-sm font-medium text-[#220849]/60">
                        {new Date(log.played_at).toLocaleString()}
                      </td>
                      <td className="p-5">
                        <span className="font-bold text-[#220849] bg-[#c7a6f3]/10 px-3 py-1 rounded-lg">
                          {log.profiles?.username || "Unknown"}
                        </span>
                      </td>
                      <td className="p-5 font-bold text-[#5f2396]">
                        {log.games?.title || "Deleted Game"}
                      </td>
                      <td className="p-5 text-right">
                        <span className="text-xl font-black font-mono text-[#220849]">
                          {log.score.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {scoreLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-[#220849]/60 font-medium">
                        No scores have been logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>
    </main>
  );
}