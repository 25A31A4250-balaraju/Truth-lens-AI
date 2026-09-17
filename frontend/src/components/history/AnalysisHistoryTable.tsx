import React, { useState } from 'react';
import { Trash2, ExternalLink, Search, FileText } from 'lucide-react';
import { AnalysisListItem } from '../../types/forensic';

interface AnalysisHistoryTableProps {
  items: AnalysisListItem[];
  onSelectAnalysis: (uuid: string) => void;
  onDeleteAnalysis: (uuid: string) => void;
}

export const AnalysisHistoryTable: React.FC<AnalysisHistoryTableProps> = ({
  items,
  onSelectAnalysis,
  onDeleteAnalysis,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = items.filter(
    (i) =>
      i.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.file_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.overall_verdict.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Forensic Analysis History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit log of previously processed images, cryptographic hashes, and verdicts.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by filename or hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      <div className="forensic-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
            No analysis records found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Target File</th>
                  <th className="px-4 py-3">SHA-256 Digest</th>
                  <th className="px-4 py-3">Verdict</th>
                  <th className="px-4 py-3">AI Probability</th>
                  <th className="px-4 py-3">Uncertainty</th>
                  <th className="px-4 py-3">Latency</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.uuid} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 truncate max-w-[160px]" title={item.filename}>
                      {item.filename}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 truncate max-w-[140px]" title={item.file_hash}>
                      {item.file_hash.slice(0, 16)}...
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border font-mono ${
                        item.overall_verdict === 'LIKELY_AUTHENTIC' || item.overall_verdict === 'LIKELY_REAL' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                        item.overall_verdict === 'LIKELY_MANIPULATED' || item.overall_verdict === 'AI_GENERATED' ? 'bg-red-50 text-red-800 border-red-300' :
                        item.overall_verdict === 'SUSPECTED_OOD' ? 'bg-orange-50 text-orange-800 border-orange-300' :
                        'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {item.overall_verdict === 'LIKELY_AUTHENTIC' || item.overall_verdict === 'LIKELY_REAL' ? 'LIKELY REAL' :
                         item.overall_verdict === 'LIKELY_MANIPULATED' || item.overall_verdict === 'AI_GENERATED' ? 'AI GENERATED' :
                         item.overall_verdict === 'SUSPECTED_OOD' ? 'AI (OOD)' :
                         'UNCERTAIN'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-800">
                      {(item.overall_score * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {item.uncertainty_label}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {item.processing_time_ms} ms
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => onSelectAnalysis(item.uuid)}
                        className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                        title="View detailed forensics"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteAnalysis(item.uuid)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
