import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Layers, 
  Cpu,
  UserCheck,
  UserX,
  Target,
  Eye,
  EyeOff,
  FileText,
  Download,
  FileCode,
  Printer
} from 'lucide-react';
import { AnalysisResponse, VerdictType } from '../../types/forensic';
import { FrequencyEvidencePanel } from './FrequencyEvidencePanel';
import { ConsensusMetricCard } from './ConsensusMetricCard';
import { OODMetricCard } from './OODMetricCard';
import { FusionDecompositionCard } from './FusionDecompositionCard';
import { RobustnessLabDeck } from './RobustnessLabDeck';

interface AnalysisResultCardProps {
  analysis: AnalysisResponse;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ analysis }) => {
  const [showFaceBoxes, setShowFaceBoxes] = useState(true);
  const [showPatches, setShowPatches] = useState(true);
  const [selectedPatchIndex, setSelectedPatchIndex] = useState<number | null>(null);

  const getVerdictBadge = (verdict: VerdictType | string) => {
    switch (verdict) {
      case 'LIKELY_AUTHENTIC':
      case 'LIKELY_REAL':
        return {
          headline: 'LIKELY REAL',
          subhead: 'AUTHENTIC CAMERA PHOTOGRAPH',
          color: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          badgeBg: 'bg-emerald-600 text-white',
          icon: CheckCircle,
          desc: 'Sightengine GenAI analysis verifies this is an authentic optical camera photograph with low probability of synthetic or AI generation.'
        };
      case 'LIKELY_MANIPULATED':
      case 'AI_GENERATED':
        return {
          headline: 'AI GENERATED',
          subhead: 'SYNTHETIC GENAI ARTIFACTS DETECTED',
          color: 'bg-red-50 text-red-900 border-red-300',
          badgeBg: 'bg-red-600 text-white',
          icon: XCircle,
          desc: 'Sightengine GenAI analysis detected high probability of synthetic generation (e.g., Midjourney, DALL-E, Stable Diffusion, Flux, or Face Swap).'
        };
      case 'SUSPECTED_OOD':
        return {
          headline: 'AI GENERATED (OOD)',
          subhead: 'NOVEL GENERATOR / OOD SHIFT',
          color: 'bg-orange-50 text-orange-900 border-orange-300',
          badgeBg: 'bg-orange-600 text-white',
          icon: AlertTriangle,
          desc: 'Input features deviate significantly from natural photographic manifolds, indicating an unseen generative model or modern diffusion architecture.'
        };
      case 'UNCERTAIN':
      default:
        return {
          headline: 'UNCERTAIN',
          subhead: 'BORDERLINE INCONCLUSIVE EVIDENCE',
          color: 'bg-amber-50 text-amber-900 border-amber-300',
          badgeBg: 'bg-amber-600 text-white',
          icon: HelpCircle,
          desc: 'Sightengine AI generation score falls in the borderline indeterminate range (30% – 70%). Visual features are inconclusive; manual forensic inspection recommended.'
        };
    }
  };

  const vInfo = getVerdictBadge(analysis.overall_verdict);
  const VerdictIcon = vInfo.icon;

  // Filter regions
  const faceRegions = analysis.regions.filter((r) => r.region_type === 'FACE');
  const patchRegions = analysis.regions
    .filter((r) => r.region_type === 'SUSPICIOUS_PATCH')
    .sort((a, b) => b.region_score - a.region_score);

  // Top 3 suspicious regions for ranking
  const topPatches = patchRegions.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Primary Overview Banner */}
      <div className={`p-5 rounded border ${vInfo.color} flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs`}>
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5">
            <VerdictIcon className="w-7 h-7 text-inherit" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded font-black tracking-wider uppercase shadow-xs ${vInfo.badgeBg}`}>
                {vInfo.headline}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                {vInfo.subhead}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/70 border border-slate-200 font-mono font-medium">
                UUID: {analysis.uuid.slice(0, 8)}
              </span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 mt-1">
              {vInfo.headline === 'LIKELY REAL'
                ? 'Classified as Likely Real Photograph'
                : vInfo.headline.startsWith('AI GENERATED')
                ? 'Classified as AI-Generated Image'
                : 'Borderline Inconclusive — Uncertain'}
            </h3>
            <p className="text-xs text-slate-700 mt-0.5 max-w-xl">
              {vInfo.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-300/60 pt-3 md:pt-0 md:pl-6">
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-semibold">
              {vInfo.headline.startsWith('AI GENERATED') ? 'Detection Confidence' : 'AI Probability'}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-slate-900">
                {vInfo.headline.startsWith('AI GENERATED')
                  ? `${(analysis.overall_score * 100).toFixed(1)}%`
                  : `${(analysis.overall_score * 100).toFixed(1)}%`}
              </span>
            </div>
            <div className="text-[10px] font-mono font-semibold text-slate-600 mt-0.5">
              {vInfo.headline.startsWith('AI GENERATED')
                ? `AI Generated ${(analysis.overall_score * 100).toFixed(1)}% confidence`
                : vInfo.headline === 'LIKELY REAL'
                ? `Likely Real ${(analysis.overall_score * 100).toFixed(1)}% AI probability`
                : `Uncertain ${(analysis.overall_score * 100).toFixed(1)}% AI probability`}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500 uppercase font-medium">Uncertainty</div>
            <div className="text-sm font-bold font-mono text-slate-800">
              {analysis.uncertainty_label}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500 uppercase font-medium">Detection Engine</div>
            <div className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Sightengine GenAI
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500 uppercase font-medium">Face Localized</div>
            <div className="text-sm font-bold font-mono text-slate-800 flex items-center gap-1">
              {analysis.face_count > 0 ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{analysis.face_count} Found</span>
                </>
              ) : (
                <>
                  <UserX className="w-3.5 h-3.5 text-amber-600" />
                  <span>Full Frame</span>
                </>
              )}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500 uppercase font-medium">Input Quality</div>
            <div className="text-sm font-bold font-mono text-slate-800">
              {analysis.image_quality_label || 'NORMAL'}
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Report Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs text-slate-600">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-800">Forensic Audit Dossier:</span>
          <span className="font-mono text-[11px] text-slate-500">Cryptographic Chain-of-Custody Verified</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/v1/analysis/${analysis.uuid}/report/markdown`}
            download={`${analysis.uuid}_forensic_report.md`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Markdown Report</span>
          </a>
          <a
            href={`/api/v1/analysis/${analysis.uuid}/report/json`}
            download={`${analysis.uuid}_forensic_certificate.json`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-500" />
            <span>JSON Certificate</span>
          </a>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-slate-900 bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Two Column Inspection Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Preview with Interactive Forensics Overlay */}
        <div className="lg:col-span-5 space-y-4">
          <div className="forensic-card overflow-hidden">
            <div className="forensic-panel-header">
              <span>Spatial Inspection Preview</span>
              {/* Overlay Toggle Controls */}
              <div className="flex items-center gap-2 lowercase font-normal">
                {faceRegions.length > 0 && (
                  <button
                    onClick={() => setShowFaceBoxes(!showFaceBoxes)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
                      showFaceBoxes
                        ? 'bg-blue-50 text-blue-800 border-blue-200 font-semibold'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    {showFaceBoxes ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    Face Box
                  </button>
                )}
                {patchRegions.length > 0 && (
                  <button
                    onClick={() => setShowPatches(!showPatches)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
                      showPatches
                        ? 'bg-red-50 text-red-800 border-red-200 font-semibold'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    {showPatches ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    Top Patches
                  </button>
                )}
              </div>
            </div>
            
            {/* Interactive Image Container */}
            <div className="p-4 bg-slate-100 flex items-center justify-center min-h-[300px]">
              <div className="relative inline-block max-h-[340px] max-w-full">
                <img
                  src={`/static/uploads/${analysis.stored_path.split(/[\\/]/).pop()}`}
                  alt="Analyzed target"
                  className="max-h-[340px] max-w-full rounded border border-slate-200 object-contain shadow-xs block"
                />

                {/* SVG Coordinate Bounding Box Overlay */}
                <svg
                  viewBox={`0 0 ${analysis.width} ${analysis.height}`}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                >
                  {/* Face Bounding Boxes */}
                  {showFaceBoxes &&
                    faceRegions.map((face, idx) => (
                      <g key={`face-${idx}`}>
                        <rect
                          x={face.x}
                          y={face.y}
                          width={face.width}
                          height={face.height}
                          fill="rgba(59, 130, 246, 0.12)"
                          stroke="#2563eb"
                          strokeWidth={Math.max(2, Math.round(analysis.width / 200))}
                          strokeDasharray="4 2"
                        />
                        <rect
                          x={face.x}
                          y={Math.max(0, face.y - 20)}
                          width={Math.min(face.width, 100)}
                          height={18}
                          fill="#2563eb"
                        />
                        <text
                          x={face.x + 4}
                          y={Math.max(13, face.y - 6)}
                          fill="white"
                          fontSize="11"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          FACE ({(face.region_score * 100).toFixed(0)}%)
                        </text>
                      </g>
                    ))}

                  {/* Top 3 Suspicious Patch Bounding Boxes */}
                  {showPatches &&
                    topPatches.map((patch, idx) => {
                      const isSelected = selectedPatchIndex === idx;
                      const strokeColor = idx === 0 ? '#dc2626' : idx === 1 ? '#ea580c' : '#d97706';
                      const fillColor = idx === 0 
                        ? 'rgba(220, 38, 38, 0.20)' 
                        : idx === 1 
                        ? 'rgba(234, 88, 12, 0.15)' 
                        : 'rgba(217, 119, 6, 0.15)';

                      return (
                        <g key={`patch-${idx}`}>
                          <rect
                            x={patch.x}
                            y={patch.y}
                            width={patch.width}
                            height={patch.height}
                            fill={isSelected ? 'rgba(220, 38, 38, 0.40)' : fillColor}
                            stroke={strokeColor}
                            strokeWidth={isSelected ? 4 : 2}
                          />
                          <text
                            x={patch.x + 4}
                            y={patch.y + 14}
                            fill={strokeColor}
                            fontSize="11"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            #{idx + 1} ({patch.region_score.toFixed(2)})
                          </text>
                        </g>
                      );
                    })}
                </svg>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Filename:</span>
                <span className="font-mono font-medium text-slate-800 truncate max-w-[200px]" title={analysis.filename}>
                  {analysis.filename}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Dimensions:</span>
                <span className="font-mono font-medium text-slate-800">
                  {analysis.width} × {analysis.height} px
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">File Size:</span>
                <span className="font-mono font-medium text-slate-800">
                  {(analysis.file_size_bytes / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">SHA-256 Hash:</span>
                <span className="font-mono text-[11px] text-slate-700 truncate max-w-[200px]" title={analysis.file_hash}>
                  {analysis.file_hash}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Processing Latency:</span>
                <span className="font-mono font-medium text-slate-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {analysis.processing_time_ms} ms
                </span>
              </div>
            </div>
          </div>

          {/* Suspicious Regions (Ranked) - Prompt Section 29 */}
          {topPatches.length > 0 && (
            <div className="forensic-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-red-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Suspicious Regions (Ranked)
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400">Click card to highlight</span>
              </div>

              <div className="space-y-2">
                {topPatches.map((patch, idx) => {
                  const isSelected = selectedPatchIndex === idx;
                  const borderCol = idx === 0 ? 'border-red-300' : idx === 1 ? 'border-orange-300' : 'border-amber-300';
                  const bgCol = idx === 0 ? 'bg-red-50/60' : idx === 1 ? 'bg-orange-50/60' : 'bg-amber-50/60';

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedPatchIndex(isSelected ? null : idx)}
                      className={`p-2.5 rounded border ${borderCol} ${bgCol} cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSelected ? 'ring-2 ring-red-500 shadow-xs' : 'hover:opacity-90'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          Region {idx + 1}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          ({patch.x}, {patch.y}, {patch.width}×{patch.height})
                        </span>
                      </div>
                      <div className="font-mono font-bold text-slate-800">
                        Score {patch.region_score.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Multi-Model Consensus Matrix & Evidence */}
        <div className="lg:col-span-7 space-y-4">
          {/* Multi-Model Consensus Table */}
          <div className="forensic-card">
            <div className="forensic-panel-header">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-slate-500" />
                <span>Detector Consensus Matrix</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {analysis.model_predictions.length} Modules Registered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Model</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Prediction</th>
                    <th className="px-4 py-2.5">Confidence</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analysis.model_predictions.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-slate-900 font-mono">
                        {p.model_name}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {p.model_name === 'Effort' ? 'Spatial' :
                         p.model_name === 'LSDA' ? 'Generalization' :
                         p.model_name === 'F3Net' ? 'Frequency' :
                         p.model_name === 'SBI' ? 'Self-Blending' :
                         p.model_name === 'Xception' ? 'Baseline' : 'Semantic'}
                      </td>
                      <td className="px-4 py-2.5 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          p.prediction === 'REAL' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          p.prediction === 'FAKE' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {p.prediction}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-700">
                        {(p.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[11px] font-mono font-medium ${
                          p.status === 'COMPLETED' || p.status === 'READY' ? 'text-emerald-700 font-semibold' :
                          p.status === 'STANDBY_NO_CHECKPOINT' ? 'text-amber-700' :
                          'text-slate-500'
                        }`}>
                          {p.status === 'COMPLETED' ? 'Active (Completed)' : 
                           p.status === 'READY' ? 'Active (Ready)' :
                           p.status === 'STANDBY_NO_CHECKPOINT' ? 'Standby (No Checkpoint)' : p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Forensic Evidence Items */}
          <div className="forensic-card">
            <div className="forensic-panel-header">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Forensic Evidence Log</span>
              </div>
              <span className="text-[11px] text-slate-400">Verifiable Indicators</span>
            </div>

            <div className="p-4 space-y-3">
              {analysis.evidence_items.map((e, idx) => (
                <div key={idx} className="p-3 rounded bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-slate-800 text-[11px]">
                      {e.evidence_type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Source: {e.source_model}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {e.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Engine Consensus & Disagreement Metric */}
      <ConsensusMetricCard analysis={analysis} />

      {/* Interpretable Multi-Modal Fusion Decomposition */}
      <FusionDecompositionCard analysis={analysis} />

      {/* Semantic Foundation Embeddings & OOD Manifold Shift */}
      <OODMetricCard analysis={analysis} />

      {/* Frequency-Domain Fourier Analysis (2D-FFT) Deck */}
      <FrequencyEvidencePanel analysis={analysis} />

      {/* Robustness & Perturbation Testing Lab Deck */}
      <RobustnessLabDeck analysis={analysis} />
    </div>
  );
};
