export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface BoundingBox {
  id: string;
  label: string;
  isCompliant: boolean;
  confidence: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage
  height: number; // percentage
  missingItems?: string[];
  postureAlert?: string;
}

export interface ZoneIntrusionPoint {
  x: number; // 0-100 percentage relative to canvas
  y: number;
}

export interface ZoneData {
  id: string;
  name: string;
  code: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  activeWorkers: number;
  activeViolations: number;
  sensors: {
    tempCelsius: number;
    gasPPM: number;
    noiseDB: number;
  };
  coordinates: { x: number; y: number; width: number; height: number };
  description: string;
  supervisorName: string;
}

export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  zoneId: string;
  fps: number;
  status: 'online' | 'degraded' | 'offline';
  videoUrl?: string;
  isWebcam?: boolean;
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  zoneId: string;
  zoneName: string;
  violationType: 'Missing Helmet' | 'Missing Vest' | 'Restricted Zone Intrusion' | 'Dangerous Posture / Fall' | 'Toxic Gas Elevation' | 'Multiple PPE Breach';
  severity: SeverityLevel;
  status: 'unacknowledged' | 'in_progress' | 'resolved';
  workerId?: string;
  missingItems: string[];
  snapshotUrl: string;
  supervisorAssigned?: string;
  notes?: string;
  webhookDispatched?: boolean;
}

export interface RiskTimeSeriesData {
  time: string;
  zoneA: number;
  zoneB: number;
  zoneC: number;
  zoneD: number;
  overallScore: number;
}

export interface RawIncidentLog {
  id: string;
  date: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
  zone: string;
  rawText: string;
  reporter: string;
}

export interface GeminiNLPAnalysisResult {
  topRootCauses: { cause: string; percentage: number; rationale: string }[];
  complianceGaps: string[];
  preventativeActions: { action: string; priority: 'Immediate' | 'Medium' | 'Routine'; assignedRole: string }[];
  executiveSummary: string;
  oshaComplianceScore: number;
  suggestedPPEPolicyUpdates: string[];
}
