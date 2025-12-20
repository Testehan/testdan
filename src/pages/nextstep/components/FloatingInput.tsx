import React from 'react';

interface FloatingInputProps {
  quickInput: string;
  setQuickInput: (value: string) => void;
  onQuickCapture: () => void;
  loading: boolean;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  quickInput,
  setQuickInput,
  onQuickCapture,
  loading,
}) => {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
      <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20">
        <div className="flex-1 flex items-center px-4 py-2">
          <input 
            className="bg-transparent border-none focus:ring-0 text-[#131b2e] w-full font-medium" 
            placeholder="Add a task, idea, or reference..." 
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onQuickCapture()}
          />
        </div>
        <div className="flex items-center gap-2 p-1">
          <button 
            onClick={onQuickCapture}
            disabled={loading || !quickInput.trim()}
            className="bg-[#0051d5] text-white w-10 h-10 rounded-xl flex items-center justify-center hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined">north</span>
          </button>
        </div>
      </div>
    </div>
  );
};