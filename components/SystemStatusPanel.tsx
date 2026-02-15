
import React, { useState, useEffect } from 'react';

const SystemStatusPanel: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState(1240);
  const [gpuLoad, setGpuLoad] = useState(42);
  const [queue, setQueue] = useState(12);

  // Simulate metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
      setGpuLoad(prev => Math.max(20, Math.min(95, prev + Math.floor(Math.random() * 10) - 5)));
      setQueue(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#08080c] border border-white/5 rounded-xl p-5 mb-6 relative overflow-hidden shadow-2xl group">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent opacity-50"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-red-900/50 to-black border border-red-500/30 flex items-center justify-center">
               <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-100 font-tech uppercase tracking-[0.2em] leading-none">LIVE GLOBAL</h3>
            <span className="text-[9px] text-red-400 font-bold tracking-widest uppercase">UPDATES & METRICS</span>
          </div>
        </div>
        <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-gray-400">
           V4.0.2
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-3 gap-2 relative z-10">
         {/* Metric 1 */}
         <div className="bg-[#0d0d12] border border-white/5 p-2 rounded flex flex-col items-center justify-center gap-1 group-hover:border-gold-500/20 transition-colors">
            <span className="text-[9px] text-gray-500 font-mono uppercase">ACTIVE USER</span>
            <span className="text-sm font-bold text-gray-200 font-tech">{activeUsers.toLocaleString()}</span>
         </div>
         {/* Metric 2 */}
         <div className="bg-[#0d0d12] border border-white/5 p-2 rounded flex flex-col items-center justify-center gap-1 group-hover:border-gold-500/20 transition-colors">
            <span className="text-[9px] text-gray-500 font-mono uppercase">GPU LOAD</span>
            <span className={`text-sm font-bold font-tech ${gpuLoad > 80 ? 'text-red-500' : 'text-green-500'}`}>{gpuLoad}%</span>
         </div>
         {/* Metric 3 */}
         <div className="bg-[#0d0d12] border border-white/5 p-2 rounded flex flex-col items-center justify-center gap-1 group-hover:border-gold-500/20 transition-colors">
            <span className="text-[9px] text-gray-500 font-mono uppercase">QUEUE</span>
            <span className="text-sm font-bold text-gold-500 font-tech">{queue}</span>
         </div>
      </div>

      {/* Connection Bar */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
         <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
               <div className="w-0.5 h-2 bg-gold-500"></div>
               <div className="w-0.5 h-3 bg-gold-500"></div>
               <div className="w-0.5 h-1.5 bg-gold-500"></div>
               <div className="w-0.5 h-4 bg-gold-500"></div>
               <div className="w-0.5 h-2 bg-gold-500"></div>
            </div>
            <span className="text-[9px] text-gold-500 font-mono font-bold tracking-wider">NETWORK STABLE</span>
         </div>
         <span className="text-[9px] text-gray-600 font-mono">LATENCY: 24ms</span>
      </div>
    </div>
  );
};

export default SystemStatusPanel;
