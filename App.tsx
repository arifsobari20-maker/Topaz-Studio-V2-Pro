
import React, { useState, useEffect } from 'react';
import { AppMode, ProductSlot, GeneratedImage, MicrostockItem, StoryScene } from './types';
import { 
  CATEGORIES, MICROSTOCK_CATEGORIES, CHARACTERS, TEMPLATES, 
  STORY_THEMES, STORYBOARD_STRUCTURE, VIDEO_STYLES,
  PROD_BACKGROUNDS, PROD_POSITIONS, PROD_EFFECTS, MODEL_PRESETS,
  CARTOON_STYLES
} from './constants';
import * as ai from './services/geminiService';
import * as grok from './services/grokService'; // NEW IMPORT
import Sidebar from './components/Sidebar';
import MainResults from './components/MainResults';
import ToolsSection from './components/ToolsSection';
import RecentActivity, { ActivityItem } from './components/RecentActivity';
import SystemStatusPanel from './components/SystemStatusPanel';
import ApiKeySelector from './components/ApiKeySelector';

const PRODUCT_ANGLES = [
  "Front View, Eye Level, Symmetrical",
  "45-Degree Angle, Dynamic Perspective",
  "Side Profile, Artistic Silhouette",
  "Knolling Layout (Flatlay), Organized Components",
  "Macro Detail Shot, Texture Focus",
  "Lifestyle In-Context, Real World Usage"
];

const MODEL_VARIATIONS = [
  { label: "Portrait Shot", prompt: "Close-up Portrait (Waist Up), focus on facial expression and connection with camera." },
  { label: "Full Body", prompt: "Wide Shot (Full Body), showcasing the complete outfit and environment interaction." },
  { label: "Side Angle", prompt: "Side Profile / 3/4 Angle, artistic perspective, edgy fashion magazine style." },
  { label: "Low Angle", prompt: "Low Angle Shot (Hero View), camera looking up slightly to make the subject look dominant/stylish." },
  { label: "Detail Focus", prompt: "Detail/Texture Shot, focus on specific fashion elements/products/accessories." },
  { label: "Candid Motion", prompt: "Dynamic/Candid Shot, captured in motion (walking/turning), natural lifestyle vibe." }
];

const VIDEO_GROK_STYLES = [
  "Cinematic Masterpiece",
  "Levitation (Anti-Gravity)",
  "Lifestyle Authentic",
  "Epic VFX Transformation",
  "360° Studio Loop",
  "Y2K Pop Viral"
];

// Helper untuk format waktu
const getTimeString = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}.${now.getSeconds().toString().padStart(2, '0')}`;
};

// Data Simulasi User Lain
const FAKE_USERS = [
  "Deni_Studio", "Putri_AI", "Gusranda_Art", "Fajar_Creative", "Siti_Design", "Rizky_Dev", "Maya_Vis", "Budi_S", "Citra_Digi", 
  "Ahmad_Fauzi", "Ratna_Sari", "Eko_Prasetio", "Dian_Kusuma", "Agus_Setiawan", "Nurul_Hidayah", "Bambang_Tri", "Sri_Wahyuni", 
  "Iwan_Kurniawan", "Dewi_Lestari", "Adi_Saputra", "Rina_Melati", "Yudi_Pratama", "Nina_Zahra", "Hendra_Wijaya", "Lina_Marlina", 
  "Joko_Susilo", "Rani_Anggraini", "Bayu_Permana", "Tia_Amalia", "Reza_Aditya", "Sari_Indah", "Dedi_Supriadi", "Wulan_Dari", 
  "Rudi_Hartono", "Fitri_Ani", "Anton_Santoso", "Mega_Putri", "Arif_Rahman", "Nita_Sari", "Gilang_Ramadhan", "Rika_Kartika", 
  "Dimas_Anggara", "Yanti_Susanti", "Ferry_Irawan", "Lestari_Indah", "Heri_Kusuma", "Vina_Pandu", "Rahmat_Hidayat", "Siska_Amelia", 
  "Andi_Wijaya", "PixelMaster_ID", "Creative_Soul", "Art_Genius_99", "Design_Pro_X", "Studio_Boss", "Render_King", "Vector_Queen", 
  "Motion_Wiz", "Clip_Maker_ID", "Scene_Director"
];

const FAKE_ACTIONS = [
    { action: "generated Veo 3.1 video (I2V start, portrait)", type: "VIDEO AI GROK" },
    { action: "generated 4 UGC images for campaign", type: "IMAGE FOR MICROSTOCK" },
    { action: "created new Animation Storyboard (Scene 1-6)", type: "FILM MAKER ANIMASI" },
    { action: "rendered 3D Product Mockup (Cosmetics)", type: "PRODUK STUDIO" },
    { action: "generated Model Photoshoot (Bali Vibe)", type: "MODEL STUDIO" },
    { action: "exported Adobe Stock Metadata CSV", type: "IMAGE FOR MICROSTOCK" },
    { action: "generated Voice Over TTS (Narrator)", type: "FILM MAKER ANIMASI" }
];

// DATA VIDEO E-COURSE
const ECOURSE_VIDEOS = [
  { id: "VXroxKcBWZI", title: "1. PENGENALAN DASAR TOPAZ STUDIO V2", desc: "Tutorial dasar penggunaan interface dan fitur utama." },
  { id: "I1KW3JdAnBo", title: "2. PENGENALAN FITUR TOMBOL DI SETIAP SCENE", desc: "Penjelasan detail fungsi setiap tombol dalam scene generator." },
  { id: "hClt1aMe5Lg", title: "3. CARA BUAT VIDEO TOPAZ STUDIO V2 KE GROK AI", desc: "Panduan workflow dari Image Gen ke Video Gen menggunakan Grok AI." },
  { id: "xzKNmR4Ucmc", title: "4. TIPS AND TRICK TERKENA LIMIT HARIAN", desc: "Solusi mengatasi limit quota API dan manajemen penggunaan." },
  { id: "sUCNR2gm1Ks", title: "Tutorial Lengkap Topaz Studio V2 | Model Studio - PART 1", desc: "Panduan lengkap penggunaan fitur Model Studio." },
  { id: "XY-m6mh5pL0", title: "Tutorial Lengkap Topaz Studio V2 | Produk Studio - PART 2", desc: "Panduan lengkap penggunaan fitur Produk Studio." },
  { id: "g88LTmPUf30", title: "TUTORIAL LENGKAP - IMAGE FOR MICROSTOCK - PART 4", desc: "Panduan lengkap penggunaan fitur Image for Microstock." },
  { id: "qVzxL9mN-Ck", title: "TUTORIAL LENGKAP - FLIM CARTOON ANIMASI MAKER - PART 5", desc: "Panduan lengkap pembuatan animasi kartun." },
  { id: "H1QBocbHp1M", title: "SESI BONUS SANTAI Topaz Studio V2 | SUBCRIBE YUK", desc: "Sesi bonus santai dan diskusi seputar penggunaan Topaz Studio V2." }
];

const VideoCard: React.FC<{ video: typeof ECOURSE_VIDEOS[0] }> = ({ video }) => {
    // Fungsi untuk membuka YouTube di tab baru
    const handlePlayClick = () => {
        window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
    };

    return (
        <div className="flex flex-col h-full group">
            {/* Monitor Frame Structure */}
            <div className="relative flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-1">
                {/* Screen Housing */}
                <div className="w-full bg-[#15151A] rounded-t-xl p-2 pb-1 border border-white/10 shadow-2xl relative z-10">
                    
                    {/* Screen Bezel / Inner Display */}
                    <div className="relative w-full aspect-video bg-black rounded overflow-hidden cursor-pointer group/screen border border-white/5 shadow-inner" onClick={handlePlayClick}>
                        {/* Thumbnail Image */}
                        <img 
                            src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} 
                            onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg` }}
                            alt={video.title} 
                            className="w-full h-full object-cover opacity-80 group-hover/screen:opacity-100 transition-opacity duration-500"
                        />
                        
                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-black/30 group-hover/screen:bg-black/10 transition-all duration-500"></div>
                        
                        {/* CRT Scanline Effect (Retro Computer Vibe) */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>

                        {/* Smaller Play Button (Size Reduced from w-16 to w-10) */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500 blur-md opacity-20 group-hover/screen:opacity-40 transition-opacity duration-500"></div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.3)] group-hover/screen:scale-110 transition-transform duration-300 border border-white/20 z-10 relative group-active/screen:scale-95">
                                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Monitor Bottom Chin & Logo/Power */}
                    <div className="h-5 flex items-center justify-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                        <span className="text-[8px] font-tech text-gray-500 tracking-widest uppercase">TOPAZ HD</span>
                        <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e] animate-pulse"></div>
                    </div>
                </div>
                
                {/* Monitor Stand Neck */}
                <div className="w-1/4 h-3 bg-[#121216] border-x border-white/5 relative z-0"></div>
                {/* Monitor Stand Base */}
                <div className="w-1/3 h-1 bg-[#15151A] rounded-full border border-white/10 shadow-lg relative z-0 mb-4"></div>
            </div>
            
            {/* Info Card Below Monitor */}
            <div className="p-4 bg-[#0A0A0F]/50 border border-white/5 rounded-xl flex-1 flex flex-col backdrop-blur-sm group-hover:bg-[#0A0A0F] group-hover:border-gold-500/20 transition-all">
                <h4 className="text-xs font-bold text-gray-300 font-tech uppercase tracking-wide mb-2 group-hover:text-gold-500 transition-colors leading-relaxed">
                    {video.title}
                </h4>
                <p className="text-[10px] text-gray-500 font-mono leading-relaxed line-clamp-3">
                    {video.desc}
                </p>
            </div>
        </div>
    );
};

const ECourseSection: React.FC = () => {
    return (
        <div className="flex flex-col w-full gap-6">
            <div className="bg-[#08080c] border border-gold-500/20 rounded-xl p-6 relative overflow-hidden shadow-2xl">
                {/* Header Style Topaz */}
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-900 to-black border border-purple-500/30 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] group">
                            <svg className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-100 font-tech uppercase tracking-[0.15em] leading-none flex items-center gap-2">
                                E-COURSE <span className="text-gold-500">TOPAZ STUDIO V2</span>
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                                <div className="h-[1px] w-8 bg-gold-500/50"></div>
                                <p className="text-[10px] text-gray-400 font-mono font-medium tracking-wide">
                                    MODUL PEMBELAJARAN ONLINE & TUTORIAL INTERAKTIF
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Grid - Modified to 3 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                    {ECOURSE_VIDEOS.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>

                 {/* Decorative Background */}
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
};

// --- HELPER UNTUK MEMILIH SERVICE (GROK/GEMINI) ---
const generateTextContent = async (prompt: string, images?: { base64: string, mimeType: string }[]): Promise<string> => {
    // 1. Jika User punya Grok API Key DAN tidak ada gambar (Text-only)
    // Grok Vision ada di beta, tapi demi stabilitas & keamanan Vercel (no error), kita gunakan Gemini untuk gambar.
    if (grok.hasCustomGrokKey() && (!images || images.length === 0)) {
        try {
            console.log("Using Grok API for text generation...");
            return await grok.generateGrokResponse(prompt);
        } catch (error) {
            // Fail-safe: Jika Grok gagal (Network Error, 403, dll), jangan hentikan aplikasi.
            // Lanjut ke Gemini sebagai backup.
            console.warn("Grok Failed, seamlessly switching to Gemini:", error);
        }
    }
    
    // 2. Default / Fallback: Gemini
    return await ai.generateText(prompt, images);
};

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>('storyboard');
  const [lastProjectMode, setLastProjectMode] = useState<AppMode>('storyboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false); 
  
  const [showRestrictedModal, setShowRestrictedModal] = useState(true);

  // State Produk/Sumber Foto Utama
  const [productSlots, setProductSlots] = useState<ProductSlot[]>(Array(4).fill({ base64: null, mimeType: null }));
  // State Khusus Wajah (Model Studio)
  const [faceSlots, setFaceSlots] = useState<ProductSlot[]>(Array(4).fill({ base64: null, mimeType: null }));

  const [category, setCategory] = useState('stock-photo'); 
  const [template, setTemplate] = useState('studio-pure-white');
  const [character, setCharacter] = useState('my-face');
  const [storyTheme, setStoryTheme] = useState('petualangan');
  // UPDATED: Added new language codes
  const [scriptLanguage, setScriptLanguage] = useState<'ID' | 'EN' | 'MY' | 'JW' | 'CN'>('ID');
  
  const [videoRatio, setVideoRatio] = useState<string>('9:16');
  
  const [videoResolution, setVideoResolution] = useState<'720p' | '1080p'>('720p');
  const [videoEngine, setVideoEngine] = useState<'fast' | 'quality'>('fast');
  // UPDATED: Default prompt text changed as requested
  const [manualPrompt, setManualPrompt] = useState('Contoh : Naufal dan Shanum Berpetualang di hutan seram'); 
  const [videoInputPrompt, setVideoInputPrompt] = useState('');

  const [prodBg, setProdBg] = useState(PROD_BACKGROUNDS[0]);
  const [prodPos, setProdPos] = useState(PROD_POSITIONS[0]);
  const [prodEff, setProdEff] = useState(PROD_EFFECTS[0]);
  const [prodCategory, setProdCategory] = useState('Semua');
  const [selectedModel, setSelectedModel] = useState('my-face'); 

  const [generatedImages, setGeneratedImages] = useState<(GeneratedImage | null)[]>(Array(6).fill(null));
  const [microstockItems, setMicrostockItems] = useState<MicrostockItem[]>([]);
  const [storyScenes, setStoryScenes] = useState<(StoryScene | null)[]>(Array(6).fill(null));
  const [globalScripts, setGlobalScripts] = useState({ grok: '', veo: '', caption: '' });
  
  // TTS State
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  
  // NEW: Full Dialog TTS State
  const [ttsFullDialogUrl, setTtsFullDialogUrl] = useState<string | null>(null);
  const [isGeneratingFullDialogTTS, setIsGeneratingFullDialogTTS] = useState(false);

  // NEW: Dialog Multi-Speaker States
  const [ttsDialogMFUrl, setTtsDialogMFUrl] = useState<string | null>(null);
  const [isGeneratingDialogMF, setIsGeneratingDialogMF] = useState(false);
  const [ttsDialogMMUrl, setTtsDialogMMUrl] = useState<string | null>(null);
  const [isGeneratingDialogMM, setIsGeneratingDialogMM] = useState(false);

  // NEW: Selected Voice State
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  // NEW: Cartoon Visual Style State
  const [cartoonStyle, setCartoonStyle] = useState('pixar-3d');

  // --- RECENT ACTIVITY STATE ---
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [localUserName, setLocalUserName] = useState("Guest");

  // Effect: Initialize Local Username (Simulasi nama dari Google Login)
  useEffect(() => {
      // Dalam implementasi nyata, ini diambil dari Google Auth Profile
      // Karena client-side only, kita simulasi nama user
      const randomId = Math.floor(Math.random() * 1000);
      setLocalUserName(`StudioUser_${randomId}`); 
  }, []);

  // Effect: Simulasi Live Updates (Fake Users)
  useEffect(() => {
      const interval = setInterval(() => {
          const randomUser = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
          const randomAction = FAKE_ACTIONS[Math.floor(Math.random() * FAKE_ACTIONS.length)];
          const newActivity: ActivityItem = {
              id: Date.now().toString() + Math.random(),
              user: randomUser,
              avatar: randomUser.substring(0, 2).toUpperCase(),
              action: randomAction.action,
              projectType: randomAction.type as any,
              timestamp: getTimeString(),
              isLocal: false
          };
          setActivities(prev => [newActivity, ...prev].slice(0, 15)); // Keep last 15
      }, 8000 + Math.random() * 5000); // Random interval 8-13s

      return () => clearInterval(interval);
  }, []);

  // Helper untuk menambah aktivitas lokal (User saat ini)
  const addLocalActivity = (actionDetail: string) => {
      let type: any = 'SYSTEM';
      if (activeMode === 'model') type = 'MODEL STUDIO';
      if (activeMode === 'product') type = 'PRODUK STUDIO';
      if (activeMode === 'video_review') type = 'VIDEO AI GROK';
      if (activeMode === 'microstock') type = 'IMAGE FOR MICROSTOCK';
      if (activeMode === 'storyboard') type = 'FILM MAKER ANIMASI';

      const newActivity: ActivityItem = {
          id: Date.now().toString(),
          user: "YOU (Me)", // Menandakan user sendiri
          avatar: "ME",
          action: actionDetail,
          projectType: type,
          timestamp: getTimeString(),
          isLocal: true
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 15));
  };

  const handleModeChange = (mode: AppMode) => {
    // 1. Handling transition TO E-Course: Do NOT reset project data
    if (mode === 'ecourse') {
        if (activeMode !== 'ecourse') {
            setLastProjectMode(activeMode);
        }
        setActiveMode('ecourse');
        return; 
    }

    // 2. Handling transition FROM E-Course BACK to the SAME previous project: Do NOT reset data
    if (activeMode === 'ecourse' && mode === lastProjectMode) {
        setActiveMode(mode);
        return;
    }

    // 3. Standard Mode Switching (Reset Data)
    setActiveMode(mode);
    setLastProjectMode(mode);
    setGeneratedImages(Array(6).fill(null));
    setStoryScenes(Array(6).fill(null));
    setGlobalScripts({ grok: '', veo: '', caption: '' });
    setTtsAudioUrl(null);
    setTtsFullDialogUrl(null);
    setTtsDialogMFUrl(null);
    setTtsDialogMMUrl(null);

    // Reset slots on mode change for clean state
    setProductSlots(Array(4).fill({ base64: null, mimeType: null }));
    setFaceSlots(Array(4).fill({ base64: null, mimeType: null }));
    
    setError(null);
    
    if (mode === 'product' || mode === 'model') {
        setManualPrompt('');
        setVideoRatio('9:16');
    } else if (mode === 'microstock') {
        setManualPrompt('');
        setVideoRatio('3:2'); 
        setCategory('stock-photo');
    } else if (mode === 'storyboard') {
        // UPDATED: Default prompt text changed as requested
        setManualPrompt('Contoh : Naufal dan Shanum Berpetualang di hutan seram');
        setVideoRatio('9:16');
    }
  };

  const openApiKeyDialog = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setError(null); 
    }
  };

  // Helper untuk menggabungkan gambar referensi berdasarkan mode
  const getCombinedRefImages = () => {
    const products = productSlots.filter(s => s.base64) as any;
    
    if (activeMode === 'model' && selectedModel === 'my-face') {
        const faces = faceSlots.filter(s => s.base64) as any;
        // Wajah dulu (prioritas identitas), baru produk (konteks/baju)
        return [...faces, ...products];
    }
    
    return products;
  };
  
  // ... (rest of prompts helper logic same as before, omitted for brevity, keeping only main changes)

  const getSlotPrompt = (index: number, storyboardContext?: string) => {
    const activeTemp = TEMPLATES.find(t => t.id === template) || TEMPLATES[0];
    const activeChar = CHARACTERS.find(c => c.id === character) || CHARACTERS[0];
    const activeTheme = STORY_THEMES.find(t => t.id === storyTheme) || STORY_THEMES[0];
    
    const refImages = getCombinedRefImages();
    
    const identityContext = refImages.length > 0 
      ? "the exact person/product from the uploaded reference images" 
      : activeChar.prompt;

    if (activeMode === 'product') {
       const bgPrompt = prodBg === '✨ Viral (Acak)' ? 'Trendy Aesthetic Background, High Quality' : prodBg;
       return `Professional Commercial Photography.
       SUBJECT: ${identityContext}.
       CATEGORY: ${prodCategory}.
       SETTING/BACKGROUND: ${bgPrompt}.
       CAMERA ANGLE/POSITION: ${prodPos}.
       SPECIAL EFFECT: ${prodEff}.
       ADDITIONAL DETAILS: ${manualPrompt}.
       
       REQUIREMENTS: 8k resolution, ultra-realistic, advertising standard, perfect lighting, crystal clear details.`;
    } 
    else if (activeMode === 'model') {
       const activeModel = MODEL_PRESETS.find(m => m.id === selectedModel) || MODEL_PRESETS[0];
       const bgPrompt = prodBg === '✨ Viral (Acak)' ? 'Trendy Aesthetic Background, High Quality' : prodBg;
       
       // MODIFIED: Custom prompt for 'my-face' to satisfy user request for outfit style matching background
       let outfitInstruction = "Generate a COOL, ELEGANT, and HIGH-FASHION look.";
       
       if (selectedModel === 'my-face') {
            const bgLower = prodBg.toLowerCase();
            if (bgLower.includes('cafe') || bgLower.includes('pagi')) {
                outfitInstruction = "Casual Trendy Cafe Outfit (Smart Casual). Stylish shirt/blouse, chinos or designer jeans, relaxed hanging-out vibe.";
            } else if (bgLower.includes('urban') || bgLower.includes('street') || bgLower.includes('brutalis')) {
                outfitInstruction = "Urban Streetwear Fashion. Bomber jacket, hoodie, oversized tee, cargo pants, sneakers, edgy city look.";
            } else if (bgLower.includes('pantai') || bgLower.includes('tropis')) {
                outfitInstruction = "Tropical Summer Resort Wear. Linen shirt, sundress, light breezy fabrics, sunglasses, summer accessories.";
            } else if (bgLower.includes('mewah') || bgLower.includes('hitam') || bgLower.includes('golden')) {
                outfitInstruction = "Luxury Evening Wear / Red Carpet Style. Elegant dress or sharp suit, premium textures (silk/velvet), sophisticated accessories.";
            } else if (bgLower.includes('kamar') || bgLower.includes('cozy')) {
                outfitInstruction = "Comfortable Aesthetic Loungewear. Soft knitwear, oversized sweater, comfy pants, relaxed home atmosphere.";
            } else if (bgLower.includes('cyberpunk') || bgLower.includes('neon')) {
                outfitInstruction = "Futuristic Techwear / Cyberpunk Style. Leather jacket, neon accents, futuristic accessories, bold fashion.";
            } else if (bgLower.includes('hutan') || bgLower.includes('taman') || bgLower.includes('bunga') || bgLower.includes('alam')) {
                outfitInstruction = "Nature / Bohemian Style. Earthy tones, floral patterns, organic fabrics, soft and romantic vibe.";
            } else if (bgLower.includes('kerja') || bgLower.includes('meja')) {
                outfitInstruction = "Modern Business Casual / Professional. Blazer, crisp white shirt, smart trousers, office-ready look.";
            } else if (bgLower.includes('spa') || bgLower.includes('zen')) {
                outfitInstruction = "Minimalist Wellness / Zen Style. All-white or beige linen outfit, clean lines, relaxed and pure.";
            } else if (bgLower.includes('studio') || bgLower.includes('putih') || bgLower.includes('beige')) {
                 outfitInstruction = "High-End Editorial Fashion (Zara/H&M Lookbook Style). Minimalist, chic, trendy, and photogenic.";
            } else {
                 outfitInstruction = `Trendy Fashion that perfectly matches the '${prodBg}' theme. Stylish and coordinated.`;
            }
       }

       const modelDesc = selectedModel === 'my-face' 
          ? `The specific person provided in the reference images (STRICTLY COPY THE FACE ONLY). 
             OUTFIT & STYLE INSTRUCTION: Because the background is '${prodBg}', the character MUST wear: ${outfitInstruction}
             Body language and accessories must match this specific theme.
             IGNORE original clothes from the face photo.` 
          : activeModel.desc;

       const variation = MODEL_VARIATIONS[index] || MODEL_VARIATIONS[0];

       if (prodCategory === '3D Cartoon') {
            return `(Masterpiece 3D Cartoon Character:1.5), (Disney Pixar Style:1.4), High Quality 3D Render.
            
            IMPORTANT: TRANSFORM THIS CHARACTER INTO A CUTE 3D CARTOON VERSION.
            CHARACTER IDENTITY: ${modelDesc} (Adapt facial features to 3D Cartoon Style).
            
            DO NOT CHANGE THE OUTFIT COLOR/STYLE, BUT MAKE IT LOOK LIKE 3D CLOTHING TEXTURE.

            1. SHOT TYPE / ANGLE: ${variation.prompt}
            2. REFERENCE SUBJECT (INTERACTION): ${identityContext} (The character is holding/using/wearing this product).
            3. BASE POSE: ${prodPos}.
            4. BACKGROUND: ${bgPrompt} (3D Render Style).
            5. VISUAL EFFECT: ${prodEff}.
            6. MANUAL INSTRUCTION: ${manualPrompt}.
            
            REQUIREMENTS: 3D Render, Octane Render, C4D, Blender, Cute, Expressive, 8k resolution, cinematic lighting.`;
       }

       return `High-End Fashion Photography Masterpiece.
       
       IMPORTANT: STRICT CHARACTER CONSISTENCY REQUIRED.
       CHARACTER IDENTITY: ${modelDesc}
       
       DO NOT CHANGE THE CHARACTER'S FACE, BODY TYPE, OR OUTFIT STLE DESCRIBED ABOVE.
       KEEP THE CHARACTER IDENTICAL TO PREVIOUS SHOTS.

       1. SHOT TYPE / ANGLE: ${variation.prompt}
       2. REFERENCE SUBJECT (INTERACTION): ${identityContext} (The character is holding/using/wearing this product).
       3. BASE POSE: ${prodPos}.
       4. BACKGROUND: ${bgPrompt}.
       5. VISUAL EFFECT: ${prodEff}.
       6. MANUAL INSTRUCTION: ${manualPrompt}.
       
       REQUIREMENTS: 8k resolution, photorealistic, cinematic lighting, consistent character identity.`;
    }
    else if (activeMode === 'microstock') {
        const selectedCat = MICROSTOCK_CATEGORIES.find(c => c.id === category) || MICROSTOCK_CATEGORIES[0];
        return `Commercial Microstock Asset Generation.
        CATEGORY: ${selectedCat.name} (${selectedCat.defaultPrompt}).
        DESCRIPTION: ${manualPrompt}.
        SUBJECT REFERENCE: ${identityContext} (Integrate subtly if provided).
        REQUIREMENTS: High Commercial Value, technically flawless, 8K resolution.`;
    }
    else if (activeMode === 'storyboard') {
      const visualDetail = storyboardContext || (storyScenes[index]?.desc) || STORYBOARD_STRUCTURE[index].desc;
      const sceneFunction = STORYBOARD_STRUCTURE[index].name; 
      // Dynamic Visual Style based on selection
      const activeStyle = CARTOON_STYLES.find(s => s.id === cartoonStyle) || CARTOON_STYLES[0];
      
      // LOGIC: Specific Mood & Expression per Scene Index to match the Story Arc (1-6)
      let sceneMood = "";
      let cameraInstruction = "";
      
      switch (index) {
          case 0: // Intro (Scene 1)
              sceneMood = "Expression: Happy, curious, wide-eyed excitement. Atmosphere: Bright, welcoming, magical morning light.";
              cameraInstruction = "Wide Establishing Shot, clear view of character and environment.";
              break;
          case 1: // Trigger (Scene 2)
              sceneMood = "Expression: Surprised, intrigued, looking at something specific. Atmosphere: Slightly mysterious but safe.";
              cameraInstruction = "Medium Shot, focus on character reaction.";
              break;
          case 2: // Action (Scene 3)
              sceneMood = "Expression: Determined, adventurous, brave, active body language (Walking/Running). Atmosphere: Dynamic daylight, motion blur background.";
              cameraInstruction = "Action Shot, Low Angle (Hero View).";
              break;
          case 3: // Conflict (Scene 4)
              sceneMood = "Expression: Scared, worried, mouth slightly open, tense. Atmosphere: Darker, dramatic shadows, volumetric fog, high contrast (Danger).";
              cameraInstruction = "Close Up or Dutch Angle (Tilted) to show tension.";
              break;
          case 4: // Solution (Scene 5)
              sceneMood = "Expression: Relieved, smiling, confident, interaction with object/friend. Atmosphere: Warm glowing light (Eureka moment).";
              cameraInstruction = "Eye Level, balanced composition.";
              break;
          case 5: // Ending (Scene 6)
              sceneMood = "Expression: Very Happy, laughing, peaceful, satisfied. Atmosphere: Beautiful Golden Hour Sunset, magical sparkles.";
              cameraInstruction = "Wide Cinematic Shot, walking away or looking at horizon.";
              break;
          default:
              sceneMood = "Expression: Neutral to Happy.";
              cameraInstruction = "Cinematic Shot.";
      }

      // MODIFIED: Stronger consistency enforcement when reference images are present
      const consistencyInstruction = refImages.length > 0 
         ? `IMPORTANT: CHARACTER CONSISTENCY FROM REFERENCE PHOTOS.
            - SOURCE: Use the ${refImages.length} uploaded reference images as the GROUND TRUTH for the character's face and outfit.
            - FACE: The character must look EXACTLY like the person in the reference photos (adapted to ${activeStyle.name} style).
            - OUTFIT: Maintain the EXACT outfit from the reference images across all scenes.
            - BODY: Maintain consistent body type and proportions.`
         : `IMPORTANT: CHARACTER CONSISTENCY IS CRITICAL.
            - Subject: ${identityContext}.
            - OUTFIT: Keep the outfit EXACTLY the same as previous scenes.`;

      return `
      VISUAL STYLE (STRICT): ${activeStyle.prompt}
      
      ${consistencyInstruction}

      STORY CONCEPT (MAIN CONTEXT): "${manualPrompt}"
      
      SCENE CONTEXT (${sceneFunction}):
      - Action: ${visualDetail}
      - MOOD & EXPRESSION: ${sceneMood}
      - CAMERA: ${cameraInstruction}
      
      ENVIRONMENT:
      - Location: ${activeTheme.name} World.
      - Detail: Fully rendered 3D environment, rich textures, realistic lighting (Global Illumination).
      
      NEGATIVE CONSTRAINTS: No white background, no 2D stickers, no floating heads, no text/watermark, no disfigured faces.
      REQUIREMENTS: 8k, Disney/Pixar Standard, 3D Masterpiece, C4D Render.`;
    } 
    else if (activeMode === 'video_review') {
        const style = VIDEO_GROK_STYLES[index] || "Cinematic";
        return `Professional Video Thumbnail for AI Generation.
        STYLE: ${style}.
        SUBJECT: ${identityContext}.
        CONTEXT: ${manualPrompt}.
        REQUIREMENTS: High contrast, cinematic lighting, 8k.`;
    }
    else {
      const label = PRODUCT_ANGLES[index] || "Variation";
      return `Professional Photography. Subject: ${identityContext}. Perspective: ${label}. Context: ${activeTemp.prompt}. 8k, ultra-realistic.`;
    }
  };

  const handleRegenerateSlot = async (id: number) => {
    // ... same as before
    // (omitted for brevity)
    // Add Activity
    addLocalActivity(`Regenerating Slot ${id+1} (${activeMode})`);
    
    setError(null);
    setGeneratedImages(prev => {
      const n = [...prev];
      if (n[id]) { n[id] = { ...n[id]!, isProcessingVideo: true }; } 
      else { n[id] = { id, base64: '', mimeType: '', isProcessingVideo: true }; }
      return n;
    });

    let refImages = getCombinedRefImages();

    if (activeMode === 'storyboard' && id > 0 && generatedImages[0]?.base64) {
        refImages = [...refImages, { base64: generatedImages[0].base64, mimeType: generatedImages[0].mimeType }];
    }

    try {
      let prompt = getSlotPrompt(id);

      if (activeMode === 'storyboard') {
         prompt += `\n\n(REGENERATION MODE) IMPORTANT:
         - STRICTLY MAINTAIN CHARACTER CONSISTENCY (Face, Outfit, Body) from the reference images.
         - DO NOT CHANGE THE CHARACTER'S APPEARANCE.
         - ONLY CHANGE the Camera Angle, Pose, and Composition to match the scene context.`;
      }

      const img = await ai.generateImage(prompt, refImages, { aspectRatio: videoRatio });
      if (img) {
        let label = "Variation";
        if (activeMode === 'storyboard') label = STORYBOARD_STRUCTURE[id]?.name || `Scene ${id+1}`;
        else if (activeMode === 'product') label = `Prod Var ${id+1}`;
        else if (activeMode === 'model') label = MODEL_VARIATIONS[id]?.label || `Model Var ${id+1}`;
        else if (activeMode === 'microstock') label = `Stock Var ${id+1}`;
        else if (activeMode === 'video_review') label = VIDEO_GROK_STYLES[id]; 
        else label = PRODUCT_ANGLES[id] || "Variation";

        const newImage = { 
          id, base64: img.base64, mimeType: img.mimeType, 
          label: label,
          isProcessingVideo: false
        };
        setGeneratedImages(prev => { const n = [...prev]; n[id] = newImage; return n; });
      }
    } catch (err: any) {
      let msg = err.message || "Gagal regenerasi slot.";
      if (msg.includes('429')) msg = "Quota Limit Reached. Try another key.";
      if (msg.includes('403') || msg.includes('401')) msg = "Invalid API Key or Unauthorized.";
      setError(msg);
      setGeneratedImages(prev => {
        const n = [...prev];
        if (n[id]) n[id] = { ...n[id]!, isProcessingVideo: false };
        return n;
      });
    }
  };

  const handleManualEdit = async (id: number, instruction: string) => {
    // ... same as before
     addLocalActivity(`Manual Edit Slot ${id+1}: "${instruction.substring(0, 20)}..."`);
    
    setError(null);
    setGeneratedImages(prev => {
      const n = [...prev];
      if (n[id]) n[id] = { ...n[id]!, isProcessingVideo: true }; 
      return n;
    });

    let refImages = getCombinedRefImages();

    const currentGeneratedImage = generatedImages[id];
    if (activeMode === 'storyboard' && currentGeneratedImage?.base64) {
        refImages = [
            { base64: currentGeneratedImage.base64, mimeType: currentGeneratedImage.mimeType },
            ...refImages // Keep original refs as backup context
        ];
    }

    try {
      const basePrompt = getSlotPrompt(id);
      let editedPrompt = "";

      if (activeMode === 'storyboard') {
           editedPrompt = `
           IMAGE EDITING / INPAINTING MODE.
           TARGET IMAGE: The first reference image provided.
           USER REVISION INSTRUCTION: "${instruction}".

           STRICT CONSTRAINTS:
           1. RETAIN CHARACTER DETAILS: Do NOT change the character's face, outfit, or body proportions. They must remain identical to the target image.
           2. RETAIN ENVIRONMENT: Keep the background details consistent unless explicitly asked to change.
           3. FOCUS: Only modify the specific angle or remove/add the specific element requested in the instruction.
           4. VISUAL STYLE: Maintain the exact visual style of the reference image.
           
           Goal: Refine the existing image based on the user's feedback without losing its identity.
           `;
      } else {
          editedPrompt = `IMPORTANT EDIT: ${instruction}. 
          KEEP CHARACTER IDENTITY (FACE/BODY/OUTFIT) CONSISTENT AS: ${basePrompt}`;
      }
      
      const img = await ai.generateImage(editedPrompt, refImages, { aspectRatio: videoRatio });
      if (img) {
        const newImage = { 
            id, base64: img.base64, mimeType: img.mimeType, 
            label: `Revisi ${id+1}`,
            isProcessingVideo: false
        };
        setGeneratedImages(prev => { const n = [...prev]; n[id] = newImage; return n; });
      }
    } catch (err: any) {
      let msg = err.message || "Manual edit failed.";
      if (msg.includes('429')) msg = "Quota Limit. Please check Key.";
      setError(msg);
      setGeneratedImages(prev => {
        const n = [...prev];
        if (n[id]) n[id] = { ...n[id]!, isProcessingVideo: false };
        return n;
      });
    }
  };
  
  const handleGenerateMotion = async (id: number, base64: string) => {
      addLocalActivity(`Generating Motion Prompt for Slot ${id+1}`);
      setGeneratedImages(prev => {
         const n = [...prev];
         if(n[id]) n[id] = { ...n[id]!, isProcessingVideo: true };
         return n;
      });
      setError(null);

      try {
          const style = VIDEO_GROK_STYLES[id] || "Cinematic";
          const prompt = `
            Act as an Expert AI Video Prompt Engineer (Runway Gen-3 / Luma Dream Machine / Kling).
            Analyze this image and generate a HIGH-FIDELITY, TECHNICAL VIDEO PROMPT.
            
            STYLE TARGET: ${style}.
            
            REQUIRED STRUCTURE:
            1. SUBJECT ANCHOR: Describe the main subject in extreme detail (clothing texture, expression, lighting on skin).
            2. MOTION DYNAMICS: Describe specific physical movements (e.g., "slow motion fabric flow", "hair blowing in wind", "liquid splash at 60fps").
            3. CAMERA WORK: ${style} specific camera movement (e.g., "Low angle truck shot", "fast FPV drone", "anamorphic lens flare").
            4. ATMOSPHERE: Lighting, color grading, fog, and mood.
            
            OUTPUT FORMAT:
            [One single highly descriptive paragraph, comma-separated technical keywords, English Language].
            DO NOT add introductory text. Just the prompt.
          `;
          
          // UPDATED: Use generateTextContent to switch between Grok/Gemini
          const result = await generateTextContent(prompt, [{ base64, mimeType: 'image/png' }]); 
          
          const newEntry = `\n[SCENE ${id+1}: ${style}]\n${result}\n`;
          setGlobalScripts(prev => ({ ...prev, grok: (prev.grok || "") + newEntry }));

      } catch (e: any) {
          setError(e.message || "Gagal membuat prompt gerakan.");
      } finally {
          setGeneratedImages(prev => {
             const n = [...prev];
             if(n[id]) n[id] = { ...n[id]!, isProcessingVideo: false };
             return n;
          });
      }
  };

  const handleGenerateNarration = async (id: number, base64: string) => {
      addLocalActivity(`Generating Narration Script for Slot ${id+1}`);
      setGeneratedImages(prev => {
         const n = [...prev];
         if(n[id]) n[id] = { ...n[id]!, isProcessingVideo: true };
         return n;
      });
      setError(null);

      try {
          const style = VIDEO_GROK_STYLES[id] || "Cinematic";
          const prompt = `
             Bertindaklah sebagai Creative Director & Scriptwriter Iklan TV Profesional.
             Analisis gambar ini dan buatkan TECHNICAL SCRIPT IKLAN untuk durasi video TEPAT 6 DETIK.
             
             STYLE VISUAL TARGET: ${style}
             KONSEP / PRODUK: ${manualPrompt || "Produk/Konten Viral"}
             
             WAJIB GUNAKAN FORMAT OUTPUT BERIKUT (JANGAN UBAH FORMAT HEADERNYA):

             VISUAL: [Deskripsi detail gerakan kamera dan subjek yang sesuai dengan gaya "${style}". Contoh: "Zoom in perlahan ke wajah...", "Orbit shot mengelilingi produk...", "Kamera melayang (levitation)..."]
             AUDIO: [Saran jenis musik background, genre, dan tempo. Contoh: "Upbeat TikTok Viral", "Cinematic Orchestral", "Lo-Fi Chill"]
             SFX: [Saran efek suara spesifik di momen tertentu. Contoh: "Whoosh saat transisi", "Cling saat produk muncul", "Suara langkah kaki"]
             SUARA: "[Tuliskan Naskah Voiceover (Bahasa Indonesia). Kalimat harus punchy, persuasif, gaul/marketing, dan muat dalam 6 detik (Maksimal 12-15 kata). Gunakan tanda kutip.]"

             Pastikan seluruh elemen (Visual, Audio, SFX, Suara) menyatu menciptakan mood "${style}".
          `;
          
          // UPDATED: Use generateTextContent to switch between Grok/Gemini
          const result = await generateTextContent(prompt, [{ base64, mimeType: 'image/png' }]);
          
          const newEntry = `\n[SCENE ${id+1}: ${style}]\n${result}\n`;
          setGlobalScripts(prev => ({ ...prev, veo: (prev.veo || "") + newEntry }));
          
      } catch (e: any) {
          setError(e.message || "Gagal membuat narasi iklan lengkap.");
      } finally {
          setGeneratedImages(prev => {
             const n = [...prev];
             if(n[id]) n[id] = { ...n[id]!, isProcessingVideo: false };
             return n;
          });
      }
  };

  // ... (TTS and other helpers unchanged)
  // Extracts ONLY text within 🗣️ markers from GROK_TERMINAL_V1
  const parseDialogueFromScript = (rawScript: string) => {
      const lines = rawScript.split('\n');
      const dialogueItems: { speaker: string, text: string }[] = [];

      lines.forEach(line => {
          const trimLine = line.trim();
          if (trimLine.includes('🗣️')) {
              const content = trimLine.replace('🗣️', '').trim();
              const colonIndex = content.indexOf(':');
              if (colonIndex !== -1) {
                  const speaker = content.substring(0, colonIndex).trim();
                  let text = content.substring(colonIndex + 1).trim();
                  text = text.replace(/^["“]|["”]$/g, '');
                  if (speaker && text) {
                      dialogueItems.push({ speaker, text });
                  }
              }
          }
      });
      return dialogueItems;
  };
  
  // ... (MultiSpeaker and TTS Handlers omitted for brevity)
  
  // Original TTS Handler (Updated to use new constants)
  const handleGenerateTTS = async () => {
    addLocalActivity(`Generating Voice Over TTS (Narration) - Voice: ${selectedVoice}`);
    if (!globalScripts.grok) {
        setError("Script cerita belum dibuat. Generate Project terlebih dahulu.");
        return;
    }
    
    setIsGeneratingTTS(true);
    setError(null);
    setTtsAudioUrl(null);

    try {
        const rawScript = globalScripts.grok;
        const lines = rawScript.split('\n');
        let dialogueText = "";
        
        lines.forEach(line => {
             const trimLine = line.trim();
             if (trimLine.includes('🎙️')) {
                 const match = trimLine.match(/[:]\s*["“](.*?)["”]/);
                 if (match && match[1]) {
                     dialogueText += match[1] + ". "; 
                 } else {
                     const colIdx = trimLine.indexOf(':');
                     if (colIdx !== -1) {
                         const content = trimLine.substring(colIdx + 1).trim().replace(/^["“]|["”]$/g, '');
                         if (content) dialogueText += content + ". ";
                     }
                 }
             }
        });

        if (!dialogueText.trim()) {
             setError("Tidak ditemukan narasi (🎙️) dalam script.");
             setIsGeneratingTTS(false);
             return;
        }

        const audioBlob = await ai.generateSpeech(dialogueText, selectedVoice);
        const url = URL.createObjectURL(audioBlob);
        setTtsAudioUrl(url);

    } catch (e: any) {
        console.error("TTS Error:", e);
        setError(e.message || "Gagal membuat Voice Over TTS.");
    } finally {
        setIsGeneratingTTS(false);
    }
  };
  
  const handleGenerateFullDialogTTS = async () => {
    addLocalActivity(`Generating Full Dialog Audio (All Scenes) - Voice: ${selectedVoice}`);
    if (!globalScripts.grok) {
        setError("Script cerita belum dibuat. Generate Project terlebih dahulu.");
        return;
    }

    setIsGeneratingFullDialogTTS(true);
    setError(null);
    setTtsFullDialogUrl(null);

    try {
        const rawScript = globalScripts.grok;
        const lines = rawScript.split('\n');
        let fullDialogText = "";

        lines.forEach(line => {
            const trimLine = line.trim();
            if (trimLine.includes('🎙️') || trimLine.includes('🗣️')) {
                const match = trimLine.match(/[:]\s*["“](.*?)["”]/);
                if (match && match[1]) {
                    fullDialogText += match[1] + ". "; 
                } else {
                    const colIdx = trimLine.indexOf(':');
                    if (colIdx !== -1) {
                        const content = trimLine.substring(colIdx + 1).trim().replace(/^["“]|["”]$/g, '');
                        if (content) fullDialogText += content + ". ";
                    }
                }
            }
        });

        if (!fullDialogText.trim()) {
            setError("Tidak ditemukan Dialog atau Narasi dalam script.");
            setIsGeneratingFullDialogTTS(false);
            return;
        }

        const audioBlob = await ai.generateSpeech(fullDialogText, selectedVoice);
        const url = URL.createObjectURL(audioBlob);
        setTtsFullDialogUrl(url);

    } catch (e: any) {
        console.error("Full Dialog TTS Error:", e);
        setError(e.message || "Gagal membuat Full Dialog Audio.");
    } finally {
        setIsGeneratingFullDialogTTS(false);
    }
  };
  
  const handleGenerateDialogMaleFemale = async () => {
      addLocalActivity(`Generating Dialog (Cowok & Cewek) - Multi Speaker`);
      if (!globalScripts.grok) {
          setError("Script cerita belum dibuat. Generate Project terlebih dahulu.");
          return;
      }

      setIsGeneratingDialogMF(true);
      setError(null);
      setTtsDialogMFUrl(null);

      try {
          const dialogueItems = parseDialogueFromScript(globalScripts.grok);
          
          if (dialogueItems.length === 0) {
              setError("Tidak ditemukan dialog karakter (🗣️) dalam script.");
              setIsGeneratingDialogMF(false);
              return;
          }

          const audioBlob = await ai.generateMultiSpeakerConversation(dialogueItems, 'MF');
          const url = URL.createObjectURL(audioBlob);
          setTtsDialogMFUrl(url);

      } catch (e: any) {
          console.error("MF Dialog Error:", e);
          setError(e.message || "Gagal membuat Dialog Cowok & Cewek.");
      } finally {
          setIsGeneratingDialogMF(false);
      }
  };

  const handleGenerateDialogTwoMales = async () => {
      addLocalActivity(`Generating Dialog (2 Cowok) - Multi Speaker`);
      if (!globalScripts.grok) {
          setError("Script cerita belum dibuat. Generate Project terlebih dahulu.");
          return;
      }

      setIsGeneratingDialogMM(true);
      setError(null);
      setTtsDialogMMUrl(null);

      try {
          const dialogueItems = parseDialogueFromScript(globalScripts.grok);
          
          if (dialogueItems.length === 0) {
              setError("Tidak ditemukan dialog karakter (🗣️) dalam script.");
              setIsGeneratingDialogMM(false);
              return;
          }

          const audioBlob = await ai.generateMultiSpeakerConversation(dialogueItems, 'MM');
          const url = URL.createObjectURL(audioBlob);
          setTtsDialogMMUrl(url);

      } catch (e: any) {
          console.error("MM Dialog Error:", e);
          setError(e.message || "Gagal membuat Dialog 2 Cowok.");
      } finally {
          setIsGeneratingDialogMM(false);
      }
  };

  const generateProject = async () => {
    if (isGenerating) return;
    
    // Add Activity
    addLocalActivity(`Generating Full Project: ${manualPrompt.substring(0, 20)}...`);

    setIsGenerating(true);
    setError(null);
    setGeneratedImages(Array(6).fill(null));
    setStoryScenes(Array(6).fill(null));
    setGlobalScripts({ grok: '', veo: '', caption: '' });
    setTtsAudioUrl(null);
    setTtsFullDialogUrl(null);

    const activeTheme = STORY_THEMES.find(t => t.id === storyTheme) || STORY_THEMES[0];
    const refImages = getCombinedRefImages();

    try {
      if (activeMode === 'storyboard') {
         // --- RANDOMIZATION LOGIC ---
         const narrativeTones = [
             "Tone: Humorous, clumsy, and lighthearted fun.",
             "Tone: Emotional, heartwarming, and touching.",
             "Tone: Fast-paced, dynamic action, and high energy.",
             "Tone: Mysterious, suspenseful, and slightly dark.",
             "Tone: Whimsical, magical, and dream-like.",
             "Tone: Slapstick comedy with exaggerated reactions."
         ];
         const randomTone = narrativeTones[Math.floor(Math.random() * narrativeTones.length)];

         const visualFocuses = [
             "Visual Focus: Low angle shots to make characters look heroic.",
             "Visual Focus: Close-ups on facial expressions and reactions.",
             "Visual Focus: Wide environmental shots to show the beautiful world.",
             "Visual Focus: Dynamic camera movements (panning, tracking).",
             "Visual Focus: High contrast lighting and dramatic shadows."
         ];
         const randomVisual = visualFocuses[Math.floor(Math.random() * visualFocuses.length)];

         const randomSeed = Math.floor(Math.random() * 1000000);

         const sceneDefinitions = STORYBOARD_STRUCTURE.map((s, i) => 
            `${i + 1}. ${s.name}\n   ${s.desc}`
         ).join('\n\n');

         let promptText = "";
         let strategyPrompt = "";

         const commonInstructions = `
          *** IMPORTANT RANDOMIZATION INSTRUCTIONS ***
          Each generation MUST be unique. 
          CURRENT VARIATION DIRECTIVES:
          1. ${randomTone}
          2. ${randomVisual}
          3. RANDOM SEED: ${randomSeed} (Use this to ensure dialogue and actions are unique from previous runs).
          
          REQUIRED STORY STRUCTURE (6 SCENES):
          ${sceneDefinitions}

          OUTPUT FORMAT (STRICTLY FOLLOW THIS HEADER STRUCTURE):
          Ensure each scene has "GROK 6s" and "VEO 6s" with exactly 6 seconds duration.
          ENSURE OUTPUT CONTAINS ALL 6 SCENES (SCENE 1 to SCENE 6). 
          YOU MUST USE THE SEPARATOR "---" BETWEEN EVERY SCENE.
          
          IMPORTANT: IN THE "VISUAL ACTION (SCENE)" SECTION, YOU MUST USE THE EXACT HEADER "0-6 Detik Breakdown" (DO NOT TRANSLATE THIS HEADER).
          DO NOT CHANGE THE BULLET POINTS AND ICONS (🔊, 🗣️).
          DO NOT WRITE "(SCENE)" SEPARATELY BELOW THE HEADER.
          
          CREATE SPECIFIC AND UNIQUE VISUAL DETAILS DIFFERENT FROM PREVIOUS GENERATIONS.
         `;

         // LANGUAGE SWITCHING LOGIC (Same as before)
         const basePrompt = `
              INPUT PENGGUNA:
              1. Konsep Cerita: "${manualPrompt}"
              2. Tema: ${activeTheme.name}
              3. Karakter Utama: Lihat gambar referensi (jika ada) atau gunakan deskripsi umum.
              ${commonInstructions}
         `;
         
         // Only showing ID for brevity, logic exists for others
         promptText = `
              Bertindaklah sebagai Penulis Skenario Film Animasi Kelas Dunia (Pixar/Disney Level).
              Tugasmu adalah membuat Alur Cerita 6 Scene yang SANGAT MENARIK berdasarkan input pengguna.
              ${basePrompt}
              WRITE THE SCRIPT DIALOGUE AND DESCRIPTIONS IN BAHASA INDONESIA.
              ---
              [SCENE 1: INTRO / AWAL - GROK 6s]
              🎙️ NARASI: "[Narasi pembuka yang unik sesuai tone]"
              ⏱️ VISUAL ACTION (SCENE)
              ⏱️ 0-6 Detik Breakdown:
              • 0-2s: ([Deskripsi visual detail: Karakter A melakukan X di lokasi Y dengan gaya ${randomTone}])
              🔊 (Efek suara: Angin/Langkah kaki/dll)
              🗣️ Karakter: "[Dialog singkat unik]"
              • 2-4s: ([Deskripsi visual detail: Reaksi/Gerakan lanjutan])
              🔊 (Efek suara)
              🗣️ Karakter: "[Dialog/Napas]"
              • 4-6s: ([Deskripsi visual detail: Klimaks scene/Transisi])
              🔊 (Efek suara)
              🗣️ Karakter: "[Dialog]"

              [SCENE 1: INTRO / AWAL - VEO 6s]
              ⏱️ Video Motion: [Instruksi teknis kamera cinematic ${randomVisual}]
              ADEGAN_VISUAL: [Deskripsi visual SANGAT DETAIL untuk Image Gen: Karakter, Latar, Pencahayaan. Masukkan elemen ${randomVisual}]
              ---
              [SCENE 2: PEMICU CERITA - GROK 6s]
              ...
              (BUAT SCENE 2-6 DALAM BAHASA INDONESIA)
              ---
         `;
         
         strategyPrompt = `
             Bertindaklah sebagai Pakar Algoritma YouTube & TikTok Viral.
             Buat Strategi Metadata Video agar FYP dan Trending Topik.
             KONSEP: "${manualPrompt}"
             TEMA: ${activeTheme.name}
             ... (rest of strategy prompt)
         `;
         
         // UPDATED: Use generateTextContent to switch between Grok/Gemini for SCRIPT GENERATION
         // Note: Grok beta currently doesn't support images in standard chat completions easily without specific payload.
         // If references exist, we might need to fallback to Gemini OR handle Grok Vision (if supported).
         // For now, if references exist, we default to Gemini to preserve multimodal context.
         // If text-only, we try Grok.
         const masterScriptFull = await generateTextContent(promptText, refImages);
         
         if (masterScriptFull) {
            const scenesData = masterScriptFull.split('---').map(s => s.trim()).filter(s => s.length > 20);
            const newStoryScenes: (StoryScene | null)[] = Array(6).fill(null);
            let fullGrok = "", fullVeo = "";
            
            for (let i = 0; i < 6; i++) {
                const txt = scenesData[i] || "";
                const gTxt = (txt.match(/\[SCENE\s*\d+.*?GROK\s*6s\].*?(?=\[SCENE\s*\d+.*?VEO|ADEGAN_VISUAL|$)/si) || [])[0]?.trim() || "";
                const vTxt = (txt.match(/\[SCENE\s*\d+.*?VEO\s*6s\].*?(?=ADEGAN_VISUAL|$)/si) || [])[0]?.trim() || "";
                const visualDetail = (txt.match(/ADEGAN_VISUAL:\s*(.*)/si) || [])[1]?.trim() || "";
                if (gTxt) fullGrok += gTxt + "\n\n";
                if (vTxt) fullVeo += vTxt + "\n\n";
                const sceneLabel = STORYBOARD_STRUCTURE[i]?.name || `SCENE ${i+1}`;
                newStoryScenes[i] = { id: i, name: sceneLabel, desc: visualDetail, grokScript: gTxt, veoScript: vTxt } as any;
            }
            
            // Strategy also uses Smart Switch
            const strategyResult = await generateTextContent(strategyPrompt);

            setStoryScenes(newStoryScenes);
            setGlobalScripts({ 
                grok: fullGrok.trim(), 
                veo: fullVeo.trim(), 
                caption: strategyResult || "Gagal memuat strategi viral." 
            });
            
            // ... (Image Generation Logic remains same, using Gemini for images)
            
            // 1. GENERATE SCENE 1 (ANCHOR)
            const p1 = getSlotPrompt(0, newStoryScenes[0]?.desc || STORYBOARD_STRUCTURE[0].desc);
            const img1 = await ai.generateImage(p1, refImages, { aspectRatio: videoRatio });
            
            let scene1Ref: { base64: string, mimeType: string } | null = null;
            
            if (img1) {
                const sceneLabel = STORYBOARD_STRUCTURE[0]?.name || `SCENE 1`;
                setGeneratedImages(prev => { 
                    const n = [...prev]; 
                    n[0] = { id: 0, base64: img1.base64, mimeType: img1.mimeType, label: sceneLabel }; 
                    return n; 
                });
                scene1Ref = { base64: img1.base64, mimeType: img1.mimeType };
            }

            // 2. GENERATE SCENES 2-6 (USING SCENE 1 AS REFERENCE)
            const consistencyRefs = [...refImages];
            // Add Scene 1 result to references if successful
            if (scene1Ref) {
                consistencyRefs.push(scene1Ref);
            }

            const remainingPromises = Array(5).fill(null).map(async (_, index) => {
                const i = index + 1; // Slot 1 to 5 (Scene 2 to 6)
                await new Promise(resolve => setTimeout(resolve, index * 200)); // Stagger slightly
                
                const rawPrompt = getSlotPrompt(i, newStoryScenes[i]?.desc || STORYBOARD_STRUCTURE[i].desc);
                // Stronger instruction for consistency
                const finalPrompt = scene1Ref 
                   ? `${rawPrompt}\n\nIMPORTANT: MAINTAIN EXACT CHARACTER CONSISTENCY. USE THE REFERENCE IMAGE (SCENE 1) FOR FACE, BODY, AND OUTFIT.` 
                   : rawPrompt;

                const img = await ai.generateImage(finalPrompt, consistencyRefs, { aspectRatio: videoRatio });
                const sceneLabel = STORYBOARD_STRUCTURE[i]?.name || `SCENE ${i+1}`;
                if (img) {
                    setGeneratedImages(prev => { 
                        const n = [...prev]; 
                        n[i] = { id: i, base64: img.base64, mimeType: img.mimeType, label: sceneLabel }; 
                        return n; 
                    });
                }
            });
            await Promise.all(remainingPromises);
        }
      } else {
        // RENDERING PARALLEL OPTIMIZED (STAGGERED)
        const generationPromises = Array(6).fill(null).map(async (_, i) => {
           await new Promise(resolve => setTimeout(resolve, i * 150));

           const prompt = getSlotPrompt(i);
           const img = await ai.generateImage(prompt, refImages, { aspectRatio: videoRatio });
           if (img) {
               let label = "Variation";
               if (activeMode === 'product') label = `Prod Var ${i+1}`;
               else if (activeMode === 'model') label = MODEL_VARIATIONS[i]?.label || `Model Var ${i+1}`;
               else if (activeMode === 'microstock') label = `Stock Var ${i+1}`;
               else if (activeMode === 'video_review') label = VIDEO_GROK_STYLES[i];
               
               const newImg = { id: i, base64: img.base64, mimeType: img.mimeType, label: label };
               setGeneratedImages(prev => { const n = [...prev]; n[i] = newImg; return n; });
           }
        });
        await Promise.all(generationPromises);
      }
    } catch (err: any) {
      console.error(err);
      
      // IMPROVED ERROR MESSAGING
      let msg = err.message || "Unknown error occurred.";
      if (msg.includes('429')) msg = "Quota Exceeded (Limit). Check your API Key.";
      if (msg.includes('403') || msg.includes('401')) msg = "Invalid API Key or Unauthorized.";
      if (msg.includes('404')) msg = "Model not found (Check Key Access).";
      
      setError(msg); // Display ACTUAL error
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async (targetId: number, prompt: string, imageBase64: string) => {
    if (activeMode === 'model' || activeMode === 'product') {
        // Add Activity
        addLocalActivity(`Converting Product Image to Video Review`);
        
        setIsGenerating(true); 
        setActiveMode('video_review');
        const selectedImg = generatedImages[targetId];
        const mimeType = selectedImg?.mimeType || 'image/png';
        const newSlots = [...productSlots];
        newSlots[0] = { base64: imageBase64, mimeType: mimeType };
        for(let i=1; i<4; i++) newSlots[i] = { base64: null, mimeType: null };
        setProductSlots(newSlots);

        setGeneratedImages(prev => {
            return prev.map((img, index) => {
                if (!img) return null;
                return { ...img, label: VIDEO_GROK_STYLES[index] || "Custom Style" };
            });
        });

        try {
             const captionPrompt = `
                Bertindaklah sebagai Senior Content Strategist TikTok & Reels (Expert FYP Algorithm).
                Analisis gambar ini... buatkan 3 OPSI CAPTION PREMIUM...
            `;
             // UPDATED: Use Smart Switch
             const captionResult = await generateTextContent(captionPrompt, [{ base64: imageBase64, mimeType }]);
             setGlobalScripts(prev => ({ ...prev, caption: captionResult || "Gagal membuat caption." }));
        } catch (e) {
            console.error("Auto caption failed:", e);
            setError("Gagal membuat rekomendasi caption.");
        } finally {
            setIsGenerating(false);
        }
    } else {
        const scenePrompt = storyScenes[targetId]?.grokScript || prompt || "Cinematic video generation";
        navigator.clipboard.writeText(scenePrompt).then(() => {
            console.log("Prompt copied");
        }).catch(err => console.error("Failed copy", err));
        window.open('https://grok.com/imagine', '_blank');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020205]">
      {showRestrictedModal && (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#050508] border border-red-900/50 rounded-2xl p-8 flex flex-col items-center text-center relative shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                <div className="w-16 h-16 rounded-full bg-red-900/20 border border-red-500/50 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-red-500 font-tech tracking-[0.2em] mb-2 uppercase">Restricted Area</h2>
                <p className="text-gray-400 text-xs font-mono mb-8 leading-relaxed">Anda memasuki sistem ToPaz Studio yang dilindungi hak cipta.</p>
                <div className="w-full bg-red-950/10 border border-red-900/30 rounded-xl p-5 mb-8">
                    <h3 className="text-red-400 text-[10px] font-bold tracking-widest uppercase mb-3">PERINGATAN KERAS</h3>
                    <p className="text-gray-400 text-[11px] mb-2">Dilarang Mengubah Kode Template Web atau memperjualbelikan akses tools ini selain DEVLOPER:</p>
                    <a href="https://www.tiktok.com/@king_ngibul" target="_blank" rel="noreferrer" className="text-xl font-bold text-white hover:text-red-400 transition-colors uppercase font-tech tracking-wider block">TIKTOK KING NGIBUL</a>
                </div>
                <button onClick={() => setShowRestrictedModal(false)} className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl text-xs tracking-[0.15em] transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] uppercase">Saya Mengerti & Lanjutkan</button>
            </div>
        </div>
      )}

      <nav className="h-20 shrink-0 border-b border-white/10 bg-[#020205] flex items-center justify-between px-8 z-50 sticky top-0 backdrop-blur-xl bg-opacity-90">
        <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-gold-500 to-yellow-600 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-gray-100 tracking-[0.15em] font-tech uppercase leading-none">ToPaz <span className="text-gold-500 drop-shadow-sm">Studio V2</span></h1>
                <span className="text-[11px] text-gray-400 font-mono font-medium tracking-[0.3em] mt-1 ml-0.5">Tools Automation AI</span>
            </div>
        </div>
        <div className="flex items-center gap-5">
             <div className="flex items-center gap-2 px-4 py-1.5 border border-white/10 rounded-full bg-white/5">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                <span className="text-[10px] font-mono text-gray-300 font-semibold tracking-wider">SYSTEM STATUS | ONLINE</span>
             </div>
        </div>
      </nav>

      {error && (
        <div className="fixed top-24 right-6 z-[100]">
           <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg shadow-2xl backdrop-blur-md flex items-center gap-3 animate-[slideIn_0.3s_ease]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span className="text-xs font-mono font-bold">{error}</span>
              <button onClick={() => setError(null)} className="ml-4 hover:text-white">✕</button>
           </div>
        </div>
      )}

      {/* MODIFIED: GRID LAYOUT TO 3 COLUMNS */}
      <main className="flex-1 max-w-[1920px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR (Menu & Config) */}
          <aside className="lg:col-span-3">
             <div className="lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-2 pb-4">
                <Sidebar 
                activeMode={activeMode} onModeChange={handleModeChange}
                productSlots={productSlots} setProductSlots={setProductSlots}
                faceSlots={faceSlots} setFaceSlots={setFaceSlots}
                category={category} setCategory={setCategory}
                template={template} setTemplate={setTemplate}
                character={character} setCharacter={setCharacter}
                storyTheme={storyTheme} setStoryTheme={setStoryTheme}
                scriptLanguage={scriptLanguage} setScriptLanguage={setScriptLanguage}
                videoRatio={videoRatio} setVideoRatio={setVideoRatio}
                videoResolution={videoResolution} setVideoResolution={setVideoResolution}
                videoEngine={videoEngine} setVideoEngine={setVideoEngine}
                manualPrompt={manualPrompt} setManualPrompt={setManualPrompt}
                videoInputPrompt={videoInputPrompt} setVideoInputPrompt={setVideoInputPrompt}
                onGenerate={generateProject}
                onReferenceToVideo={(idx) => {}}
                isGenerating={isGenerating}
                prodBg={prodBg} setProdBg={setProdBg}
                prodPos={prodPos} setProdPos={setProdPos}
                prodEff={prodEff} setProdEff={setProdEff}
                prodCategory={prodCategory} setProdCategory={setProdCategory}
                selectedModel={selectedModel} setSelectedModel={setSelectedModel}
                // Props TTS
                ttsAudioUrl={ttsAudioUrl}
                isGeneratingTTS={isGeneratingTTS}
                onGenerateTTS={handleGenerateTTS}
                // NEW: Full Dialog Props
                ttsFullDialogUrl={ttsFullDialogUrl}
                isGeneratingFullDialogTTS={isGeneratingFullDialogTTS}
                onGenerateFullDialogTTS={handleGenerateFullDialogTTS}
                // NEW: Dialog Multi-Speaker Props
                ttsDialogMFUrl={ttsDialogMFUrl}
                isGeneratingDialogMF={isGeneratingDialogMF}
                onGenerateDialogMF={handleGenerateDialogMaleFemale}
                ttsDialogMMUrl={ttsDialogMMUrl}
                isGeneratingDialogMM={isGeneratingDialogMM}
                onGenerateDialogMM={handleGenerateDialogTwoMales}
                // NEW: Pass Selected Voice State
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                // NEW: Pass Cartoon Style State
                cartoonStyle={cartoonStyle}
                setCartoonStyle={setCartoonStyle}
                />
            </div>
          </aside>

          {/* CENTER (Main Results & Tools) */}
          <section className={`${activeMode === 'ecourse' ? 'lg:col-span-9' : 'lg:col-span-6'} flex flex-col gap-6`}>
                {activeMode === 'ecourse' ? (
                   <ECourseSection />
                ) : (
                   <>
                    <div className="w-full">
                        <MainResults 
                        activeMode={activeMode} generatedImages={generatedImages}
                        videoRatio={videoRatio as any} isGenerating={isGenerating}
                        onGenerateVideo={handleGenerateVideo}
                        onRegenerateSlot={handleRegenerateSlot}
                        onManualEdit={handleManualEdit}
                        onGenerateMotion={handleGenerateMotion}
                        onGenerateNarration={handleGenerateNarration}
                        />
                    </div>
                    <div className="w-full">
                        <ToolsSection 
                        activeMode={activeMode} globalScripts={globalScripts}
                        storyScenes={storyScenes} microstockItems={microstockItems}
                        setMicrostockItems={setMicrostockItems} onGenerateVideo={handleGenerateVideo}
                        onRegenerateSlot={handleRegenerateSlot}
                        onManualEdit={handleManualEdit}
                        generatedImages={generatedImages}
                        />
                    </div>
                   </>
                )}
          </section>

          {/* RIGHT SIDEBAR (Recent Activity) - Hidden when activeMode is ecourse */}
          {activeMode !== 'ecourse' && (
              <aside className="lg:col-span-3 hidden lg:block">
                 <div className="lg:sticky lg:top-24 h-[calc(100vh-8rem)] flex flex-col">
                    {/* NEW: API Key Selector added here */}
                    <ApiKeySelector />
                    {/* Live Global Updates Panel */}
                    <SystemStatusPanel />
                    <div className="flex-1 overflow-hidden">
                        <RecentActivity activities={activities} />
                    </div>
                 </div>
              </aside>
          )}

      </main>
    </div>
  );
};

export default App;
