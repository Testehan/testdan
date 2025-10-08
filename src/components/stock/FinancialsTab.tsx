import React from 'react';
import IncomeStatementTab from './IncomeStatementTab';
import BalanceSheetTab from './BalanceSheetTab';
import CashFlowTab from './CashFlowTab';
import RatiosTab from './RatiosTab';
import EarningsTab from './EarningsTab';

interface FinancialsTabProps {
  symbol: string;
  activeSubTab: string;
  onSubTabClick: (subTab: string) => void;
}

const FinancialsTab: React.FC<FinancialsTabProps> = ({ symbol, activeSubTab, onSubTabClick }) => {
  return (
    <div>
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeSubTab === 'incomeStatement' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => onSubTabClick('incomeStatement')}
        >
          Income Statement
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeSubTab === 'balanceSheet' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => onSubTabClick('balanceSheet')}
        >
          Balance Sheet
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeSubTab === 'cashFlow' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => onSubTabClick('cashFlow')}
        >
          Cash Flow
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeSubTab === 'ratios' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => onSubTabClick('ratios')}
        >
          Ratios
        </button>
        <button
            className={`px-4 py-2 text-lg font-medium ${
                activeSubTab === 'earnings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => onSubTabClick('earnings')}
        >
          Earnings
        </button>
      </div>
      <div>
        {activeSubTab === 'incomeStatement' && <IncomeStatementTab symbol={symbol} />}
        {activeSubTab === 'balanceSheet' && <BalanceSheetTab symbol={symbol} />}
        {activeSubTab === 'cashFlow' && <CashFlowTab symbol={symbol} />}
        {activeSubTab === 'ratios' && <RatiosTab symbol={symbol} />}
        {activeSubTab === 'earnings' && <EarningsTab symbol={symbol} />}
      </div>
    </div>
  );
};

export default FinancialsTab;