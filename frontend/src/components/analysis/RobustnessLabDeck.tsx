import React, { useState } from 'react';
import { FlaskConical, Play, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Sliders, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { AnalysisResponse, RobustnessTest, RobustnessLabResponse } from '../../types/forensic';

interface RobustnessLabDeckProps {
  analysis: AnalysisResponse;
}

export const RobustnessLabDeck: React.FC<RobustnessLabDeckProps> = ({ analysis }) => {
  const [tests, setTests] = useState<RobustnessTest[]>(analysis.robustness_tests || []);
  const [isRunning, setIsRunning] = useState(false);
  const [stabilityIndex, setStabilityIndex] = useState<number | null>(() => {
    if (analysis.robustness_tests && analysis.robustness_tests.length > 0) {
      const deltas = analysis.robustness_tests.map((t) => Math.abs(t.score_delta));
      const meanPen = deltas.reduce((a, b) => a + Math.min(1.0, 2.0 * b), 0) / deltas.length;
      return Math.max(0, 1.0 - meanPen);
    }
    return null;
  });
  const [stabilityLabel, setStabilityLabel] = useState<string>(() => {
    if (stabilityIndex !== null) {
      return stabilityIndex >= 0.80 ? 'HIGHLY_STABLE' : stabilityIndex >= 0.60 ? 'MODERATELY_STABLE' : 'UNSTABLE';
    }
    return 'NOT_TESTED';
  });

  const handleRunStressTest = async () => {
    setIsRunning(true);
    try {
      const res = await fetch(`/api/v1/analysis/${analysis.uuid}/robustness`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to run robustness suite');
      const data: RobustnessLabResponse = await res.json();
      setTests(data.tests);
      setStabilityIndex(data.stability_index);
      setStabilityLabel(data.stability_label);
    } catch (err) {
      console.error('Error running robustness suite:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const getStabilityBadge = (idx: number | null, label: string) => {
    if (idx === null) {
      return {
        label: 'Awaiting Perturbation Evaluation',
        color: 'bg-slate-100 text-slate-700 border-slate-300',
        icon: Sliders,
        desc: 'Execute online stress tests to evaluate resilience against WhatsApp/social media compression.'
      };
    }
    if (label === 'HIGHLY_STABLE') {
      return {
        label: `Highly Robust (${(idx * 100).toFixed(1)}% Stability)`,
        color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        icon: CheckCircle2,
        desc: 'Forensic evaluation exhibits high resilience under compression, noise, and resizing perturbations.'
      };
    }
    if (label === 'MODERATELY_STABLE') {
      return {
        label: `Moderately Stable (${(idx * 100).toFixed(1)}% Stability)`,
        color: 'bg-amber-50 text-amber-800 border-amber-300',
        icon: AlertTriangle,
        desc: 'Minor metric drift observed under severe high-frequency compression.'
      };
    }
    return {
      label: `Fragile / Sensitive (${(idx * 100).toFixed(1)}% Stability)`,
      color: 'bg-rose-50 text-rose-800 border-rose-300',
      icon: XCircle,
      desc: 'Forensic confidence degrades significantly when image undergoes lossy transformations.'
    };
  };

  const badge = getStabilityBadge(stabilityIndex, stabilityLabel);
  const BadgeIcon = badge.icon;

  return (
    <div className="forensic-card overflow-hidden">
      <div className="forensic-panel-header">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-3.5 h-3.5 text-slate-500" />
          <span>Robustness & Perturbation Testing Lab</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunStressTest}
            disabled={isRunning}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
            ) : (
              <Play className="w-3 h-3 text-slate-600" />
            )}
            <span>{tests.length > 0 ? 'Re-run Stress Tests' : 'Execute Stress Tests'}</span>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Status Pill */}
        <div className={`p-3.5 rounded border ${badge.color} flex items-start justify-between gap-3 text-xs`}>
          <div className="flex items-start gap-3">
            <BadgeIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-semibold uppercase tracking-wider font-mono text-[11px]">
                {badge.label}
              </div>
              <div className="text-slate-700 leading-relaxed">
                {badge.desc}
              </div>
            </div>
          </div>
          {stabilityIndex !== null && (
            <div className="text-right shrink-0">
              <div className="text-lg font-bold font-mono text-slate-800">
                {(stabilityIndex * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Stability Score</div>
            </div>
          )}
        </div>

        {/* Perturbation Grid */}
        {tests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {tests.map((t, idx) => {
              const absScoreDelta = Math.abs(t.score_delta);
              const isDriftHigh = absScoreDelta > 0.15;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded bg-slate-50 border border-slate-200 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-bold text-slate-800 uppercase">
                      {t.transformation.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                      {t.parameter}
                    </span>
                  </div>

                  <div className="space-y-1.5 my-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Post-Perturbation:</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        t.prediction === 'FAKE' ? 'bg-rose-100 text-rose-800' :
                        t.prediction === 'REAL' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {t.prediction}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Score Drift (Δs):</span>
                      <span className={`flex items-center gap-0.5 font-bold ${
                        isDriftHigh ? 'text-rose-600' : 'text-slate-700'
                      }`}>
                        {t.score_delta > 0 ? (
                          <ArrowUpRight className="w-3 h-3 text-rose-500" />
                        ) : t.score_delta < 0 ? (
                          <ArrowDownRight className="w-3 h-3 text-blue-500" />
                        ) : (
                          <Minus className="w-3 h-3 text-slate-400" />
                        )}
                        {t.score_delta > 0 ? `+${t.score_delta.toFixed(3)}` : t.score_delta.toFixed(3)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Uncertainty (ΔU):</span>
                      <span className="text-slate-700">
                        {t.uncertainty_delta > 0 ? `+${t.uncertainty_delta.toFixed(3)}` : t.uncertainty_delta.toFixed(3)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-400">
                    {absScoreDelta <= 0.08 ? 'Stable Output' : 'Mild Channel Shift'}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded border border-dashed border-slate-300 bg-slate-50 text-center space-y-3">
            <FlaskConical className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800">Perturbation Suite Not Yet Executed</h4>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                Test how this image's forensic indicators hold up against JPEG recompression (Q=50, 70, 90),
                Gaussian sensor noise, Gaussian defocus blur, and spatial resizing.
              </p>
            </div>
            <button
              onClick={handleRunStressTest}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isRunning ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>{isRunning ? 'Processing Perturbations...' : 'Run Robustness Suite Now'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
