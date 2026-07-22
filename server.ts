import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_INCIDENTS, INITIAL_ZONES, SAMPLE_RAW_INCIDENT_LOGS } from './src/data/mockData';
import { IncidentEvent } from './src/types/sentinel';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory data store for live hackathon demo
let incidentsStore: IncidentEvent[] = [...INITIAL_INCIDENTS];
let zonesStore = [...INITIAL_ZONES];

// Initialize Gemini Server SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Gemini features will return fallback AI estimates.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'SentinelOps Engine', timestamp: new Date().toISOString() });
});

app.get('/api/incidents', (req, res) => {
  res.json({ incidents: incidentsStore, zones: zonesStore });
});

app.post('/api/incidents/acknowledge', (req, res) => {
  const { incidentId, supervisorName, notes } = req.body;
  const incident = incidentsStore.find((i) => i.id === incidentId);
  if (incident) {
    incident.status = 'in_progress';
    incident.supervisorAssigned = supervisorName || 'Shift Lead';
    incident.notes = notes || 'Supervisor dispatched to zone.';
    
    // Broadcast status change via WebSocket
    broadcastWS({
      type: 'INCIDENT_UPDATED',
      incident,
    });
    
    return res.json({ success: true, incident });
  }
  res.status(404).json({ error: 'Incident not found' });
});

app.post('/api/webhook/simulate-dispatch', (req, res) => {
  const { incidentId, channel } = req.body; // 'whatsapp' | 'sms' | 'n8n' | 'email'
  const incident = incidentsStore.find((i) => i.id === incidentId) || incidentsStore[0];
  
  const payload = {
    event: 'SAFETY_VIOLATION_TRIGGERED',
    channel: channel || 'whatsapp',
    timestamp: new Date().toISOString(),
    incidentId: incident.id,
    zone: incident.zoneName,
    severity: incident.severity,
    violationType: incident.violationType,
    missingItems: incident.missingItems,
    snapshotUrl: incident.snapshotUrl,
    n8nWorkflowId: 'wf_sentinel_safety_v2',
    recipient: '+91-9876543210 (Zone Supervisor)',
    status: 'DELIVERED',
  };

  res.json({ success: true, dispatchPayload: payload });
});

// Gemini Incident Intelligence & OSHA Report Endpoint
app.post('/api/incident-intelligence/analyze', async (req, res) => {
  try {
    const { logs } = req.body;
    const logTexts = logs && logs.length > 0 
      ? logs.map((l: any) => `[${l.date} | ${l.zone} | ${l.shift} Shift]: ${l.rawText}`).join('\n')
      : SAMPLE_RAW_INCIDENT_LOGS.map((l) => `[${l.date} | ${l.zone} | ${l.shift} Shift]: ${l.rawText}`).join('\n');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback structured analysis if API key is not present
      return res.json({
        topRootCauses: [
          { cause: 'High Temperature & Helmet Discomfort in Scaffolding Bay', percentage: 42, rationale: 'Workers removing safety helmets at elevated scaffolding due to heat strain and missing chin straps.' },
          { cause: 'Unsanctioned Door Access in Chemical Vault', percentage: 28, rationale: 'Maintenance doors left unlocked allowing entry without gas masks and goggles.' },
          { cause: 'Hazard Line Blind spots during Forklift Operations', percentage: 20, rationale: 'Contractors stepping inside loader boundaries without reflective high-vis vests.' },
          { cause: 'Ergonomic Over-reaching at Heights', percentage: 10, rationale: 'Cables handled without fall harness lanyards attached.' }
        ],
        complianceGaps: [
          'Lack of ventilated ergonomic PPE helmets for high-heat shifts',
          'Absence of automated magnetic lock interlocks on Chemical Vault doors',
          'Inconsistent harness clip enforcement on scaffolding platforms'
        ],
        preventativeActions: [
          { action: 'Deploy SentinelOps Smart CCTV Vision with Auto Audio Siren in Zone B', priority: 'Immediate', assignedRole: 'EHS Manager' },
          { action: 'Upgrade to Lightweight Ventilated Mesh Helmets with Smart Chin Straps', priority: 'Medium', assignedRole: 'Procurement' },
          { action: 'Install NFC Access Badging on Solvent Storage Entrance', priority: 'Immediate', assignedRole: 'Facility Admin' }
        ],
        executiveSummary: 'AI Root-Cause Mining indicates that 70% of safety breaches stem from micro-ergonomic fatigue and improper physical perimeter locks. Real-time vision enforcement combined with instant WhatsApp supervisor alerting will achieve zero-harm operations.',
        oshaComplianceScore: 78,
        suggestedPPEPolicyUpdates: [
          'Mandate double-point harness clips above 3 meters elevation',
          'Enforce pre-shift optical PPE scanning at chemical vault airlocks',
          'Conduct weekly ergonomics shift briefings on posture alignment'
        ]
      });
    }

    const ai = getGeminiClient();
    const prompt = `You are SentinelOps Master EHS AI Specialist. Analyze the following raw industrial safety logs and output a detailed structured analysis in JSON format for an executive OSHA compliance report.

LOGS TO ANALYZE:
${logTexts}

Generate a JSON response matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topRootCauses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  cause: { type: Type.STRING },
                  percentage: { type: Type.NUMBER },
                  rationale: { type: Type.STRING },
                },
              },
            },
            complianceGaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            preventativeActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  assignedRole: { type: Type.STRING },
                },
              },
            },
            executiveSummary: { type: Type.STRING },
            oshaComplianceScore: { type: Type.NUMBER },
            suggestedPPEPolicyUpdates: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in incident intelligence endpoint:', err);
    res.status(500).json({ error: 'Failed to perform AI incident analysis', details: err.message });
  }
});

// Vision Frame AI Inspection Endpoint (Multimodal frame validation)
app.post('/api/vision/analyze-frame', async (req, res) => {
  try {
    const { imageBase64, zoneName } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || !imageBase64) {
      return res.json({
        analysis: 'Vision Frame Audit Completed (Simulated Inference Engine): Detects 2 Workers. Worker 1: Helmet OK, Vest Missing (Violation). Worker 2: Compliant.',
        detectedObjects: ['Helmet (Green)', 'Vest Missing (Red)', 'Safety Boots (Green)'],
        riskScore: 'HIGH',
        recommendation: 'Sound local audio siren and alert Zone Supervisor via WhatsApp.'
      });
    }

    const ai = getGeminiClient();
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `You are SentinelOps Computer Vision Engine. Analyze this camera frame from ${zoneName || 'Industrial Site'}. Identify PPE Compliance (Helmet, Vest, Gloves, Goggles), posture/fall risks, or zone intrusions. Keep response brief, structured, and actionable.`,
          },
        ],
      },
    });

    res.json({
      analysis: response.text,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Vision analysis error:', err);
    res.status(500).json({ error: 'Vision frame analysis failed', details: err.message });
  }
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket Server attached to same server
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected to SentinelOps Real-Time WebSocket');

  // Send current state
  ws.send(JSON.stringify({
    type: 'INITIAL_STATE',
    incidents: incidentsStore,
    zones: zonesStore,
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'SIMULATE_VIOLATION') {
        const newIncident: IncidentEvent = {
          id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
          timestamp: new Date().toISOString(),
          cameraId: data.cameraId || 'cam-02',
          cameraName: data.cameraName || 'CAM-02: Scaffolding Elevated View',
          zoneId: data.zoneId || 'zone-b',
          zoneName: data.zoneName || 'High-Bay Scaffolding Platform',
          violationType: data.violationType || 'Missing Helmet',
          severity: data.severity || 'high',
          status: 'unacknowledged',
          workerId: `W-${Math.floor(1000 + Math.random() * 9000)}`,
          missingItems: data.missingItems || ['Safety Helmet'],
          snapshotUrl: data.snapshotUrl || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
        };

        incidentsStore.unshift(newIncident);
        broadcastWS({
          type: 'NEW_VIOLATION',
          incident: newIncident,
        });
      }
    } catch (e) {
      console.error('Error handling WS message:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

function broadcastWS(data: any) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Periodic background telemetry ping (Simulating live camera streams telemetry updates)
setInterval(() => {
  if (clients.size > 0) {
    // Fluctuating sensor values
    zonesStore = zonesStore.map((zone) => ({
      ...zone,
      sensors: {
        tempCelsius: parseFloat((zone.sensors.tempCelsius + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        gasPPM: Math.max(10, Math.min(100, Math.round(zone.sensors.gasPPM + (Math.random() * 4 - 2)))),
        noiseDB: Math.max(50, Math.min(110, Math.round(zone.sensors.noiseDB + (Math.random() * 3 - 1.5)))),
      },
    }));

    broadcastWS({
      type: 'TELEMETRY_UPDATE',
      zones: zonesStore,
      fps: 30,
      timestamp: new Date().toISOString(),
    });
  }
}, 3000);

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`SentinelOps Command Center running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
