import React, { useState } from 'react';
import { useEarningsHistory } from './hooks/useFinancialReports';
import EarningsHistoryTable from './EarningsHistoryTable';

const EarningsTab: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { earningsHistory, loading, error } = useEarningsHistory({ symbol });
  const [reportType, setReportType] = useState<'annual' | 'quarterly'>('quarterly');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="flex space-x-1 border rounded-lg p-1">
          <button
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              reportType === 'annual' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setReportType('annual')}
          >
            Annual
          </button>
          <button
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              reportType === 'quarterly' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setReportType('quarterly')}
          >
            Quarterly
          </button>
        </div>
      </div>
      {earningsHistory && (
        <>
          {reportType === 'annual' && (
            <EarningsHistoryTable
              title="Annual Earnings"
              data={earningsHistory.annualEarnings}
              columns={['date', 'reportedEPS']}
            />
          )}
          {reportType === 'quarterly' && (
            <EarningsHistoryTable
              title="Quarterly Earnings"
              data={earningsHistory.quarterlyEarnings}
              columns={['date', 'reportedDate', 'reportedEPS', 'estimatedEPS', 'surprise', 'surprisePercentage']}
            />
          )}
        </>
      )}
    </div>
  );
};

export default EarningsTab;
