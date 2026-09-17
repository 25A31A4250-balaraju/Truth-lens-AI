import React from 'react';
import { Compass, AlertTriangle, CheckCircle2, Cpu, Network } from 'lucide-react';
import { AnalysisResponse } from '../../types/forensic';

interface OODMetricCardProps {
  analysis: AnalysisResponse;
}

export const OODMetricCard: React.FC<OODMetricCardProps> = ({ analysis }) => {
  const oodEvidence = analysis.evidence_items.find(
    (e) => e.evidence_type === 'OOD_DISTRIBUTION_ANALYSIS'
  );

  let oodScore = 0.15;
  let cosineDist = '0.280';
  let isOOD = analysis.overall_verdict === 'SUSPECTED_OOD';
  let status: 'IN_DISTRIBUTION' | 'MODERATE_SHIFT' | 'SUSPECTED_OOD' = 'IN_DISTRIBUTION';

  if (oodEvidence) {
    oodScore = oodEvidence.score;
    const distMatch = oodEvidence.description.match(/Cosine distance:\s*([0-9.]+)/);
    if (distMatch) cosineDist = distMatch[1];

    if (oodScore >= 0.65 || isOOD) {
      status = 'SUSPECTED_OOD';
    } else if (oodScore >= 0.35) {
      status = 'MODERATE_SHIFT';
    } else {
      status = 'IN_DISTRIBUTION';
    }
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'SUSPECTED_OOD':
        return {
          label: 'Suspected OOD / Novel Architecture',
          color: 'bg-orange-50 text-orange-800 border-orange-300',
          icon: AlertTriangle,
          badgeBg: 'bg-orange-600',
          desc: 'Feature embedding lies significantly outside reference manifold. Suspected unseen generative model.'
        };
      case 'MODERATE_SHIFT':
        return {
          label: 'Moderate Representation Shift',
          color: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: Compass,
          badgeBg: 'bg-amber-500',
          desc: 'Mild domain discrepancy detected from standard photographic reference distribution.'
        };
      case 'IN_DISTRIBUTION':
      default:
        return {
          label: 'In-Distribution (Reference Manifold)',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
          badgeBg: 'bg-emerald-600',
          desc: 'Features align well with standard photographic reference representations.'
        };
    }
  };

  const cfg = getStatusConfig();
  const StatusIcon = cfg.icon;

  return (
    <div className="forensic-card overflow-hidden">
      <div className="forensic-panel-header">
        <div className="flex items-center gap-2">
          <Network className="w-3.5 h-3.5 text-slate-500" />
          <span>Semantic Foundation Embeddings & OOD Manifold Shift</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">DINOv2 ViT-S/14 (384-Dim)</span>
      </div>

      <div className="p-5 space-y-5">
        {/* Status Pill */}
        <div className={`p-3.5 rounded border ${cfg.color} flex items-start gap-3 text-xs`}>
          <StatusIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold uppercase tracking-wider font-mono text-[11px]">
              {cfg.label}
            </div>
            <div className="text-slate-700 leading-relaxed">
              {oodEvidence ? oodEvidence.description : cfg.desc}
            </div>
          </div>
        </div>

        {/* Radar / Distance Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gauge 1: Cosine Distance to Manifold */}
          <div className="p-4 rounded bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-medium">Manifold Cosine Distance</span>
              <span className="font-mono font-bold text-slate-800">
                {cosineDist}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 ${
                  status === 'SUSPECTED_OOD' ? 'bg-orange-500' :
                  status === 'MODERATE_SHIFT' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, parseFloat(cosineDist) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Distance metric: 1.0 - cos_sim(v, μ_ref)
            </div>
          </div>

          {/* Gauge 2: Out-Of-Distribution Index */}
          <div className="p-4 rounded bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-medium">OOD Shift Index</span>
              <span className="font-mono font-bold text-slate-800">
                {(oodScore * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 ${
                  status === 'SUSPECTED_OOD' ? 'bg-orange-500' :
                  status === 'MODERATE_SHIFT' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${oodScore * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Threshold: &gt; 65.0% flags SUSPECTED_OOD
            </div>
          </div>

          {/* Gauge 3: Representation Vector Info */}
          <div className="p-4 rounded bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-medium">Foundation Vector</span>
              <span className="font-mono font-bold text-slate-800">
                384-D Unit L2
              </span>
            </div>
            <div className="text-[11px] text-slate-600 mb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span>DINOv2 ViT-S/14 Semantic Space</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Persisted in forensic_embeddings table
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
