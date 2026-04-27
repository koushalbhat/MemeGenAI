"use client";
import { useState, useEffect } from "react";
import { createClient } from '../../utils/supabase/client';
import MemeEditor from '../../components/MemeEditor';

export default function Gallery() {
  const [history, setHistory] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeEditor, setActiveEditor] = useState<{index: number, baseImageUrl: string, historyId: string, elements: any[]} | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchHistory();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/templates`);
      if (res.ok) {
         const data = await res.json();
         setTemplates(data.templates || {});
      }
    } catch(e) {}
  };

  const fetchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/history`, {
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
                <span className="bg-white/10 px-2 py-1 rounded">Template: {item.template_name || "Custom Upload"}</span>
                <span>{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="mt-3 flex space-x-2">
                 <a 
                   href={item.image_url} 
                   download={`meme_${item.id}.jpg`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex-1 block text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 rounded transition"
                 >
                   Download
                 </a>
                 <button
                   onClick={() => {
                       let baseImgUrl = null;
                       if (item.template_name && templates[item.template_name]) {
                           const filename = templates[item.template_name].filename;
                           const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xixljvaizawnsquricma.supabase.co";
                           baseImgUrl = `${supabaseUrl}/storage/v1/object/public/template-assets/${encodeURIComponent(filename)}`;
                       } else if (item.ai_caption && item.ai_caption.base_image_url) {
                           baseImgUrl = item.ai_caption.base_image_url;
                       }
                       
                       if (!baseImgUrl) {
                           alert("Cannot edit this specific custom meme because the blank base image was not saved to the cloud (generated prior to the Editor update).");
                           return;
                       }
                       
                       setActiveEditor({
                           index: idx,
                           baseImageUrl: baseImgUrl,
                           historyId: item.id,
                           elements: item.ai_caption.text_elements || []
                       });
                   }}
                   className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2 rounded transition font-bold"
                 >
                   Edit Meme
                 </button>
              </div>
            </div>
          )) : (
             <p className="col-span-3 text-center text-gray-500 py-12">No history items found in the database.</p>
          )}
        </div>
      )}

      {activeEditor && (
          <MemeEditor
             baseImageUrl={activeEditor.baseImageUrl}
             historyId={activeEditor.historyId}
             initialElements={activeEditor.elements}
             onClose={() => setActiveEditor(null)}
             onSave={(newUrl, newElements) => {
                 setHistory((prev) => {
                     const newList = [...prev];
                     newList[activeEditor.index].image_url = newUrl;
                     if (!newList[activeEditor.index].ai_caption) {
                         newList[activeEditor.index].ai_caption = {};
                     }
                     newList[activeEditor.index].ai_caption.text_elements = newElements;
                     return newList;
                 });
                 setActiveEditor(null);
             }}
          />
      )}
    </div>
  );
}
