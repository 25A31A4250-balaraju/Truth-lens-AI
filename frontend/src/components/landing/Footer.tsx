import React from 'react';
import { Twitter, Github, Linkedin, MessageSquare, ArrowUp } from 'lucide-react';

interface FooterProps {
  onSelectDetector: (type: 'image' | 'document') => void;
  onGoHome: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectDetector,
  onGoHome,
  onOpenContact
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToDetector = (type: 'image' | 'document') => {
    onSelectDetector(type);
    const el = document.getElementById('detectors');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#141414] text-white pt-16 pb-12 border-t border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-[#262626]">
          
          {/* Left Column: Platform Name & Description */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF5B00] text-white flex items-center justify-center font-serif text-base font-bold shadow-sm">
                TL
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-white">
                TruthLens<span className="text-[#FF5B00]">AI</span>
              </span>
            </div>
            
            <p className="text-[#A3A3A3] text-sm leading-relaxed max-w-sm">
              State-of-the-art forensic analysis platform for detecting AI-generated synthetic media, manipulated imagery, and document tampering with research-grade confidence.
            </p>

            <div className="pt-2 text-xs text-[#737373] font-mono">
              Powered by Sightengine GenAI &amp; Multi-Signal Signal Fusion
            </div>
          </div>

          {/* Center Column: Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] font-mono mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={onGoHome}
                  className="text-[#E5E5E5] hover:text-[#FF5B00] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToDetector('image')}
                  className="text-[#E5E5E5] hover:text-[#FF5B00] transition-colors"
                >
                  AI Image Detector
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToDetector('document')}
                  className="text-[#E5E5E5] hover:text-[#FF5B00] transition-colors"
                >
                  Fake Document Detector
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="text-[#E5E5E5] hover:text-[#FF5B00] transition-colors"
                >
                  Let's Talk
                </button>
              </li>
            </ul>
          </div>

          {/* Right Column: Social Icons */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] font-mono mb-4">
              Connect
            </h4>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#262626] hover:bg-[#FF5B00] hover:text-white flex items-center justify-center text-[#A3A3A3] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#262626] hover:bg-[#FF5B00] hover:text-white flex items-center justify-center text-[#A3A3A3] transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#262626] hover:bg-[#FF5B00] hover:text-white flex items-center justify-center text-[#A3A3A3] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <button
                onClick={onOpenContact}
                className="w-10 h-10 rounded-full bg-[#262626] hover:bg-[#FF5B00] hover:text-white flex items-center justify-center text-[#A3A3A3] transition-colors"
                aria-label="Contact Message"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-[#737373] pt-2">
              Inquiries: contact@truthlensai.com
            </p>
          </div>

        </div>

        {/* Bottom Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737373]">
          <div>
            &copy; {new Date().getFullYear()} TruthLensAI Platform. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onOpenContact}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={onOpenContact}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={onOpenContact}
              className="hover:text-white transition-colors"
            >
              Contact
            </button>
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-full bg-[#262626] hover:bg-[#FF5B00] text-white flex items-center justify-center transition-colors ml-2"
              title="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
