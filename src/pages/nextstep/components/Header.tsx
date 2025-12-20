import React from 'react';
import { View } from '../hooks/useNextStep';

interface HeaderProps {
  activeView: View;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setMobileMenuOpen,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 bg-[#faf8ff] z-40 flex justify-between items-center px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 -ml-2"
        >
          <span className="material-symbols-outlined text-[#4d556a]">menu</span>
        </button>
        <h2 className="text-lg lg:text-xl font-bold text-[#131b2e]">
          {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
        </h2>
      </div>
      <div className="flex items-center gap-2 lg:gap-6">
        <div className="relative hidden sm:flex items-center bg-[#f2f3ff] px-4 py-2 rounded-xl">
          <span className="material-symbols-outlined text-[#737686]">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-32 lg:w-64 ml-2" 
            placeholder="Search..." 
            type="text"
          />
        </div>
        <div className="flex items-center gap-1 lg:gap-3">
          <span className="material-symbols-outlined text-[#4d556a] cursor-pointer hover:text-[#0051d5] p-2">add_circle</span>
          <span className="material-symbols-outlined text-[#4d556a] cursor-pointer hover:text-[#0051d5] p-2 hidden sm:inline">notifications</span>
          <div className="w-8 h-8 rounded-full bg-[#dae2fd] overflow-hidden ml-1">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZWAiJsPgH1QjIu-6IoZB38y7x32EPdJadYUSj0zsedJ6pHXXD1nUVZlc8wrHfenGWTOc_j2Z5D-zEN1E2PdcKfsRXUV-LuIUZfrGn2EAs-xeEfFa7Urfz1x_LYpLkfSls1Pg2KtC0WeSSEk_TNZQN19AtqUXG1x-Mw2tfCwW73FtcwSbbO5SL_iv9hRAttel2VcQd31utQZm7PCzqW8SZVdoqCWmKa6C2SyGAvF_-h8BDE4Fx7Q4aZkoSLN7hzPPxPY-QKYzQqJ9m" alt="Profile" />
          </div>
        </div>
      </div>
    </header>
  );
};