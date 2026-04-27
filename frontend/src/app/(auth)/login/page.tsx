"use client";

import { useState } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, User, Calendar } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = mode === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ 
          email, 
          password, 
          options: { 
            emailRedirectTo: `${location.origin}/auth/callback`,
            data: {
              first_name: firstName,
              last_name: lastName,
              dob: dateOfBirth
            }
          }
        });

    if (error) {
      setError(error.message);
    } else {
      if (mode === 'login') {
          router.push('/workshop');
          router.refresh();
      } else {
          setError("Check your email for the confirmation link!");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070b19] flex items-center justify-center p-4">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card rounded-3xl p-10 shadow-2xl border border-white/10 backdrop-blur-3xl relative overflow-hidden">
             
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-cyan-500"></div>

          <motion.div 
             initial={{ scale: 0.8 }}
             animate={{ scale: 1 }}
             className="text-center mb-10"
          >
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 font-display">
              {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-gray-400 font-mono text-sm">
              {mode === 'login' ? 'Log in to access your generation history.' : 'Sign up to start generating.'}
            </p>
          </motion.div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-fuchsia-400" />
                        </div>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First Name"
                          required
                          className="w-full pl-11 pr-4 py-4 bg-black/40 border border-white/5 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-white placeholder-gray-500 transition-all font-mono"
                        />
                      </div>
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-cyan-400" />
                        </div>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last Name"
                          required
                          className="w-full pl-11 pr-4 py-4 bg-black/40 border border-white/5 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500 transition-all font-mono"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-fuchsia-400" />
                      </div>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-4 bg-black/40 border border-white/5 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-white placeholder-gray-500 transition-all font-mono [color-scheme:dark]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-fuchsia-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full pl-11 pr-4 py-4 bg-black/40 border border-white/5 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-white placeholder-gray-500 transition-all font-mono"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-cyan-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full pl-11 pr-4 py-4 bg-black/40 border border-white/5 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500 transition-all font-mono"
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center font-mono bg-red-400/10 py-2 rounded-lg">
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white font-bold text-lg shadow-lg hover:shadow-cyan-500/25 transform transition hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : mode === 'login' ? (
                <><LogIn className="w-5 h-5" /> Log In</>
              ) : (
                <><UserPlus className="w-5 h-5" /> Sign Up</>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-gray-400 hover:text-white transition-colors font-mono text-sm"
            >
              {mode === 'login' 
                ? "Don't have an account? Sign up here." 
                : 'Already have an account? Log in.'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
