import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CtaSectionProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onGetStarted, onLearnMore }) => {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#FF5B00] rounded-3xl p-10 sm:p-16 lg:p-20 text-center text-white relative overflow-hidden shadow-[0_16px_40px_rgba(255,91,0,0.25)]">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-tight text-white mb-6">
            Let's detect something<br />
            with confidence.
          </h2>

          <p className="font-sans text-base sm:text-lg text-white/90 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
            Analyze images and documents with modern AI-powered detection tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-[#141414] hover:bg-[#141414] hover:text-white font-semibold text-sm tracking-wide shadow-md hover:shadow-xl transition-all duration-200"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLearnMore}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/40 text-white hover:bg-white/15 font-semibold text-sm tracking-wide transition-all duration-200"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
