
import React, { useState, useEffect } from 'react';
import * as ai from '../services/geminiService';
import * as grok from '../services/grokService';

const ApiKeySelector: React.FC = () => {
  // --- GEMINI STATE ---
  const [geminiValue, setGeminiValue] = useState('');
  const [isGeminiSaved, setIsGeminiSaved] = useState(false);
  const [isGeminiVisible, setIsGeminiVisible] = useState(false);
  const [hasGeminiCustom, setHasGeminiCustom] = useState(false);

  // --- GROK STATE ---
  const [grokValue, setGrokValue] = useState('');
  const [isGrokSaved, setIsGrokSaved] = useState(false);
  const [isGrokVisible, setIsGrokVisible] = useState(false);
  const [hasGrokCustom, setHasGrokCustom] = useState(false);

  // Initialize from storage on mount
  useEffect(() => {
    // Gemini
    const savedGemini = localStorage.getItem('TOPAZ_USER_GEMINI_KEY');
    if (savedGemini && savedGemini.trim().length > 0) {
      setGeminiValue(savedGemini.trim());
      setHasGeminiCustom(true);
      setIsGeminiSaved(true);
    }

    // Grok
    const savedGrok = localStorage.getItem('TOPAZ_USER_GROK_KEY');
    if (savedGrok && savedGrok.trim().length > 0) {
        setGrokValue(savedGrok.trim());
        setHasGrokCustom(true);
        setIsGrokSaved(true);
    }
  }, []);

  // --- GEMINI HANDLERS ---
  const handleSaveGemini = () => {
    // Remove all whitespace/newlines
    const cleanKey = geminiValue.replace(/\s/g, '').trim();
    if (cleanKey.length > 5) {
      ai.setCustomApiKey(cleanKey);
      setGeminiValue(cleanKey); // Update UI with trimmed value
      setHasGeminiCustom(true);
      setIsGeminiSaved(true);
    } else {
      handleClearGemini();
    }
  };

  const handleClearGemini = () => {
    ai.setCustomApiKey(null);
    setGeminiValue('');
    setHasGeminiCustom(false);
    setIsGeminiSaved(false);
  };

  // --- GROK HANDLERS ---
  const handleSaveGrok = () => {
    const cleanKey = grokValue.replace(/\s/g, '').trim();
    if (cleanKey.length > 5) {
      grok.setCustomGrokKey(cleanKey);
      setGrokValue(cleanKey); // Update UI with trimmed value
      setHasGrokCustom(true);
      setIsGrokSaved(true);
    } else {
      handleClearGrok();
    }
  };

  const handleClearGrok = () => {
    grok.setCustomGrokKey(null);
    setGrokValue('');
    setHasGrokCustom(false);
    setIsGrokSaved(false);
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
        
        {/* ================= GEMINI KEY SELECTOR ================= */}
        <div className="bg-[#08080c] border border-white/5 rounded-xl p-5 relative overflow-hidden shadow-2xl group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-900/10 blur-[50px] pointer-events-none group-hover:bg-purple-900/20 transition-all"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-100 font-tech uppercase tracking-[0.1em]">GEMINI API KEY</h3>
                    <span className="text-[9px] text-gray-500 font-mono">Input your Key to Override Default</span>
                </div>
                </div>
                
                <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-purple-400 font-bold hover:text-purple-300 transition-colors flex items-center gap-1 group/link"
                >
                Get Key 
                <svg className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
            </div>

            {/* Input Field */}
            <div className="relative mb-3 group z-10">
                <input
                type={isGeminiVisible ? "text" : "password"}
                value={geminiValue}
                onChange={(e) => {
                    setGeminiValue(e.target.value);
                    setIsGeminiSaved(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveGemini()}
                placeholder="AIza... (Paste Gemini Key)"
                className={`w-full bg-[#15151E] text-white text-xs font-mono p-3 pr-24 rounded-lg border focus:outline-none transition-all ${
                    hasGeminiCustom && isGeminiSaved
                    ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                    : 'border-white/10 focus:border-purple-500/50'
                }`}
                />
                
                <button 
                onClick={() => setIsGeminiVisible(!isGeminiVisible)}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1.5"
                >
                {isGeminiVisible ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                )}
                </button>

                <button 
                onClick={handleSaveGemini}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded flex items-center justify-center transition-all ${
                    isGeminiSaved && hasGeminiCustom
                    ? 'bg-green-500 text-black shadow-[0_0_10px_#22c55e]'
                    : 'bg-white/10 text-gray-400 hover:bg-purple-500 hover:text-white'
                }`}
                title="Save API Key"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </button>
            </div>

            <div className="flex items-center gap-2">
                {hasGeminiCustom && isGeminiSaved ? (
                    <>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-mono text-green-400 font-bold uppercase">Active: Custom Key</span>
                        <button onClick={handleClearGemini} className="ml-auto text-[9px] text-red-400 hover:text-red-300 underline font-mono">Remove</button>
                    </>
                ) : (
                    <>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span className="text-[10px] font-mono text-yellow-500 font-bold uppercase">Active: Default System Key</span>
                    </>
                )}
            </div>
        </div>

        {/* ================= GROK KEY SELECTOR ================= */}
        <div className="bg-[#08080c] border border-white/5 rounded-xl p-5 relative overflow-hidden shadow-2xl group">
            {/* Background Glow (Cyan/White for Grok) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-900/10 blur-[50px] pointer-events-none group-hover:bg-cyan-900/20 transition-all"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-900/40 to-black border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    {/* Icon Grok (Abstract X or Chip) */}
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-100 font-tech uppercase tracking-[0.1em]">GROK API KEY</h3>
                    <span className="text-[9px] text-gray-500 font-mono">Input your Key to Override Default</span>
                </div>
                </div>
                
                <a 
                href="https://console.x.ai/" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-cyan-400 font-bold hover:text-cyan-300 transition-colors flex items-center gap-1 group/link"
                >
                Get Key 
                <svg className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
            </div>

            {/* Input Field */}
            <div className="relative mb-3 group z-10">
                <input
                type={isGrokVisible ? "text" : "password"}
                value={grokValue}
                onChange={(e) => {
                    setGrokValue(e.target.value);
                    setIsGrokSaved(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveGrok()}
                placeholder="xai-... (Paste Grok Key)"
                className={`w-full bg-[#15151E] text-white text-xs font-mono p-3 pr-24 rounded-lg border focus:outline-none transition-all ${
                    hasGrokCustom && isGrokSaved
                    ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                    : 'border-white/10 focus:border-cyan-500/50'
                }`}
                />
                
                <button 
                onClick={() => setIsGrokVisible(!isGrokVisible)}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1.5"
                >
                {isGrokVisible ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                )}
                </button>

                <button 
                onClick={handleSaveGrok}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded flex items-center justify-center transition-all ${
                    isGrokSaved && hasGrokCustom
                    ? 'bg-green-500 text-black shadow-[0_0_10px_#22c55e]'
                    : 'bg-white/10 text-gray-400 hover:bg-cyan-500 hover:text-white'
                }`}
                title="Save API Key"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </button>
            </div>

            <div className="flex items-center gap-2">
                {hasGrokCustom && isGrokSaved ? (
                    <>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-mono text-green-400 font-bold uppercase">Active: Custom Key</span>
                        <button onClick={handleClearGrok} className="ml-auto text-[9px] text-red-400 hover:text-red-300 underline font-mono">Remove</button>
                    </>
                ) : (
                    <>
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        <span className="text-[10px] font-mono text-gray-500 font-bold uppercase">Inactive (Fallback to Gemini)</span>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

export default ApiKeySelector;
