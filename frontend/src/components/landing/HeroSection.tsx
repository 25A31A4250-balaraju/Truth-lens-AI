import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onLearnMore }) => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Decorative ambient orange glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[600px] h-[420px] sm:h-[600px] bg-gradient-to-tr from-[#FF5B00]/15 via-[#FF8A00]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-10 -right-20 w-80 h-80 bg-[#FF5B00]/5 rounded-full blur-2xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 -left-20 w-72 h-72 bg-[#FF8A00]/5 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF3EB] border border-[#FFD8C2] text-[#FF5B00] mb-8 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#FF5B00] animate-pulse" />
          <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase">
            AI DETECTION • DOCUMENT FORENSICS
          </span>
        </div>

        {/* Main Editorial Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl xl:text-8xl text-[#141414] font-medium tracking-tight leading-[1.08] sm:leading-[1.08] mb-8">
          Detect AI-Generated<br />
          Images &amp; Fake Documents<br />
          <span className="italic font-normal text-[#FF5B00] underline decoration-[#FF5B00]/30 underline-offset-8">
            with Confidence.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="font-sans text-base sm:text-lg lg:text-xl text-[#737373] max-w-2xl mx-auto leading-relaxed font-normal mb-10">
          Upload an image or document and let our advanced detection tools analyze it for signs of AI generation, manipulation, or forgery.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#FF5B00] hover:bg-[#141414] text-white font-semibold text-sm tracking-wide shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={onLearnMore}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full bg-white border border-[#EAE3D9] hover:border-[#141414] text-[#141414] font-semibold text-sm tracking-wide hover:bg-[#FAF7F2] transition-all duration-200"
          >
            Learn More
          </button>
        </div>

        {/* Subtle trust signal */}
        <div className="mt-14 pt-8 border-t border-[#EAE3D9]/60 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-[#737373] text-xs font-medium uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Sightengine GenAI Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>Multi-Signal Decomposition</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Private &amp; Secure Ingestion</span>
          </div>
        </div>

      </div>
    </section>
  );
};
