import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { HeroSection } from './components/landing/HeroSection';
import { DetectorCardsSection } from './components/landing/DetectorCardsSection';
import { DetectorWorkbench } from './components/landing/DetectorWorkbench';
import { WorkflowSection } from './components/landing/WorkflowSection';
import { AboutSection } from './components/landing/AboutSection';
import { TestimonialSection } from './components/landing/TestimonialSection';
import { CtaSection } from './components/landing/CtaSection';
import { Footer } from './components/landing/Footer';
import { ContactModal } from './components/landing/ContactModal';
import { forensicApi } from './api/client';
import { AnalysisResponse, AnalysisListItem } from './types/forensic';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeDetector, setActiveDetector] = useState<'image' | 'document'>('image');
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResponse | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const a = await forensicApi.listAnalyses();
      setAnalyses(a);
    } catch (err: any) {
      // Backend may be initializing
      console.warn('Backend connection status:', err?.message);
    }
  };

  const handleAnalyzeImage = async (file: File, mode: 'quick' | 'standard') => {
    setImageLoading(true);
    setError(null);
    try {
      const result = await forensicApi.uploadImage(file, mode);
      setActiveAnalysis(result);
      const updated = await forensicApi.listAnalyses();
      setAnalyses(updated);
      
      // Smooth scroll to results
      const wb = document.getElementById('workbench');
      if (wb) wb.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Forensic image analysis failed. Please verify file format.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSelectAnalysis = async (uuid: string) => {
    setImageLoading(true);
    setError(null);
    try {
      const full = await forensicApi.getAnalysis(uuid);
      setActiveAnalysis(full);
      const wb = document.getElementById('workbench');
      if (wb) wb.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Could not retrieve analysis record.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteAnalysis = async (uuid: string) => {
    if (!confirm('Are you sure you want to remove this forensic record?')) return;
    try {
      await forensicApi.deleteAnalysis(uuid);
      if (activeAnalysis?.uuid === uuid) setActiveAnalysis(null);
      setAnalyses((prev) => prev.filter((a) => a.uuid !== uuid));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const scrollToWorkbench = (detectorType?: 'image' | 'document') => {
    if (detectorType) setActiveDetector(detectorType);
    const element = document.getElementById('workbench');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToWorkflow = () => {
    const element = document.getElementById('workflow');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#141414] font-sans antialiased selection:bg-[#FF5B00] selection:text-white">
      {/* Sticky Editorial Header */}
      <Header
        activeDetector={activeDetector}
        onSelectDetector={(type) => {
          setActiveDetector(type);
          scrollToWorkbench(type);
        }}
        onGoHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onOpenContact={() => setContactModalOpen(true)}
      />

      <main className="flex-1">
        {/* Error notification banner if any */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold font-mono">System Notice</div>
                  <div className="mt-0.5">{error}</div>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-800 font-bold px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 1. Hero Section */}
        <HeroSection
          onGetStarted={() => scrollToWorkbench('image')}
          onLearnMore={scrollToWorkflow}
        />

        {/* 2. Detector Cards Section (Side by side) */}
        <DetectorCardsSection
          onSelectImageDetector={() => scrollToWorkbench('image')}
          onSelectDocumentDetector={() => scrollToWorkbench('document')}
        />

        {/* 3. Interactive Detector Workbench (Embedded Tool) */}
        <DetectorWorkbench
          activeDetector={activeDetector}
          onTabChange={(tab) => setActiveDetector(tab)}
          onAnalyzeImage={handleAnalyzeImage}
          isImageLoading={imageLoading}
          activeAnalysis={activeAnalysis}
          onClearAnalysis={() => setActiveAnalysis(null)}
          analyses={analyses}
          onSelectAnalysis={handleSelectAnalysis}
          onDeleteAnalysis={handleDeleteAnalysis}
        />

        {/* 4. Workflow Section (Simple Steps) */}
        <WorkflowSection />

        {/* 5. About Section (Woman with laptop reference & feature list) */}
        <AboutSection />

        {/* 6. Testimonial Section */}
        <TestimonialSection />

        {/* 7. CTA Section (Full-width orange card) */}
        <CtaSection
          onGetStarted={() => scrollToWorkbench('image')}
          onLearnMore={scrollToWorkflow}
        />
      </main>

      {/* 8. Footer */}
      <Footer
        onSelectDetector={(type) => scrollToWorkbench(type)}
        onGoHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onOpenContact={() => setContactModalOpen(true)}
      />

      {/* "Let's Talk" Contact Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </div>
  );
};
