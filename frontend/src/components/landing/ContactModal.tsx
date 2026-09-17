import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: 'Forensic Detection Inquiry', message: '' });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-[#EAE3D9] rounded-3xl p-8 sm:p-10 shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-[#FAF7F2] hover:bg-[#EAE3D9] text-[#141414] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FFF3EB] text-[#FF5B00] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#141414]">Message Dispatched</h3>
            <p className="text-sm text-[#737373] max-w-xs mx-auto">
              Thank you for reaching out. Our forensic analysis specialist will review your inquiry shortly.
            </p>
          </div>
        ) : (
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-[#FF5B00] block mb-1">
              GET IN TOUCH
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#141414] font-semibold mb-2">
              Let's Talk.
            </h3>
            <p className="text-xs sm:text-sm text-[#737373] mb-6">
              Inquire about enterprise integration, batch forensic verification, or bespoke detection model tuning.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#262626] mb-1.5 font-mono">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9] text-sm text-[#141414] focus:outline-none focus:border-[#FF5B00] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#262626] mb-1.5 font-mono">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. s.jenkins@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9] text-sm text-[#141414] focus:outline-none focus:border-[#FF5B00] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#262626] mb-1.5 font-mono">
                  Message / Requirements
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your verification volumes, file types, or specific threat vectors..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9] text-sm text-[#141414] focus:outline-none focus:border-[#FF5B00] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-full bg-[#FF5B00] hover:bg-[#141414] text-white font-semibold text-sm tracking-wide shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 mt-4"
              >
                <span>Submit Inquiry</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
