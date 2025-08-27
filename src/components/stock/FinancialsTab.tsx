import React, { useState } from 'react';
import IncomeStatementTab from './IncomeStatementTab';
import BalanceSheetTab from './BalanceSheetTab';
import CashFlowTab from './CashFlowTab';
import RatiosTab from './RatiosTab';
import EarningsTab from './EarningsTab';

interface FinancialsTabProps {
  symbol: string;
}

const FinancialsTab: React.FC<FinancialsTabProps> = ({ symbol }) => {
  const [activeTab, setActiveTab] = useState('incomeStatement');

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === 'incomeStatement' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('incomeStatement')}
        >
          Income Statement
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === 'balanceSheet' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('balanceSheet')}
        >
          Balance Sheet
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === 'cashFlow' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('cashFlow')}
        >
          Cash Flow
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === 'ratios' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('ratios')}
        >
          Ratios
        </button>
        <button
            className={`px-4 py-2 text-lg font-medium ${
                activeTab === 'earnings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('earnings')}
        >
          Earnings
        </button>
      </div>
      <div>
        {activeTab === 'incomeStatement' && <IncomeStatementTab symbol={symbol} />}
        {activeTab === 'balanceSheet' && <BalanceSheetTab symbol={symbol} />}
        {activeTab === 'cashFlow' && <CashFlowTab symbol={symbol} />}
        {activeTab === 'ratios' && <RatiosTab symbol={symbol} />}
        {activeTab === 'earnings' && <EarningsTab symbol={symbol} />}
      </div>
    </div>
  );
};

export default FinancialsTab;
