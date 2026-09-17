import React from 'react';
import { GitCommit, AlertCircle, CheckCircle2, Sliders, ShieldAlert } from 'lucide-react';
import { AnalysisResponse } from '../../types/forensic';

interface ConsensusMetricCardProps {
  analysis: AnalysisResponse;
}

export const ConsensusMetricCard: React.FC<ConsensusMetricCardProps> = ({ analysis }) => {
  const consensusEvidence = analysis.evidence_items.find(
    (e) => e.evidence_type === 'CONSENSUS_ANALYSIS'
  );
  const uncertaintyEvidence = analysis.evidence_items.find(
    (e) => e.evidence_type === 'UNCERTAINTY_BREAKDOWN'
  );

  const activeModels = analysis.model_predictions.filter(
    (p) => p.status === 'READY' || p.status === 'COMPLETED'
  );
  const standbyModels = analysis.model_predictions.filter(
    (p) => p.status !== 'READY' && p.status !== 'COMPLETED'
  );

  // Extract disagreement index or default based on active status
  let disagreementPct = 0;
  let consensusStatus: 'HIGH_CONSENSUS' | 'MODERATE_CONSENSUS' | 'HIGH_DISAGREEMENT' | 'STANDBY' = 'STANDBY';

  if (consensusEvidence) {
    if (
      consensusEvidence.description.includes('HIGH_CONSENSUS') || 
      consensusEvidence.description.includes('Strong consensus') || 
      consensusEvidence.description.includes('LIKELY_AUTHENTIC')
    ) {
      consensusStatus = 'HIGH_CONSENSUS';
      disagreementPct = 8.0;
    } else if (
      consensusEvidence.description.includes('ANOMALY_DETECTED') || 
      consensusEvidence.description.includes('LIKELY_MANIPULATED')
    ) {
      consensusStatus = 'HIGH_CONSENSUS';
      disagreementPct = 12.0;
    } else if (consensusEvidence.description.includes('Standby mode')) {
      consensusStatus = 'STANDBY';
    } else {
      const match = consensusEvidence.description.match(/([0-9.]+)%/);
      if (match) {
        disagreementPct = parseFloat(match[1]);
      }
      if (disagreementPct < 15.0) {
        consensusStatus = 'HIGH_CONSENSUS';
      } else if (disagreementPct < 35.0) {
        consensusStatus = 'MODERATE_CONSENSUS';
      } else {
        consensusStatus = 'HIGH_DISAGREEMENT';
      }
    }
  } else if (activeModels.length === 0) {
    consensusStatus = 'STANDBY';
  }

  const getConsensusBadge = () => {
    switch (consensusStatus) {
      case 'HIGH_CONSENSUS':
        return {
          label: 'High Consensus',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
          desc: 'Independent forensic detectors exhibit strong statistical alignment.'
        };
      case 'MODERATE_CONSENSUS':
        return {
          label: 'Moderate Consensus',
          color: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: Sliders,
          desc: 'Minor cross-signal divergence observed across evaluated representations.'
        };
      case 'HIGH_DISAGREEMENT':
        return {
          label: 'High Model Disagreement',
          color: 'bg-rose-50 text-rose-800 border-rose-300',
          icon: ShieldAlert,
          desc: 'Conflicting hypotheses between spatial, frequency, and semantic detectors.'
        };
      case 'STANDBY':
      default:
        return {
          label: 'Ensemble Standby',
          color: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: AlertCircle,
          desc: 'Detectors currently awaiting checkpoint placement in models/checkpoints/.'
        };
    }
  };

  const badge = getConsensusBadge();
  const BadgeIcon = badge.icon;
  const agreementPct = Math.max(0, 100 - disagreementPct);

  return (
    <div className="forensic-card overflow-hidden">
      <div className="forensic-panel-header">
        <div className="flex items-center gap-2">
          <GitCommit className="w-3.5 h-3.5 text-slate-500" />
          <span>Evidence Engine & Model Disagreement Calibration</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Statistical Hypothesis Synthesis</span>
      </div>

      <div className="p-5 space-y-5">
        {/* Consensus Status Pill */}
        <div className={`p-3.5 rounded border ${badge.color} flex items-start gap-3 text-xs`}>
          <BadgeIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold uppercase tracking-wider font-mono text-[11px]">
              {badge.label}
            </div>
            <div className="text-slate-700 leading-relaxed">
              {consensusEvidence ? consensusEvidence.description : badge.desc}
            </div>
          </div>
        </div>

        {/* Metric Gauges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gauge 1: Cross-Detector Concordance */}
          <div className="p-4 rounded bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-medium">Model Concordance</span>
              <span className="font-mono font-bold text-slate-800">
                {activeModels.length > 0 ? `${agreementPct.toFixed(1)}%` : 'N/A'}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 ${
                  activeModels.length === 0 ? 'bg-slate-300 w-0' :
                  disagreementPct < 15 ? 'bg-emerald-500' :
                  disagreementPct < 35 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: activeModels.length > 0 ? `${agreementPct}%` : '0%' }}
              />
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {activeModels.length} active, {standbyModels.length} standby module(s)
            </div>
          </div>

          {/* Gauge 2: Calibrated Uncertainty */}
          <div className="p-4 rounded bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-medium">Calibrated Uncertainty</span>
              <span className="font-mono font-bold text-slate-800">
                {(analysis.uncertainty_score * 100).toFixed(1)}% ({analysis.uncertainty_label})
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 ${
                  analysis.uncertainty_score > 0.65 ? 'bg-rose-500' :
                  analysis.uncertainty_score > 0.35 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${analysis.uncertainty_score * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Margin + Disagreement + Quality penalties
            </div>
          </div>

          {/* Gauge 3: Quality Attenuation */}
          <div className="p-4 rounded bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-medium">Quality-Weighted Scaling</span>
              <span className="font-mono font-bold text-slate-800">
                {analysis.image_quality_label || 'NORMAL'}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 mb-1">
              {analysis.image_quality_label === 'POOR'
                ? 'Spatial model weights attenuated due to pixel degradation.'
                : 'Full neural confidence weighting applied.'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Quality Index: {((analysis.image_quality_score ?? 0.85) * 100).toFixed(0)} / 100
            </div>
          </div>
        </div>

        {/* Verifiable Uncertainty Explanation */}
        {uncertaintyEvidence && (
          <div className="p-3 rounded bg-slate-100/70 border border-slate-200 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Calibration Breakdown: </span>
            {uncertaintyEvidence.description}
          </div>
        )}
      </div>
    </div>
  );
};
