import { AnalysisResponse, AnalysisListItem } from '../types/forensic';

/**
 * Creates a realistic simulated forensic analysis response when
 * the standalone backend is offline or unreachable on static Netlify deployments.
 */
export function generateClientMockAnalysis(file: File, mode: 'quick' | 'standard' = 'standard'): AnalysisResponse {
  const uuid = 'demo-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
  const nowIso = new Date().toISOString();
  const previewBlobUrl = URL.createObjectURL(file);

  // Deterministic pseudo-random seed based on filename
  let seed = 0;
  for (let i = 0; i < file.name.length; i++) {
    seed = (seed * 31 + file.name.charCodeAt(i)) % 1000;
  }
  const isAiSuspected = seed % 2 === 0;
  const score = isAiSuspected ? 0.88 + (seed % 10) * 0.01 : 0.08 + (seed % 10) * 0.01;

  const verdict = isAiSuspected ? 'AI_GENERATED' : 'LIKELY_REAL';

  return {
    id: Math.floor(Math.random() * 90000) + 10000,
    uuid,
    filename: file.name,
    stored_path: previewBlobUrl,
    file_hash: 'sha256_' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    media_type: file.type || 'image/jpeg',
    file_size_bytes: file.size,
    width: 1024,
    height: 1024,
    overall_verdict: verdict,
    overall_score: score,
    uncertainty_score: isAiSuspected ? 0.12 : 0.07,
    uncertainty_label: 'LOW',
    image_quality_score: 0.92,
    image_quality_label: 'HIGH_RESOLUTION',
    face_count: 1,
    processing_time_ms: 380,
    analysis_mode: mode,
    fft_path: null,
    created_at: nowIso,
    model_predictions: [
      {
        model_name: 'Sightengine GenAI',
        model_version: 'v2.4',
        prediction: verdict,
        confidence: score,
        processing_time_ms: 180,
        status: 'COMPLETED',
        error_message: null
      },
      {
        model_name: 'F3Net Frequency Decomposition',
        model_version: 'v1.1',
        prediction: verdict,
        confidence: isAiSuspected ? 0.84 : 0.14,
        processing_time_ms: 95,
        status: 'COMPLETED',
        error_message: null
      },
      {
        model_name: 'DINOv2 ViT Feature Manifold',
        model_version: 'small-14',
        prediction: verdict,
        confidence: isAiSuspected ? 0.89 : 0.11,
        processing_time_ms: 105,
        status: 'COMPLETED',
        error_message: null
      }
    ],
    evidence_items: [
      {
        evidence_type: 'FREQUENCY_SPECTRUM',
        score: isAiSuspected ? 0.82 : 0.12,
        description: isAiSuspected
          ? 'High-frequency spectrum anomaly detected: ratio: 0.082 (Low-frequency 74.2%, Mid-frequency 18.1%, High-frequency 7.7%). Checkerboard artifact spikes observed in radial harmonics.'
          : 'Normal natural optical power decay: ratio: 0.021 (Low-frequency 88.4%, Mid-frequency 9.6%, High-frequency 2.0%). No periodic upsampling lattice detected.',
        source_model: '2D-FFT Centered Spectrum',
        created_at: nowIso
      },
      {
        evidence_type: 'SPECTRAL_ENTROPY',
        score: isAiSuspected ? 0.76 : 0.22,
        description: `Spectral entropy measured at ${isAiSuspected ? '14.8' : '11.9'} bits across 12 radial spatial bands.`,
        source_model: 'Entropy Profiler',
        created_at: nowIso
      },
      {
        evidence_type: 'FACIAL_SEAM_INTEGRITY',
        score: isAiSuspected ? 0.79 : 0.09,
        description: isAiSuspected
          ? 'Micro-texture boundary discontinuity detected along jawline perimeter.'
          : 'Continuous biological gradient detected; seamless skin pore distribution.',
        source_model: 'SBI Seam Detector',
        created_at: nowIso
      }
    ],
    regions: [
      {
        x: 320,
        y: 210,
        width: 380,
        height: 420,
        region_score: isAiSuspected ? 0.85 : 0.08,
        region_type: 'face'
      },
      {
        x: 410,
        y: 290,
        width: 120,
        height: 90,
        region_score: isAiSuspected ? 0.91 : 0.11,
        region_type: 'patch'
      },
      {
        x: 520,
        y: 290,
        width: 120,
        height: 90,
        region_score: isAiSuspected ? 0.88 : 0.09,
        region_type: 'patch'
      }
    ],
    robustness_tests: [
      {
        transformation: 'JPEG Compression (Q=75)',
        parameter: 'quality=75',
        prediction: verdict,
        score_delta: -0.02,
        uncertainty_delta: 0.01,
        created_at: nowIso
      },
      {
        transformation: 'Gaussian Noise (σ=5)',
        parameter: 'sigma=5',
        prediction: verdict,
        score_delta: -0.04,
        uncertainty_delta: 0.02,
        created_at: nowIso
      },
      {
        transformation: 'Gaussian Blur (r=1.5px)',
        parameter: 'radius=1.5',
        prediction: verdict,
        score_delta: -0.03,
        uncertainty_delta: 0.01,
        created_at: nowIso
      }
    ]
  };
}

export function toListItem(analysis: AnalysisResponse): AnalysisListItem {
  return {
    uuid: analysis.uuid,
    filename: analysis.filename,
    file_hash: analysis.file_hash,
    overall_verdict: analysis.overall_verdict,
    overall_score: analysis.overall_score,
    uncertainty_label: analysis.uncertainty_label,
    processing_time_ms: analysis.processing_time_ms,
    created_at: analysis.created_at
  };
}
