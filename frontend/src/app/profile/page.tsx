"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Save, Calendar, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      
      setEmail(user.email || "");
      setFirstName(user.user_metadata?.first_name || "");
      setLastName(user.user_metadata?.last_name || "");
      setDob(user.user_metadata?.dob || "");
      setLoading(false);
    }
    loadUser();
  }, [router, supabase.auth]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: "Profile updated successfully!" });
      router.refresh();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b19] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b19] p-8">
      {/* Background Orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="max-w-2xl mx-auto relative z-10 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-10 shadow-2xl border border-white/10 backdrop-blur-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500"></div>

          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-display">
              My Profile
            </h1>
            <p className="text-gray-400 font-mono text-sm mt-2">
              Manage your personal information
            </p>
          </div>

          {message && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className={`p-4 rounded-xl mb-6 font-mono text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
            >
              {message.text}
            </motion.div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Email Field (Disabled) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300 font-display">Email Address (Cannot be changed)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/5 rounded-xl text-gray-500 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div className="flex gap-4">
              {/* First Name */}
              <div className="space-y-2 flex-1">
                <label className="text-sm font-bold text-gray-300 font-display">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white transition-all font-mono"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2 flex-1">
                <label className="text-sm font-bold text-gray-300 font-display">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-fuchsia-400" />
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-white transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Date of Birth (Disabled) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300 font-display">Date of Birth (Cannot be changed)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="date"
                  value={dob}
                  disabled
                  className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/5 rounded-xl text-gray-500 cursor-not-allowed font-mono [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 font-display"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
}
