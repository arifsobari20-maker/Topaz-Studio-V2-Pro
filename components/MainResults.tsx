
import React, { useState, useEffect } from 'react';
import { GeneratedImage, AppMode } from '../types';

interface MainResultsProps {
  activeMode: AppMode;
  generatedImages: (GeneratedImage | null)[];
  videoRatio: '9:16' | '16:9' | '1:1' | '3:4' | '3:2' | '2:3'; // Expanded type
  isGenerating: boolean;
  onGenerateVideo: (id: number, prompt: string, base64: string) => void;
  onRegenerateSlot: (id: number) => void;
  onManualEdit: (id: number, instruction: string) => void;
  // Handler baru untuk mode Video AI Grok
  onGenerateMotion?: (id: number, base64: string) => void;
  onGenerateNarration?: (id: number, base64: string) => void;
}

// Pesan-pesan lucu saat loading
const LOADING_MESSAGES = [
  "Sedang casting aktor... 🎬",
  "Menyusun pixel ajaib... ✨",
  "AI sedang ngopi dulu... ☕",
  "Menggosok lensa kamera... 📷",
  "Menyiapkan popcorn... 🍿",
  "Mencari lighting terbaik... 💡",
  "Membangun set lokasi... 🏗️",
  "Sabar ya bestie... ✌️",
  "Merender mimpi... 💭"
];

const MainResults: React.FC<MainResultsProps> = ({ 
    activeMode, generatedImages, videoRatio, isGenerating, 
    onGenerateVideo, onRegenerateSlot, onManualEdit,
    onGenerateMotion, onGenerateNarration 
}) => {
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [manualInstruction, setManualInstruction] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  
  // Logic Aspect Ratio Dinamis
  const getAspectClass = (ratio: string) => {
      switch(ratio) {
          case '1:1': return 'aspect-square';
          case '3:4': return 'aspect-[3/4]';
          case '3:2': return 'aspect-[3/2]';
          case '2:3': return 'aspect-[2/3]';
          case '16:9': return 'aspect-[16/9]';
          case '9:16': default: return 'aspect-[9/16]';
      }
  };
  
  const aspectClass = getAspectClass(videoRatio);

  // Efek untuk mengganti pesan loading setiap 1.5 detik
  useEffect(() => {
    if (isGenerating || generatedImages.some(img => img?.isProcessingVideo)) {
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 1500);
        return () => clearInterval(interval);
    }
  }, [isGenerating, generatedImages]);

  const submitManualEdit = () => {
    if (editingSlot !== null && manualInstruction.trim()) {
      onManualEdit(editingSlot, manualInstruction);
      setEditingSlot(null);
      setManualInstruction('');
    }
  };

  const handleDownload = (base64: string, mimeType: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper untuk mendapatkan class animasi video berdasarkan Index Slot
  const getVideoMotionClass = (index: number) => {
      // 1. MODE VIDEO REVIEW (GROK) - Existing Logic
      if (activeMode === 'video_review') {
          switch (index) {
              case 0: return 'motion-cinematic';   // Cinematic Masterpiece
              case 1: return 'motion-levitate';    // Levitation
              case 2: return 'motion-lifestyle';   // Lifestyle Authentic
              case 3: return 'motion-vfx';         // Epic VFX
              case 4: return 'motion-360';         // 360 Studio Loop
              case 5: return 'motion-y2k';         // Y2K Pop
              default: return '';
          }
      }

      // 2. MODE STORYBOARD (FILM CARTOON) - NEW LOGIC 
      // Mapping gerakan sesuai narasi scene 1-6
      if (activeMode === 'storyboard') {
          switch (index) {
              case 0: return 'motion-cinematic'; // SCENE 1: INTRO (Zoom In Slow - Establishing Shot)
              case 1: return 'motion-levitate';  // SCENE 2: PEMICU (Floating/Unease - Mystery Trigger)
              case 2: return 'motion-360';       // SCENE 3: AKSI (Panning - Movement/Journey)
              case 3: return 'motion-lifestyle'; // SCENE 4: KONFLIK (Handheld Shake - Tension/Chaos)
              case 4: return 'motion-vfx';       // SCENE 5: SOLUSI (Pulse/Bright - Eureka Moment)
              case 5: return 'motion-cinematic'; // SCENE 6: ENDING (Zoom Out/In - Calm Resolution)
              default: return 'motion-cinematic';
          }
      }
      
      return '';
  };

  const hasData = generatedImages.some(img => img !== null && img.base64);

  // Dynamic Header Title
  const getHeaderTitle = () => {
      switch(activeMode) {
          case 'storyboard': return 'FILM CARTOON ANIMASI';
          case 'product': return 'PRODUK STUDIO GALERI';
          case 'model': return 'MODEL STUDIO RESULT';
          case 'microstock': return 'MICROSTOCK ASSETS';
          case 'video_review': return 'VIDEO AI RESULT';
          default: return 'GENERATED RESULTS';
      }
  };

  return (
    <div className="flex flex-col w-full relative">
      
      {/* CSS Animation untuk Tombol */}
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: translateY(15px) scale(0.9); }
          60% { opacity: 1; transform: translateY(-2px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .btn-anim {
          animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        }
      `}</style>
        
      {/* Outer Container - Styled like Cyber Blueprint */}
      <div className="bg-[#08080c] border border-white/5 rounded-xl p-6 w-full flex flex-col relative overflow-hidden shadow-2xl">
          
          {/* Top Left Gold Accent Line */}
          <div className="absolute top-0 left-0 w-32 h-[3px] bg-gold-500 shadow-[0_0_15px_#EAB308]"></div>

          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg border border-gold-500/30 bg-[#0d0d12] flex items-center justify-center text-gold-500 shadow-lg shadow-gold-500/10">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                      <h2 className="text-xl font-bold text-gray-100 font-tech uppercase tracking-widest leading-none mb-1">
                          {getHeaderTitle()}
                      </h2>
                      <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${hasData ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-wider">
                              {(activeMode === 'video_review' || activeMode === 'storyboard') ? 'MOTION SIMULATION ACTIVE' : 'OUTPUT VISUAL SCENE'}
                          </span>
                      </div>
                  </div>
              </div>

              <div className="px-4 py-1.5 rounded border border-white/10 bg-[#0c0c10] flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${hasData ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-900'}`}></span>
                  <span className={`text-[9px] font-mono font-bold tracking-widest uppercase ${hasData ? 'text-green-500' : 'text-gray-600'}`}>
                      {hasData ? 'SYSTEM READY' : 'SYSTEM NOT READY'}
                  </span>
              </div>
          </div>

          {/* Grid Canvas */}
          <div className="grid grid-cols-3 gap-8">
            {generatedImages.map((img, i) => {
              const isLoading = isGenerating || img?.isProcessingVideo;
              const hasImage = img && img.base64;
              
              // Tentukan apakah ini mode yang mendukung simulasi video
              const isVideoMode = activeMode === 'video_review';
              const isStoryboardMode = activeMode === 'storyboard';
              const showMotionEffect = isVideoMode || isStoryboardMode;

              const motionClass = getVideoMotionClass(i);
              
              return (
                <div key={i} className="group relative w-full flex flex-col gap-3">
                  {/* Slot Container */}
                  <div className={`
                      w-full ${aspectClass} rounded-xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300
                      ${hasImage
                          ? 'border border-gold-500/20 bg-black' 
                          : 'border border-dashed border-white/10 bg-[#0d0d12] hover:border-gold-500/30'
                      }
                  `}>
                    
                    {/* CUSTOM ANIMATED LOADER */}
                    {isLoading ? (
                         <div className="absolute inset-0 bg-[#0A0A0F] z-20 flex flex-col items-center justify-center text-center p-4 overflow-hidden">
                             {/* Background Effect */}
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent opacity-50 animate-pulse"></div>
                             
                             {/* Bouncing Icon */}
                             <div className="text-4xl mb-3 animate-bounce filter drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                                 {i % 2 === 0 ? '🤖' : '🎬'}
                             </div>
                             
                             {/* Rotating Text */}
                             <div className="relative h-6 w-full overflow-hidden mb-2">
                                <p className="text-[10px] font-bold text-gold-400 font-mono tracking-wider animate-[pulse_1s_infinite] whitespace-nowrap">
                                    {LOADING_MESSAGES[(msgIndex + i) % LOADING_MESSAGES.length]}
                                </p>
                             </div>

                             {/* Progress Bar Style */}
                             <div className="w-2/3 h-1 bg-gray-800 rounded-full overflow-hidden mt-1">
                                 <div className="h-full bg-gold-500/80 animate-[shimmer_1.5s_infinite] w-full origin-left-right scale-x-50 translate-x-[-100%]"></div>
                             </div>
                             
                             <style>{`
                                @keyframes shimmer {
                                    0% { transform: translateX(-100%); }
                                    50% { transform: translateX(0%); }
                                    100% { transform: translateX(100%); }
                                }
                             `}</style>

                             <span className="text-[8px] text-gray-600 font-mono mt-3 absolute bottom-4">SCENE {i+1} PROCESSING</span>
                         </div>
                    ) : (
                      /* CONTENT OR EMPTY STATE */
                      <>
                        {hasImage ? (
                          <>
                            {/* IMAGE with Motion Class */}
                            <img 
                                src={`data:${img.mimeType};base64,${img.base64}`} 
                                className={`w-full h-full object-cover ${motionClass}`} 
                                alt={`Scene ${i+1}`} 
                            />
                            
                            {/* Play Overlay for Video Mode OR Storyboard Mode */}
                            {showMotionEffect && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-60">
                                    <div className="w-10 h-10 rounded-full bg-black/50 border border-white/30 flex items-center justify-center backdrop-blur-sm">
                                        <svg className="w-4 h-4 text-white fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                            )}

                            {/* Label Tag */}
                            <div className="absolute top-2 right-2 pointer-events-none z-20">
                               <span className="text-[9px] font-bold text-white/90 font-mono tracking-widest bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-white/5">
                                  {img.label || `SCENE 0${i+1}`}
                               </span>
                            </div>
                          </>
                        ) : (
                          /* EMPTY STATE */
                          <div className="flex flex-col items-center justify-center gap-3 opacity-20 group-hover:opacity-40 transition-opacity w-full h-full">
                               <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                               <span className="text-[10px] font-bold font-mono tracking-[0.2em] uppercase">
                                  SLOT {i+1}
                               </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* --- NEW ACTION BUTTON GRID (BELOW IMAGE) --- */}
                  <div className="grid grid-cols-4 gap-2 w-full">
                        {/* 1. BUTTON 1: EDIT MANUAL (Default) / MOTION PROMPT (Video Mode) */}
                        {isVideoMode ? (
                           <button 
                                onClick={() => onGenerateMotion?.(i, img?.base64 || "")}
                                disabled={!hasImage}
                                title="Buat Prompt Gerakan (Kamera)"
                                style={{ animationDelay: '0ms' }}
                                className="btn-anim h-10 rounded-lg border border-cyan-500/20 bg-cyan-900/20 hover:bg-cyan-900/40 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.2)] flex items-center justify-center text-cyan-400 hover:text-cyan-200 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none group/btn"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                           </button>
                        ) : (
                           <button 
                                onClick={() => { setEditingSlot(i); setManualInstruction(''); }} 
                                disabled={!hasImage}
                                title="Edit Manual Prompt"
                                style={{ animationDelay: '0ms' }}
                                className="btn-anim h-10 rounded-lg border border-white/10 bg-[#0d0d12] hover:bg-[#1A1A24] hover:border-white/30 hover:shadow-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none group/btn"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                           </button>
                        )}

                        {/* 2. BUTTON 2: REGENERATE (Default) / NARRATION PROMPT (Video Mode) */}
                        {isVideoMode ? (
                           <button 
                                onClick={() => onGenerateNarration?.(i, img?.base64 || "")} 
                                disabled={!hasImage}
                                title="Buat Prompt Narasi Iklan"
                                style={{ animationDelay: '100ms' }}
                                className="btn-anim h-10 rounded-lg border border-yellow-500/20 bg-yellow-900/20 hover:bg-yellow-900/40 hover:border-yellow-400 hover:shadow-[0_0_10px_rgba(250,204,21,0.2)] flex items-center justify-center text-yellow-400 hover:text-yellow-200 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none group/btn"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                           </button>
                        ) : (
                           <button 
                                onClick={() => onRegenerateSlot(i)} 
                                title="Regenerate This Slot"
                                style={{ animationDelay: '100ms' }}
                                className="btn-anim h-10 rounded-lg border border-white/10 bg-[#0d0d12] hover:bg-[#1A1A24] hover:border-white/30 hover:shadow-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none group/btn"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                           </button>
                        )}

                        {/* 3. VIDEO AI (GOLD BUTTON) */}
                        <button 
                            onClick={() => onGenerateVideo(i, "Motion", img?.base64 || "")} 
                            disabled={!hasImage}
                            title="Generate Video (Grok/Veo)"
                            style={{ animationDelay: '200ms' }}
                            className={`btn-anim h-10 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none group/btn shadow-lg
                                ${hasImage 
                                    ? 'bg-gold-500 text-black hover:bg-gold-400 shadow-gold-500/20 hover:shadow-gold-500/50 border border-gold-400' 
                                    : 'bg-[#0d0d12] border border-white/10 text-gray-600'
                                }
                            `}
                        >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </button>

                        {/* 4. DOWNLOAD */}
                        <button 
                            onClick={() => handleDownload(img?.base64 || "", img?.mimeType || "", `ToPaz_Scene_${i+1}.png`)} 
                            disabled={!hasImage}
                            title="Download HD"
                            style={{ animationDelay: '300ms' }}
                            className="btn-anim h-10 rounded-lg border border-white/10 bg-[#0d0d12] hover:bg-[#1A1A24] hover:border-white/30 hover:shadow-lg flex items-center justify-center text-gray-400 hover:text-green-400 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none group/btn"
                        >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Minimal Editor Modal */}
          {editingSlot !== null && (
              <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="bg-[#0A0A0F] border border-gold-500/20 rounded-lg w-full max-w-lg space-y-4 shadow-2xl relative p-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="text-xs font-bold text-gold-500 font-mono uppercase tracking-widest">EDIT PROMPT SCENE 0{editingSlot + 1}</h3>
                        <button onClick={() => setEditingSlot(null)} className="text-gray-600 hover:text-white transition-colors">✕</button>
                    </div>
                    
                    <p className="text-[10px] text-gray-400 font-mono mb-1">
                       Masukkan instruksi revisi (Contoh: "Ubah angle kamera dari atas", "Ganti baju karakter jadi merah").
                    </p>
                    <textarea 
                      value={manualInstruction}
                      onChange={(e) => setManualInstruction(e.target.value)}
                      placeholder="Tulis revisi di sini..."
                      className="w-full bg-[#050508] border border-white/10 p-4 text-xs text-white h-[120px] rounded resize-none font-mono focus:border-gold-500/50 focus:outline-none transition-colors"
                    />
                    
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingSlot(null)} className="px-4 py-2 border border-white/10 hover:bg-white/5 text-gray-400 text-[10px] font-bold uppercase rounded transition-colors">
                          BATAL
                      </button>
                      <button onClick={submitManualEdit} className="px-6 py-2 bg-gold-500 hover:bg-gold-400 text-black text-[10px] font-bold tracking-widest uppercase rounded transition-colors shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                          TERAPKAN REVISI
                      </button>
                    </div>
                </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default MainResults;
