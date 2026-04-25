import Link from "next/link";
import { createClient } from "../utils/supabase/server";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return (
    <nav className="border-b border-white/10 bg-[#070b19]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-black bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent tracking-tighter">
              MemeGenAI
            </Link>
          </div>
          <div className="flex space-x-6 items-center">
            <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-cyan-400 transition font-mono">
              About Us
            </Link>
            
            {user ? (
              <>
                <Link href="/gallery" className="text-sm font-medium text-gray-300 hover:text-cyan-400 transition font-mono">
                  My Gallery
                </Link>
                <Link href="/workshop" className="text-sm font-medium text-gray-300 hover:text-fuchsia-400 transition font-mono">
                  Workshop
                </Link>
                <form action="/auth/signout" method="post" className="m-0 p-0">
                  <button type="submit" className="text-sm font-medium px-4 py-2 bg-white/5 hover:bg-white/10 hover:text-white text-gray-300 transition-all font-mono rounded-xl border border-white/10">
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
               <Link href="/login" className="text-sm font-medium px-5 py-2 bg-fuchsia-600/20 text-fuchsia-400 hover:bg-fuchsia-600/30 hover:text-fuchsia-300 transition-all font-mono rounded-xl border border-fuchsia-500/30">
                 Log In
               </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
