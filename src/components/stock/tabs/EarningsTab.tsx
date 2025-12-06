import React, { useState } from 'react';
import { useEarningsHistory } from '../hooks/useFinancialReports';
import EarningsHistoryTable from '../tables/EarningsHistoryTable';
import Spinner from '../shared/components/Spinner';

interface Estimate {
  symbol: string;
  date: string;
  revenueLow: string;
  revenueHigh: string;
  revenueAvg: string;
  ebitdaLow: string;
  ebitdaHigh: string;
  ebitdaAvg: string;
  ebitLow: string;
  ebitHigh: string;
  ebitAvg: string;
  netIncomeLow: string;
  netIncomeHigh: string;
  netIncomeAvg: string;
  sgaExpenseLow: string;
  sgaExpenseHigh: string;
  sgaExpenseAvg: string;
  epsAvg: string;
  epsHigh: string;
  epsLow: string;
  numAnalystsRevenue: number | null;
  numAnalystsEps: number | null;
}

interface EarningsEstimate {
  estimates: Estimate[];
  lastUpdated: string | null;
}

const EarningsTab: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'estimates'>('history');
  const [numberScale, setNumberScale] = useState<'millions' | 'billions'>('billions');
  const { earningsHistory, loading, error, lastUpdated } = useEarningsHistory({ symbol });
  
  const [estimatesData, setEstimatesData] = useState<EarningsEstimate | null>(null);
  const [estimatesLoading, setEstimatesLoading] = useState(false);
  const [estimatesError, setEstimatesError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const formatValue = (value: string | null | undefined, isCurrency: boolean = false): string => {
    if (!value) return '-';
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return value;
    
    const scaled = numberScale === 'billions' ? num / 1000000000 : num / 1000000;
    const prefix = isCurrency ? '$' : '';
    const suffix = numberScale === 'billions' ? 'B' : 'M';
    
    if (scaled >= 1000) {
      return `${prefix}${scaled.toFixed(2)}${suffix}`;
    }
    return `${prefix}${scaled.toFixed(4)}${suffix}`;
  };

  const formatEPS = (value: string | null | undefined): string => {
    if (!value) return '-';
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return value;
    return `$${num.toFixed(2)}`;
  };

  const fetchEstimates = async () => {
    setEstimatesLoading(true);
    setEstimatesError(null);
    try {
      const response = await fetch(`http://localhost:8080/stocks/earnings-estimates/${symbol}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch estimates: ${response.statusText}`);
      }
      const data = await response.json();
      setEstimatesData(data);
    } catch (err: any) {
      setEstimatesError(err.message || 'An error occurred');
    } finally {
      setEstimatesLoading(false);
    }
  };

  const handleTabChange = (tab: 'history' | 'estimates') => {
    setActiveTab(tab);
    if (tab === 'estimates' && !estimatesData) {
      fetchEstimates();
    }
  };

  const toggleRowExpansion = (index: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center p-12 min-h-[400px]"><Spinner elapsedTime={0} /></div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  const visibleEstimateColumns = ['date', 'revenueAvg', 'ebitdaAvg', 'netIncomeAvg', 'epsAvg', 'numAnalystsEps'];

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Earnings</h2>
        {activeTab === 'history' && lastUpdated && (
          <span className="text-sm text-gray-600">
            Last Updated: {new Date(lastUpdated).toLocaleString()}
          </span>
        )}
        {activeTab === 'estimates' && estimatesData && estimatesData.lastUpdated && (
          <span className="text-sm text-gray-600">
            Last Updated: {new Date(estimatesData.lastUpdated).toLocaleString()}
          </span>
        )}
      </div>
      
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => handleTabChange('history')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'history'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Earnings History
        </button>
        <button
          onClick={() => handleTabChange('estimates')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'estimates'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Earnings Estimates
        </button>
      </div>

      {activeTab === 'history' && earningsHistory && (
        <>
          <EarningsHistoryTable
            title="Quarterly Earnings"
            data={earningsHistory.quarterlyEarnings}
            columns={['fiscalDateEnding', 'reportedEPS', 'estimatedEPS', 'surprise', 'surprisePercentage']}
          />
        </>
      )}

      {activeTab === 'estimates' && (
        <div>
          <div className="flex space-x-1 border rounded-lg px-1 py-0.5 w-fit mb-4">
            <button
              className={`px-2 py-1 text-sm font-medium ${numberScale === 'millions' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setNumberScale('millions')}
            >
              Millions
            </button>
            <button
              className={`px-2 py-1 text-sm font-medium ${numberScale === 'billions' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setNumberScale('billions')}
            >
              Billions
            </button>
          </div>
          {estimatesLoading && <div className="text-center p-4">Loading estimates...</div>}
          {estimatesError && <div className="text-center p-4 text-red-500">Error: {estimatesError}</div>}
          {!estimatesLoading && !estimatesError && estimatesData && estimatesData.estimates && estimatesData.estimates.length === 0 && (
            <div className="text-gray-500 text-center p-4">No estimates available</div>
          )}
          {!estimatesLoading && !estimatesError && estimatesData && estimatesData.estimates && estimatesData.estimates.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="w-8 px-2 py-2"></th>
                    {visibleEstimateColumns.map(col => (
                      <th key={col} className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                        {col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {estimatesData.estimates.map((estimate, index) => (
                    <React.Fragment key={index}>
                      <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'} onClick={() => toggleRowExpansion(index)}>
                        <td className="px-2 py-2 text-center">
                          <span className="text-gray-500">{expandedRows.has(index) ? '▼' : '▶'}</span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800 border-b">{estimate.date}</td>
                        <td className="px-4 py-2 text-sm text-gray-800 border-b">{formatValue(estimate.revenueAvg, true)}</td>
                        <td className="px-4 py-2 text-sm text-gray-800 border-b">{formatValue(estimate.ebitdaAvg, true)}</td>
                        <td className="px-4 py-2 text-sm text-gray-800 border-b">{formatValue(estimate.netIncomeAvg, true)}</td>
                        <td className="px-4 py-2 text-sm text-gray-800 border-b">{formatEPS(estimate.epsAvg)}</td>
                        <td className="px-4 py-2 text-sm text-gray-800 border-b">{estimate.numAnalystsEps}</td>
                      </tr>
                      {expandedRows.has(index) && (
                        <tr>
                          <td colSpan={visibleEstimateColumns.length + 1} className="bg-gray-50 border-b p-4">
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div><span className="font-medium">Revenue Low:</span> {formatValue(estimate.revenueLow, true)}</div>
                              <div><span className="font-medium">Revenue High:</span> {formatValue(estimate.revenueHigh, true)}</div>
                              <div><span className="font-medium">EBITDA Low:</span> {formatValue(estimate.ebitdaLow, true)}</div>
                              <div><span className="font-medium">EBITDA High:</span> {formatValue(estimate.ebitdaHigh, true)}</div>
                              <div><span className="font-medium">EBIT Low:</span> {formatValue(estimate.ebitLow, true)}</div>
                              <div><span className="font-medium">EBIT High:</span> {formatValue(estimate.ebitHigh, true)}</div>
                              <div><span className="font-medium">Net Income Low:</span> {formatValue(estimate.netIncomeLow, true)}</div>
                              <div><span className="font-medium">Net Income High:</span> {formatValue(estimate.netIncomeHigh, true)}</div>
                              <div><span className="font-medium">SGA Expense Low:</span> {formatValue(estimate.sgaExpenseLow, true)}</div>
                              <div><span className="font-medium">SGA Expense High:</span> {formatValue(estimate.sgaExpenseHigh, true)}</div>
                              <div><span className="font-medium">EPS Low:</span> {formatEPS(estimate.epsLow)}</div>
                              <div><span className="font-medium">EPS High:</span> {formatEPS(estimate.epsHigh)}</div>
                              <div><span className="font-medium">EBITDA Avg:</span> {formatValue(estimate.ebitdaAvg, true)}</div>
                              <div><span className="font-medium">EBIT Avg:</span> {formatValue(estimate.ebitAvg, true)}</div>
                              <div><span className="font-medium">Net Income Avg:</span> {formatValue(estimate.netIncomeAvg, true)}</div>
                              <div><span className="font-medium">SGA Expense Avg:</span> {formatValue(estimate.sgaExpenseAvg, true)}</div>
                              <div><span className="font-medium">Num Analysts (Revenue):</span> {estimate.numAnalystsRevenue}</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EarningsTab;