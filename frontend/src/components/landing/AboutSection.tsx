import React from 'react';
import { CheckCircle2, Zap, Lock, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white border border-[#EAE3D9] rounded-3xl p-8 sm:p-12 lg:p-16 shadow-[0_2px_20px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Woman working at laptop (editorial reference image) */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] max-w-md mx-auto shadow-lg border border-[#EAE3D9] group">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop"
              alt="Professional forensic researcher analyzing data at laptop"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            {/* Subtle warm overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/40 via-transparent to-transparent pointer-events-none" />

            {/* Floating Editorial Pill Badge */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-[#EAE3D9] shadow-md flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-mono text-[#FF5B00] font-bold">
                  Certified Architecture
                </p>
                <p className="font-serif font-semibold text-sm text-[#141414]">
                  Research-Grade Integrity
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#FFF3EB] text-[#FF5B00] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Decorative orange border element */}
          <div className="hidden sm:block absolute -bottom-4 -left-4 w-32 h-32 border-2 border-[#FFD8C2] rounded-3xl -z-10" />
        </div>

        {/* Right Column: About content */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#FF5B00] mb-3 block">
            ABOUT US
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#141414] font-medium tracking-tight leading-tight mb-6">
            Smart detection for a<br className="hidden sm:inline" />
            safer digital world.
          </h2>

          <p className="font-sans text-base sm:text-lg text-[#737373] leading-relaxed mb-8">
            We help individuals and businesses analyze images and documents using modern AI-powered detection technology.
          </p>

          {/* Three small feature items */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#F0EBE3]">
            
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FFF3EB] text-[#FF5B00] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-[#141414]">
                Accurate Analysis
              </h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                Multi-model calibrated pipelines for high-accuracy discrimination.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FFF3EB] text-[#FF5B00] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-[#141414]">
                Fast Results
              </h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                Sub-second response times with real-time confidence scores.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FFF3EB] text-[#FF5B00] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-[#141414]">
                Secure &amp; Private
              </h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                Zero client exposure of keys and confidential upload processing.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
