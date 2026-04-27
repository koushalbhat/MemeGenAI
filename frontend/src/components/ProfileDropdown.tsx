"use client";

import { useState } from "react";
import Link from "next/link";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User, LogOut, Settings } from "lucide-react";

export default function ProfileDropdown({ user }: { user: SupabaseUser }) {
  const [isOpen, setIsOpen] = useState(false);

  const firstName = user.user_metadata?.first_name || "";
  const lastName = user.user_metadata?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const email = user.email;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-600 to-cyan-600 cursor-pointer shadow-lg border border-white/20 text-white font-bold font-mono">
        {firstName ? firstName[0].toUpperCase() : <User className="w-5 h-5" />}
      </div>

      {/* Dropdown Menu */}
      <div 
        className={`absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden glass-card shadow-2xl border border-white/10 transition-all duration-200 transform origin-top-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="p-4 border-b border-white/10 bg-black/40">
          <p className="text-sm font-bold text-white font-display truncate">{fullName}</p>
          <p className="text-xs text-gray-400 font-mono truncate">{email}</p>
        </div>
        
        <div className="p-2 flex flex-col gap-1">
          <Link 
            href="/profile" 
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors font-mono"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            My Profile
          </Link>
          
          <form action="/auth/signout" method="post" className="m-0 p-0">
            <button 
              type="submit" 
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-colors font-mono"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
