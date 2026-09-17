import React from 'react';
import { Scan, HelpCircle } from 'lucide-react';

export type NavTab = 'analysis';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'analysis' as NavTab, label: 'AI Image Detector', icon: Scan },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between select-none">
      <div className="py-4">
        <div className="px-5 mb-3">
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Tools
          </div>
        </div>

        <nav className="space-y-0.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Scientific disclaimer footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 leading-relaxed">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Scientific Notice</span>
        </div>
        Assessments are probabilistic technical evaluations, not definitive legal proof of manipulation or authenticity.
      </div>
    </aside>
  );
};
