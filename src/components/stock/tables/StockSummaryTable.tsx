import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../common/ConfirmDialog';

interface StockSummary {
  ticker: string;
  totalFerolScore: number;
  total100BaggerScore: number;
  generationFerolDate: string;
  generation100BaggerDate: string;
  status: string;
}

interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // current page number (0-indexed)
  // Add other fields from Spring Page if needed
}

type SortColumn = keyof StockSummary;
type SortDirection = 'asc' | 'desc';

const StockSummaryTable: React.FC = React.memo(() => {
  const [summaryData, setSummaryData] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('ticker');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
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
    'PASS',
  ];

  const fetchSummaryData = async (page: number, size: number, sortCol: SortColumn, sortDir: SortDirection, status: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = `http://localhost:8080/stocks/reporting/checklist/summary/dante?page=${page}&size=${size}&sort=${sortCol},${sortDir}`;
      if (status !== 'All') {
        url += `&status=${status}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PaginatedResponse<StockSummary> = await response.json();
      setSummaryData(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.number);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData(currentPage, pageSize, sortColumn, sortDirection, statusFilter);
  }, [currentPage, pageSize, sortColumn, sortDirection, statusFilter]);


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

  const handleDeleteClick = (symbol: string, e: React.MouseEvent<HTMLButtonElement>) => {
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
      } catch (e: unknown) {
        setError((e as Error).message);
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
          {summaryData.map((summary, index) => (
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

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="pageSizeSelect" className="text-sm font-medium text-gray-700">
            Items per page:
          </label>
          <select
            id="pageSizeSelect"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0); // Reset to first page when page size changes
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(0)}
            disabled={currentPage === 0}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage + 1} of {totalPages} ({totalElements} items)
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages - 1)}
            disabled={currentPage === totalPages - 1}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Last
          </button>
        </div>
      </div>
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
});

export default StockSummaryTable;
