import React from 'react';
import { useEarningsHistory } from '../hooks/useFinancialReports';
import EarningsHistoryTable from '../tables/EarningsHistoryTable';

const EarningsTab: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { earningsHistory, loading, error, lastUpdated } = useEarningsHistory({ symbol });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Earnings</h2>
        {lastUpdated && (
          <span className="text-sm text-gray-600">
            Last Updated: {new Date(lastUpdated).toLocaleString()}
          </span>
        )}
      </div>
      {earningsHistory && (
        <EarningsHistoryTable
          title="Quarterly Earnings"
          data={earningsHistory.quarterlyEarnings}
          columns={['fiscalDateEnding', 'reportedEPS', 'estimatedEPS', 'surprise', 'surprisePercentage']}
        />
      )}
    </div>
  );
};

export default EarningsTab;
