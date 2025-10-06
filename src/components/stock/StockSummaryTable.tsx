import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface StockSummary {
  ticker: string;
  totalScore: number;
  generationDate: string;
}

type SortColumn = keyof StockSummary;
type SortDirection = 'asc' | 'desc';

const StockSummaryTable: React.FC = () => {
  const [summaryData, setSummaryData] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('ticker');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const response = await fetch('http://localhost:8080/stocks/reporting/ferol/summary');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: StockSummary[] = await response.json();
        setSummaryData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = [...summaryData].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (sortColumn === 'totalScore') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    } else if (sortColumn === 'generationDate') {
      const dateA = new Date(aValue as string).getTime();
      const dateB = new Date(bValue as string).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      // Default to string comparison for other columns like 'ticker'
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }
  });

  if (loading) {
    return <div className="text-center p-4">Loading stock summaries...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Stock Summaries</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('ticker')}
            >
              Ticker {sortColumn === 'ticker' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('totalScore')}
            >
              Total Score {sortColumn === 'totalScore' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('generationDate')}
            >
              Generation Date {sortColumn === 'generationDate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((summary) => (
            <tr
              key={summary.ticker}
              onClick={() => navigate(`/stocks/${summary.ticker}`)}
              className="cursor-pointer hover:bg-gray-100"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {summary.ticker}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {summary.totalScore.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(summary.generationDate).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockSummaryTable;
