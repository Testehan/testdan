import React from 'react';
import { View } from '../hooks/useNextStep';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onNewClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  mobileMenuOpen,
  setMobileMenuOpen,
  onNewClick,
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - fixed on desktop, slide-out on mobile */}
      <aside className={`
        fixed top-0 h-screen bg-[#f2f3ff] border-r border-[#c3c6d7] z-50 flex flex-col
        transition-transform duration-300 ease-in-out
        w-64 left-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-tighter">NextStep</h1>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="text-sm font-medium tracking-tight uppercase text-[#4d556a]/60 mt-1 hidden sm:block">Deep Work Mode</p>
        </div>
        
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          {[
            { id: 'execution', label: 'Execution', icon: 'bolt' },
            { id: 'actions', label: 'Actions', icon: 'check_circle' },
            { id: 'projects', label: 'Projects', icon: 'account_tree' },
            { id: 'goals', label: 'Goals', icon: 'flag' },
            { id: 'archive', label: 'Archive', icon: 'inventory_2' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveView(item.id as View); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 font-medium tracking-tight uppercase text-sm transition-all ${
                activeView === item.id 
                  ? 'text-[#0051d5] border-l-4 border-[#0051d5] bg-white' 
                  : 'text-[#434655] hover:bg-[#dae2fd]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-[#c3c6d7]/10">
          <button 
            onClick={() => { onNewClick(); setMobileMenuOpen(false); }}
            className="w-full py-3 bg-[#0051d5] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span className="hidden sm:inline">New</span>
          </button>
        </div>

        <div className="px-2 pb-8">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-[#434655] hover:bg-[#dae2fd] transition-colors font-medium tracking-tight uppercase text-sm">
            <span className="material-symbols-outlined text-lg">settings</span>
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};