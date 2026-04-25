"use client";

import { motion } from 'framer-motion';
import { PenTool, BrainCircuit, Sparkles, Smile } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#070b19] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 font-display mb-4">
            How MemeGenAI Works
          </h1>
          <p className="text-gray-400 font-mono text-lg max-w-2xl mx-auto">
            You don't need to be a comedy genius to go viral. We handle the formatting, templates, and text delivery—you just provide the core idea. Here is what we do:
          </p>
        </motion.div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-fuchsia-500 before:via-cyan-500 before:to-transparent">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#070b19] bg-fuchsia-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-lg shadow-fuchsia-500/50">
              <PenTool className="w-5 h-5" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-6 rounded-2xl border border-white/10 hover:border-fuchsia-500/50 transition-colors">
              <h3 className="font-display font-bold text-xl text-white mb-2">1. Brainstorm an Idea</h3>
              <p className="text-gray-400 font-mono text-sm leading-relaxed">
                Log into our workshop and simply type something relatable happening in your life. Try something like, "When the weekend finally arrives but you're too exhausted to leave the house."
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#070b19] bg-cyan-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-lg shadow-cyan-500/50">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-6 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-colors">
              <h3 className="font-display font-bold text-xl text-white mb-2">2. We Find the Perfect Template</h3>
              <p className="text-gray-400 font-mono text-sm leading-relaxed">
                Our AI instantly scans thousands of popular meme templates and isolates the top 3 images that best match the emotional tone and context of your idea.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#070b19] bg-indigo-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-lg shadow-indigo-500/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-6 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors">
              <h3 className="font-display font-bold text-xl text-white mb-2">3. The AI Writes the Joke</h3>
              <p className="text-gray-400 font-mono text-sm leading-relaxed">
                Rather than forcing you to decide what words go where, MemeGenAI acts as your ghostwriter, generating punchlines and stamping them perfectly into the image format.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#070b19] bg-emerald-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-lg shadow-emerald-500/50">
              <Smile className="w-5 h-5" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-6 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-colors">
              <h3 className="font-display font-bold text-xl text-white mb-2">4. Build Your Gallery</h3>
              <p className="text-gray-400 font-mono text-sm leading-relaxed">
                Every prompt you execute is safely secured directly to your account. You can revisit your personal meme gallery anytime, download the image natively, and share it globally!
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
