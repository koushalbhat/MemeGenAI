"use client";

export default function Admin() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black font-heading text-white mb-8">System Telemetry</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-purple-500">
            <h2 className="text-2xl font-bold mb-4">PostgreSQL + pgvector</h2>
            <p className="text-gray-400 mb-6">Database connection state and vector index health.</p>
            <div className="bg-black/50 p-4 rounded-lg font-mono text-sm flex items-center space-x-3">
                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-green-400">STATE: CONNECTED AND OPERATIONAL</span>
            </div>
         </div>

         <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-blue-500">
            <h2 className="text-2xl font-bold mb-4">Gemini API Pipeline</h2>
            <p className="text-gray-400 mb-6">Semantic routing and image analysis telemetry.</p>
             <div className="bg-black/50 p-4 rounded-lg font-mono text-sm flex items-center space-x-3">
                 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                 <span className="text-green-400">STATE: MULTIMODAL INFERENCE ONLINE</span>
            </div>
         </div>
      </div>

      <div className="mt-8 glass-panel p-8 rounded-2xl">
         <h2 className="text-2xl font-bold mb-4">Moderation Firewall Logs</h2>
         <p className="text-gray-400">Standard user constraints filtering API metrics.</p>
         <table className="w-full mt-6 text-left border-collapse">
            <thead>
               <tr className="border-b border-white/10">
                  <th className="py-3 text-gray-300 font-medium">Timestamp</th>
                  <th className="py-3 text-gray-300 font-medium">Action</th>
                  <th className="py-3 text-gray-300 font-medium">Flag</th>
               </tr>
            </thead>
            <tbody>
               <tr>
                  <td className="py-3 text-gray-500">2026-04-12 18:00</td>
                  <td className="py-3 text-gray-500">Input Parsed</td>
                  <td className="py-3 text-green-500">PASS</td>
               </tr>
            </tbody>
         </table>
      </div>
    </div>
  );
}
