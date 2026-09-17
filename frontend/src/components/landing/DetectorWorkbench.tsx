import React from 'react';
import { Image, FileText } from 'lucide-react';
import { UploadDropzone } from '../analysis/UploadDropzone';
import { AnalysisResultCard } from '../analysis/AnalysisResultCard';
import { AnalysisHistoryTable } from '../history/AnalysisHistoryTable';
import { DocumentDetectorCard } from './DocumentDetectorCard';
import { AnalysisResponse, AnalysisListItem } from '../../types/forensic';

interface DetectorWorkbenchProps {
  activeDetector: 'image' | 'document';
  onTabChange: (tab: 'image' | 'document') => void;
  // Image detector handlers & data
  onAnalyzeImage: (file: File, mode: 'quick' | 'standard') => void;
  isImageLoading: boolean;
  activeAnalysis: AnalysisResponse | null;
  onClearAnalysis: () => void;
  analyses: AnalysisListItem[];
  onSelectAnalysis: (uuid: string) => void;
  onDeleteAnalysis: (uuid: string) => void;
}

export const DetectorWorkbench: React.FC<DetectorWorkbenchProps> = ({
  activeDetector,
  onTabChange,
  onAnalyzeImage,
  isImageLoading,
  activeAnalysis,
  onClearAnalysis,
  analyses,
  onSelectAnalysis,
  onDeleteAnalysis,
}) => {
  return (
    <section id="workbench" className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Workbench Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#FF5B00] mb-1 block">
            INTERACTIVE WORKBENCH
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#141414] font-medium tracking-tight">
            Run Live Detection
          </h2>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-white border border-[#EAE3D9] shadow-xs">
          <button
            onClick={() => onTabChange('image')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
              activeDetector === 'image'
                ? 'bg-[#141414] text-white shadow-sm'
                : 'text-[#737373] hover:text-[#141414] hover:bg-[#FAF7F2]'
            }`}
          >
            <Image className="w-4 h-4 text-[#FF5B00]" />
            <span>AI Image Detector</span>
          </button>

          <button
            onClick={() => onTabChange('document')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
              activeDetector === 'document'
                ? 'bg-[#141414] text-white shadow-sm'
                : 'text-[#737373] hover:text-[#141414] hover:bg-[#FAF7F2]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#FF5B00]" />
            <span>Fake Document Detector</span>
          </button>
        </div>
      </div>

      {/* Tab 1: AI Image Detector */}
      {activeDetector === 'image' && (
        <div className="space-y-8">
          <UploadDropzone onAnalyze={onAnalyzeImage} isLoading={isImageLoading} />

          {activeAnalysis && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373] font-mono">
                  Live Sightengine GenAI Result Dossier
                </h3>
                <button
                  onClick={onClearAnalysis}
                  className="text-xs text-[#737373] hover:text-[#FF5B00] underline font-semibold transition-colors"
                >
                  Clear Result
                </button>
              </div>
              <AnalysisResultCard analysis={activeAnalysis} />
            </div>
          )}

          {/* Recent History Preview */}
          {!activeAnalysis && analyses.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-[#EAE3D9]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373] font-mono">
                  Recent Ingestions ({analyses.length})
                </h3>
                <span className="text-xs text-[#737373]">
                  Stored forensic records with SHA-256 verification
                </span>
              </div>
              <div className="bg-white border border-[#EAE3D9] rounded-2xl overflow-hidden shadow-xs">
                <AnalysisHistoryTable
                  items={analyses.slice(0, 5)}
                  onSelectAnalysis={onSelectAnalysis}
                  onDeleteAnalysis={onDeleteAnalysis}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Fake Document Detector */}
      {activeDetector === 'document' && (
        <div>
          <DocumentDetectorCard />
        </div>
      )}
    </section>
  );
};
