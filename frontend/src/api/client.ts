import { AnalysisResponse, AnalysisListItem, SystemHealth, SystemModel } from '../types/forensic';

// In production (Netlify), VITE_API_BASE_URL is set to the backend URL, e.g.:
//   https://your-backend.railway.app/api/v1
// In local dev, it falls back to the Vite proxy path /api/v1
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Server error (${res.status})`;
    try {
      const data = await res.json();
      if (data && data.detail) {
        errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // ignore
    }
    throw new ApiError(res.status, errorMsg);
  }
  return res.json();
}

export const forensicApi = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<SystemHealth>(res);
  },

  async getModels(): Promise<SystemModel[]> {
    const res = await fetch(`${API_BASE}/models`);
    return handleResponse<SystemModel[]>(res);
  },

  async listAnalyses(limit = 50): Promise<AnalysisListItem[]> {
    const res = await fetch(`${API_BASE}/analysis?limit=${limit}`);
    return handleResponse<AnalysisListItem[]>(res);
  },

  async getAnalysis(uuid: string): Promise<AnalysisResponse> {
    const res = await fetch(`${API_BASE}/analysis/${uuid}`);
    return handleResponse<AnalysisResponse>(res);
  },

  async uploadImage(file: File, mode: 'quick' | 'standard' = 'standard'): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);
    const res = await fetch(`${API_BASE}/analyze/image`, { method: 'POST', body: formData });
    return handleResponse<AnalysisResponse>(res);
  },

  async deleteAnalysis(uuid: string): Promise<{ status: string; uuid: string }> {
    const res = await fetch(`${API_BASE}/analysis/${uuid}`, { method: 'DELETE' });
    return handleResponse<{ status: string; uuid: string }>(res);
  }
};
