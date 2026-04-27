"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "../utils/supabase/client";

export default function MemeEditor({
  baseImageUrl,
  historyId,
  initialElements,
  onClose,
  onSave
}: {
  baseImageUrl: string;
  historyId: string;
  initialElements: any[];
  onClose: () => void;
  onSave: (newUrl: string, newElements: any[]) => void;
}) {
  const [elements, setElements] = useState(initialElements.map((el, i) => ({
    id: i,
    text: el.text,
    color: el.color || "white",
    size: el.size || 50,
    box: el.box_coordinates || { x1: 50, y1: 50, x2: 950, y2: 250 } // fallback
  })));
  
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Auto-fit text algorithm to mirror Python Backend
  useEffect(() => {
    elements.forEach(el => {
      const container = document.getElementById(`editor-el-${el.id}`);
      const textNode = document.getElementById(`text-p-${el.id}`);
      if (container && textNode) {
        // Temporarily allow text node to expand freely for measurement
        textNode.style.maxHeight = 'none';
        
        let minSize = 6;
        let maxSize = Math.max(10, Math.min(container.clientWidth, container.clientHeight));
        let bestSize = minSize;
        
        while (minSize <= maxSize) {
          let mid = Math.floor((minSize + maxSize) / 2);
          textNode.style.fontSize = `${mid}px`;
          
          if (textNode.scrollHeight <= container.clientHeight && textNode.scrollWidth <= container.clientWidth) {
            bestSize = mid;
            minSize = mid + 1;
          } else {
            maxSize = mid - 1;
          }
        }
        textNode.style.fontSize = `${bestSize}px`;
        textNode.style.maxHeight = '100%';
      }
    });
  });


  const handlePointerDown = (e: any, id: number) => {
    e.stopPropagation();
    setSelectedId(id);
    const el = document.getElementById(`editor-el-${id}`);
    if (!el || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    
    // Original normalized coords (0-1000)
    const originalBox = elements.find(e => e.id === id)?.box;
    if (!originalBox) return;

    const handlePointerMove = (moveEv: any) => {
      const dx = moveEv.clientX - startX;
      const dy = moveEv.clientY - startY;
      
      const dxNorm = (dx / containerRect.width) * 1000;
      const dyNorm = (dy / containerRect.height) * 1000;
      
      setElements(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            box: {
              x1: Math.max(0, originalBox.x1 + dxNorm),
              y1: Math.max(0, originalBox.y1 + dyNorm),
              x2: Math.min(1000, originalBox.x2 + dxNorm),
              y2: Math.min(1000, originalBox.y2 + dyNorm)
            }
          };
        }
        return item;
      }));
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleResizePointerDown = (e: any, id: number, corner: string) => {
    e.stopPropagation();
    setSelectedId(id);
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    
    const originalBox = elements.find(e => e.id === id)?.box;
    if (!originalBox) return;

    const handlePointerMove = (moveEv: any) => {
      const dx = moveEv.clientX - startX;
      const dy = moveEv.clientY - startY;
      
      const dxNorm = (dx / containerRect.width) * 1000;
      const dyNorm = (dy / containerRect.height) * 1000;
      
      setElements(prev => prev.map(item => {
        if (item.id === id) {
          let newBox = { ...originalBox };
          if (corner.includes('n')) newBox.y1 = Math.min(originalBox.y2 - 10, Math.max(0, originalBox.y1 + dyNorm));
          if (corner.includes('s')) newBox.y2 = Math.max(originalBox.y1 + 10, Math.min(1000, originalBox.y2 + dyNorm));
          if (corner.includes('w')) newBox.x1 = Math.min(originalBox.x2 - 10, Math.max(0, originalBox.x1 + dxNorm));
          if (corner.includes('e')) newBox.x2 = Math.max(originalBox.x1 + 10, Math.min(1000, originalBox.x2 + dxNorm));
          return { ...item, box: newBox };
        }
        return item;
      }));
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const payloadElements = elements.map(e => ({
        text: e.text,
        color: e.color,
        size: e.size,
        box_coordinates: e.box
      }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || ""}`
        },
        body: JSON.stringify({
          history_id: historyId,
          base_image_url: baseImageUrl,
          text_elements: payloadElements
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        onSave(data.image_url, payloadElements);
      } else {
        alert("Failed to save changes.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const selectedElement = elements.find(e => e.id === selectedId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden border border-slate-700">
        
        {/* Canvas Area */}
        <div className="flex-grow p-4 flex items-center justify-center bg-slate-950">
          <div 
            ref={containerRef}
            className="relative select-none"
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
          >
            <img 
              src={baseImageUrl} 
              alt="Base Template" 
              onLoad={(e) => {
                 const parentWidth = e.currentTarget.parentElement?.parentElement?.clientWidth || 600;
                 const parentHeight = window.innerHeight * 0.7;
                 const imgRatio = e.currentTarget.naturalWidth / e.currentTarget.naturalHeight;
                 const containerRatio = parentWidth / parentHeight;
                 
                 if (imgRatio > containerRatio) {
                     e.currentTarget.style.width = '100%';
                     e.currentTarget.style.height = 'auto';
                 } else {
                     e.currentTarget.style.height = '70vh';
                     e.currentTarget.style.width = 'auto';
                 }
              }}
              className="max-w-full max-h-[70vh] pointer-events-none shadow-2xl"
            />
            
            {elements.map((el) => {
              const left = `${(el.box.x1 / 1000) * 100}%`;
              const top = `${(el.box.y1 / 1000) * 100}%`;
              const width = `${((el.box.x2 - el.box.x1) / 1000) * 100}%`;
              const height = `${((el.box.y2 - el.box.y1) / 1000) * 100}%`;
              
              const isSelected = el.id === selectedId;

              return (
                <div
                  key={el.id}
                  id={`editor-el-${el.id}`}
                  onPointerDown={(e) => handlePointerDown(e, el.id)}
                  style={{ left, top, width, height, containerType: 'size' } as any}
                  className={`absolute flex items-center justify-center text-center cursor-move border-2 overflow-hidden ${isSelected ? 'border-blue-500 bg-blue-500/10 z-10' : 'border-dashed border-white/30 hover:border-white/60'} transition-colors`}
                >
                  <p 
                    id={`text-p-${el.id}`}
                    style={{ 
                      color: el.color, 
                      fontSize: '20px', // Fallback, will be overridden by useEffect
                      textShadow: el.color === 'white' ? '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' : 'none',
                      fontFamily: 'Impact, sans-serif',
                      lineHeight: '1.1',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      maxWidth: '100%'
                    }}
                    className="pointer-events-none"
                  >
                    {el.text}
                  </p>
                  
                  {isSelected && (
                    <>
                      <div onPointerDown={(e) => handleResizePointerDown(e, el.id, 'nw')} className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize"></div>
                      <div onPointerDown={(e) => handleResizePointerDown(e, el.id, 'ne')} className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize"></div>
                      <div onPointerDown={(e) => handleResizePointerDown(e, el.id, 'sw')} className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize"></div>
                      <div onPointerDown={(e) => handleResizePointerDown(e, el.id, 'se')} className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize"></div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls Sidebar */}
        <div className="w-full md:w-80 bg-slate-800 p-6 flex flex-col border-l border-slate-700">
          <h2 className="text-xl font-bold text-white mb-6">Meme Editor</h2>
          
          {selectedElement ? (
            <div className="flex-grow space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Caption Text</label>
                <textarea 
                  value={selectedElement.text}
                  onChange={(e) => setElements(prev => prev.map(el => el.id === selectedId ? {...el, text: e.target.value} : el))}
                  className="w-full bg-slate-950/50 text-white rounded p-3 border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                  rows={3}
                />
                <p className="text-xs text-blue-400 mt-1">
                  Tip: Hit 'Enter' to force manual line breaks! The backend compiles the final image precisely to the box boundaries.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Style</label>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setElements(prev => prev.map(e => e.id === selectedId ? {...e, color: "white"} : e))}
                    className={`flex-1 py-2 rounded font-bold ${selectedElement.color === 'white' ? 'bg-white text-black' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  >
                    Meme White
                  </button>
                  <button 
                    onClick={() => setElements(prev => prev.map(e => e.id === selectedId ? {...e, color: "black"} : e))}
                    className={`flex-1 py-2 rounded font-bold ${selectedElement.color === 'black' ? 'bg-black text-white ring-2 ring-blue-500' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  >
                    Ink Black
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Actions</label>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                        const newId = Math.max(...elements.map(e => e.id)) + 1;
                        const newEl = { ...selectedElement, id: newId, box: { ...selectedElement.box, y1: Math.min(900, selectedElement.box.y1 + 50), y2: Math.min(1000, selectedElement.box.y2 + 50) } };
                        setElements(prev => [...prev, newEl]);
                        setSelectedId(newId);
                    }}
                    className="flex-1 py-2 rounded bg-slate-700 text-white hover:bg-slate-600 text-sm font-bold"
                  >
                    Duplicate Box
                  </button>
                  <button 
                    onClick={() => {
                        setElements(prev => prev.filter(e => e.id !== selectedId));
                        setSelectedId(null);
                    }}
                    className="flex-1 py-2 rounded bg-red-900/50 text-red-200 hover:bg-red-800/60 text-sm font-bold"
                  >
                    Delete Box
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-500 text-center px-4">
              Click on any text box over the image to select and edit it. Drag to move it.
            </div>
          )}

          <div className="mt-8 space-y-3">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-bold shadow-lg disabled:opacity-50"
            >
              {loading ? "Compiling..." : "Save Customization"}
            </button>
            <button 
              onClick={onClose} 
              disabled={loading}
              className="w-full py-3 bg-transparent border border-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
