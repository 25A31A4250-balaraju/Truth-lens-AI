import React from 'react';
import { Star } from 'lucide-react';

export const TestimonialSection: React.FC = () => {
  const testimonials = [
    {
      stars: 5,
      quote: "TruthLensAI identified subtle generative diffusion patterns in our submitted media that traditional filters completely missed. Essential for our digital integrity team.",
      name: "Elena Rostova",
      role: "Head of Content Verification, Veritas Media",
    },
    {
      stars: 5,
      quote: "The speed and accuracy of the detection engine streamlined our document onboarding audit process significantly while providing actionable forensic confidence.",
      name: "Marcus Vance",
      role: "Compliance Officer, Apex Financial Group",
    },
    {
      stars: 5,
      quote: "Having multi-signal analysis alongside calibrated AI probability percentages gives us full clarity rather than vague binary guesses. An outstanding platform.",
      name: "Dr. Sarah Lin",
      role: "Lead Forensic Specialist, CyberTrust Labs",
    },
    {
      stars: 5,
      quote: "Clean editorial layout with robust API infrastructure. It helped us distinguish authentic photographs from synthetic renders effortlessly during our press review.",
      name: "Julian Thorne",
      role: "Senior Photo Editor, Global Chronicle",
    },
  ];

  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#FF5B00] mb-2 block">
          TESTIMONIALS
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-[#141414] font-medium tracking-tight">
          From our clients.
        </h2>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {testimonials.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#EAE3D9] rounded-3xl p-7 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#FFD8C2] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300"
          >
            <div>
              {/* 5-Star visual */}
              <div className="flex items-center gap-1 text-[#FF5B00] mb-5">
                {[...Array(item.stars)].map((_, sIdx) => (
                  <Star key={sIdx} className="w-4 h-4 fill-[#FF5B00]" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#262626] text-sm leading-relaxed mb-6 font-normal">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>

            {/* Author */}
            <div className="pt-4 border-t border-[#F0EBE3]">
              <h4 className="font-serif font-bold text-sm text-[#141414]">
                {item.name}
              </h4>
              <p className="text-[11px] text-[#737373] mt-0.5 font-medium">
                {item.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
