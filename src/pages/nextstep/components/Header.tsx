import React from 'react';
import { View } from '../hooks/useNextStep';

interface HeaderProps {
  activeView: View;
  setMobileMenuOpen: (open: boolean) => void;
  user?: {
    photoURL?: string | null;
    displayName?: string | null;
    email?: string | null;
  } | null;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setMobileMenuOpen,
  user,
  onSignOut,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const userPhoto = user?.photoURL || user?.email?.[0]?.toUpperCase() || '?';
  const userInitial = user?.displayName?.[0] || user?.email?.[0] || '?';

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
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full bg-[#dae2fd] overflow-hidden ml-1 flex items-center justify-center"
            >
              {user?.photoURL ? (
                <img className="w-full h-full object-cover" src={user.photoURL} alt="Profile" />
              ) : (
                <span className="text-[#4d556a] font-medium text-sm">{userInitial.toUpperCase()}</span>
              )}
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border overflow-hidden">
                {user?.displayName && (
                  <div className="px-4 py-2 border-b text-sm font-medium text-[#131b2e]">
                    {user.displayName}
                  </div>
                )}
                {user?.email && (
                  <div className="px-4 py-1 border-b text-xs text-gray-500">
                    {user.email}
                  </div>
                )}
                <button
                  onClick={() => {
                    onSignOut();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};