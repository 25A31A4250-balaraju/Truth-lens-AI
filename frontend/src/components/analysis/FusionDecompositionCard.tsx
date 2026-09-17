import React from 'react';
import { Layers, Activity, Radio, ShieldCheck, Sparkles, Sliders } from 'lucide-react';
import { AnalysisResponse } from '../../types/forensic';

interface FusionDecompositionCardProps {
  analysis: AnalysisResponse;
}

export const FusionDecompositionCard: React.FC<FusionDecompositionCardProps> = ({ analysis }) => {
  const fusionEvidence = analysis.evidence_items.find(
    (e) => e.evidence_type === 'FUSION_DECOMPOSITION'
  );

  let pctSpatial = 30.0;
  let pctFreq = 25.0;
  let pctBoundary = 25.0;
  let pctSemantic = 20.0;

  if (fusionEvidence) {
    const sMatch = fusionEvidence.description.match(/Spatial\s*\(([0-9.]+)%/);
    const fMatch = fusionEvidence.description.match(/Frequency\s*\(([0-9.]+)%/);
    const bMatch = fusionEvidence.description.match(/Boundary\s*\(([0-9.]+)%/);
    const semMatch = fusionEvidence.description.match(/Semantic\s*\(([0-9.]+)%/);

    if (sMatch) pctSpatial = parseFloat(sMatch[1]);
    if (fMatch) pctFreq = parseFloat(fMatch[1]);
    if (bMatch) pctBoundary = parseFloat(bMatch[1]);
    if (semMatch) pctSemantic = parseFloat(semMatch[1]);
  }

  const modalities = [
    {
      name: 'Spatial Modality',
      pct: pctSpatial,
      color: 'bg-blue-600',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: Layers,
      sources: 'Effort (ConvNeXt), Xception, Patch Gradient Texture',
      description: 'Localized pixel anomalies, gradient variances, and structural facial regions.'
    },
    {
      name: 'Frequency Modality',
      pct: pctFreq,
      color: 'bg-violet-600',
      textColor: 'text-violet-700',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      icon: Radio,
      sources: 'F3Net Dual-Stream, 2D-FFT Radial Heatmap, Spectral Entropy',
      description: 'Fourier frequency energy distribution, high/low band ratio, and lattice artifacts.'
    },
    {
      name: 'Boundary Modality',
      pct: pctBoundary,
      color: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: ShieldCheck,
      sources: 'SBI (Self-Blending Images Boundary Anomaly Detector)',
      description: 'Blending seams, facial landmark border discrepancies, and cut-and-paste edges.'
    },
    {
      name: 'Semantic Modality',
      pct: pctSemantic,
      color: 'bg-amber-600',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: Sparkles,
      sources: 'LSDA Cross-Architecture, DINOv2 ViT-S/14 Foundation Embeddings',
      description: 'High-level contextual coherence and feature manifold alignment distance.'
    }
  ];

  return (
    <div className="forensic-card overflow-hidden">
      <div className="forensic-panel-header">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span>Interpretable Multi-Modal Fusion Engine</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Signal Contribution Share</span>
      </div>

      <div className="p-5 space-y-5">
        {/* Visual Stacked Modality Share Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Modality Contribution Distribution</span>
            <span className="font-mono text-[11px]">Normalized to 100%</span>
          </div>
          <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200 shadow-inner">
            <div
              style={{ width: `${pctSpatial}%` }}
              className="bg-blue-600 h-full transition-all duration-500"
              title={`Spatial: ${pctSpatial.toFixed(1)}%`}
            />
            <div
              style={{ width: `${pctFreq}%` }}
              className="bg-violet-600 h-full transition-all duration-500"
              title={`Frequency: ${pctFreq.toFixed(1)}%`}
            />
            <div
              style={{ width: `${pctBoundary}%` }}
              className="bg-emerald-600 h-full transition-all duration-500"
              title={`Boundary: ${pctBoundary.toFixed(1)}%`}
            />
            <div
              style={{ width: `${pctSemantic}%` }}
              className="bg-amber-600 h-full transition-all duration-500"
              title={`Semantic: ${pctSemantic.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* 4 Modality Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {modalities.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded border ${m.borderColor} ${m.bgColor} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${m.textColor}`} />
                      <span className="font-bold text-xs text-slate-800">{m.name}</span>
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-800 px-2 py-0.5 rounded bg-white/80 border border-slate-200">
                      {m.pct.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                    {m.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[10px] font-mono text-slate-500 truncate">
                  Signals: {m.sources}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mathematical Transparency Note */}
        <div className="p-3 rounded bg-slate-100/80 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
          <Activity className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11px]">
            <span className="font-semibold text-slate-800">Quality-Conditioned Fusion: </span>
            Contributions are computed as C_m = (|w_m(Q) · x_m| / Σ |w_k(Q) · x_k|) × 100%.
            When image degradation is detected, spatial and boundary weights attenuate automatically to prevent false positives from blur or compression artifacts.
          </div>
        </div>
      </div>
    </div>
  );
};
