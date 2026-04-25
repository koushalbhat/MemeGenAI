"use client";
import { useState, useEffect } from "react";
import { createClient } from '../../utils/supabase/client';

export default function Gallery() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Wait, the API for fetching history doesn't exist yet!
    // I need to add an endpoint in main.py, or just use Supabase client directly in Next.js Server Components.
    // For now, let's keep it mocked or we can write a quick endpoint.
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("http://127.0.0.1:8000/api/history", {
         headers: {
            "Authorization": `Bearer ${session?.access_token || ""}`
         }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black font-heading bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Generation History
          </h1>
          <p className="text-gray-400 mt-2">Vector retrieval and transformation logs.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><div className="loader"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {history.length > 0 ? history.map((item: any, idx: number) => (
            <div key={idx} className="glass-panel p-4 rounded-xl flex flex-col">
              <img src={item.image_url} alt="Meme" className="w-full object-cover rounded-lg mb-4" />
              <p className="text-sm text-gray-300 flex-grow font-mono bg-black/40 p-2 rounded">
                &gt; {item.user_prompt}
              </p>
              <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <span className="bg-white/10 px-2 py-1 rounded">Template: {item.template_name}</span>
                <span>{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          )) : (
             <p className="col-span-3 text-center text-gray-500 py-12">No history items found in the database.</p>
          )}
        </div>
      )}
    </div>
  );
}
