import React, { useRef, useEffect, useState } from 'react';
import { CameraFeed, ZoneIntrusionPoint } from '../types/sentinel';
import { Camera, Eye, ShieldAlert, Sparkles, Sliders, RefreshCw, Layers, Crosshair, AlertCircle, CheckCircle2 } from 'lucide-react';

interface VisionFeedProps {
  cameras: CameraFeed[];
  onTriggerViolation: (cameraName: string, zoneId: string, violationType: string) => void;
}

export const VisionFeed: React.FC<VisionFeedProps> = ({ cameras, onTriggerViolation }) => {
  const [selectedCamId, setSelectedCamId] = useState<string>('cam-02');
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.85);
  const [showPoseSkeleton, setShowPoseSkeleton] = useState<boolean>(true);
  const [showPPEBoxes, setShowPPEBoxes] = useState<boolean>(true);
  const [showZoneBoundary, setShowZoneBoundary] = useState<boolean>(true);
  const [isDrawingZone, setIsDrawingZone] = useState<boolean>(false);
  const [zonePoints, setZonePoints] = useState<ZoneIntrusionPoint[]>([
    { x: 55, y: 25 },
    { x: 92, y: 25 },
    { x: 92, y: 85 },
    { x: 55, y: 85 },
  ]);

  const [aiAuditing, setAiAuditing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{ analysis: string; timestamp?: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentCam = cameras.find((c) => c.id === selectedCamId) || cameras[0];

  // Handle Webcam Start/Stop
  useEffect(() => {
    if (selectedCamId === 'webcam') {
      setIsWebcamActive(true);
      navigator.mediaDevices
        .getUserMedia({ video: { width: 1280, height: 720 } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.error('Webcam access error:', err);
          alert('Could not access camera. Reverting to pre-recorded CCTV feed.');
          setSelectedCamId('cam-02');
          setIsWebcamActive(false);
        });
    } else {
      setIsWebcamActive(false);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [selectedCamId]);

  // Main Canvas Rendering Loop (Drawing OpenCV/YOLO Simulation overlays)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Background Image or Video
      if (isWebcamActive && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);
      } else {
        // Draw CCTV image representation
        const img = new Image();
        img.src = currentCam.videoUrl || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80';
        if (img.complete) {
          ctx.drawImage(img, 0, 0, width, height);
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, width, height);
        }
      }

      // Dark Overlay Tint for UI clarity
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Draw Digital Camera Viewfinder Crosshairs
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
      ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
      ctx.stroke();

      // 2. Draw Zone Intrusion Boundary Polygon if enabled
      if (showZoneBoundary && zonePoints.length >= 3) {
        ctx.beginPath();
        zonePoints.forEach((p, idx) => {
          const px = (p.x / 100) * width;
          const py = (p.y / 100) * height;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();

        // Polygon Glow Fill
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#ef4444';
        ctx.stroke();
        ctx.setLineDash([]);

        // Zone Label
        const startX = (zonePoints[0].x / 100) * width;
        const startY = (zonePoints[0].y / 100) * height;
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('⛔ RESTRICTED ZONE A-02 (INTRUSION MONITORED)', startX + 10, startY + 20);
      }

      // 3. Draw Simulated YOLOv8 Bounding Boxes for Workers
      if (showPPEBoxes) {
        // --- Worker 1: Fully Compliant ---
        const w1X = (0.18 + Math.sin(time * 0.5) * 0.02) * width;
        const w1Y = 0.28 * height;
        const w1W = 0.18 * width;
        const w1H = 0.55 * height;

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#10b981'; // Green
        ctx.strokeRect(w1X, w1Y, w1W, w1H);

        // Header Label
        ctx.fillStyle = '#10b981';
        ctx.fillRect(w1X, w1Y - 24, w1W, 24);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`WORKER #104 | COMPLIANT [${(confidenceThreshold * 100).toFixed(0)}%]`, w1X + 6, w1Y - 8);

        // Sub-tags
        ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
        ctx.font = '10px monospace';
        ctx.fillText('✔ Helmet  ✔ Vest  ✔ Gloves', w1X + 4, w1Y + 16);

        // --- Worker 2: PPE Breach / Intrusion ---
        const w2X = (0.62 + Math.cos(time * 0.4) * 0.01) * width;
        const w2Y = 0.22 * height;
        const w2W = 0.22 * width;
        const w2H = 0.62 * height;

        const isBlinking = Math.floor(time * 4) % 2 === 0;
        ctx.lineWidth = 3;
        ctx.strokeStyle = isBlinking ? '#ef4444' : '#f59e0b'; // Red / Amber Flash
        ctx.strokeRect(w2X, w2Y, w2W, w2H);

        // Header Label
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(w2X, w2Y - 26, w2W, 26);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('⚠ VIOLATION: MISSING HELMET & VEST', w2X + 6, w2Y - 8);

        // Warning Badges
        ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
        ctx.fillRect(w2X + 4, w2Y + 8, 140, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('❌ HELMET MISSING', w2X + 8, w2Y + 20);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
        ctx.fillRect(w2X + 4, w2Y + 30, 140, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('❌ HIGH-VIS VEST MISSING', w2X + 8, w2Y + 42);

        // 4. Draw MediaPipe Pose Estimation Skeleton
        if (showPoseSkeleton) {
          // Worker 2 Pose Skeleton
          const headX = w2X + w2W * 0.5;
          const headY = w2Y + w2H * 0.12;
          const neckX = headX;
          const neckY = w2Y + w2H * 0.25;
          const lShoulderX = w2X + w2W * 0.25;
          const rShoulderX = w2X + w2W * 0.75;
          const shoulderY = w2Y + w2H * 0.3;
          const hipX = headX + Math.sin(time) * 12; // Slouched lean
          const hipY = w2Y + w2H * 0.65;

          ctx.strokeStyle = '#06b6d4'; // Cyan joints
          ctx.lineWidth = 2;

          // Connect bones
          ctx.beginPath();
          ctx.moveTo(headX, headY); ctx.lineTo(neckX, neckY);
          ctx.moveTo(neckX, neckY); ctx.lineTo(lShoulderX, shoulderY);
          ctx.moveTo(neckX, neckY); ctx.lineTo(rShoulderX, shoulderY);
          ctx.moveTo(neckX, neckY); ctx.lineTo(hipX, hipY);
          ctx.stroke();

          // Joint Keypoints
          [ {x: headX, y: headY}, {x: neckX, y: neckY}, {x: lShoulderX, y: shoulderY}, {x: rShoulderX, y: shoulderY}, {x: hipX, y: hipY} ].forEach((pt) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
          });

          // Posture Alert Label
          ctx.fillStyle = '#f59e0b';
          ctx.font = '10px sans-serif';
          ctx.fillText('Ergonomic Lean: 38° (Slip Risk)', w2X + 6, w2Y + w2H - 12);
        }
      }

      // Draw Top OSD Telemetry Banner
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(10, 10, width - 20, 32);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeRect(10, 10, width - 20, 32);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`CAM: ${currentCam.name} | CONF: ${(confidenceThreshold * 100).toFixed(0)}% | FPS: 30`, 22, 31);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('🔴 LIVE YOLOv8 + MEDIAPIPE INFERENCE ENGINE ACTIVE', width - 380, 31);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [currentCam, isWebcamActive, confidenceThreshold, showPoseSkeleton, showPPEBoxes, showZoneBoundary, zonePoints]);

  // Handle Clicking Canvas to Draw Zone Points
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingZone || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (zonePoints.length >= 6) {
      setZonePoints([{ x, y }]);
    } else {
      setZonePoints((prev) => [...prev, { x, y }]);
    }
  };

  // Perform Gemini Multimodal Frame Audit
  const handleAuditiWithGemini = async () => {
    if (!canvasRef.current) return;
    setAiAuditing(true);
    try {
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
      const res = await fetch('/api/vision/analyze-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          zoneName: currentCam.location,
        }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (e) {
      console.error(e);
      alert('Gemini Vision analysis failed. Check API key status.');
    } finally {
      setAiAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar & Camera Selector */}
      <div className="bg-[#0A0D14] border border-white/10 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Camera Selector */}
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Select Feed:</span>
          <select
            value={selectedCamId}
            onChange={(e) => setSelectedCamId(e.target.value)}
            className="bg-[#05070A] border border-white/10 text-slate-100 font-mono text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-400 focus:outline-none"
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.location})
              </option>
            ))}
            <option value="webcam">🎥 Live Webcam (Browser Feed - Judge Demo)</option>
          </select>
        </div>

        {/* Feature Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPPEBoxes(!showPPEBoxes)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              showPPEBoxes
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-[#05070A] border-white/10 text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>PPE Bounding Boxes</span>
          </button>

          <button
            onClick={() => setShowPoseSkeleton(!showPoseSkeleton)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              showPoseSkeleton
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                : 'bg-[#05070A] border-white/10 text-slate-400'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>MediaPipe Pose</span>
          </button>

          <button
            onClick={() => setShowZoneBoundary(!showZoneBoundary)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              showZoneBoundary
                ? 'bg-red-500/10 border-red-500/40 text-red-400'
                : 'bg-[#05070A] border-white/10 text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Restricted Boundary</span>
          </button>

          <button
            onClick={() => setIsDrawingZone(!isDrawingZone)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              isDrawingZone
                ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-[#05070A] border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Click on the video canvas to draw custom virtual restricted boundary points"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{isDrawingZone ? 'Click Canvas to Add Points' : '✏ Draw Custom Zone'}</span>
          </button>
        </div>

        {/* Confidence Threshold Slider */}
        <div className="flex items-center space-x-3 bg-[#05070A] px-3 py-1.5 rounded-lg border border-white/10 text-xs">
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-mono text-[10px]">YOLO CONF: {(confidenceThreshold * 100).toFixed(0)}%</span>
          <input
            type="range"
            min="0.5"
            max="0.95"
            step="0.05"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-20 accent-emerald-400 cursor-pointer"
          />
        </div>

      </div>

      {/* Main Vision Canvas Display */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Canvas Area (3 Cols) */}
        <div className="lg:col-span-3 bg-[#05070A] border border-white/10 rounded-xl p-2 relative shadow-2xl overflow-hidden group">
          <video ref={videoRef} className="hidden" playInline muted />
          
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            onClick={handleCanvasClick}
            className={`w-full aspect-video rounded-lg bg-black object-cover ${
              isDrawingZone ? 'cursor-crosshair ring-2 ring-emerald-400' : ''
            }`}
          />

          {isDrawingZone && (
            <div className="absolute top-4 left-4 bg-emerald-500 text-black px-3 py-1 rounded-md text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse">
              ✏ Zone Drawing Active ({zonePoints.length} points set). Click canvas frame.
            </div>
          )}

          {/* Action Overlay Floating Bar */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between bg-[#0A0D14]/90 backdrop-blur-md p-3 rounded-lg border border-white/10 text-xs gap-3">
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-ping" />
              <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest">YOLOv8 + MEDIAPIPE INFERENCE ENGINE</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onTriggerViolation(currentCam.name, currentCam.zoneId, 'Missing Helmet')}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 font-bold px-3 py-1.5 rounded-lg transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)] flex items-center space-x-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Simulate Breach</span>
              </button>

              <button
                onClick={handleAuditiWithGemini}
                disabled={aiAuditing}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center space-x-1.5 disabled:opacity-50"
              >
                {aiAuditing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Gemini Vision Audit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-Time Detection Feed Sidebar (1 Col) */}
        <div className="bg-[#0A0D14] border border-white/10 rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Live Telemetry</span>
              </h3>
              <span className="bg-white/5 border border-white/10 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded">
                2 Persons
              </span>
            </div>

            <div className="space-y-3">
              
              {/* Person 1 Box */}
              <div className="bg-[#05070A] border border-emerald-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Worker #104</span>
                  </span>
                  <span className="text-slate-400 text-[10px] font-mono">CONF: 98%</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300 font-mono">
                  <span className="text-emerald-400">✔ Helmet OK</span>
                  <span className="text-emerald-400">✔ Vest OK</span>
                  <span className="text-emerald-400">✔ Gloves OK</span>
                  <span className="text-emerald-400">✔ Posture OK</span>
                </div>
              </div>

              {/* Person 2 Box (Violation) */}
              <div className="bg-[#05070A] border border-red-500/50 rounded-lg p-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-red-400 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Worker #409</span>
                  </span>
                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                    HIGH RISK
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-[11px] font-mono">
                  <span className="text-red-400 font-semibold">❌ NO HELMET</span>
                  <span className="text-red-400 font-semibold">❌ NO VEST</span>
                  <span className="text-amber-400">⚠ LEAN: 38°</span>
                  <span className="text-red-400 font-semibold">⛔ ZONE INTRUSION</span>
                </div>
              </div>

            </div>
          </div>

          {/* Gemini Vision Result Modal/Panel */}
          {aiResult && (
            <div className="bg-[#05070A] border border-emerald-500/40 rounded-lg p-3 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Gemini Multimodal AI Audit:</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {aiResult.analysis}
              </p>
              <button
                onClick={() => setAiResult(null)}
                className="text-emerald-400 hover:underline text-[10px] font-mono font-semibold"
              >
                Dismiss Audit
              </button>
            </div>
          )}

          {/* Camera Info */}
          <div className="bg-[#05070A] p-3 rounded-lg border border-white/10 text-[10px] font-mono text-slate-400 space-y-1">
            <div className="text-slate-200 font-bold">{currentCam.name}</div>
            <div>ZONE: <span className="text-slate-300">{currentCam.location}</span></div>
            <div>STREAM: <span className="text-emerald-400">30 FPS LATENCY 14ms</span></div>
          </div>

        </div>

      </div>

    </div>
  );
};
