
import React, { useState } from 'react';
import { AppMode, ProductSlot } from '../types';
import { 
    STORY_THEMES, VIDEO_STYLES, MICROSTOCK_CATEGORIES, 
    PROD_CATEGORIES, PROD_BACKGROUNDS, PROD_POSITIONS, PROD_EFFECTS, MODEL_PRESETS,
    CARTOON_STYLES
} from '../constants';

interface SidebarProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  productSlots: ProductSlot[];
  setProductSlots: React.Dispatch<React.SetStateAction<ProductSlot[]>>;
  // NEW: Face Slots Prop
  faceSlots?: ProductSlot[];
  setFaceSlots?: React.Dispatch<React.SetStateAction<ProductSlot[]>>;

  category: string;
  setCategory: (val: string) => void;
  template: string;
  setTemplate: (val: string) => void;
  character: string;
  setCharacter: (val: string) => void;
  storyTheme: string;
  setStoryTheme: (val: string) => void;
  // UPDATED: Added new language codes
  scriptLanguage?: 'ID' | 'EN' | 'MY' | 'JW' | 'CN';
  setScriptLanguage?: (val: 'ID' | 'EN' | 'MY' | 'JW' | 'CN') => void;
  
  videoRatio: string;
  setVideoRatio: (val: string) => void;
  
  videoResolution: '720p' | '1080p';
  setVideoResolution: (val: '720p' | '1080p') => void;
  videoEngine: 'fast' | 'quality';
  setVideoEngine: (val: 'fast' | 'quality') => void;
  manualPrompt: string;
  setManualPrompt: (val: string) => void;
  videoInputPrompt: string;
  setVideoInputPrompt: (val: string) => void;
  onGenerate: () => void;
  onReferenceToVideo: (slotIndex: number) => void;
  isGenerating: boolean;

  // Product Studio Specific Props
  prodBg?: string; setProdBg?: (v: string) => void;
  prodPos?: string; setProdPos?: (v: string) => void;
  prodEff?: string; setProdEff?: (v: string) => void;
  prodCategory?: string; setProdCategory?: (v: string) => void;
  selectedModel?: string; setSelectedModel?: (v: string) => void;

  // New TTS Props
  ttsAudioUrl?: string | null;
  isGeneratingTTS?: boolean;
  onGenerateTTS?: () => void;
  
  // NEW: Full Dialog TTS Props
  ttsFullDialogUrl?: string | null;
  isGeneratingFullDialogTTS?: boolean;
  onGenerateFullDialogTTS?: () => void;

  // NEW: Dialog Multi-Speaker Props
  ttsDialogMFUrl?: string | null;
  isGeneratingDialogMF?: boolean;
  onGenerateDialogMF?: () => void;
  ttsDialogMMUrl?: string | null;
  isGeneratingDialogMM?: boolean;
  onGenerateDialogMM?: () => void;
  
  // NEW: Selected Voice State
  selectedVoice?: string;
  setSelectedVoice?: (val: string) => void;
  
  // NEW: Cartoon Visual Style
  cartoonStyle?: string;
  setCartoonStyle?: (val: string) => void;
}

// DEFINISI PILIHAN SUARA DENGAN GAMBAR (UPDATED STYLE: ADVENTURER)
const VOICE_OPTIONS = [
  { 
      id: 'Kore', 
      name: 'Kore (Wanita)', 
      desc: 'Suara wanita lembut & menenangkan',
      img: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Willow&backgroundColor=b6e3f4' 
  },
  { 
      id: 'Fenrir', 
      name: 'Fenrir (Pria)', 
      desc: 'Suara pria berat & berwibawa',
      img: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Alexander&backgroundColor=c0aede' 
  },
  { 
      id: 'Puck', 
      name: 'Puck (Pria)', 
      desc: 'Suara pria muda & energik',
      img: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Easton&backgroundColor=ffdfbf' 
  },
  { 
      id: 'Charon', 
      name: 'Charon (Pria)', 
      desc: 'Suara pria tua & bijaksana',
      img: 'https://api.dicebear.com/9.x/adventurer/svg?seed=George&backgroundColor=d1d4f9' 
  },
  { 
      id: 'Zephyr', 
      name: 'Zephyr (Wanita)', 
      desc: 'Suara wanita ceria & modern',
      img: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Chloe&backgroundColor=ffdfbf' 
  },
  { 
      id: 'Aoede', 
      name: 'Aoede (Wanita)', 
      desc: 'Suara wanita elegan & formal',
      img: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Bella&backgroundColor=ffd5dc' 
  }
];

const Sidebar: React.FC<SidebarProps> = (props) => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { 
        id: 'model', 
        label: 'Model Studio',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        )
    },
    { 
        id: 'product', 
        label: 'Produk Studio',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
        )
    },
    { 
        id: 'video_review', 
        label: 'Video AI (Grok)', 
        isNew: true,
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        )
    },
    { 
        id: 'microstock', 
        label: 'Image For Microstock', 
        isNew: true,
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        )
    },
    { 
        id: 'storyboard', 
        label: 'Film Cartoon Animasi Maker', 
        isNew: true,
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
        )
    },
    { 
        id: 'ecourse', 
        label: 'E-COURSE TOPAZ STUDIO V2', 
        isNew: true,
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
        )
    },
  ];

  const handleFile = (idx: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = (e.target?.result as string).split(',')[1];
      const newSlots = [...props.productSlots];
      newSlots[idx] = { base64: b64, mimeType: file.type };
      props.setProductSlots(newSlots);
    };
    reader.readAsDataURL(file);
  };
  
  // New Handler for Face Slots
  const handleFaceFile = (idx: number, file: File) => {
    if (!props.faceSlots || !props.setFaceSlots) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = (e.target?.result as string).split(',')[1];
      const newSlots = [...props.faceSlots!];
      newSlots[idx] = { base64: b64, mimeType: file.type };
      props.setFaceSlots!(newSlots);
    };
    reader.readAsDataURL(file);
  };

  const activeThemeName = STORY_THEMES.find(t => t.id === props.storyTheme)?.name || 'Adventure';

  const toggleVideoStyle = (style: string) => {
    const current = props.manualPrompt;
    if (current.includes(style)) {
        props.setManualPrompt(current.replace(`, ${style}`, '').replace(style, '').trim());
    } else {
        props.setManualPrompt(current ? `${current}, ${style}` : style);
    }
  };

  const getTopAreaTitle = () => {
      if (props.activeMode === 'model') return "FOTO PRODUK / OUTFIT";
      return "SUMBER FOTO";
  };
  
  return (
    <div className="space-y-6">
      
      {/* 1. PILIH PROYEK */}
      <div className="bg-dark-surface tech-border rounded-lg overflow-hidden shadow-lg">
        <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-full flex items-center justify-between px-5 py-4 bg-[#15151E] hover:bg-[#1A1A24] transition-colors group"
        >
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-5 bg-gold-500 rounded-sm shadow-[0_0_10px_#EAB308]"></div>
             <span className="panel-header text-base text-gray-200 tracking-widest group-hover:text-gold-500 transition-colors">PILIH PROYEK</span>
          </div>
          <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
        </button>

        {isOpen && (
          <div className="p-3 space-y-2 bg-dark-bg/50">
            {menuItems.map((item) => {
              const isActive = props.activeMode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { props.onModeChange(item.id as AppMode); }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs rounded-md transition-all border group
                    ${isActive 
                      ? 'bg-gold-500/10 border-gold-500/50 text-gold-400 font-bold shadow-lg shadow-gold-500/10' 
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                  <div className="flex items-center gap-3">
                      <div className={`transition-colors ${isActive ? 'text-gold-500' : 'text-gray-500 group-hover:text-gray-300'}`}>
                        {item.icon}
                      </div>
                      <span className="tracking-widest uppercase font-semibold text-[11px] text-left">{item.label}</span>
                  </div>
                  {item.isNew && (
                    <span className="px-2 py-0.5 rounded bg-red-600 text-[9px] font-bold text-white tracking-wider shadow-red-500/20 shadow-lg">NEW</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* KONTAINER UTAMA KONFIGURASI - Hide if E-Course is active */}
      {props.activeMode !== 'ecourse' && (
      <div className="bg-dark-surface tech-border rounded-lg p-5 space-y-6 shadow-lg">
          
          {/* A. SUMBER FOTO UTAMA (Produk/Barang/Umum) */}
          <div className="space-y-4 border-b border-dark-border pb-5">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-gold-500 rounded-sm"></div>
                    <h3 className="panel-header text-sm text-gray-200">{getTopAreaTitle()}</h3>
                </div>
                <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-1 rounded">MAX 4 JPG</span>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-square relative group">
                    {props.productSlots[i]?.base64 ? (
                        <div className="w-full h-full rounded border border-gray-700 relative overflow-hidden bg-black shadow-lg">
                        <img src={`data:${props.productSlots[i].mimeType};base64,${props.productSlots[i].base64}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <button onClick={() => { const n = [...props.productSlots]; n[i] = { base64: null, mimeType: null }; props.setProductSlots(n); }} className="absolute top-0 right-0 bg-black/80 text-white w-5 h-5 flex items-center justify-center rounded-bl-sm hover:text-red-500 transition-colors text-xs">
                            ×
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center py-0.5 text-gray-300 font-mono">SLOT {i+1}</div>
                        </div>
                    ) : (
                        <label className="w-full h-full border border-dashed border-gray-700 hover:border-gold-500/50 hover:bg-gold-500/5 rounded flex flex-col items-center justify-center cursor-pointer transition-all bg-[#0d0d12]">
                        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(i, e.target.files[0])} />
                        <span className="text-lg text-gray-500 mb-0 group-hover:text-gold-500 transition-colors">+</span>
                        <span className="text-[9px] text-gray-600 mt-1">SLOT {i+1}</span>
                        </label>
                    )}
                </div>
                ))}
            </div>
            {props.activeMode === 'model' && (
                <p className="text-[9px] text-gray-500 italic mt-1 font-mono">
                    *Upload foto produk/baju di sini (Gunakan Slot 1-4).
                </p>
            )}
          </div>

          {/* B. KONFIGURASI DINAMIS PER MODE */}
          
          {/* ======================= MODE: MODEL STUDIO ======================= */}
          {props.activeMode === 'model' && (
             <>
                {/* PILIH MODEL */}
                <div className="space-y-4 border-b border-dark-border pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-gold-500 rounded-sm"></div>
                        <h3 className="panel-header text-sm text-gray-200">PILIH MODEL</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                        {MODEL_PRESETS.map(m => (
                            <button
                                key={m.id}
                                onClick={() => props.setSelectedModel?.(m.id)}
                                className={`text-left px-3 py-2.5 rounded text-[10px] border transition-all flex items-center gap-2 ${
                                    props.selectedModel === m.id
                                    ? 'bg-gold-500/20 border-gold-500 text-gold-400 font-bold'
                                    : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <span className={props.selectedModel === m.id ? 'text-gold-500' : 'opacity-50'}>
                                   {m.id === 'my-face' ? '📸' : '👤'}
                                </span>
                                <span className="truncate">{m.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- SEPARATE UPLOAD WAJAH (ONLY IF MY-FACE) --- */}
                {props.selectedModel === 'my-face' && (
                    <div className="space-y-4 border-b border-dark-border pb-5 bg-gold-500/5 p-4 rounded-lg border border-gold-500/20 animate-[fadeIn_0.3s_ease]">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-3 bg-gold-500 rounded-sm"></div>
                                <h3 className="panel-header text-xs text-gold-500">UPLOAD WAJAH ANDA</h3>
                            </div>
                            <span className="text-[9px] text-gray-400">MAX 4 FOTO</span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                            {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="aspect-square relative group">
                                {/* Use faceSlots prop here instead of productSlots */}
                                {props.faceSlots && props.faceSlots[i]?.base64 ? (
                                    <div className="w-full h-full rounded border border-gray-700 relative overflow-hidden bg-black shadow-lg">
                                    <img src={`data:${props.faceSlots[i].mimeType};base64,${props.faceSlots[i].base64}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <button onClick={() => { if(props.setFaceSlots) { const n = [...props.faceSlots]; n[i] = { base64: null, mimeType: null }; props.setFaceSlots(n); }}} className="absolute top-0 right-0 bg-black/80 text-white w-5 h-5 flex items-center justify-center rounded-bl-sm hover:text-red-500 transition-colors text-xs">
                                        ×
                                    </button>
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-center py-0.5 text-gray-300 font-mono">FACE {i+1}</div>
                                    </div>
                                ) : (
                                    <label className="w-full h-full border border-dashed border-gray-700 hover:border-gold-500/50 hover:bg-gold-500/5 rounded flex flex-col items-center justify-center cursor-pointer transition-all bg-[#0d0d12]">
                                    <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFaceFile(i, e.target.files[0])} />
                                    <span className="text-lg text-gray-500 mb-0 group-hover:text-gold-500 transition-colors">+</span>
                                    <span className="text-[9px] text-gray-600 mt-1">FACE {i+1}</span>
                                    </label>
                                )}
                            </div>
                            ))}
                        </div>
                        <p className="text-[9px] text-gray-500 italic mt-1 font-mono">
                            *Upload foto wajah khusus untuk model.
                        </p>
                    </div>
                )}

                {/* KATEGORI */}
                <div className="space-y-4 border-b border-dark-border pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-gold-500 rounded-sm"></div>
                        <h3 className="panel-header text-sm text-gray-200">KATEGORI</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {PROD_CATEGORIES.map(c => (
                            <button
                                key={c}
                                onClick={() => props.setProdCategory?.(c)}
                                className={`py-2 rounded text-[9px] font-medium border uppercase transition-all ${
                                    props.prodCategory === c
                                    ? 'bg-gold-500 text-black border-gold-500 font-bold'
                                    : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-white'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* UKURAN GAMBAR */}
                <div className="space-y-4 border-b border-dark-border pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-gold-500 rounded-sm"></div>
                        <h3 className="panel-header text-sm text-gray-200">UKURAN GAMBAR</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {['9:16', '1:1', '16:9', '3:4'].map(r => (
                            <button
                                key={r}
                                onClick={() => props.setVideoRatio(r)}
                                className={`py-2 rounded text-[10px] font-bold border transition-all ${
                                    props.videoRatio === r
                                    ? 'bg-gold-500/10 border-gold-500 text-gold-500'
                                    : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-white'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PENGATURAN LANJUT */}
                <div className="flex items-center gap-3 pt-2">
                    <div className="w-full h-[1px] bg-dark-border"></div>
                    <span className="text-[10px] font-mono text-gray-500 whitespace-nowrap uppercase tracking-widest">PENGATURAN LANJUT</span>
                    <div className="w-full h-[1px] bg-dark-border"></div>
                </div>

                {/* BACKGROUND / TEMA */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-3 bg-gold-500 rounded-sm"></div>
                        <span className="panel-header text-[11px] text-gray-300">BACKGROUND / TEMA</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                        {PROD_BACKGROUNDS.map(bg => (
                            <button
                                key={bg}
                                onClick={() => props.setProdBg?.(bg)}
                                className={`text-left px-3 py-2 rounded text-[10px] border transition-all truncate ${
                                    props.prodBg === bg
                                    ? 'bg-gold-500/20 border-gold-500 text-gold-400 font-bold'
                                    : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {bg}
                            </button>
                        ))}
                    </div>
                </div>

                {/* POSISI */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-3 bg-gold-500 rounded-sm"></div>
                        <span className="panel-header text-[11px] text-gray-300">POSISI</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {PROD_POSITIONS.map(p => (
                            <button
                                key={p}
                                onClick={() => props.setProdPos?.(p)}
                                className={`px-1 py-2 rounded text-[9px] border transition-all truncate ${
                                    props.prodPos === p
                                    ? 'bg-gold-500/20 border-gold-500 text-gold-400 font-bold'
                                    : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-gray-300'
                                }`}
                                title={p}
                            >
                                {p.split('. ')[1]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* EFEK */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-3 bg-gold-500 rounded-sm"></div>
                        <span className="panel-header text-[11px] text-gray-300">EFEK</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                        {PROD_EFFECTS.map(e => (
                            <button
                                key={e}
                                onClick={() => props.setProdEff?.(e)}
                                className={`px-1 py-2 rounded text-[9px] border transition-all truncate ${
                                    props.prodEff === e
                                    ? 'bg-gold-500/20 border-gold-500 text-gold-400 font-bold'
                                    : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-gray-300'
                                }`}
                                title={e}
                            >
                                {e.split('. ')[1]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PROMPT MANUAL */}
                <div className="space-y-3 pt-2 border-t border-dark-border">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-3 bg-gold-500 rounded-sm"></div>
                        <span className="panel-header text-[11px] text-gray-300">PROMPT MANUAL</span>
                    </div>
                    <textarea 
                        value={props.manualPrompt}
                        onChange={(e) => props.setManualPrompt(e.target.value)}
                        placeholder="Contoh: Pencahayaan gelap, efek asap..."
                        className="w-full cyber-input p-3 text-xs h-[80px] rounded resize-none placeholder:text-gray-600 font-mono leading-relaxed"
                    />
                </div>
             </>
          )}

          {/* ======================= MODE: STORYBOARD ======================= */}
          {props.activeMode === 'storyboard' && (
            <>
                <div className="space-y-4 border-b border-dark-border pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-gold-500 rounded-sm"></div>
                        <h3 className="panel-header text-sm text-gray-200">IDE KONSEP CERITA</h3>
                    </div>
                    <textarea 
                        value={props.manualPrompt}
                        onChange={(e) => props.setManualPrompt(e.target.value)}
                        placeholder="Ceritakan ide film animasi Anda di sini..."
                        className="w-full cyber-input p-4 text-xs h-[100px] rounded resize-none placeholder:text-gray-600 font-mono leading-relaxed"
                    />
                </div>

                <div className="space-y-4 border-b border-dark-border pb-5">
                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-gold-500 rounded-sm"></div>
                            <span className="panel-header text-gray-200 text-sm">GENRE</span>
                        </div>
                        <span className="text-gold-500 font-bold text-[10px] uppercase bg-gold-500/10 px-3 py-1 rounded border border-gold-500/20">{activeThemeName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {STORY_THEMES.slice(0, 9).map(theme => (
                        <button 
                            key={theme.id}
                            onClick={() => props.setStoryTheme(theme.id)}
                            className={`py-2.5 rounded text-[10px] font-medium transition-all border uppercase truncate px-1 ${
                                props.storyTheme === theme.id 
                                ? 'bg-gold-500 text-black border-gold-500 font-bold shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                                : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-gray-300 hover:border-gray-600'
                            }`}
                        >
                            {theme.name}
                        </button>
                        ))}
                    </div>
                </div>

                {/* --- NEW: VISUAL STYLE SELECTION FOR STORYBOARD --- */}
                <div className="space-y-4 border-b border-dark-border pb-5 animate-[fadeIn_0.5s_ease]">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-gold-500 rounded-sm"></div>
                        <h3 className="panel-header text-sm text-gray-200">VISUAL STYLE (OUTPUT SCENE 1-6)</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                        {CARTOON_STYLES.map(style => (
                            <button 
                                key={style.id}
                                onClick={() => props.setCartoonStyle?.(style.id)}
                                className={`text-left px-3 py-2.5 rounded text-[10px] border transition-all flex items-center gap-2 ${
                                    props.cartoonStyle === style.id
                                    ? 'bg-gold-500/20 border-gold-500 text-gold-400 font-bold shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                                    : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-gray-300 hover:border-gray-600'
                                }`}
                            >
                                <span className="truncate">{style.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* SETTINGS (Language & Ratio) - MOVED HERE */}
                <div className="grid grid-cols-2 gap-5 border-b border-dark-border pb-5">
                    {/* Bahasa - UPDATED with 5 languages AND SVG ICONS */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3 bg-gold-500 rounded-sm"></div>
                            <span className="panel-header text-[11px] text-gray-300">BAHASA</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                            {/* ID */}
                            <button onClick={() => props.setScriptLanguage?.('ID')} className={`py-2 flex flex-col items-center justify-center gap-1 text-[9px] font-bold rounded border uppercase transition-all ${props.scriptLanguage === 'ID' ? 'bg-gold-500 text-black border-gold-500' : 'bg-[#15151E] border-dark-border text-gray-500 hover:bg-white/5'}`}>
                                <svg className="w-4 h-3 shadow-sm rounded-[1px]" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="30" height="20" fill="#F0F0F0"/>
                                    <rect width="30" height="10" fill="#EF3340"/>
                                </svg>
                                <span>ID</span>
                            </button>
                            {/* EN */}
                            <button onClick={() => props.setScriptLanguage?.('EN')} className={`py-2 flex flex-col items-center justify-center gap-1 text-[9px] font-bold rounded border uppercase transition-all ${props.scriptLanguage === 'EN' ? 'bg-gold-500 text-black border-gold-500' : 'bg-[#15151E] border-dark-border text-gray-500 hover:bg-white/5'}`}>
                                <svg className="w-4 h-3 shadow-sm rounded-[1px]" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="30" height="20" fill="#012169"/>
                                    <path d="M0 0L30 20M30 0L0 20" stroke="white" strokeWidth="3"/>
                                    <path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1"/>
                                    <path d="M15 0V20M0 10H30" stroke="white" strokeWidth="5"/>
                                    <path d="M15 0V20M0 10H30" stroke="#C8102E" strokeWidth="3"/>
                                </svg>
                                <span>EN</span>
                            </button>
                            {/* MY */}
                            <button onClick={() => props.setScriptLanguage?.('MY')} className={`py-2 flex flex-col items-center justify-center gap-1 text-[9px] font-bold rounded border uppercase transition-all ${props.scriptLanguage === 'MY' ? 'bg-gold-500 text-black border-gold-500' : 'bg-[#15151E] border-dark-border text-gray-500 hover:bg-white/5'}`}>
                                <svg className="w-4 h-3 shadow-sm rounded-[1px]" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="30" height="20" fill="white"/>
                                    <path d="M0 2H30M0 6H30M0 10H30M0 14H30M0 18H30" stroke="#CC0001" strokeWidth="2"/>
                                    <rect width="15" height="10" fill="#010066"/>
                                    <circle cx="6" cy="5" r="3" fill="#FFD200"/>
                                    <circle cx="7" cy="5" r="2.5" fill="#010066"/>
                                </svg>
                                <span>MY</span>
                            </button>
                            {/* JW */}
                            <button onClick={() => props.setScriptLanguage?.('JW')} className={`py-2 flex flex-col items-center justify-center gap-1 text-[9px] font-bold rounded border uppercase transition-all ${props.scriptLanguage === 'JW' ? 'bg-gold-500 text-black border-gold-500' : 'bg-[#15151E] border-dark-border text-gray-500 hover:bg-white/5'}`}>
                                <svg className="w-4 h-3 shadow-sm rounded-[1px]" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="30" height="20" fill="white"/>
                                    <path d="M0 2H30M0 6H30M0 10H30M0 14H30M0 18H30" stroke="#EF3340" strokeWidth="2"/>
                                </svg>
                                <span>JW</span>
                            </button>
                            {/* CN */}
                            <button onClick={() => props.setScriptLanguage?.('CN')} className={`py-2 flex flex-col items-center justify-center gap-1 text-[9px] font-bold rounded border uppercase transition-all ${props.scriptLanguage === 'CN' ? 'bg-gold-500 text-black border-gold-500' : 'bg-[#15151E] border-dark-border text-gray-500 hover:bg-white/5'}`}>
                                <svg className="w-4 h-3 shadow-sm rounded-[1px]" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="30" height="20" fill="#EE1C25"/>
                                    <path d="M5 6L3 10H7L5 6Z" fill="#FFFF00" transform="scale(0.8)"/>
                                    <circle cx="5" cy="5" r="1.5" fill="#FFFF00"/>
                                    <circle cx="10" cy="2" r="0.5" fill="#FFFF00"/>
                                    <circle cx="11" cy="4" r="0.5" fill="#FFFF00"/>
                                    <circle cx="11" cy="7" r="0.5" fill="#FFFF00"/>
                                    <circle cx="10" cy="9" r="0.5" fill="#FFFF00"/>
                                </svg>
                                <span>CN</span>
                            </button>
                        </div>
                    </div>
                    {/* Ratio - UPDATED with SVG ICONS */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3 bg-gold-500 rounded-sm"></div>
                            <span className="panel-header text-[11px] text-gray-300">RASIO</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => props.setVideoRatio('9:16')} className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded border text-[10px] font-bold transition-all ${props.videoRatio === '9:16' ? 'bg-gold-500/10 border-gold-500 text-gold-500' : 'bg-[#15151E] border-dark-border text-gray-500 hover:bg-white/5'}`}>
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="6" y="2" width="12" height="20" rx="2" strokeWidth="2"/></svg>
                                9:16
                            </button>
                            <button onClick={() => props.setVideoRatio('16:9')} className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded border text-[10px] font-bold transition-all ${props.videoRatio === '16:9' ? 'bg-gold-500/10 border-gold-500 text-gold-500' : 'bg-[#15151E] border-dark-border text-gray-500 hover:bg-white/5'}`}>
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2"/></svg>
                                16:9
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- NEW VOICE OVER TTS SECTION WITH VOICE SELECTION --- */}
                <div className="space-y-4 border-b border-dark-border pb-5 animate-[fadeIn_0.5s_ease]">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-gold-500 rounded-sm"></div>
                        <h3 className="panel-header text-sm text-gray-200">VOICE OVER TTS (SCENE 1-6)</h3>
                    </div>
                    
                    <div className="p-3 bg-dark-bg border border-dark-border rounded-lg space-y-4">
                        <p className="text-[9px] text-gray-500 font-mono">
                           Pilih karakter suara lalu gabungkan dialog:
                        </p>

                        {/* VOICE SELECTION GRID */}
                        <div className="grid grid-cols-2 gap-2">
                            {VOICE_OPTIONS.map((voice) => (
                                <button
                                    key={voice.id}
                                    onClick={() => props.setSelectedVoice?.(voice.id)}
                                    className={`relative rounded-lg p-2 border transition-all flex flex-col items-center gap-2 group overflow-hidden ${
                                        props.selectedVoice === voice.id 
                                        ? 'bg-gold-500/20 border-gold-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                                        : 'bg-[#15151E] border-dark-border hover:border-gray-600'
                                    }`}
                                >
                                    {/* Avatar Image */}
                                    <div className={`w-10 h-10 rounded-full bg-gray-800 p-0.5 ${props.selectedVoice === voice.id ? 'ring-2 ring-gold-500' : ''}`}>
                                        <img src={voice.img} alt={voice.name} className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    
                                    {/* Name & Desc */}
                                    <div className="text-center w-full">
                                        <div className={`text-[10px] font-bold truncate ${props.selectedVoice === voice.id ? 'text-gold-400' : 'text-gray-300'}`}>
                                            {voice.name}
                                        </div>
                                        <div className="text-[8px] text-gray-500 truncate mt-0.5">
                                            {voice.desc}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        <div className="h-[1px] bg-white/5 w-full my-2"></div>

                        {/* BUTTON 1: GENERATE NARRATION ONLY */}
                        <button 
                           onClick={props.onGenerateTTS}
                           disabled={props.isGeneratingTTS}
                           className="w-full py-3 bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 font-bold rounded text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                           {props.isGeneratingTTS ? (
                               <>
                                   <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                   GENERATING AUDIO...
                               </>
                           ) : (
                               <>
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                                   GENERATE AUDIO (NARASI SAJA)
                               </>
                           )}
                        </button>

                        {props.ttsAudioUrl && (
                            <div className="space-y-2 pt-1 animate-[slideIn_0.3s_ease]">
                                <audio controls src={props.ttsAudioUrl} className="w-full h-8 block rounded" />
                                <a 
                                    href={props.ttsAudioUrl} 
                                    download={`Storyline_Voiceover_${props.selectedVoice}.wav`} 
                                    className="block w-full text-center py-2 bg-green-900/30 hover:bg-green-900/50 border border-green-500/30 text-green-400 text-[9px] font-bold rounded uppercase transition-colors"
                                >
                                    DOWNLOAD AUDIO (.WAV)
                                </a>
                            </div>
                        )}

                        <div className="h-[1px] bg-white/5 w-full my-1"></div>

                        {/* BUTTON 2: GENERATE FULL DIALOG (ALL SCENES) */}
                        <button 
                           onClick={props.onGenerateFullDialogTTS}
                           disabled={props.isGeneratingFullDialogTTS}
                           className="w-full py-3 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 text-purple-400 font-bold rounded text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                           {props.isGeneratingFullDialogTTS ? (
                               <>
                                   <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                   GENERATING FULL DIALOG...
                               </>
                           ) : (
                               <>
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                   GENERATE FULL DIALOG (ALL SCENES)
                               </>
                           )}
                        </button>

                        {props.ttsFullDialogUrl && (
                            <div className="space-y-2 pt-1 animate-[slideIn_0.3s_ease]">
                                <audio controls src={props.ttsFullDialogUrl} className="w-full h-8 block rounded" />
                                <a 
                                    href={props.ttsFullDialogUrl} 
                                    download={`Full_Dialog_Story_${props.selectedVoice}.wav`} 
                                    className="block w-full text-center py-2 bg-green-900/30 hover:bg-green-900/50 border border-green-500/30 text-green-400 text-[9px] font-bold rounded uppercase transition-colors"
                                >
                                    DOWNLOAD FULL DIALOG (.WAV)
                                </a>
                            </div>
                        )}

                        <div className="h-[1px] bg-white/5 w-full my-1"></div>

                        {/* NEW: MULTI-SPEAKER BUTTONS (CARTOON 3D) */}
                        <div className="grid grid-cols-2 gap-2">
                            {/* 1. BUTTON MF (COWOK & CEWEK) */}
                            <button 
                                onClick={props.onGenerateDialogMF}
                                disabled={props.isGeneratingDialogMF}
                                className="w-full py-3 bg-orange-900/30 hover:bg-orange-900/50 border border-orange-500/30 text-orange-400 font-bold rounded text-[9px] tracking-wider uppercase transition-all flex flex-col items-center justify-center gap-0.5 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {props.isGeneratingDialogMF ? (
                                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <>
                                        <div className="flex gap-1"><span className="text-blue-400">♂</span><span className="text-pink-400">♀</span></div>
                                        GENERATE CARTOON 3D
                                        <span className="text-[7px] text-gray-400 font-normal normal-case -mt-0.5">(Suara Viral & Acak)</span>
                                    </>
                                )}
                            </button>

                            {/* 2. BUTTON MM (2 COWOK) */}
                            <button 
                                onClick={props.onGenerateDialogMM}
                                disabled={props.isGeneratingDialogMM}
                                className="w-full py-3 bg-teal-900/30 hover:bg-teal-900/50 border border-teal-500/30 text-teal-400 font-bold rounded text-[9px] tracking-wider uppercase transition-all flex flex-col items-center justify-center gap-0.5 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {props.isGeneratingDialogMM ? (
                                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <>
                                        <div className="flex gap-1"><span className="text-blue-400">♂</span><span className="text-blue-400">♂</span></div>
                                        GENERATE CARTOON 3D
                                        <span className="text-[7px] text-gray-400 font-normal normal-case -mt-0.5">(2 Cowok - Acak)</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* RESULT PLAYERS FOR MULTI SPEAKER */}
                        {props.ttsDialogMFUrl && (
                            <div className="space-y-1 pt-1 animate-[slideIn_0.3s_ease]">
                                <p className="text-[8px] text-orange-400 font-mono">Output: Dialog Cartoon (Cowok & Cewek)</p>
                                <audio controls src={props.ttsDialogMFUrl} className="w-full h-6 block rounded bg-orange-900/20" />
                                <a href={props.ttsDialogMFUrl} download="Dialog_Cartoon_MF.wav" className="block text-center text-[8px] text-orange-500 hover:text-orange-300 underline">Download WAV</a>
                            </div>
                        )}

                        {props.ttsDialogMMUrl && (
                            <div className="space-y-1 pt-1 animate-[slideIn_0.3s_ease]">
                                <p className="text-[8px] text-teal-400 font-mono">Output: Dialog Cartoon (2 Cowok)</p>
                                <audio controls src={props.ttsDialogMMUrl} className="w-full h-6 block rounded bg-teal-900/20" />
                                <a href={props.ttsDialogMMUrl} download="Dialog_Cartoon_MM.wav" className="block text-center text-[8px] text-teal-500 hover:text-teal-300 underline">Download WAV</a>
                            </div>
                        )}

                    </div>
                </div>
            </>
          )}

          {/* ... existing code for other modes ... */}
          {/* ======================= MODE: VIDEO AI ======================= */}
          {props.activeMode === 'video_review' && (
            <>
                <div className="space-y-4 border-b border-dark-border pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-gold-500 rounded-sm"></div>
                        <h3 className="panel-header text-sm text-gray-200">DESKRIPSI VIDEO</h3>
                    </div>
                    <textarea 
                        value={props.manualPrompt}
                        onChange={(e) => props.setManualPrompt(e.target.value)}
                        placeholder="Gambarkan detail gerakan kamera, subjek, dan aktivitas untuk video..."
                        className="w-full cyber-input p-4 text-xs h-[100px] rounded resize-none placeholder:text-gray-600 font-mono leading-relaxed"
                    />
                </div>

                <div className="space-y-4 border-b border-dark-border pb-5">
                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-gold-500 rounded-sm"></div>
                            <span className="panel-header text-gray-200 text-sm">VISUAL STYLE</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {VIDEO_STYLES.map((style, idx) => {
                            const isSelected = props.manualPrompt.includes(style);
                            return (
                                <button 
                                    key={idx}
                                    onClick={() => toggleVideoStyle(style)}
                                    className={`py-3 px-2 rounded text-[10px] font-medium transition-all border uppercase truncate ${
                                        isSelected 
                                        ? 'bg-gold-500 text-black border-gold-500 font-bold shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                                        : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-gray-300 hover:border-gray-600'
                                    }`}
                                >
                                    {style}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-3 bg-gold-500 rounded-sm"></div>
                        <span className="panel-header text-[11px] text-gray-300">ASPEK RASIO</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => props.setVideoRatio('9:16')} className={`flex-1 py-3 flex items-center justify-center gap-2 rounded border text-[10px] font-bold transition-all ${props.videoRatio === '9:16' ? 'bg-gold-500/10 border-gold-500 text-gold-500' : 'bg-[#15151E] border-dark-border text-gray-500 hover:bg-white/5'}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="7" y="4" width="10" height="16" rx="1" strokeWidth="2"></rect></svg>
                            9:16 (TIKTOK)
                        </button>
                        <button onClick={() => props.setVideoRatio('16:9')} className={`flex-1 py-3 flex items-center justify-center gap-2 rounded border text-[10px] font-bold transition-all ${props.videoRatio === '16:9' ? 'bg-gold-500/10 border-gold-500 text-gold-500' : 'bg-[#15151E] border-dark-border text-gray-500 hover:bg-white/5'}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="10" rx="1" strokeWidth="2"></rect></svg>
                            16:9 (YOUTUBE)
                        </button>
                    </div>
                </div>
            </>
          )}

          {/* ======================= MODE: MICROSTOCK ======================= */}
          {props.activeMode === 'microstock' && (
             <>
                 {/* 1. PROMPT MANUAL DULU */}
                 <div className="space-y-4 border-b border-dark-border pb-5">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-gold-500 rounded-sm"></div>
                            <h3 className="panel-header text-sm text-gray-200">PROMPT MANUAL (DESKRIPSI)</h3>
                        </div>
                        <span className="text-[9px] text-gray-500 font-mono tracking-wide">TULIS DESKRIPSI DULU</span>
                    </div>
                    <textarea 
                        value={props.manualPrompt}
                        onChange={(e) => props.setManualPrompt(e.target.value)}
                        placeholder="Deskripsikan gambar Microstock yang ingin dibuat secara detail..."
                        className="w-full cyber-input p-4 text-xs h-[100px] rounded resize-none placeholder:text-gray-600 font-mono leading-relaxed"
                    />
                </div>

                {/* 2. KATEGORI (GRID 2 KOLOM) */}
                <div className="space-y-4 border-b border-dark-border pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-gold-500 rounded-sm"></div>
                        <span className="panel-header text-gray-200 text-sm">KATEGORI</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {MICROSTOCK_CATEGORIES.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => props.setCategory(cat.id)}
                            className={`py-2.5 rounded text-[10px] font-medium transition-all border uppercase truncate px-2 text-left ${
                                props.category === cat.id 
                                ? 'bg-gold-500 text-black border-gold-500 font-bold shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                                : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-gray-300 hover:border-gray-600'
                            }`}
                        >
                            {cat.name}
                        </button>
                        ))}
                    </div>
                </div>

                {/* 3. UKURAN GAMBAR (4 PILIHAN) */}
                <div className="space-y-3">
                     <div className="flex items-center gap-2">
                        <div className="w-1 h-3 bg-gold-500 rounded-sm"></div>
                        <span className="panel-header text-[11px] text-gray-300">UKURAN GAMBAR</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {['3:2', '16:9', '2:3', '1:1'].map(r => (
                             <button 
                                key={r}
                                onClick={() => props.setVideoRatio(r)} 
                                className={`py-2 rounded border text-[10px] font-bold transition-all ${
                                    props.videoRatio === r 
                                    ? 'bg-gold-500/10 border-gold-500 text-gold-500' 
                                    : 'bg-[#15151E] border-dark-border text-gray-500 hover:bg-white/5'
                                }`}
                             >
                                {r}
                             </button>
                        ))}
                    </div>
                </div>
             </>
          )}

          {/* ======================= MODE: PRODUK STUDIO ======================= */}
          {props.activeMode === 'product' && (
              <>
                {/* KATEGORI */}
                <div className="space-y-4 border-b border-dark-border pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-gold-500 rounded-sm"></div>
                        <h3 className="panel-header text-sm text-gray-200">KATEGORI</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {PROD_CATEGORIES.map(c => (
                            <button
                                key={c}
                                onClick={() => props.setProdCategory?.(c)}
                                className={`py-2 rounded text-[9px] font-medium border uppercase transition-all ${
                                    props.prodCategory === c
                                    ? 'bg-gold-500 text-black border-gold-500 font-bold'
                                    : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-white'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* UKURAN GAMBAR */}
                <div className="space-y-4 border-b border-dark-border pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-gold-500 rounded-sm"></div>
                        <h3 className="panel-header text-sm text-gray-200">UKURAN GAMBAR</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {['9:16', '1:1', '16:9', '3:4'].map(r => (
                            <button
                                key={r}
                                onClick={() => props.setVideoRatio(r)}
                                className={`py-2 rounded text-[10px] font-bold border transition-all ${
                                    props.videoRatio === r
                                    ? 'bg-gold-500/10 border-gold-500 text-gold-500'
                                    : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-white'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PENGATURAN LANJUT HEADER */}
                <div className="flex items-center gap-3 pt-2">
                    <div className="w-full h-[1px] bg-dark-border"></div>
                    <span className="text-[10px] font-mono text-gray-500 whitespace-nowrap uppercase tracking-widest">PENGATURAN LANJUT</span>
                    <div className="w-full h-[1px] bg-dark-border"></div>
                </div>

                {/* BACKGROUND / TEMA */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-3 bg-gold-500 rounded-sm"></div>
                        <span className="panel-header text-[11px] text-gray-300">BACKGROUND / TEMA</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                        {PROD_BACKGROUNDS.map(bg => (
                            <button
                                key={bg}
                                onClick={() => props.setProdBg?.(bg)}
                                className={`text-left px-3 py-2 rounded text-[10px] border transition-all truncate ${
                                    props.prodBg === bg
                                    ? 'bg-gold-500/20 border-gold-500 text-gold-400 font-bold'
                                    : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {bg}
                            </button>
                        ))}
                    </div>
                </div>

                {/* POSISI */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-3 bg-gold-500 rounded-sm"></div>
                        <span className="panel-header text-[11px] text-gray-300">POSISI</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {PROD_POSITIONS.map(p => (
                            <button
                                key={p}
                                onClick={() => props.setProdPos?.(p)}
                                className={`px-1 py-2 rounded text-[9px] border transition-all truncate ${
                                    props.prodPos === p
                                    ? 'bg-gold-500/20 border-gold-500 text-gold-400 font-bold'
                                    : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-gray-300'
                                }`}
                                title={p}
                            >
                                {p.split('. ')[1]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* EFEK */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-3 bg-gold-500 rounded-sm"></div>
                        <span className="panel-header text-[11px] text-gray-300">EFEK</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                        {PROD_EFFECTS.map(e => (
                            <button
                                key={e}
                                onClick={() => props.setProdEff?.(e)}
                                className={`px-1 py-2 rounded text-[9px] border transition-all truncate ${
                                    props.prodEff === e
                                    ? 'bg-gold-500/20 border-gold-500 text-gold-400 font-bold'
                                    : 'bg-[#15151E] border-dark-border text-gray-500 hover:text-gray-300'
                                }`}
                                title={e}
                            >
                                {e.split('. ')[1]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PROMPT MANUAL */}
                <div className="space-y-3 pt-2 border-t border-dark-border">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-3 bg-gold-500 rounded-sm"></div>
                        <span className="panel-header text-[11px] text-gray-300">PROMPT MANUAL</span>
                    </div>
                    <textarea 
                        value={props.manualPrompt}
                        onChange={(e) => props.setManualPrompt(e.target.value)}
                        placeholder="Contoh: Pencahayaan gelap, efek asap..."
                        className="w-full cyber-input p-3 text-xs h-[80px] rounded resize-none placeholder:text-gray-600 font-mono leading-relaxed"
                    />
                </div>
              </>
          )}

          {/* GENERATE BUTTON (GLOBAL) */}
          <div className="col-span-2 pt-4">
            <button 
                onClick={props.onGenerate}
                disabled={props.isGenerating}
                className="w-full py-4 rounded btn-gold text-sm font-bold tracking-[0.15em] relative overflow-hidden group shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-shadow"
            >
            {props.isGenerating ? (
                <div className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>PROCESSING...</span>
                </div>
            ) : (
                <span>
                    {props.activeMode === 'product' ? 'GENERATE PRODUK' : 
                     props.activeMode === 'model' ? 'GENERATE MODEL & PRODUK' :
                     props.activeMode === 'microstock' ? 'GENERATE MICROSTOCK' :
                     'GENERATE PROJECT'}
                </span>
            )}
            <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:animate-[shine_1s_infinite]"></div>
            </button>
            
            {/* Estimate Text */}
            {props.activeMode === 'product' && (
                <p className="text-center text-[9px] text-gray-500 mt-2 font-mono">
                    Estimasi 1-3 menit untuk 6 variasi (Produk Saja).
                </p>
            )}
            {props.activeMode === 'model' && (
                <p className="text-center text-[9px] text-gray-500 mt-2 font-mono">
                    Estimasi 1-3 menit untuk 6 variasi (Model & Produk).
                </p>
            )}
            {props.activeMode === 'microstock' && (
                <p className="text-center text-[9px] text-gray-500 mt-2 font-mono">
                    Estimasi 1-3 menit untuk 6 variasi (Microstock).
                </p>
            )}
          </div>

      </div>
      )}
    </div>
  );
};

export default Sidebar;
