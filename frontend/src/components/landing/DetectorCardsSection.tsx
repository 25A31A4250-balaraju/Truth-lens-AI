import React from 'react';
import { Image, FileText, Check, ArrowRight } from 'lucide-react';

interface DetectorCardsSectionProps {
  onSelectImageDetector: () => void;
  onSelectDocumentDetector: () => void;
}

export const DetectorCardsSection: React.FC<DetectorCardsSectionProps> = ({
  onSelectImageDetector,
  onSelectDocumentDetector,
}) => {
  return (
    <section id="detectors" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#FF5B00] mb-2 block">
          DETECTION SUITE
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-[#141414] font-medium tracking-tight">
          Specialized Forensic Tools.
        </h2>
        <p className="mt-4 text-[#737373] text-base leading-relaxed">
          Choose between our image and document verification workflows, each equipped with dedicated forensic pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        
        {/* CARD 1: AI Image Detector */}
        <div className="bg-white border border-[#EAE3D9] rounded-3xl p-8 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(255,91,0,0.08)] hover:border-[#FFD8C2] transition-all duration-300 flex flex-col justify-between group">
          <div>
            {/* Icon Header */}
            <div className="w-14 h-14 rounded-2xl bg-[#FFF3EB] border border-[#FFD8C2] flex items-center justify-center text-[#FF5B00] mb-6 group-hover:bg-[#FF5B00] group-hover:text-white transition-colors duration-300">
              <Image className="w-7 h-7" />
            </div>

            <div className="mb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#FF5B00] font-semibold">
                Sightengine GenAI Powered
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#141414] font-semibold mt-1">
                AI Image Detector
              </h3>
            </div>

            <p className="text-[#737373] text-sm sm:text-base leading-relaxed mb-8">
              Find out if an image is likely AI-generated using advanced AI detection technology.
            </p>

            {/* Feature List */}
            <div className="space-y-3.5 border-t border-[#F0EBE3] pt-6 mb-8">
              {[
                'AI-generated image detection',
                'AI model analysis',
                'Confidence score',
                'Fast analysis',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FFF3EB] text-[#FF5B00] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="text-sm font-medium text-[#262626]">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onSelectImageDetector}
            className="w-full py-4 px-6 rounded-full bg-[#141414] group-hover:bg-[#FF5B00] text-white font-semibold text-sm tracking-wide shadow-sm hover:shadow-lg flex items-center justify-center gap-2 transition-all duration-200"
          >
            <span>Analyze Image</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* CARD 2: Fake Document Detector */}
        <div className="bg-white border border-[#EAE3D9] rounded-3xl p-8 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(255,91,0,0.08)] hover:border-[#FFD8C2] transition-all duration-300 flex flex-col justify-between group">
          <div>
            {/* Icon Header */}
            <div className="w-14 h-14 rounded-2xl bg-[#FFF3EB] border border-[#FFD8C2] flex items-center justify-center text-[#FF5B00] mb-6 group-hover:bg-[#FF5B00] group-hover:text-white transition-colors duration-300">
              <FileText className="w-7 h-7" />
            </div>

            <div className="mb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#FF5B00] font-semibold">
                Document Forensics
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#141414] font-semibold mt-1">
                Fake Document Detector
              </h3>
            </div>

            <p className="text-[#737373] text-sm sm:text-base leading-relaxed mb-8">
              Analyze documents for signs of tampering, manipulation, or forgery.
            </p>

            {/* Feature List */}
            <div className="space-y-3.5 border-t border-[#F0EBE3] pt-6 mb-8">
              {[
                'Document authenticity analysis',
                'Tampering detection',
                'Suspicious-region analysis',
                'Forensic insights',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FFF3EB] text-[#FF5B00] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="text-sm font-medium text-[#262626]">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onSelectDocumentDetector}
            className="w-full py-4 px-6 rounded-full bg-[#141414] group-hover:bg-[#FF5B00] text-white font-semibold text-sm tracking-wide shadow-sm hover:shadow-lg flex items-center justify-center gap-2 transition-all duration-200"
          >
            <span>Analyze Document</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
