import React from 'react';
import { ArrowRight, Upload, Search, CheckCircle2, ShieldCheck } from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload',
      desc: 'Choose an image or document from your device.',
      icon: Upload,
    },
    {
      num: '02',
      title: 'Analyze',
      desc: 'Our detection tools scan for signs of AI generation, manipulation, or forgery.',
      icon: Search,
    },
    {
      num: '03',
      title: 'Get Results',
      desc: 'View detailed insights and confidence information.',
      icon: CheckCircle2,
    },
    {
      num: '04',
      title: 'Make Informed Decisions',
      desc: 'Use the results as an additional verification signal.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="workflow" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#FF5B00] mb-2 block">
          SIMPLE STEPS
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-[#141414] font-medium tracking-tight">
          How we'll work together.
        </h2>
      </div>

      {/* Horizontal Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-[#EAE3D9] rounded-3xl p-7 relative shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#FFD8C2] transition-all flex flex-col justify-between group"
            >
              {/* Step indicator pill */}
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] group-hover:bg-[#FF5B00] group-hover:text-white transition-colors flex items-center justify-center font-serif text-base font-bold text-[#141414]">
                  {step.num}
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FFF3EB] text-[#FF5B00] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="font-serif text-xl text-[#141414] font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Connecting arrow indicator for desktop (between cards) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-[#EAE3D9] shadow-xs flex items-center justify-center text-[#FF5B00]">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
