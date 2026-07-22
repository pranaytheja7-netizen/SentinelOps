/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SentinelOps: AI-Powered Industrial Safety Intelligence Platform
 * Author: Pranay Theja (CVR College of Engineering)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { VisionFeed } from './components/VisionFeed';
import { CommandDashboard } from './components/CommandDashboard';
import { IncidentList } from './components/IncidentList';
import { NLPIntelligenceModal } from './components/NLPIntelligenceModal';
import { PitchDemoDrawer } from './components/PitchDemoDrawer';
import { INITIAL_CAMERAS, INITIAL_INCIDENTS, INITIAL_ZONES, RISK_TIME_SERIES } from './data/mockData';
import { CameraFeed, IncidentEvent, ZoneData } from './types/sentinel';
import { ShieldAlert, Zap, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vision' | 'dashboard' | 'incidents' | 'nlp' | 'pitch'>('vision');
  const [incidents, setIncidents] = useState<IncidentEvent[]>(INITIAL_INCIDENTS);
  const [zones, setZones] = useState<ZoneData[]>(INITIAL_ZONES);
  const [cameras, setCameras] = useState<CameraFeed[]>(INITIAL_CAMERAS);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [pitchGuideOpen, setPitchGuideOpen] = useState<boolean>(false);
  const [liveToast, setLiveToast] = useState<IncidentEvent | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket Connection to Server
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        console.log('Connected to SentinelOps WebSocket');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'INITIAL_STATE') {
            if (data.incidents) setIncidents(data.incidents);
            if (data.zones) setZones(data.zones);
          } else if (data.type === 'NEW_VIOLATION') {
            setIncidents((prev) => [data.incident, ...prev]);
            setLiveToast(data.incident);
          } else if (data.type === 'TELEMETRY_UPDATE') {
            if (data.zones) setZones(data.zones);
          } else if (data.type === 'INCIDENT_UPDATED') {
            setIncidents((prev) =>
              prev.map((i) => (i.id === data.incident.id ? data.incident : i))
            );
          }
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
      };

      return () => {
        ws.close();
      };
    } catch (e) {
      console.warn('WebSocket connection error:', e);
    }
  }, []);

  // Handler to trigger simulated violation for demo
  const handleSimulateViolation = (
    cameraName = 'CAM-02: Scaffolding Elevated View',
    zoneId = 'zone-b',
    violationType = 'Missing Helmet'
  ) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'SIMULATE_VIOLATION',
          cameraName,
          zoneId,
          violationType,
          missingItems: [violationType, 'High-Vis Vest'],
        })
      );
    } else {
      // Local fallback if WS disconnected
      const newIncident: IncidentEvent = {
        id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: new Date().toISOString(),
        cameraId: 'cam-02',
        cameraName,
        zoneId,
        zoneName: 'High-Bay Scaffolding Platform',
        violationType: violationType as any,
        severity: 'critical',
        status: 'unacknowledged',
        workerId: `W-${Math.floor(1000 + Math.random() * 9000)}`,
        missingItems: [violationType, 'High-Vis Harness'],
        snapshotUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
      };
      setIncidents((prev) => [newIncident, ...prev]);
      setLiveToast(newIncident);
    }
  };

  const handleAcknowledgeIncident = (id: string, supervisor: string, notes: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? { ...inc, status: 'in_progress', supervisorAssigned: supervisor, notes }
          : inc
      )
    );
  };

  const handleSelectZone = (zoneId: string) => {
    setActiveTab('vision');
  };

  const activeViolationsCount = incidents.filter((i) => i.status === 'unacknowledged').length;
  const openIncidentsCount = incidents.filter((i) => i.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-black relative">
      
      {/* Background Radial Grid Overlay */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none z-0"
        style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* Header */}
      <div className="relative z-10">
        <Header
          wsConnected={wsConnected}
          activeViolationsCount={activeViolationsCount}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSimulateViolation={() => handleSimulateViolation()}
          onOpenPitchGuide={() => setPitchGuideOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        
        {/* Tab 1: Live Vision & Edge */}
        {activeTab === 'vision' && (
          <VisionFeed
            cameras={cameras}
            onTriggerViolation={handleSimulateViolation}
          />
        )}

        {/* Tab 2: Command Dashboard & Digital Twin */}
        {activeTab === 'dashboard' && (
          <CommandDashboard
            zones={zones}
            riskData={RISK_TIME_SERIES}
            activeViolationsCount={activeViolationsCount}
            openIncidentsCount={openIncidentsCount}
            onSelectZone={handleSelectZone}
          />
        )}

        {/* Tab 3: Incidents & Webhook Dispatch */}
        {activeTab === 'incidents' && (
          <IncidentList
            incidents={incidents}
            onAcknowledgeIncident={handleAcknowledgeIncident}
          />
        )}

        {/* Tab 4: Gemini NLP OSHA Safety Intelligence */}
        {activeTab === 'nlp' && <NLPIntelligenceModal />}

      </main>

      {/* Footer */}
      <footer className="bg-[#0A0D14] border-t border-white/5 py-4 text-xs text-slate-400 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]"></div>
            <span className="font-bold text-white">Sentinel<span className="text-emerald-400">Ops</span></span>
            <span>• Lead: <strong className="text-emerald-400">Pranay Theja</strong> (CVR College of Engineering)</span>
          </div>
          <div className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">
            2026 SENTINEL OPS | PROTOTYPE ALPHA_BUILD • GEMINI 3.6 FLASH ENGINE
          </div>
        </div>
      </footer>

      {/* Real-time Floating Violation Alert Toast */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-[#0A0D14] border-2 border-red-500 rounded-xl p-4 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-bounce flex items-start justify-between space-x-3">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/40">
              <Zap className="w-5 h-5 animate-pulse text-red-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-[10px] uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  CRITICAL SECURITY ALERT
                </span>
                <span className="text-[10px] font-mono text-slate-400">{liveToast.id}</span>
              </div>
              <p className="font-bold text-sm text-white">{liveToast.violationType}</p>
              <p className="text-xs text-slate-300">{liveToast.zoneName}</p>
            </div>
          </div>
          <button
            onClick={() => setLiveToast(null)}
            className="text-slate-400 hover:text-white font-bold p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hackathon Winner Pitch Drawer */}
      <PitchDemoDrawer
        isOpen={pitchGuideOpen}
        onClose={() => setPitchGuideOpen(false)}
      />

    </div>
  );
}
