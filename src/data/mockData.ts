import { CameraFeed, IncidentEvent, RawIncidentLog, RiskTimeSeriesData, ZoneData } from '../types/sentinel';

export const INITIAL_ZONES: ZoneData[] = [
  {
    id: 'zone-a',
    name: 'Main Assembly Line 01',
    code: 'Z-01',
    riskLevel: 'low',
    activeWorkers: 14,
    activeViolations: 0,
    sensors: { tempCelsius: 24.2, gasPPM: 12, noiseDB: 68 },
    coordinates: { x: 5, y: 10, width: 42, height: 38 },
    description: 'High-speed robotic assembly and conveyance line.',
    supervisorName: 'Vikram Singh'
  },
  {
    id: 'zone-b',
    name: 'High-Bay Scaffolding Platform',
    code: 'Z-02',
    riskLevel: 'high',
    activeWorkers: 6,
    activeViolations: 2,
    sensors: { tempCelsius: 28.5, gasPPM: 18, noiseDB: 82 },
    coordinates: { x: 52, y: 10, width: 43, height: 38 },
    description: 'Elevated working platform at 18m height. Requires full harness + helmet.',
    supervisorName: 'Ananya Sharma'
  },
  {
    id: 'zone-c',
    name: 'Chemical & Solvent Vault',
    code: 'Z-03',
    riskLevel: 'critical',
    activeWorkers: 3,
    activeViolations: 1,
    sensors: { tempCelsius: 31.0, gasPPM: 48, noiseDB: 74 },
    coordinates: { x: 5, y: 53, width: 42, height: 40 },
    description: 'Restricted chemical storage bay. Respirator mask and high-visibility vest mandatory.',
    supervisorName: 'Rajesh Kumar'
  },
  {
    id: 'zone-d',
    name: 'Heavy Logistics Loading Bay',
    code: 'Z-04',
    riskLevel: 'medium',
    activeWorkers: 8,
    activeViolations: 1,
    sensors: { tempCelsius: 26.8, gasPPM: 22, noiseDB: 89 },
    coordinates: { x: 52, y: 53, width: 43, height: 40 },
    description: 'Forklift transit zone and heavy pallet loading.',
    supervisorName: 'David Miller'
  }
];

export const INITIAL_CAMERAS: CameraFeed[] = [
  {
    id: 'cam-01',
    name: 'CAM-01: Assembly Floor High-Angle',
    location: 'Main Assembly Line 01',
    zoneId: 'zone-a',
    fps: 30,
    status: 'online',
    videoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'cam-02',
    name: 'CAM-02: Scaffolding Elevated View',
    location: 'High-Bay Scaffolding Platform',
    zoneId: 'zone-b',
    fps: 28,
    status: 'online',
    videoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'cam-03',
    name: 'CAM-03: Chemical Vault Entrance',
    location: 'Chemical & Solvent Vault',
    zoneId: 'zone-c',
    fps: 25,
    status: 'online',
    videoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'cam-04',
    name: 'CAM-04: Loading Dock Overhead',
    location: 'Heavy Logistics Loading Bay',
    zoneId: 'zone-d',
    fps: 30,
    status: 'online',
    videoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
  }
];

export const INITIAL_INCIDENTS: IncidentEvent[] = [
  {
    id: 'INC-2026-881',
    timestamp: '2026-07-22T07:12:15Z',
    cameraId: 'cam-02',
    cameraName: 'CAM-02: Scaffolding Elevated View',
    zoneId: 'zone-b',
    zoneName: 'High-Bay Scaffolding Platform',
    violationType: 'Missing Helmet',
    severity: 'high',
    status: 'unacknowledged',
    workerId: 'W-4092',
    missingItems: ['Safety Helmet', 'High-Vis Harness'],
    snapshotUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'INC-2026-880',
    timestamp: '2026-07-22T06:58:30Z',
    cameraId: 'cam-03',
    cameraName: 'CAM-03: Chemical Vault Entrance',
    zoneId: 'zone-c',
    zoneName: 'Chemical & Solvent Vault',
    violationType: 'Restricted Zone Intrusion',
    severity: 'critical',
    status: 'in_progress',
    workerId: 'W-1108',
    missingItems: ['Gas Mask', 'Chemical Gloves'],
    snapshotUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    supervisorAssigned: 'Rajesh Kumar',
    notes: 'Supervisor dispatched via instant WhatsApp alert at 07:00.'
  },
  {
    id: 'INC-2026-879',
    timestamp: '2026-07-22T06:30:10Z',
    cameraId: 'cam-04',
    cameraName: 'CAM-04: Loading Dock Overhead',
    zoneId: 'zone-d',
    zoneName: 'Heavy Logistics Loading Bay',
    violationType: 'Missing Vest',
    severity: 'medium',
    status: 'resolved',
    workerId: 'W-2041',
    missingItems: ['High-Vis Vest'],
    snapshotUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    supervisorAssigned: 'David Miller',
    notes: 'Worker equipped vest after on-site reminder.'
  }
];

export const RISK_TIME_SERIES: RiskTimeSeriesData[] = [
  { time: '00:00', zoneA: 2, zoneB: 8, zoneC: 15, zoneD: 5, overallScore: 92 },
  { time: '04:00', zoneA: 1, zoneB: 12, zoneC: 18, zoneD: 8, overallScore: 88 },
  { time: '08:00', zoneA: 5, zoneB: 35, zoneC: 42, zoneD: 22, overallScore: 78 },
  { time: '12:00', zoneA: 8, zoneB: 68, zoneC: 78, zoneD: 45, overallScore: 65 },
  { time: '16:00', zoneA: 12, zoneB: 82, zoneC: 65, zoneD: 58, overallScore: 62 },
  { time: '20:00', zoneA: 4, zoneB: 45, zoneC: 30, zoneD: 20, overallScore: 84 },
  { time: 'Now', zoneA: 3, zoneB: 72, zoneC: 85, zoneD: 38, overallScore: 71 }
];

export const SAMPLE_RAW_INCIDENT_LOGS: RawIncidentLog[] = [
  {
    id: 'LOG-01',
    date: '2026-07-21',
    shift: 'Morning',
    zone: 'Zone B (Scaffolding)',
    reporter: 'Safety Inspector R. Verma',
    rawText: 'Contractor worker unbuckled safety helmet during scaffold welding at 14m level due to heat discomfort. Chin strap was missing. Supervisor was away for shift handoff.'
  },
  {
    id: 'LOG-02',
    date: '2026-07-20',
    shift: 'Night',
    zone: 'Zone C (Chemical Vault)',
    reporter: 'Night Foreman S. Patil',
    rawText: 'Unidentified technician entered solvent dispensing room without chemical safety goggles and respirator. Vapor alarm hit 45 PPM. Maintenance door was left unlocked.'
  },
  {
    id: 'LOG-03',
    date: '2026-07-19',
    shift: 'Afternoon',
    zone: 'Zone D (Loading Bay)',
    reporter: 'Logistics Supervisor D. Miller',
    rawText: 'Forklift reversed near pallet stack while a contractor stepped inside the yellow hazard border without wearing a high-visibility reflective vest. Near miss reported.'
  },
  {
    id: 'LOG-04',
    date: '2026-07-18',
    shift: 'Morning',
    zone: 'Zone B (Scaffolding)',
    reporter: 'Site Ergonomist A. Roy',
    rawText: 'Worker was observed slouched and over-reaching while carrying heavy cable drums across high bay plank without fall arrest lanyard hooked.'
  },
  {
    id: 'LOG-05',
    date: '2026-07-17',
    shift: 'Night',
    zone: 'Zone A (Assembly Line)',
    reporter: 'Shift Lead K. Rao',
    rawText: 'Assembly worker removed cut-resistant gloves during micro-component alignment to gain finger dexterity. Minor scratch reported.'
  }
];
