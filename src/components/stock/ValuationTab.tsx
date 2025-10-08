import React from 'react';
import DcfCalculator from './DcfCalculator';
import ReverseDcfCalculator from './ReverseDcfCalculator';

interface ValuationTabProps {
  symbol: string;
  activeSubTab: string;
  onSubTabClick: (subTab: string) => void;
}

const ValuationTab: React.FC<ValuationTabProps> = ({ symbol, activeSubTab, onSubTabClick }) => {
  return (
    <div className="p-4">
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeSubTab === 'dcf' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => onSubTabClick('dcf')}
        >
          DCF
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeSubTab === 'reverse_dcf' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => onSubTabClick('reverse_dcf')}
        >
          Reverse DCF
        </button>
      </div>
      <div>
        {activeSubTab === 'dcf' && <DcfCalculator symbol={symbol} />}
        {activeSubTab === 'reverse_dcf' && <ReverseDcfCalculator symbol={symbol} />}
      </div>
    </div>
  );
};

export default ValuationTab;