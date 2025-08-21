import React from 'react';
import { useEarningsHistory } from './hooks/useFinancialReports';
import EarningsHistoryTable from './EarningsHistoryTable';

const EarningsTab: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { earningsHistory, loading, error } = useEarningsHistory({ symbol });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {earningsHistory && (
        <>
          <EarningsHistoryTable
            title="Annual Earnings"
            data={earningsHistory.annualEarnings}
            columns={['fiscalDateEnding', 'reportedEPS']}
          />
          <EarningsHistoryTable
            title="Quarterly Earnings"
            data={earningsHistory.quarterlyEarnings}
            columns={['fiscalDateEnding', 'reportedDate', 'reportedEPS', 'estimatedEPS', 'surprise', 'surprisePercentage']}
          />
        </>
      )}
    </div>
  );
};

export default EarningsTab;
