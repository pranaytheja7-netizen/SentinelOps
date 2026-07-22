import React from 'react';
import { ShieldAlert, Video, Zap, FileText, Award, Activity, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  wsConnected: boolean;
  activeViolationsCount: number;
  activeTab: 'vision' | 'dashboard' | 'incidents' | 'nlp' | 'pitch';
  setActiveTab: (tab: 'vision' | 'dashboard' | 'incidents' | 'nlp' | 'pitch') => void;
  onSimulateViolation: () => void;
  onOpenPitchGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wsConnected,
  activeViolationsCount,
  activeTab,
  setActiveTab,
  onSimulateViolation,
  onOpenPitchGuide,
}) => {
  return (
    <header className="bg-[#0A0D14]/80 backdrop-blur-md border-b border-white/10 text-slate-100 sticky top-0 z-40 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('vision')}>
            <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/40 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)] flex items-center justify-center">
                <ShieldAlert className="w-3 h-3 text-black font-extrabold" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-white">
                  Sentinel<span className="text-emerald-400">Ops</span>
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest">
                  v2.0.4 AI VISION
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block uppercase tracking-wider">
                Industrial Safety Intelligence & Threat Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#05070A]/80 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('vision')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'vision'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Live Vision & Edge</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Digital Twin & Risk</span>
            </button>

            <button
              onClick={() => setActiveTab('incidents')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'incidents'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Incidents Log</span>
              {activeViolationsCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                  {activeViolationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('nlp')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'nlp'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>OSHA Gemini AI</span>
            </button>
          </nav>

          {/* Actions & Status */}
          <div className="flex items-center space-x-2">
            
            {/* Live WS Status Indicator */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-lg bg-[#05070A] border border-white/10 text-[10px] font-mono">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-pulse' : 'bg-red-500'}`} />
              <span className="text-slate-300">
                {wsConnected ? 'SOCKET: CONNECTED' : 'RECONNECTING...'}
              </span>
            </div>

            {/* Quick Simulate Violation Button */}
            <button
              onClick={onSimulateViolation}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 font-semibold text-xs rounded-lg transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)] active:scale-95"
              title="Simulate Instant PPE Violation for Hackathon Judge Demo"
            >
              <Zap className="w-3.5 h-3.5 text-red-400 animate-bounce" />
              <span className="hidden sm:inline uppercase text-[10px] tracking-wider font-bold">Trigger Threat</span>
            </button>

            {/* Pitch Drawer Button */}
            <button
              onClick={onOpenPitchGuide}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-xs rounded-lg transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] active:scale-95"
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pitch & Demo</span>
            </button>

          </div>
        </div>

        {/* Mobile Nav Subbar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-white/10 text-xs overflow-x-auto font-mono">
          <button
            onClick={() => setActiveTab('vision')}
            className={`px-3 py-1 rounded-md ${activeTab === 'vision' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}
          >
            Vision
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded-md ${activeTab === 'dashboard' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}
          >
            Digital Twin
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1 rounded-md ${activeTab === 'incidents' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}
          >
            Incidents
          </button>
          <button
            onClick={() => setActiveTab('nlp')}
            className={`px-3 py-1 rounded-md ${activeTab === 'nlp' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}
          >
            AI OSHA
          </button>
        </div>

      </div>
    </header>
  );
};
