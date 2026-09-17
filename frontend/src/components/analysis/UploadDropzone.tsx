import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, AlertCircle, ArrowRight, Zap, Layers, Sparkles } from 'lucide-react';

interface UploadDropzoneProps {
  onAnalyze: (file: File, mode: 'quick' | 'standard') => void;
  isLoading: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onAnalyze, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mode, setMode] = useState<'quick' | 'standard'>('standard');
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSizeBytes = 20 * 1024 * 1024; // 20 MB

  const handleFile = (file: File) => {
    setValidationError(null);

    if (!allowedTypes.includes(file.type)) {
      setValidationError(`Unsupported format '${file.type || 'unknown'}'. Please upload JPG, PNG, or WEBP.`);
      return;
    }

    if (file.size > maxSizeBytes) {
      setValidationError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 20 MB maximum limit.`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    if (selectedFile && !isLoading) {
      onAnalyze(selectedFile, mode);
    }
  };

  return (
    <div className="bg-white border border-[#EAE3D9] rounded-3xl p-6 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3EB] border border-[#FFD8C2] text-[#FF5B00] text-[11px] font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-3 h-3" />
            Sightengine AI Image Detector
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141414] tracking-tight">
            Upload Image for Inspection
          </h2>
          <p className="text-xs sm:text-sm text-[#737373] mt-1">
            Analyze photograph or digital render for generative AI artifacts, diffusion fingerprints, and synthetic probability.
          </p>
        </div>

        {/* Mode selector: Quick vs Full Forensic */}
        <div className="flex items-center gap-1 bg-[#FAF7F2] p-1.5 rounded-full border border-[#EAE3D9] text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('standard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
              mode === 'standard'
                ? 'bg-white text-[#141414] font-semibold shadow-xs'
                : 'text-[#737373] hover:text-[#141414]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#FF5B00]" />
            Full Forensic
          </button>
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
              mode === 'quick'
                ? 'bg-white text-[#141414] font-semibold shadow-xs'
                : 'text-[#737373] hover:text-[#141414]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#FF5B00]" />
            Quick Mode
          </button>
        </div>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl cursor-pointer transition-all p-8 sm:p-12 flex flex-col items-center justify-center text-center ${
          dragActive
            ? 'border-[#FF5B00] bg-[#FFF3EB]/60'
            : 'border-[#EAE3D9] hover:border-[#FF5B00] bg-[#FAF7F2]/60 hover:bg-[#FFF3EB]/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleChange}
        />

        {previewUrl ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-48 sm:w-56 h-48 sm:h-56 border border-[#EAE3D9] rounded-2xl overflow-hidden bg-white shadow-md">
              <img
                src={previewUrl}
                alt="Selected preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#141414] truncate max-w-xs">{selectedFile?.name}</p>
              <p className="text-xs text-[#737373] font-mono mt-0.5">
                {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ''} • Click or drop another image to replace
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#EAE3D9] flex items-center justify-center text-[#FF5B00] shadow-sm mb-1 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-semibold text-[#141414]">
                Drag &amp; drop an image here, or <span className="text-[#FF5B00] underline font-bold">browse file</span>
              </p>
              <p className="text-xs text-[#737373] mt-1">
                Supported: JPG, PNG, WEBP (Maximum 20 MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {validationError && (
        <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Action CTA */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#F0EBE3]">
        <div className="text-xs text-[#737373]">
          Inference Engine: <span className="font-semibold text-[#141414]">Sightengine GenAI (Cloud Calibrated)</span>
        </div>
        <button
          type="button"
          disabled={!selectedFile || isLoading}
          onClick={triggerUpload}
          className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 ${
            !selectedFile || isLoading
              ? 'bg-[#FAF7F2] text-[#A3A3A3] border border-[#EAE3D9] cursor-not-allowed'
              : 'bg-[#FF5B00] text-white hover:bg-[#141414] shadow-md hover:shadow-xl'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Image...</span>
            </>
          ) : (
            <>
              <span>Run AI Image Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
