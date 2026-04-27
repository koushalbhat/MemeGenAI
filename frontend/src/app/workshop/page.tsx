"use client";
import { useState } from "react";
import { createClient } from '../../utils/supabase/client';
import MemeEditor from '../../components/MemeEditor';

export default function Home() {
  const [idea, setIdea] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState("");
  const supabase = createClient();
  const [activeEditor, setActiveEditor] = useState<{index: number, baseImageUrl: string, historyId: string, elements: any[]} | null>(null);

  const [customImage, setCustomImage] = useState<File | null>(null);

  const handleGenerate = async (feedbackStr = "") => {
    if (!idea) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      let res;
      if (customImage) {
          const formData = new FormData();
          formData.append("user_idea", idea);
          if (feedbackStr) formData.append("refine_feedback", feedbackStr);
          formData.append("template_image", customImage);
          
          res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/generate/custom`, {
            method: "POST",
            headers: { 
              "Authorization": `Bearer ${session?.access_token || ""}`
            },
            body: formData,
          });
      } else {
          res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/generate`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session?.access_token || ""}`
            },
            body: JSON.stringify({ 
                 user_idea: idea, 
                 refine_feedback: feedbackStr || null 
            }),
          });
      }
      
      const data = await res.json();
      if (res.ok) {
           setResults(data);
      } else {
           alert("Error: " + data.detail);
      }
    } catch (e) {
      console.error(e);
      alert("System API Unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-4 font-heading tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Prompt Workshop
        </h1>
        <p className="text-gray-400 text-lg">Architect semantic templates via AI natural language</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl mb-12">
        <label className="block text-sm font-medium text-gray-300 mb-2">Mental Framework</label>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="e.g. When the code compiles but you don't know why..."
          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition mb-4"
          rows={3}
        />
        
        <div className="mb-6 flex flex-col items-start border border-dashed border-white/20 rounded-xl p-4 bg-black/20">
          <label className="text-sm text-gray-400 mb-2 font-medium">Optional: Upload Custom Template</label>
          <div className="w-full h-auto text-left relative flex items-center">
             <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        setCustomImage(e.target.files[0]);
                    }
                }}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600/20 file:text-purple-400 hover:file:bg-purple-600/30 cursor-pointer"
             />
             {customImage && (
                 <button onClick={() => setCustomImage(null)} className="absolute right-0 text-red-500 hover:bg-red-500/10 px-2 py-1 rounded">Clear</button>
             )}
          </div>
        </div>
        <button
          onClick={() => handleGenerate()}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.01] flex justify-center items-center h-14"
        >
          {loading ? <div className="loader"></div> : "Synthesize Vector Output"}
        </button>
      </div>

      {results?.output_image_paths && (
        <div>
          <h2 className="text-2xl font-bold mb-6 font-heading flex items-center space-x-2">
            <span>Result Mapping</span>
            <span className="h-px bg-white/20 flex-grow ml-4"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {results.output_image_paths.map((path: string, idx: number) => (
              <div key={idx} className="glass-panel rounded-2xl overflow-hidden shadow-2xl relative group">
                <img 
                  src={path} 
                  alt="Generated Meme" 
                  className="w-full h-auto object-cover transform transition group-hover:scale-105 duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-6">
                   <input
                     type="text"
                     placeholder="Feedback: e.g. Make it more ironic"
                     className="w-full bg-black/60 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 mb-3 focus:outline-none"
                     onChange={(e) => setRefineFeedback(e.target.value)}
                   />
                   <button
                     onClick={() => handleGenerate(refineFeedback)}
                     className="bg-white text-black font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition"
                   >
                     Contextual Refine
                   </button>
                   {results.base_image_urls && results.base_image_urls[idx] && results.history_ids && results.history_ids[idx] && (
                       <button
                         onClick={() => setActiveEditor({
                             index: idx,
                             baseImageUrl: results.base_image_urls[idx],
                             historyId: results.history_ids[idx],
                             elements: results.ai_payload[idx]?.text_elements || []
                         })}
                         className="mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:from-blue-400 hover:to-indigo-500 transition"
                       >
                         Open Interactive Editor
                       </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeEditor && (
          <MemeEditor
             baseImageUrl={activeEditor.baseImageUrl}
             historyId={activeEditor.historyId}
             initialElements={activeEditor.elements}
             onClose={() => setActiveEditor(null)}
             onSave={(newUrl, newElements) => {
                 setResults((prev: any) => {
                     const newPaths = [...prev.output_image_paths];
                     newPaths[activeEditor.index] = newUrl;
                     
                     const newPayloads = [...prev.ai_payload];
                     if (!newPayloads[activeEditor.index]) newPayloads[activeEditor.index] = {};
                     newPayloads[activeEditor.index].text_elements = newElements;
                     
                     return { ...prev, output_image_paths: newPaths, ai_payload: newPayloads };
                 });
                 setActiveEditor(null);
             }}
          />
      )}
    </div>
  );
}
