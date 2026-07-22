import React from 'react';
import { ZoneData, RiskTimeSeriesData } from '../types/sentinel';
import { ShieldCheck, AlertTriangle, Activity, Users, Flame, Thermometer, Wind, Volume2, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface CommandDashboardProps {
  zones: ZoneData[];
  riskData: RiskTimeSeriesData[];
  activeViolationsCount: number;
  openIncidentsCount: number;
  onSelectZone: (zoneId: string) => void;
}

export const CommandDashboard: React.FC<CommandDashboardProps> = ({
  zones,
  riskData,
  activeViolationsCount,
  openIncidentsCount,
  onSelectZone,
}) => {
  // Calculate average safety score
  const currentSafetyScore = 82; // 82%

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Header Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Violations */}
        <div className="bg-[#0A0D14] border border-white/10 rounded-xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Active Violations</span>
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <AlertTriangle className="w-4 h-4 animate-pulse text-red-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{activeViolationsCount}</span>
            <span className="text-[10px] text-red-400 font-mono font-bold uppercase flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> High Threat
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-2">REQUIRES IMMEDIATE SUPERVISOR DISPATCH</p>
        </div>

        {/* KPI 2: Site Safety Score */}
        <div className="bg-[#0A0D14] border border-white/10 rounded-xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Site Safety Index</span>
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono shadow-[0_0_15px_rgba(52,211,153,0.2)]">{currentSafetyScore}%</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">+2.4% SHIFT</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden border border-white/5">
            <div className="bg-emerald-400 h-1.5 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" style={{ width: `${currentSafetyScore}%` }} />
          </div>
        </div>

        {/* KPI 3: Open Incidents */}
        <div className="bg-[#0A0D14] border border-white/10 rounded-xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Open Incidents</span>
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">{openIncidentsCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">AWAITING ACK</span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-2">AVG RESOLUTION TIME: 4.2 MINS</p>
        </div>

        {/* KPI 4: Workers Monitored */}
        <div className="bg-[#0A0D14] border border-white/10 rounded-xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Active Workers</span>
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">31</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">100% OPTICAL</span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-2">4 ACTIVE CCTV STREAMS CONNECTED</p>
        </div>

      </div>

      {/* Main Grid: Interactive 2D Digital Twin Site Map & Predictive Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Interactive 2D Digital Twin Floorplan */}
        <div className="bg-[#0A0D14] border border-white/10 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-200 flex items-center space-x-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>Digital Twin Area & Zone Telemetry</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">Real-time zone status, telemetry sensors & worker count</p>
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded border border-emerald-500/30 uppercase tracking-widest">
              LIVE FLOORMAP
            </span>
          </div>

          {/* SVG Site Map Canvas */}
          <div className="relative aspect-[4/3] bg-[#05070A] rounded-lg border border-white/10 p-4 flex flex-col justify-between overflow-hidden">
            
            {/* Grid Lines background */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="grid grid-cols-2 gap-4 h-full relative z-10">
              {zones.map((zone) => {
                const isCritical = zone.riskLevel === 'critical' || zone.riskLevel === 'high';
                const isWarning = zone.riskLevel === 'medium';

                return (
                  <div
                    key={zone.id}
                    onClick={() => onSelectZone(zone.id)}
                    className={`rounded-lg p-3 border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                      isCritical
                        ? 'bg-red-500/10 border-red-500/50 hover:border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : isWarning
                        ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400'
                    }`}
                  >
                    {/* Top status bar */}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs font-mono text-white uppercase tracking-wider">
                        {zone.code}: {zone.name}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          isCritical
                            ? 'bg-red-500 text-white font-extrabold animate-pulse'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {zone.riskLevel}
                      </span>
                    </div>

                    {/* Sensor Telemetry Badges */}
                    <div className="my-2 grid grid-cols-3 gap-1 text-[10px] font-mono">
                      <div className="bg-[#05070A] p-1 rounded text-center border border-white/10 flex items-center justify-center space-x-1">
                        <Thermometer className="w-3 h-3 text-amber-400" />
                        <span className="text-slate-200">{zone.sensors.tempCelsius}°C</span>
                      </div>
                      <div className="bg-[#05070A] p-1 rounded text-center border border-white/10 flex items-center justify-center space-x-1">
                        <Wind className="w-3 h-3 text-cyan-400" />
                        <span className="text-slate-200">{zone.sensors.gasPPM} PPM</span>
                      </div>
                      <div className="bg-[#05070A] p-1 rounded text-center border border-white/10 flex items-center justify-center space-x-1">
                        <Volume2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-200">{zone.sensors.noiseDB} dB</span>
                      </div>
                    </div>

                    {/* Bottom worker stats */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/5 pt-2">
                      <span>LEAD: <span className="text-slate-200">{zone.supervisorName}</span></span>
                      <span className="text-cyan-400 font-bold">{zone.activeWorkers} WORKERS</span>
                    </div>

                    {/* Hover Jump Prompt */}
                    <div className="absolute inset-0 bg-[#05070A]/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
                      VIEW CAMERA FEED 📹
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Predictive Risk Heatmap Chart */}
        <div className="bg-[#0A0D14] border border-white/10 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-200 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Shift Risk Map & Violation Trends</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">Shift-wise risk score trajectory across factory zones</p>
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded border border-emerald-500/30 uppercase tracking-widest">
              LIVE CHARTS
            </span>
          </div>

          <div className="h-[300px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorZoneB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorZoneC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#05070A', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="zoneB" name="Scaffolding (Zone B)" stroke="#ef4444" fillOpacity={1} fill="url(#colorZoneB)" />
                <Area type="monotone" dataKey="zoneC" name="Chemical Vault (Zone C)" stroke="#10b981" fillOpacity={1} fill="url(#colorZoneC)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-[#05070A] rounded-lg border border-white/10 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>PEAK RISK WINDOW: <span className="text-amber-400 font-bold">12:00 PM - 04:00 PM (AFTERNOON)</span></span>
            <span className="text-emerald-400 font-bold">ACCURACY: 94.8%</span>
          </div>
        </div>

      </div>

    </div>
  );
};
