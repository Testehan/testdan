import React, { useState } from 'react';
import DcfCalculator from './DcfCalculator'; // Will create this component next
import ReverseDcfCalculator from './ReverseDcfCalculator'; // Will create this component next

interface ValuationTabProps {
  symbol: string;
}

const ValuationTab: React.FC<ValuationTabProps> = ({ symbol }) => {
  const [activeSubTab, setActiveSubTab] = useState<string>('dcf');

  return (
    <div className="p-4">
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeSubTab === 'dcf' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveSubTab('dcf')}
        >
          DCF
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeSubTab === 'reverse_dcf' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveSubTab('reverse_dcf')}
        >
          Reverse DCF
        </button>
        {/* Add other valuation tabs here */}
      </div>
      <div>
        {activeSubTab === 'dcf' && <DcfCalculator symbol={symbol} />}
        {activeSubTab === 'reverse_dcf' && <ReverseDcfCalculator symbol={symbol} />}
      </div>
    </div>
  );
};

export default ValuationTab;

