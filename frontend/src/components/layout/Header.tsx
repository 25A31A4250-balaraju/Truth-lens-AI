import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  activeDetector: 'image' | 'document' | null;
  onSelectDetector: (type: 'image' | 'document') => void;
  onGoHome: () => void;
  onOpenContact: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeDetector,
  onSelectDetector,
  onGoHome,
  onOpenContact
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToDetectors = (type: 'image' | 'document') => {
    onSelectDetector(type);
    setMobileMenuOpen(false);
    const element = document.getElementById('detectors');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleHomeClick = () => {
    onGoHome();
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF7F2]/90 border-b border-[#EAE3D9] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          onClick={handleHomeClick}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-[#141414] text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm group-hover:bg-[#FF5B00] transition-colors">
            <span className="tracking-tighter">TL</span>
          </div>
          <div>
            <div className="font-serif font-bold text-lg text-[#141414] tracking-tight group-hover:text-[#FF5B00] transition-colors flex items-center gap-1.5">
              TruthLens<span className="text-[#FF5B00]">AI</span>
            </div>
            <p className="text-[10px] uppercase font-sans tracking-widest text-[#737373] font-medium">
              Forensics Lab
            </p>
          </div>
        </button>

        {/* Center/Right Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={handleHomeClick}
            className="px-4 py-2 rounded-full text-sm font-medium text-[#141414] hover:text-[#FF5B00] hover:bg-[#F0EAE1] transition-all"
          >
            Home
          </button>
          <button
            onClick={() => scrollToDetectors('image')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeDetector === 'image'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'text-[#141414] hover:text-[#FF5B00] hover:bg-[#F0EAE1]'
            }`}
          >
            AI Image Detector
          </button>
          <button
            onClick={() => scrollToDetectors('document')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeDetector === 'document'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'text-[#141414] hover:text-[#FF5B00] hover:bg-[#F0EAE1]'
            }`}
          >
            Fake Document Detector
          </button>
        </nav>

        {/* Right Call-To-Action Button */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenContact}
            className="bg-[#FF5B00] hover:bg-[#141414] text-white px-6 py-2.5 rounded-full font-medium text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-200"
          >
            Let's Talk
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#141414] hover:bg-[#F0EAE1] transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#EAE3D9] bg-[#FAF7F2] px-6 py-5 space-y-3 shadow-lg">
          <button
            onClick={handleHomeClick}
            className="block w-full text-left py-2 text-sm font-semibold text-[#141414] hover:text-[#FF5B00]"
          >
            Home
          </button>
          <button
            onClick={() => scrollToDetectors('image')}
            className="block w-full text-left py-2 text-sm font-semibold text-[#141414] hover:text-[#FF5B00]"
          >
            AI Image Detector
          </button>
          <button
            onClick={() => scrollToDetectors('document')}
            className="block w-full text-left py-2 text-sm font-semibold text-[#141414] hover:text-[#FF5B00]"
          >
            Fake Document Detector
          </button>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="w-full bg-[#FF5B00] hover:bg-[#141414] text-white py-3 rounded-full font-medium text-xs uppercase tracking-wider text-center transition-all"
            >
              Let's Talk
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
