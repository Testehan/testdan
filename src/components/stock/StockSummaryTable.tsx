import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from './common/ConfirmDialog';

interface StockSummary {
  ticker: string;
  totalFerolScore: number;
  total100BaggerScore: number;
  generationFerolDate: string;
  generation100BaggerDate: string;
  status: string;
}

type SortColumn = keyof StockSummary;
type SortDirection = 'asc' | 'desc';

const StockSummaryTable: React.FC = () => {
  const [summaryData, setSummaryData] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('ticker');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    ticker: string;
  } | null>(null);

  const statusOptions = [
    'All',
    'NEW',
    'RESEARCHING',
    'WATCHLIST',
    'BUY_CANDIDATE',
    'OWNED',
    'TRIM',
    'SELL',
    'PASS',
    'BLACKLIST',
  ];

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const response = await fetch('http://localhost:8080/stocks/reporting/checklist/summary/dante');
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


  const handleContextMenu = (event: React.MouseEvent, ticker: string) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX + window.scrollX,
      y: event.clientY + window.scrollY,
      ticker: ticker,
    });
  };

  const handleOpenInNewTab = () => {
    if (contextMenu) {
      window.open(`/stocks/${contextMenu.ticker}#overview`, '_blank');
      setContextMenu(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  const handleDeleteClick = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStockToDelete(symbol);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (stockToDelete) {
      try {
        const response = await fetch(`http://localhost:8080/stocks/delete/${stockToDelete}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        window.location.reload();
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsConfirmOpen(false);
        setStockToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
    setStockToDelete(null);
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = [...summaryData]
    .filter((summary) => statusFilter === 'All' || summary.status === statusFilter)
    .sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (sortColumn === 'totalFerolScore' || sortColumn === 'total100BaggerScore') {
        return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
      } else if (sortColumn === 'generationFerolDate' || sortColumn === 'generation100BaggerDate') {
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
    <div className="p-4 bg-white shadow rounded-lg relative">
      <h3 className="text-xl font-semibold mb-4">Stock Summaries</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No.
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('ticker')}
            >
              Ticker {sortColumn === 'ticker' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('totalFerolScore')}
            >
              Ferol Score {sortColumn === 'totalFerolScore' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('generationFerolDate')}
            >
              Ferol Date {sortColumn === 'generationFerolDate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('total100BaggerScore')}
            >
              100Bagger Score {sortColumn === 'total100BaggerScore' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('generation100BaggerDate')}
            >
              100Bagger Date {sortColumn === 'generation100BaggerDate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((summary, index) => (
            <tr
              key={summary.ticker}
              onClick={() => navigate(`/stocks/${summary.ticker}#overview`)}
              onContextMenu={(e) => handleContextMenu(e, summary.ticker)}
              className="cursor-pointer hover:bg-gray-100"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {summary.ticker}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {summary.totalFerolScore}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(summary.generationFerolDate).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {summary.total100BaggerScore}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(summary.generation100BaggerDate).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {summary.status}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={(e) => handleDeleteClick(summary.ticker, e)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete all financial data for ${stockToDelete}?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {contextMenu && contextMenu.visible && (
        <div
          style={{
            position: 'absolute',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'white',
            border: '1px solid gray',
            borderRadius: '4px',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
          className="py-1"
        >
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={handleOpenInNewTab}
          >
            Open in new tab
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSummaryTable;
