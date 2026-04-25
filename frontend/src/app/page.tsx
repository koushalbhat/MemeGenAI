// @ts-nocheck
"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Zap, BrainCircuit, ChevronRight, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070b19] overflow-hidden relative selection:bg-fuchsia-500/30">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-fuchsia-600/30 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/30 rounded-full mix-blend-screen filter blur-[120px] animate-pulse delay-1000"></div>
      
      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 lg:px-8 flex flex-col items-center text-center">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-fuchsia-500/30 text-fuchsia-300 mb-8 font-mono text-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>MemeGenAI v2.0 - Multi-Tenant Vector Database</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-600 tracking-tight font-display mb-8"
        >
          Architect Culture <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500">
            At Machine Speed
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 text-xl leading-8 text-gray-400 max-w-2xl font-mono"
        >
          An enterprise-grade multimodal generation pipeline. We utilize pgvector mathematical mappings and the Gemini Engine to semantically route human ideation into digital art structures.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex items-center justify-center gap-x-6"
        >
          <Link
            href="/login"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-transparent rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 transition-all duration-300 ease-out group-hover:scale-105"></div>
            <div className="absolute inset-0 w-full h-full border-2 border-white/20 rounded-full"></div>
            <span className="relative flex items-center gap-2">
              Get Started <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link href="/about" className="text-sm font-semibold leading-6 text-gray-300 font-mono hover:text-cyan-400 transition-colors">
            Learn How It Works <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      </div>

      {/* Feature Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card p-8 rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-colors group"
          >
            <div className="bg-cyan-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-display">Vector Semantic Routing</h3>
            <p className="text-gray-400 font-mono text-sm leading-relaxed">
              Native Supabase pgvector infrastructure maps incoming prompts across 3,072-dimensional space to identify perfectly contextual baseline images.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card p-8 rounded-3xl border border-white/5 hover:border-fuchsia-500/30 transition-colors group"
          >
            <div className="bg-fuchsia-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-fuchsia-400 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-display">Contextual Memory Refinement</h3>
            <p className="text-gray-400 font-mono text-sm leading-relaxed">
              Iterative dynamic prompt injection allows users to hot-reload rendering conditions on the fly without wiping their visual anchor context.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass-card p-8 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-colors group"
          >
            <div className="bg-indigo-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-display">Zero-Trust Authentication</h3>
            <p className="text-gray-400 font-mono text-sm leading-relaxed">
              Cryptographically verified JWT payloads securely bind gallery instances to explicit user matrices utilizing Edge SSR.
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
