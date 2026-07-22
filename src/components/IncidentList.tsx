import React, { useState } from 'react';
import { IncidentEvent } from '../types/sentinel';
import { AlertCircle, CheckCircle2, Clock, Send, UserCheck, Smartphone, Check, ExternalLink } from 'lucide-react';

interface IncidentListProps {
  incidents: IncidentEvent[];
  onAcknowledgeIncident: (id: string, supervisor: string, notes: string) => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({ incidents, onAcknowledgeIncident }) => {
  const [filter, setFilter] = useState<'all' | 'unacknowledged' | 'in_progress' | 'resolved'>('all');
  const [selectedIncident, setSelectedIncident] = useState<IncidentEvent | null>(null);
  const [supervisorName, setSupervisorName] = useState<string>('Rajesh Kumar (Zone Lead)');
  const [supervisorNotes, setSupervisorNotes] = useState<string>('Dispatching on-site supervisor with extra helmet & high-vis vest immediately.');
  const [dispatchPayload, setDispatchPayload] = useState<any | null>(null);
  const [dispatching, setDispatching] = useState<boolean>(false);

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === 'all') return true;
    return inc.status === filter;
  });

  const handleDispatchAlert = async () => {
    if (!selectedIncident) return;
    setDispatching(true);

    try {
      // 1. Acknowledge Incident API
      await fetch('/api/incidents/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: selectedIncident.id,
          supervisorName,
          notes: supervisorNotes,
        }),
      });

      // 2. Trigger Mock Webhook / WhatsApp dispatch API
      const res = await fetch('/api/webhook/simulate-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: selectedIncident.id,
          channel: 'whatsapp',
        }),
      });
      const data = await res.json();
      setDispatchPayload(data.dispatchPayload);

      onAcknowledgeIncident(selectedIncident.id, supervisorName, supervisorNotes);
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="bg-[#0A0D14] border border-white/10 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-emerald-400" />
            <span>Incident Stream & Supervisor Alert Automation</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-mono">Live detection events with instant n8n & WhatsApp orchestration</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1.5 bg-[#05070A] p-1 rounded-lg border border-white/10 text-[10px] font-mono">
          {(['all', 'unacknowledged', 'in_progress', 'resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded font-bold transition-all uppercase tracking-wider ${
                filter === f
                  ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIncidents.map((incident) => {
          const isUnack = incident.status === 'unacknowledged';
          const isResolved = incident.status === 'resolved';

          return (
            <div
              key={incident.id}
              className={`bg-[#0A0D14] border rounded-xl overflow-hidden shadow-xl flex flex-col justify-between transition-all hover:border-emerald-500/50 ${
                isUnack
                  ? 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : isResolved
                  ? 'border-white/5 opacity-80'
                  : 'border-amber-500/50'
              }`}
            >
              {/* Header */}
              <div className="p-4 space-y-3">
                
                {/* Top Badge Line */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-emerald-400">{incident.id}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded font-mono font-bold text-[9px] uppercase tracking-wider ${
                      incident.severity === 'critical'
                        ? 'bg-red-500 text-white animate-pulse'
                        : incident.severity === 'high'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {incident.severity} SEVERITY
                  </span>
                </div>

                {/* Snapshot Thumbnail Image */}
                <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black">
                  <img
                    src={incident.snapshotUrl}
                    alt={incident.violationType}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-[#05070A]/90 border border-white/10 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                    📷 {incident.cameraName}
                  </div>
                </div>

                {/* Event Details */}
                <div>
                  <h3 className="font-bold text-xs font-mono uppercase text-white">{incident.violationType}</h3>
                  <p className="text-[10px] font-mono text-slate-400">{incident.zoneName}</p>
                </div>

                {/* Missing Items Badges */}
                <div className="flex flex-wrap gap-1">
                  {incident.missingItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-red-500/10 text-red-400 border border-red-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded"
                    >
                      ❌ {item}
                    </span>
                  ))}
                </div>

                {/* Status Indicator */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(incident.timestamp).toLocaleTimeString()}</span>
                  </span>
                  <span
                    className={`font-semibold uppercase flex items-center space-x-1 ${
                      isUnack ? 'text-red-400 font-bold' : isResolved ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {isUnack && <AlertCircle className="w-3.5 h-3.5" />}
                    {isResolved && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{incident.status.replace('_', ' ')}</span>
                  </span>
                </div>

              </div>

              {/* Action Button Footer */}
              <div className="p-3 bg-[#05070A] border-t border-white/10">
                <button
                  onClick={() => {
                    setSelectedIncident(incident);
                    setDispatchPayload(null);
                  }}
                  className="w-full bg-[#0A0D14] hover:bg-white/5 text-white font-mono font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center space-x-2 border border-white/10"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isUnack ? 'Acknowledge & Dispatch Supervisor' : 'View Action Logs'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Supervisor Dispatch Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <span>Automated Supervisor Alert Dispatch</span>
              </h3>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Incident Summary */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-rose-400">{selectedIncident.violationType}</div>
              <div className="text-slate-300">Zone: {selectedIncident.zoneName}</div>
              <div className="text-slate-400 text-[11px]">ID: {selectedIncident.id} | Severity: {selectedIncident.severity}</div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Assign Zone Supervisor:</label>
                <select
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Rajesh Kumar (Zone C Lead)">Rajesh Kumar (Zone C Chemical Lead)</option>
                  <option value="Ananya Sharma (Zone B Lead)">Ananya Sharma (Zone B Scaffolding Lead)</option>
                  <option value="Vikram Singh (Zone A Lead)">Vikram Singh (Zone A Assembly Lead)</option>
                  <option value="David Miller (Zone D Lead)">David Miller (Zone D Logistics Lead)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Instruction / Dispatch Notes:</label>
                <textarea
                  rows={3}
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Dispatch Action Button */}
            <button
              onClick={handleDispatchAlert}
              disabled={dispatching}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-extrabold text-xs py-3 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              {dispatching ? (
                <span>Dispatching Webhook...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Dispatch WhatsApp & n8n Alert Payload</span>
                </>
              )}
            </button>

            {/* Dispatch Payload Inspector Preview */}
            {dispatchPayload && (
              <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <Check className="w-4 h-4" />
                  <span>Webhook Dispatched Successfully!</span>
                </div>
                <pre className="bg-slate-900 p-2 rounded text-[10px] font-mono text-emerald-300 overflow-x-auto">
                  {JSON.stringify(dispatchPayload, null, 2)}
                </pre>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
