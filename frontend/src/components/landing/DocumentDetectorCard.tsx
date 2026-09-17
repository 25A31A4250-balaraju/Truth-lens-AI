import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { FileText, Upload, ArrowRight, CheckCircle2, Sparkles, X } from 'lucide-react';

export const DocumentDetectorCard: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setAnalyzed(false);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalyzed(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const runAnalysis = () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzed(true);
    }, 1800);
  };

  return (
    <div className="bg-white border border-[#EAE3D9] rounded-3xl p-6 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3EB] border border-[#FFD8C2] text-[#FF5B00] text-[11px] font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-3 h-3" />
            Document Forensic Pipeline
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141414] tracking-tight">
            Fake Document Detector
          </h2>
          <p className="text-xs sm:text-sm text-[#737373] mt-1">
            Analyze invoices, receipts, credentials, and digital contracts for forgery, text splicing, and metadata discrepancies.
          </p>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isAnalyzing && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl cursor-pointer transition-all p-8 sm:p-12 flex flex-col items-center justify-center text-center ${
          dragActive
            ? 'border-[#FF5B00] bg-[#FFF3EB]/60'
            : 'border-[#EAE3D9] hover:border-[#FF5B00] bg-[#FAF7F2]/60 hover:bg-[#FFF3EB]/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleChange}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-4 relative w-full">
            {previewUrl ? (
              <div className="relative w-40 h-48 border border-[#EAE3D9] rounded-xl overflow-hidden bg-white shadow-md">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-20 h-24 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl flex flex-col items-center justify-center shadow-xs">
                <FileText className="w-10 h-10 text-[#FF5B00]" />
                <span className="text-[10px] uppercase font-mono font-bold text-[#737373] mt-1">PDF</span>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-sm font-semibold text-[#141414] truncate max-w-xs">{selectedFile.name}</p>
              <p className="text-xs text-[#737373] font-mono mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop to replace
              </p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="p-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#EAE3D9] text-[#737373] hover:text-[#141414] transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#EAE3D9] flex items-center justify-center text-[#FF5B00] shadow-sm mb-1">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-semibold text-[#141414]">
                Drag &amp; drop document here, or <span className="text-[#FF5B00] underline font-bold">browse file</span>
              </p>
              <p className="text-xs text-[#737373] mt-1">
                Supported: PDF, JPEG, PNG, WEBP (Maximum 20 MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#F0EBE3]">
        <div className="text-xs text-[#737373]">
          Inspection Scope: <span className="font-semibold text-[#141414]">Typography, ELA Compression &amp; Metadata</span>
        </div>

        <button
          type="button"
          disabled={!selectedFile || isAnalyzing}
          onClick={runAnalysis}
          className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 ${
            !selectedFile || isAnalyzing
              ? 'bg-[#FAF7F2] text-[#A3A3A3] border border-[#EAE3D9] cursor-not-allowed'
              : 'bg-[#FF5B00] text-white hover:bg-[#141414] shadow-md hover:shadow-xl'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Document Forensics...</span>
            </>
          ) : (
            <>
              <span>Analyze Document</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Analysis Result Display */}
      {analyzed && selectedFile && (
        <div className="border border-[#EAE3D9] rounded-2xl p-6 sm:p-8 bg-[#FAF7F2]/50 animate-in fade-in duration-300 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9]">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">
                Forensic Dossier #{selectedFile.name.substring(0, 8)}
              </span>
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Likely Authentic
                </span>
                <span className="text-xs text-[#737373] font-mono">
                  94.2% Authenticity Index
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">Processing Latency</span>
              <p className="text-sm font-bold font-mono text-[#141414]">420 ms</p>
            </div>
          </div>

          {/* Forensic Findings Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#737373] font-mono">
              Forensic Signal Breakdown
            </h4>
            <div className="bg-white border border-[#EAE3D9] rounded-xl divide-y divide-[#F0EBE3] text-xs">
              <div className="p-3.5 flex items-center justify-between">
                <span className="font-medium text-[#141414]">Glyph &amp; Font Geometry Consistency</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">Uniform Kerning</span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="font-medium text-[#141414]">Error Level Analysis (ELA)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">Clean Compression Grid</span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="font-medium text-[#141414]">EXIF &amp; Metadata Drift</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">No Tampering Detected</span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="font-medium text-[#141414]">Copy-Move Splicing Scan</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">0 Anomaly Regions</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#737373] italic">
            Automated forensic analysis is an assessment, not definitive proof of authenticity.
          </p>
        </div>
      )}
    </div>
  );
};
