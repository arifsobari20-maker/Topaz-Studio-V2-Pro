
import React, { useState, useRef } from 'react';
import { AppMode, StoryScene, MicrostockItem, GeneratedImage } from '../types';
import * as ai from '../services/geminiService';

interface ToolsSectionProps {
  activeMode: AppMode;
  globalScripts: { grok: string; veo: string; caption: string };
  storyScenes: (StoryScene | null)[];
  microstockItems: MicrostockItem[];
  setMicrostockItems: React.Dispatch<React.SetStateAction<MicrostockItem[]>>;
  onGenerateVideo: (id: number, prompt: string, base64: string) => void;
  onRegenerateSlot: (id: number) => void;
  onManualEdit: (id: number, instruction: string) => void;
  generatedImages?: (GeneratedImage | null)[];
}

// Helper: Konversi SVG ke PNG Base64 karena Gemini API belum support image/svg+xml
const convertSvgToPng = (base64Svg: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `data:image/svg+xml;base64,${base64Svg}`;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Gunakan natural dimensions atau fallback
      canvas.width = img.width || 1024;
      canvas.height = img.height || 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Canvas context failed"));
        return;
      }
      // Background putih agar tidak transparan hitam di PNG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      try {
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl.split(',')[1]);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = (e) => reject(e);
  });
};

const ToolsSection: React.FC<ToolsSectionProps> = ({ 
  activeMode, 
  globalScripts, 
  microstockItems, 
  setMicrostockItems 
}) => {
  const [isAiImage, setIsAiImage] = useState(true);
  const [isProcessingStock, setIsProcessingStock] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOGIKA MICROSTOCK ---
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: MicrostockItem[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve((ev.target?.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        
        newItems.push({
          file,
          base64,
          mimeType: file.type,
          status: 'Menunggu'
        });
      }
      setMicrostockItems(prev => [...prev, ...newItems]);
    }
  };

  const handleGenerateStockData = async () => {
    if (microstockItems.length === 0 || isProcessingStock) return;
    setIsProcessingStock(true);

    const updatedItems = [...microstockItems];
    
    // Proses satu per satu untuk menghindari rate limit
    for (let i = 0; i < updatedItems.length; i++) {
      if (updatedItems[i].status !== 'Selesai') {
        updatedItems[i].status = 'Proses...';
        setMicrostockItems([...updatedItems]); // Force re-render untuk update UI status

        try {
          let apiBase64 = updatedItems[i].base64;
          let apiMimeType = updatedItems[i].mimeType;

          // KHUSUS SVG: Convert ke PNG sebelum kirim ke API
          if (apiMimeType === 'image/svg+xml') {
             try {
                apiBase64 = await convertSvgToPng(apiBase64);
                apiMimeType = 'image/png';
             } catch (convErr) {
                console.error("SVG Convert Error:", convErr);
                throw new Error("Gagal konversi SVG ke PNG");
             }
          }

          const metadata = await ai.generateMetadataForStock(
            apiBase64, 
            apiMimeType, 
            isAiImage
          );
          
          updatedItems[i].metadata = {
            title: metadata.title,
            keywords: metadata.keywords,
            category_id: metadata.category_id
          };
          updatedItems[i].status = 'Selesai';
        } catch (error) {
          console.error(error);
          updatedItems[i].status = 'Gagal';
        }
        setMicrostockItems([...updatedItems]); // Update hasil sukses/gagal
      }
    }
    setIsProcessingStock(false);
  };

  const handleDownloadCSV = () => {
    if (microstockItems.length === 0) return;

    // Header Adobe Stock CSV Format Standar
    const csvRows = [
      ['Filename', 'Title', 'Keywords', 'Category', 'Releases']
    ];

    microstockItems.forEach(item => {
      if (item.metadata) {
        // Bersihkan keywords: hapus spasi berlebih setelah koma
        const cleanKeywords = item.metadata.keywords.replace(/,\s+/g, ',');
        
        // Escape double quotes pada Title untuk format CSV yang valid
        const cleanTitle = item.metadata.title.replace(/"/g, '""');

        const row = [
            `"${item.file.name}"`,     // Filename (Quoted)
            `"${cleanTitle}"`,         // Title (Quoted)
            `"${cleanKeywords}"`,      // Keywords (Quoted)
            item.metadata.category_id, // Category ID (Number)
            ''                         // Releases (Empty)
        ];
        csvRows.push(row as any);
      }
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AdobeStock_Metadata_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetStockStatus = () => {
      // Mengosongkan list item untuk kembali ke tampilan awal
      setMicrostockItems([]);
      // Reset input value agar file yang sama bisa dipilih kembali jika perlu
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Helper untuk Judul Terminal Dinamis
  const getTerminalTitles = () => {
    // Terapkan judul baru untuk Model, Product, dan Video Review (Grok)
    if (['model', 'product', 'video_review'].includes(activeMode)) {
        return {
            t1: 'PROMPT GERAKAN',
            t2: 'PROMPT NARASI IKLAN',
            t3: 'CAPTION ID'
        };
    }
    // Default (Storyboard / Film Cartoon)
    return {
        t1: 'GROK_TERMINAL_V1',
        t2: 'VEO_VISION_CORE',
        t3: 'META_VIRAL_STRATEGY'
    };
  };

  const titles = getTerminalTitles();

  // --- RENDER UI: MICROSTOCK MODE ---
  if (activeMode === 'microstock') {
    return (
      <div className="bg-[#08080c] border border-white/5 rounded-xl p-6 mt-4 relative overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b border-white/5 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0d0d12] border border-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-100 font-tech uppercase tracking-widest leading-none">
                METADATA & KEYWORD <span className="text-gold-500">AI</span>
              </h3>
              <p className="text-[10px] text-gray-500 font-mono mt-1 font-medium tracking-wide uppercase">
                GENERATOR JUDUL, DESKRIPSI, DAN KEYWORD OTOMATIS UNTUK MICROSTOCK.
              </p>
            </div>
          </div>
          
          <a 
            href="https://drive.google.com/drive/folders/1l-oS_6wHAbUG89ferVy7NK4STj5IFwm-?usp=sharing" 
            target="_blank" 
            rel="noreferrer" 
            className="mt-4 md:mt-0 px-3 py-1.5 bg-[#051c10] border border-green-800 rounded-full flex items-center gap-2 hover:bg-[#0a2f1b] transition-colors cursor-pointer group"
          >
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] font-mono font-bold text-green-400 tracking-wider group-hover:text-green-300">LIVE BONUS: VEKTOR MAGIC</span>
            <svg className="w-3 h-3 text-green-500 group-hover:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          </a>
        </div>

        {/* Upload Area Refined */}
        <div className="w-full mb-6">
            {/* Input Hidden */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                multiple 
                accept="image/*,video/*,.webp,.svg" 
                className="hidden" 
            />
            
            {microstockItems.length > 0 ? (
                 <div className="space-y-4">
                    {/* Toolbar Kecil */}
                    <div className="flex justify-between items-center bg-[#0d0d12] p-3 rounded-lg border border-white/5">
                        <span className="text-xs text-gray-400 font-mono">
                            Total File: <span className="text-white font-bold">{microstockItems.length}</span>
                        </span>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-[#1A1A24] hover:bg-[#252532] text-[10px] text-gold-500 font-bold rounded border border-white/10 transition-colors"
                        >
                            + TAMBAH FILE LAGI
                        </button>
                    </div>

                    {/* Grid Layout Rapi */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {microstockItems.map((item, idx) => (
                            <div key={idx} className="group relative bg-[#0A0A0F] rounded-lg border border-gray-800 hover:border-gold-500/50 transition-all overflow-hidden shadow-lg">
                                {/* Preview Thumbnail */}
                                <div className="aspect-square w-full relative bg-black/50">
                                    {item.mimeType.startsWith('video/') ? (
                                         <video src={`data:${item.mimeType};base64,${item.base64}`} className="w-full h-full object-cover" muted playsInline />
                                    ) : (
                                         <img src={`data:${item.mimeType};base64,${item.base64}`} className="w-full h-full object-cover" loading="lazy" />
                                    )}
                                    
                                    {/* Status Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80"></div>
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <div className="flex justify-between items-end">
                                            <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                                                item.status === 'Selesai' ? 'bg-green-900/50 text-green-400 border border-green-500/30' : 
                                                item.status === 'Proses...' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30 animate-pulse' : 
                                                'bg-gray-800/50 text-gray-400 border border-gray-700'
                                            }`}>
                                                {item.status === 'Selesai' ? 'READY' : item.status}
                                            </span>
                                            {item.status === 'Selesai' && (
                                                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_8px_#22c55e]">
                                                    <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Delete Button per Item */}
                                    <button 
                                        onClick={() => {
                                            const newItems = [...microstockItems];
                                            newItems.splice(idx, 1);
                                            setMicrostockItems(newItems);
                                        }}
                                        className="absolute top-2 right-2 w-5 h-5 bg-black/60 hover:bg-red-500/80 text-white rounded flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* Metadata Preview */}
                                <div className="p-2 border-t border-white/5 bg-[#0d0d12]">
                                    <p className="text-[9px] text-gray-400 truncate font-mono" title={item.file.name}>
                                        {item.file.name}
                                    </p>
                                    {item.metadata && (
                                        <p className="text-[9px] text-gold-500 truncate mt-0.5 font-bold">
                                            {item.metadata.title}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-gray-700 bg-[#0A0A0F] hover:border-gold-500/50 hover:bg-[#0f0f16] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-14 h-14 mb-4 rounded-full bg-[#15151E] flex items-center justify-center border border-gray-700 group-hover:border-gold-500 group-hover:scale-110 transition-all shadow-lg">
                        <svg className="w-6 h-6 text-gray-500 group-hover:text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <h4 className="text-sm font-bold text-gray-300 group-hover:text-gold-500 mb-1 tracking-wide">UPLOAD FILE MICROSTOCK</h4>
                    <p className="text-[10px] text-gray-500 font-mono">Drag & drop atau klik untuk memilih file</p>
                    <div className="flex gap-2 mt-3">
                        <span className="px-2 py-0.5 bg-[#1A1A24] rounded text-[8px] text-gray-500 border border-white/5">JPG</span>
                        <span className="px-2 py-0.5 bg-[#1A1A24] rounded text-[8px] text-gray-500 border border-white/5">PNG</span>
                        <span className="px-2 py-0.5 bg-[#1A1A24] rounded text-[8px] text-gray-500 border border-white/5">VIDEO</span>
                        <span className="px-2 py-0.5 bg-[#1A1A24] rounded text-[8px] text-gray-500 border border-white/5">SVG</span>
                    </div>
                </div>
            )}
        </div>

        {/* Checkbox */}
        <div className="mb-6 flex items-center p-3 bg-yellow-900/10 border border-yellow-700/30 rounded-lg">
           <input 
             type="checkbox" 
             checked={isAiImage} 
             onChange={(e) => setIsAiImage(e.target.checked)}
             className="w-4 h-4 text-gold-500 bg-gray-900 border-gray-600 rounded focus:ring-gold-500 focus:ring-1 cursor-pointer"
           />
           <span className="ml-3 text-[11px] font-bold text-yellow-100 tracking-wide cursor-pointer" onClick={() => setIsAiImage(!isAiImage)}>
             Wajib Centang jika Gambar AI (Midjourney/DALL-E/Stable Diffusion) - Menghindari Banned Adobe
           </span>
        </div>
        
        {/* NEW BUTTON: Refresh Metadata */}
        <div className="flex justify-end mb-6 -mt-3">
             <button 
                onClick={handleResetStockStatus}
                disabled={microstockItems.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-900/30 bg-[#0A0A0F] hover:bg-red-900/20 text-[10px] text-gray-400 hover:text-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
             >
                <svg className="w-3 h-3 group-hover:-rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                RESET & CLEAR ALL FILES
             </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={handleGenerateStockData}
             disabled={isProcessingStock || microstockItems.length === 0}
             className="py-4 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-lg text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
           >
             {isProcessingStock ? (
                <>
                   <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   <span>Processing...</span>
                </>
             ) : (
                <>
                   <span className="group-hover:scale-110 transition-transform">🚀</span> Generate Adobe Stock Data
                </>
             )}
           </button>

           <button 
             onClick={handleDownloadCSV}
             disabled={microstockItems.length === 0 || microstockItems.every(i => !i.metadata)}
             className="py-4 bg-[#047857] hover:bg-[#059669] text-white font-bold rounded-lg text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
           >
             💾 Unduh CSV (Adobe Ready)
           </button>
        </div>
      </div>
    );
  }

  // --- RENDER UI: DEFAULT (DIRECTOR & SCRIPT AI) ---
  const formatText = (text: string, type: 'script' | 'strategy' = 'script') => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const l = line.trim();
      if (!l) return <div key={idx} className="h-2" />;
      
      // HILANGKAN BARIS REDUNDAN '(SCENE)'
      if (l === '(SCENE)' || l === 'SCENE') return null;
      
      // === VIDEO AI FORMATTING (VISUAL, AUDIO, SFX, SUARA) ===
      if (l.startsWith('VISUAL:')) {
          const content = l.replace('VISUAL:', '').trim();
          return (
             <div key={idx} className="mt-4 mb-2">
                 <span className="text-cyan-400 font-bold text-[10px] uppercase tracking-widest font-tech border-b border-cyan-500/50 pb-0.5 block mb-1">
                    🎥 VISUAL (CAMERA & ACTION)
                 </span>
                 <p className="text-cyan-100 font-mono text-[10px] leading-relaxed pl-4 border-l border-cyan-500/30">{content}</p>
             </div>
          );
      }
      if (l.startsWith('AUDIO:')) {
          const content = l.replace('AUDIO:', '').trim();
          return (
             <div key={idx} className="mb-2">
                 <span className="text-pink-400 font-bold text-[10px] uppercase tracking-widest font-tech border-b border-pink-500/50 pb-0.5 block mb-1">
                    🎵 AUDIO (BGM)
                 </span>
                 <p className="text-pink-100 font-mono text-[10px] leading-relaxed pl-4 border-l border-pink-500/30">{content}</p>
             </div>
          );
      }
      if (l.startsWith('SFX:')) {
          const content = l.replace('SFX:', '').trim();
          return (
             <div key={idx} className="mb-2">
                 <span className="text-orange-400 font-bold text-[10px] uppercase tracking-widest font-tech border-b border-orange-500/50 pb-0.5 block mb-1">
                    🔊 SFX (SOUND EFFECT)
                 </span>
                 <p className="text-orange-100 font-mono text-[10px] leading-relaxed pl-4 border-l border-orange-500/30">{content}</p>
             </div>
          );
      }
      if (l.startsWith('SUARA:')) {
          const content = l.replace('SUARA:', '').trim().replace(/^"|"$/g, '');
          return (
             <div key={idx} className="mt-3 mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded p-3">
                 <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest font-tech">
                        🎙️ VOICEOVER (NARRATOR)
                    </span>
                 </div>
                 <p className="text-white font-bold text-[12px] font-sans italic leading-relaxed">"{content}"</p>
             </div>
          );
      }

      // === STRATEGY (CAPTION) FORMATTING - BEAUTIFIED ===
      if (type === 'strategy') {
         // TITLE (Supports English 'TITLE' and Indonesian 'JUDUL')
         if ((l.includes('🔥') && (l.includes('TITLE') || l.includes('JUDUL'))) || l.startsWith('TITLE:') || l.startsWith('JUDUL')) {
             const content = l.replace(/🔥|TITLE:|JUDUL KLIKBAIT:|JUDUL:/gi, '').trim();
             return (
                 <div key={idx} className="mb-4 bg-gradient-to-r from-purple-900/40 to-transparent border-l-4 border-purple-500 p-4 rounded-r-lg shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🔥</span>
                        <div className="text-[10px] text-purple-400 font-bold tracking-widest uppercase font-tech">VIRAL TITLE / JUDUL KLIKBAIT</div>
                    </div>
                    <div className="text-white font-bold text-sm leading-tight font-sans tracking-wide">"{content}"</div>
                 </div>
             );
         }
         
         // DESCRIPTION (Supports 'DESCRIPTION' and 'DESKRIPSI')
         if (l.includes('📝') && (l.includes('DESCRIPTION') || l.includes('DESKRIPSI'))) {
             return (
                <div key={idx} className="mt-6 mb-2 flex items-center gap-2">
                    <div className="h-[1px] flex-1 bg-purple-500/50"></div>
                    <div className="text-[10px] text-purple-300 font-bold tracking-[0.2em] uppercase font-tech">DESCRIPTION SEO</div>
                    <div className="h-[1px] flex-1 bg-purple-500/50"></div>
                </div>
             );
         }

         // HASHTAG HEADER
         if (l.includes('🏷️') && (l.includes('HASHTAGS') || l.includes('TAGS'))) {
             return <div key={idx} className="mt-6 mb-2 text-[10px] text-pink-400 font-bold tracking-widest uppercase border-b border-pink-500/30 pb-1">🏷️ OPTIMIZED HASHTAGS</div>;
         }

         // YOUTUBE TAGS HEADER (NEW)
         if (l.includes('🔖') && (l.includes('YOUTUBE TAGS') || l.includes('TAGS YOUTUBE'))) {
             const content = l.replace(/🔖|YOUTUBE TAGS:|TAGS YOUTUBE:/gi, '').trim();
             return (
                <div key={idx} className="mt-4 mb-2">
                    <div className="text-[10px] text-blue-400 font-bold tracking-widest uppercase border-b border-blue-500/30 pb-1 mb-2">🔖 YOUTUBE TAGS (COPY THIS)</div>
                    <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded text-[10px] font-mono text-blue-200 break-words select-all hover:bg-blue-900/20 transition-colors cursor-text">
                        {content}
                    </div>
                </div>
             );
         }

         // UPLOAD TIME HEADER (NEW)
         if (l.includes('⏰') && (l.includes('UPLOAD TIME') || l.includes('JAM UPLOAD'))) {
             const content = l.replace(/⏰|UPLOAD TIME:|JAM UPLOAD:/gi, '').trim();
             return (
                 <div key={idx} className="mt-4 mb-4 flex items-start gap-3 bg-yellow-900/10 border border-yellow-500/20 p-3 rounded-lg">
                     <div className="text-xl mt-0.5">⏰</div>
                     <div>
                         <div className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest font-tech mb-1">GOLDEN TIME UPLOAD</div>
                         <p className="text-[11px] text-yellow-100 font-bold font-mono">{content}</p>
                     </div>
                 </div>
             );
         }

         // VIRAL STRATEGY / VIEW BOOST (NEW)
         if (l.includes('🚀') && (l.includes('STRATEGY') || l.includes('STRATEGI') || l.includes('VIEWS'))) {
             const content = l.replace(/🚀|VIRAL STRATEGY:|STRATEGI VIEWS:/gi, '').trim();
             return (
                 <div key={idx} className="mt-4 mb-2 bg-green-900/10 border border-green-500/30 p-3 rounded-lg">
                     <div className="flex items-center gap-2 mb-2">
                         <span className="text-sm">🚀</span>
                         <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest font-tech">AUTO VIEW BOOST STRATEGY</span>
                     </div>
                     <p className="text-[10px] text-green-100 font-mono leading-relaxed border-l-2 border-green-500/50 pl-3">
                        {content}
                     </p>
                 </div>
             );
         }
         
         // Detect Hashtags (lines starting with # or having multiple #)
         if (l.startsWith('#') || (l.match(/#/g) || []).length > 2) {
             return (
                 <div key={idx} className="flex flex-wrap gap-1.5 mt-1 pb-4">
                     {l.split(' ').filter(t => t.startsWith('#') || t.includes('#')).map((tag, tIdx) => (
                         <span key={tIdx} className="text-[10px] text-pink-200 bg-pink-900/40 border border-pink-500/30 px-2 py-1 rounded hover:bg-pink-500/30 transition-colors cursor-pointer hover:scale-105 transform duration-200">
                             {tag}
                         </span>
                     ))}
                 </div>
             );
         }
         
         // Default Caption Text
         return <div key={idx} className="mb-1 text-[11px] text-gray-300 font-sans leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-gray-700 hover:border-gray-500 transition-colors">{l}</div>;
      }

      // === SCRIPT (GROK/VEO) FORMATTING ===
      
      // Deteksi Header Scene (Dinamis Warna: Gold untuk Grok, Emerald untuk Veo)
      if (l.startsWith('[')) {
        const isVeo = l.includes('VEO');
        const borderColor = isVeo ? 'border-emerald-500/20' : 'border-gold-500/20';
        const bgColor = isVeo ? 'bg-emerald-500/10' : 'bg-gold-500/10';
        const textColor = isVeo ? 'text-emerald-400' : 'text-gold-400';
        const arrowColor = isVeo ? 'text-emerald-500' : 'text-gold-500';

        return (
            <div key={idx} className="flex items-center gap-2 mt-8 mb-1 border-t border-white/5 pt-4">
                <span className={`${arrowColor} text-[10px]`}>➜</span>
                <span className={`${textColor} font-bold text-[10px] uppercase tracking-wider font-tech ${bgColor} px-2 py-0.5 rounded border ${borderColor} shadow-[0_0_10px_rgba(255,255,255,0.05)]`}>{l}</span>
            </div>
        );
      }

      // Deteksi Baris Narasi (Grok)
      if (l.includes('🎙️') || l.includes('NARASI') || l.includes('Narasi:')) {
        return (
            <div key={idx} className="flex items-start gap-2 my-1 pl-4">
                <span className="text-yellow-300 font-bold text-[10px] mt-0.5 whitespace-nowrap">🎙️ VOICE:</span>
                <span className="text-yellow-100 italic font-mono text-[10px] leading-relaxed bg-yellow-500/10 px-2 py-0.5 rounded border-l-2 border-yellow-500/50">
                    "{l.replace(/🎙️|NARASI:|Narasi:/g, '').trim().replace(/^"|"$/g, '')}"
                </span>
            </div>
        );
      }

      // Deteksi VISUAL ACTION (Grok) - IMPROVED PARSING FOR BREAKDOWN
      if (l.includes('⏱️ VISUAL ACTION') || l.includes('VISUAL ACTION')) {
         const content = l.replace(/⏱️|VISUAL ACTION \(SCENE\):|VISUAL ACTION:|VISUAL ACTION/gi, '').trim();
         return (
             <div key={idx} className="mt-4 mb-2 pl-2">
                 <div className="flex items-center gap-2 mb-2 bg-cyan-900/20 p-1 rounded-r w-fit">
                     <span className="text-cyan-400 font-bold text-[10px] uppercase tracking-widest font-tech">
                        ⏱️ VISUAL ACTION (SCENE)
                     </span>
                 </div>
                 {content && (
                     <p className="text-cyan-100 font-mono text-[10px] leading-relaxed border-l border-cyan-500/30 pl-2">
                        {content}
                     </p>
                 )}
             </div>
         );
      }

      // DETEKSI HEADER BREAKDOWN KHUSUS (0-6 Detik)
      if (l.includes('0-6 Detik Breakdown')) {
          return <div key={idx} className="ml-4 mt-2 mb-1 text-[9px] text-cyan-500 font-bold uppercase tracking-widest border-b border-cyan-500/20 w-fit pb-0.5">{l}</div>;
      }

      // DETEKSI ITEM BREAKDOWN (0-2s, 2-4s, 4-6s) DENGAN FORMAT BARU
      if (l.includes('• 0-2s:') || l.includes('• 2-4s:') || l.includes('• 4-6s:')) {
          const timePart = l.split(':')[0];
          const descPart = l.split(':')[1] || '';
          return (
              <div key={idx} className="ml-4 mt-2 bg-cyan-950/30 border-l-2 border-cyan-500 pl-2 pr-2 py-1 rounded-r">
                  <span className="text-cyan-300 font-bold text-[10px] mr-1 bg-cyan-900/50 px-1 rounded">{timePart}:</span>
                  <span className="text-cyan-100 font-mono text-[10px]">{descPart}</span>
              </div>
          );
      }

      // DETEKSI SOUND EFFECT (DI DALAM BREAKDOWN)
      if (l.startsWith('🔊')) {
           return (
               <div key={idx} className="ml-8 mb-0.5 flex items-center gap-1.5">
                   <span className="text-[10px]">🔊</span>
                   <span className="text-pink-300 text-[9px] font-mono italic">{l.replace('🔊', '').trim()}</span>
               </div>
           );
      }

      // DETEKSI DIALOG KARAKTER (DI DALAM BREAKDOWN)
      if (l.startsWith('🗣️')) {
           return (
               <div key={idx} className="ml-8 mb-1 flex items-start gap-1.5">
                   <span className="text-[10px] mt-0.5">🗣️</span>
                   <span className="text-yellow-200 text-[10px] font-sans font-semibold bg-yellow-500/5 px-1 rounded">{l.replace('🗣️', '').trim()}</span>
               </div>
           );
      }

      // Deteksi VIDEO MOTION (Veo) - Format Baru 8s - FIX: MENAMPILKAN KONTEN TEKS
      if (l.includes('⏱️ Video Motion') || l.includes('Video Motion:')) {
         const content = l.replace(/⏱️|Video Motion:|Video Motion/gi, '').trim();
         return (
             <div key={idx} className="mt-3 mb-2 pl-4">
                 <div className="flex items-center gap-2 mb-1">
                     <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest font-tech border-b border-emerald-500/50 pb-0.5">
                        ⏱️ VIDEO CAMERA (8s)
                     </span>
                 </div>
                 {content && (
                    <p className="text-emerald-100 font-mono text-[10px] leading-relaxed border-l border-emerald-500/30 pl-2">
                        {content}
                    </p>
                 )}
             </div>
         );
      }
      
      // Deteksi Header Breakdown Lama (Fallback)
      if (l.includes('Breakdown:') && !l.includes('0-6')) {
         return <div key={idx} className="text-cyan-600 font-mono font-bold text-[9px] pl-6 uppercase tracking-wider mt-1">{l}</div>;
      }

      // Styling umum untuk instruksi Veo (jika tidak masuk kategori di atas)
      if (type === 'script' && globalScripts.veo.includes(l) && !l.startsWith('[')) {
         return <div key={idx} className="mb-0.5 font-mono text-[10px] text-emerald-100 pl-6 border-l border-emerald-900/50 hover:bg-emerald-900/10 transition-colors py-0.5 leading-relaxed">{l}</div>;
      }

      // Teks biasa (fallback)
      return <div key={idx} className="mb-0.5 font-mono text-[10px] text-gray-500 pl-4 border-l border-gray-800 transition-colors cursor-default leading-relaxed">{l}</div>;
    });
  };

  return (
    <div className="bg-[#08080c] border border-white/5 rounded-xl p-6 mt-4 relative overflow-hidden shadow-2xl">
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b border-white/5 pb-4 relative z-10">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-black border border-gold-500/30 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.15)] group">
                <svg className="w-6 h-6 text-gold-500 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-100 font-tech uppercase tracking-[0.15em] leading-none flex items-center gap-2">
                    DIRECTOR <span className="text-gold-500">&</span> SCRIPT AI
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-[1px] w-8 bg-gold-500/50"></div>
                    <p className="text-[10px] text-gray-500 font-mono font-medium tracking-wide">
                        AI menganalisis ide cerita untuk menyusun narasi, dialog, dan detail scene.
                    </p>
                </div>
            </div>
         </div>
         
         <div className="mt-4 md:mt-0 flex items-center gap-3">
             <div className="px-3 py-1 bg-[#0A0A0F] border border-white/10 rounded flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                <span className="text-[9px] font-mono text-gray-400">ENGINE STATUS: <span className="text-green-500 font-bold">ONLINE</span></span>
             </div>
         </div>
      </div>

      {/* TERMINAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
         
         {/* 1. GROK INTELLIGENCE (BLUE THEME) */}
         <div className="flex flex-col h-[280px] bg-[#050508] border border-blue-900/30 rounded-lg overflow-hidden relative group transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
             {/* Terminal Header */}
             <div className="h-9 px-3 bg-[#0A0A0F] border-b border-blue-900/30 flex items-center justify-between">
                 <div className="flex items-center gap-2.5">
                     <div className="flex gap-1.5">
                         <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/50"></div>
                         <div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                         <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50"></div>
                     </div>
                     <span className="text-[10px] font-bold text-blue-400 font-tech uppercase tracking-widest ml-1">{titles.t1}</span>
                 </div>
                 <button onClick={() => copyToClipboard(globalScripts.grok)} className="text-gray-600 hover:text-blue-400 transition-colors" title="Copy Script">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 01-2-2"></path></svg>
                 </button>
             </div>
             
             {/* Content Area */}
             <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-black/50 relative">
                 {/* Decorative Scanline */}
                 <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent h-full w-full pointer-events-none opacity-20"></div>
                 
                 {globalScripts.grok ? (
                   <div className="relative z-10">
                       {formatText(globalScripts.grok, 'script')}
                       <div className="mt-4 flex items-center gap-2 animate-pulse">
                           <span className="w-1.5 h-3 bg-blue-500"></span>
                           <span className="text-[9px] text-blue-500/50 font-mono">END OF STREAM</span>
                       </div>
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-blue-900/40">
                       <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                       <span className="text-[9px] font-mono uppercase tracking-widest">Awaiting Narrative Input...</span>
                   </div>
                 )}
             </div>
         </div>

         {/* 2. VEO VIDEO (GREEN THEME) */}
         <div className="flex flex-col h-[280px] bg-[#050508] border border-emerald-900/30 rounded-lg overflow-hidden relative group transition-all hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
             <div className="h-9 px-3 bg-[#0A0A0F] border-b border-emerald-900/30 flex items-center justify-between">
                 <div className="flex items-center gap-2.5">
                     <div className="flex gap-1.5">
                         <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/50"></div>
                         <div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                         <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50"></div>
                     </div>
                     <span className="text-[10px] font-bold text-emerald-400 font-tech uppercase tracking-widest ml-1">{titles.t2}</span>
                 </div>
                 <button onClick={() => copyToClipboard(globalScripts.veo)} className="text-gray-600 hover:text-emerald-400 transition-colors" title="Copy Script">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 01-2-2"></path></svg>
                 </button>
             </div>
             
             <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-black/50 relative">
                 <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent h-full w-full pointer-events-none opacity-20"></div>
                 {globalScripts.veo ? (
                   <div className="relative z-10">
                       {formatText(globalScripts.veo, 'script')}
                       <div className="mt-4 flex items-center gap-2 animate-pulse">
                           <span className="w-1.5 h-3 bg-emerald-500"></span>
                           <span className="text-[9px] text-emerald-500/50 font-mono">SEQUENCE COMPLETE</span>
                       </div>
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-emerald-900/40">
                       <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                       <span className="text-[9px] font-mono uppercase tracking-widest">Awaiting Visual Directives...</span>
                   </div>
                 )}
             </div>
         </div>

         {/* 3. CAPTION & STRATEGY (PURPLE THEME) */}
         <div className="flex flex-col h-[280px] bg-[#050508] border border-purple-900/30 rounded-lg overflow-hidden relative group transition-all hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]">
             <div className="h-9 px-3 bg-[#0A0A0F] border-b border-purple-900/30 flex items-center justify-between">
                 <div className="flex items-center gap-2.5">
                     <div className="flex gap-1.5">
                         <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/50"></div>
                         <div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                         <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50"></div>
                     </div>
                     <span className="text-[10px] font-bold text-purple-400 font-tech uppercase tracking-widest ml-1">{titles.t3}</span>
                 </div>
                 <button onClick={() => copyToClipboard(globalScripts.caption)} className="text-gray-600 hover:text-purple-400 transition-colors" title="Copy Script">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 01-2-2"></path></svg>
                 </button>
             </div>
             
             <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-black/50 relative">
                 <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent h-full w-full pointer-events-none opacity-20"></div>
                 {globalScripts.caption ? (
                   <div className="relative z-10">
                       {formatText(globalScripts.caption, 'strategy')}
                       <div className="mt-4 flex items-center gap-2 animate-pulse">
                           <span className="w-1.5 h-3 bg-purple-500"></span>
                           <span className="text-[9px] text-purple-500/50 font-mono">STRATEGY OPTIMIZED</span>
                       </div>
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-purple-900/40">
                       <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
                       <span className="text-[9px] font-mono uppercase tracking-widest">Awaiting Marketing Logic...</span>
                   </div>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
};

export default ToolsSection;
