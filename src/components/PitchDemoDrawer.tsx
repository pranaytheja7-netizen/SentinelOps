import React from 'react';
import { Award, Zap, Shield, Cpu, Code2, Sparkles, CheckCircle } from 'lucide-react';

interface PitchDemoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitchDemoDrawer: React.FC<PitchDemoDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-end">
      <div className="bg-[#0A0D14] border-l border-white/10 max-w-2xl w-full h-full overflow-y-auto p-6 shadow-2xl space-y-6 text-slate-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Hackathon Winner Pitch Guide</h2>
              <p className="text-[10px] text-emerald-400 font-mono font-bold">SentinelOps • CVR College of Engineering</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#05070A] border border-white/10 hover:bg-white/5 text-slate-300 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Team & Author Info */}
        <div className="bg-[#05070A] p-4 rounded-xl border border-white/10 text-xs font-mono space-y-2">
          <div className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">Project Credits & Team Lead</div>
          <div className="text-white text-sm font-extrabold">Pranay Theja</div>
          <div className="text-slate-400 text-[11px]">CVR College of Engineering</div>
          <p className="text-slate-300 pt-1 leading-relaxed text-[11px]">
            Mission: Shifting industrial safety from reactive incident reporting to a real-time, zero-harm proactive model using Computer Vision, Edge IoT streams, and Gemini 3.6 Flash AI intelligence.
          </p>
        </div>

        {/* 3 Winning Edge Features / Demo Tricks for Judges */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>3 WOW-Factor Demo Features for Hackathon Judges</span>
          </h3>

          <div className="space-y-3">
            
            {/* Trick 1 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-amber-400">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>1. Interactive Live Zone Boundary Drawing</span>
                </span>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">DEMO TRICK #1</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                In the <strong>Live Vision & Edge</strong> tab, toggle <em>"Draw Custom Zone"</em> and click anywhere on the video feed to create a dynamic restricted perimeter. As workers cross the drawn polygon, the canvas immediately detects intrusion and triggers red flashing warnings!
              </p>
            </div>

            {/* Trick 2 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-cyan-400">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>2. Gemini Multimodal Vision Audit & Free-Text Mining</span>
                </span>
                <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">DEMO TRICK #2</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Click <em>"Gemini Vision Audit"</em> on the video frame for live image inspection OR switch to the <strong>OSHA Gemini AI</strong> tab to mine free-text shift logs. Gemini extracts Pareto root-cause distributions and generates printable executive OSHA compliance briefs!
              </p>
            </div>

            {/* Trick 3 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-rose-400">
                <span className="flex items-center space-x-1.5">
                  <Cpu className="w-4 h-4 text-rose-400" />
                  <span>3. Instant WhatsApp / n8n Webhook Alert Pipeline</span>
                </span>
                <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">DEMO TRICK #3</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Click <em>"Trigger Alert ⚡"</em> in the header or <em>"Acknowledge & Dispatch"</em> in the Incidents tab. Watch live WebSocket broadcast events update all connected clients in real-time and view simulated WhatsApp / n8n webhook alert JSON payloads.
              </p>
            </div>

          </div>
        </div>

        {/* System Architecture */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>Repository & Architecture Breakdown</span>
          </h3>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5">
            <div>├── server.ts (Express + WebSocket Hub + Gemini SDK)</div>
            <div>├── src/</div>
            <div>│   ├── components/ (VisionFeed, CommandDashboard, IncidentList, NLPIntelligenceModal)</div>
            <div>│   ├── data/mockData.ts (Camera Streams, Zone Metadata, Shift Logs)</div>
            <div>│   └── types/sentinel.ts (TypeScript System Contracts)</div>
            <div>└── package.json (Full-Stack TypeScript Build Pipeline)</div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs py-3 rounded-xl shadow-lg hover:brightness-110 transition-all"
        >
          Got it! Resume Live Demo
        </button>

      </div>
    </div>
  );
};
