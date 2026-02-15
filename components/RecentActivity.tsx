
import React from 'react';

export interface ActivityItem {
  id: string;
  user: string;
  avatar: string; // URL or Initials
  action: string;
  projectType: 'MODEL STUDIO' | 'PRODUK STUDIO' | 'VIDEO AI GROK' | 'IMAGE FOR MICROSTOCK' | 'FILM MAKER ANIMASI' | 'SYSTEM';
  timestamp: string;
  isLocal?: boolean; // To highlight current user
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const getProjectColor = (type: string) => {
  switch (type) {
    case 'MODEL STUDIO': return 'text-pink-400';
    case 'PRODUK STUDIO': return 'text-gold-500';
    case 'VIDEO AI GROK': return 'text-blue-400';
    case 'IMAGE FOR MICROSTOCK': return 'text-green-400';
    case 'FILM MAKER ANIMASI': return 'text-purple-400';
    default: return 'text-gray-400';
  }
};

const getProjectIcon = (type: string) => {
    switch (type) {
      case 'MODEL STUDIO': return '📸';
      case 'PRODUK STUDIO': return '🛍️';
      case 'VIDEO AI GROK': return '🎥';
      case 'IMAGE FOR MICROSTOCK': return '🖼️';
      case 'FILM MAKER ANIMASI': return '🎬';
      default: return '🤖';
    }
  };

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className="bg-[#08080c] border border-white/5 rounded-xl overflow-hidden shadow-2xl h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-white/5 bg-[#0A0A0F] flex items-center gap-3 sticky top-0 z-10">
        <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <svg className="w-5 h-5 text-gold-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <div>
            <h3 className="text-sm font-bold text-gray-100 font-tech uppercase tracking-widest">Recent Activity</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[9px] text-gray-400 font-mono">Live Global Updates</span>
            </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {activities.map((item) => (
          <div 
            key={item.id} 
            className={`
                relative p-3 rounded-lg border transition-all duration-300 animate-[slideInRight_0.3s_ease-out]
                ${item.isLocal 
                    ? 'bg-gold-500/5 border-gold-500/30 shadow-[0_0_10px_rgba(234,179,8,0.1)]' 
                    : 'bg-[#0d0d12] border-white/5 hover:border-white/10'
                }
            `}
          >
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                    <div className={`w-8 h-8 rounded bg-[#1A1A24] flex items-center justify-center border border-white/10 text-xs font-bold ${item.isLocal ? 'text-gold-500' : 'text-gray-400'}`}>
                        {item.avatar}
                    </div>
                    <div className="absolute -top-1 -right-1 text-[10px] bg-[#08080c] rounded-full p-0.5 border border-white/10">
                        {getProjectIcon(item.projectType)}
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                        <span className={`text-[11px] font-bold truncate ${item.isLocal ? 'text-gold-400' : 'text-cyan-400'}`}>
                            {item.user}
                        </span>
                        <span className="text-[8px] text-gray-600 font-mono whitespace-nowrap">{item.timestamp}</span>
                    </div>
                    
                    <p className="text-[10px] text-gray-300 leading-tight mt-0.5 line-clamp-2">
                        {item.action}
                    </p>
                    
                    <div className="mt-2 flex items-center gap-2">
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/5 ${getProjectColor(item.projectType)}`}>
                            {item.projectType}
                        </span>
                    </div>
                </div>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
            <div className="text-center py-10 opacity-30">
                <p className="text-[10px] font-mono">Waiting for network data...</p>
            </div>
        )}
      </div>
      
      {/* Footer Stats */}
      <div className="p-3 bg-[#050508] border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-gray-500">
          <span>Server: ASIA-JKT-01</span>
          <span className="flex items-center gap-1 text-green-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Connected
          </span>
      </div>
    </div>
  );
};

export default RecentActivity;
