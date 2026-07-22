import React, { useState } from 'react';
import { RawIncidentLog, GeminiNLPAnalysisResult } from '../types/sentinel';
import { SAMPLE_RAW_INCIDENT_LOGS } from '../data/mockData';
import { Sparkles, FileText, CheckCircle2, AlertOctagon, Printer, Plus } from 'lucide-react';

export const NLPIntelligenceModal: React.FC = () => {
  const [logs, setLogs] = useState<RawIncidentLog[]>(SAMPLE_RAW_INCIDENT_LOGS);
  const [newLogText, setNewLogText] = useState<string>('');
  const [newLogZone, setNewLogZone] = useState<string>('Zone B (Scaffolding)');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<GeminiNLPAnalysisResult | null>(null);

  const handleAddLog = () => {
    if (!newLogText.trim()) return;
    const newLog: RawIncidentLog = {
      id: `LOG-0${logs.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      shift: 'Morning',
      zone: newLogZone,
      reporter: 'Shift Safety Lead',
      rawText: newLogText,
    };
    setLogs([newLog, ...logs]);
    setNewLogText('');
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/incident-intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze logs via Gemini. Check server status.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="bg-[#0A0D14] border border-white/10 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-100">
              Gemini 3.6 Flash NLP Incident Root-Cause Engine
            </h2>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-1">Mines unstructured shift safety reports & generates structured OSHA compliance briefs</p>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-5 py-2.5 rounded-lg transition-all shadow-[0_0_12px_rgba(16,185,129,0.4)] flex items-center space-x-2 text-xs font-mono uppercase tracking-wider disabled:opacity-50"
        >
          {analyzing ? (
            <span className="animate-pulse">Gemini Mining Free-Text Logs...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run Gemini Root-Cause AI Engine</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Raw Shift Logs Input (1 Col) */}
        <div className="bg-[#0A0D14] border border-white/10 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-100 flex items-center space-x-2 pb-3 border-b border-white/10">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Unstructured Shift Logs ({logs.length})</span>
          </h3>

          {/* Add Log Form */}
          <div className="bg-[#05070A] p-3 rounded-lg border border-white/10 space-y-2 text-xs font-mono">
            <div className="font-bold text-slate-300 uppercase text-[10px]">Add Live Shift Hazard Report:</div>
            <select
              value={newLogZone}
              onChange={(e) => setNewLogZone(e.target.value)}
              className="w-full bg-[#0A0D14] border border-white/10 text-slate-200 rounded p-1.5 focus:outline-none"
            >
              <option value="Zone A (Assembly Line)">Zone A (Assembly Line)</option>
              <option value="Zone B (Scaffolding)">Zone B (Scaffolding Platform)</option>
              <option value="Zone C (Chemical Vault)">Zone C (Chemical Vault)</option>
              <option value="Zone D (Loading Dock)">Zone D (Loading Dock)</option>
            </select>

            <textarea
              rows={2}
              placeholder="e.g. Technician unbuckled harness while welding due to high heat discomfort..."
              value={newLogText}
              onChange={(e) => setNewLogText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />

            <button
              onClick={handleAddLog}
              className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Append Log to Mining Feed</span>
            </button>
          </div>

          {/* Log Items Feed */}
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="font-bold text-amber-400">{log.zone}</span>
                  <span>{log.date} ({log.shift})</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{log.rawText}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Analysis Output & OSHA Executive Brief (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
          
          {!analysisResult ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="p-4 rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30 animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-200 text-base">Ready for NLP Safety Intelligence Mining</h3>
              <p className="text-xs text-slate-400 max-w-md">
                Click "Run Gemini Root-Cause AI Engine" above to analyze the shift incident corpus, extract root cause Pareto distributions, and build an executive OSHA compliance report.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Executive Summary Banner */}
              <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Executive OSHA Compliance Brief</span>
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                    OSHA Health Index: {analysisResult.oshaComplianceScore}%
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {analysisResult.executiveSummary}
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Export / Print Report</span>
                  </button>
                </div>
              </div>

              {/* Pareto Top Root Causes */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span>Top Identified Root Causes (Pareto Mining)</span>
                </h4>

                <div className="space-y-2">
                  {analysisResult.topRootCauses.map((rc, idx) => (
                    <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{rc.cause}</span>
                        <span className="text-amber-400 font-mono">{rc.percentage}% Contribution</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-1.5 rounded-full" style={{ width: `${rc.percentage}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-400">{rc.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Plan Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Preventative Action Items */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h5 className="font-bold text-white flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Prioritized Action Items</span>
                  </h5>
                  <ul className="space-y-2">
                    {analysisResult.preventativeActions.map((pa, idx) => (
                      <li key={idx} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between font-semibold text-slate-200">
                          <span>{pa.action}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                              pa.priority === 'Immediate' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {pa.priority}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">Assigned: {pa.assignedRole}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested PPE Policy Updates */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h5 className="font-bold text-white flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Suggested Policy Updates</span>
                  </h5>
                  <ul className="space-y-2">
                    {analysisResult.suggestedPPEPolicyUpdates.map((policy, idx) => (
                      <li key={idx} className="text-slate-300 text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 flex items-start space-x-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{policy}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
