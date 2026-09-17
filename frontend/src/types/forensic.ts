export type VerdictType = 
  | 'LIKELY_AUTHENTIC' 
  | 'LIKELY_MANIPULATED' 
  | 'UNCERTAIN' 
  | 'SUSPECTED_OOD'
  | 'AI_GENERATED'
  | 'LIKELY_REAL';

export type UncertaintyLevel = 'LOW' | 'MODERATE' | 'HIGH';

export type ModelStatus = 'READY' | 'COMPLETED' | 'STANDBY_NO_CHECKPOINT' | 'DISABLED' | 'FAILED';

export interface ModelPrediction {
  model_name: string;
  model_version: string;
  prediction: string;
  confidence: number;
  processing_time_ms: number;
  status: ModelStatus;
  error_message?: string | null;
}

export interface EvidenceItem {
  evidence_type: string;
  score: number;
  description: string;
  source_model: string;
  created_at: string;
}

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
  region_score: number;
  region_type: string;
}

export interface RobustnessTest {
  transformation: string;
  parameter: string;
  prediction: string;
  score_delta: number;
  uncertainty_delta: number;
  created_at?: string;
}

export interface RobustnessLabResponse {
  analysis_uuid: string;
  stability_index: number;
  stability_label: string;
  tests: RobustnessTest[];
}

export interface AnalysisResponse {
  id: number;
  uuid: string;
  filename: string;
  stored_path: string;
  file_hash: string;
  media_type: string;
  file_size_bytes: number;
  width: number;
  height: number;
  overall_verdict: VerdictType;
  overall_score: number;
  uncertainty_score: number;
  uncertainty_label: UncertaintyLevel;
  image_quality_score?: number | null;
  image_quality_label?: string | null;
  face_count: number;
  processing_time_ms: number;
  analysis_mode: string;
  fft_path?: string | null;
  created_at: string;
  model_predictions: ModelPrediction[];
  evidence_items: EvidenceItem[];
  regions: Region[];
  robustness_tests?: RobustnessTest[];
}

export interface AnalysisListItem {
  uuid: string;
  filename: string;
  file_hash: string;
  overall_verdict: VerdictType;
  overall_score: number;
  uncertainty_label: UncertaintyLevel;
  processing_time_ms: number;
  created_at: string;
}

export interface SystemModel {
  name: string;
  version: string;
  category: string;
  expected_checkpoint: string;
  checkpoint_available: boolean;
  status: ModelStatus;
  device: string;
  input_resolution: string;
  description: string;
}

export interface SystemHealth {
  status: string;
  version: string;
  environment: string;
  device: string;
  cpu_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  ram_percent: number;
  disk_free_gb: number;
  database_connected: boolean;
  registered_models_count: number;
}
