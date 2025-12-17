import React, { useState, useEffect } from 'react';
import Menu from '../components/Menu';
import { API_ENDPOINT } from '../config';

interface LlmUsage {
  id: string;
  timestamp: string;
  model: string;
  operationType: string;
  symbol: string;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  totalCostUsd: number;
  success: boolean;
  errorMessage: string | null;
}

interface Column {
  key: keyof LlmUsage | 'totalTokens';
  label: string;
  visible: boolean;
}

const UsagePage: React.FC = () => {
  const [data, setData] = useState<LlmUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [columns, setColumns] = useState<Column[]>([
    { key: 'timestamp', label: 'Timestamp', visible: true },
    { key: 'symbol', label: 'Symbol', visible: true },
    { key: 'operationType', label: 'Operation Type', visible: true },
    { key: 'model', label: 'Model', visible: true },
    { key: 'promptTokens', label: 'Prompt Tokens', visible: true },
    { key: 'completionTokens', label: 'Completion Tokens', visible: true },
    { key: 'totalTokens', label: 'Total Tokens', visible: false },
    { key: 'cachedTokens', label: 'Cached Tokens', visible: false },
    { key: 'totalCostUsd', label: 'Cost (USD)', visible: true },
    { key: 'success', label: 'Success', visible: true },
    { key: 'errorMessage', label: 'Error', visible: false },
  ]);

  const [filters, setFilters] = useState({
    symbol: '',
    operationType: '',
    fromDate: '',
    toDate: '',
    page: 0,
    size: 50,
  });

  const [sortField, setSortField] = useState<string>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sortableColumns = ['symbol', 'operationType', 'promptTokens', 'completionTokens', 'cachedTokens', 'totalCostUsd'];

  const handleSort = (column: string) => {
    if (!sortableColumns.includes(column)) return;
    
    if (sortField === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(column);
      setSortDir('asc');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.symbol) params.append('symbol', filters.symbol);
      if (filters.operationType) params.append('operationType', filters.operationType);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      params.append('page', filters.page.toString());
      params.append('size', filters.size.toString());
      const response = await fetch(`${API_ENDPOINT}/llm-usage?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch usage data: ${response.statusText}`);
      }
      const result = await response.json();
      let fetchedData = result.content || [];
      
      // Client-side sorting
      fetchedData = [...fetchedData].sort((a, b) => {
        let aVal = a[sortField as keyof LlmUsage];
        let bVal = b[sortField as keyof LlmUsage];
        
        if (sortField === 'totalTokens') {
          aVal = (a.promptTokens || 0) + (a.completionTokens || 0);
          bVal = (b.promptTokens || 0) + (b.completionTokens || 0);
        }
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = (bVal as string).toLowerCase();
        }
        
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
      
      setData(fetchedData);
      setTotalElements(result.totalElements || 0);
      setTotalPages(result.totalPages || 0);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [sortField, sortDir]);

  const parseDateInput = (value: string): string => {
    const formats = [
      /^(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2}):(\d{2})$/,
      /^(\d{2})-(\d{2})-(\d{4})\s*(\d{2}):(\d{2}):(\d{2})$/,
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/,
    ];

    for (const format of formats) {
      const match = value.match(format);
      if (match) {
        if (format === formats[0] || format === formats[1]) {
          const [, day, month, year, hour, minute, second] = match;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour}:${minute}:${second}`;
        } else {
          return value;
        }
      }
    }
    return value;
  };

  const handleFilterChange = (key: string, value: string | number) => {
    if (key === 'fromDate' || key === 'toDate') {
      const parsed = parseDateInput(String(value));
      setFilters(prev => ({ ...prev, [key]: parsed }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleDatePaste = (e: React.ClipboardEvent<HTMLInputElement>, key: string) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const parsed = parseDateInput(pastedText);
    setFilters(prev => ({ ...prev, [key]: parsed }));
  };

  const handleApplyFilters = () => {
    setFilters(prev => ({ ...prev, page: 0 }));
    fetchData();
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    fetchData();
  };

  const handleSizeChange = (newSize: number) => {
    setFilters(prev => ({ ...prev, size: newSize, page: 0 }));
    fetchData();
  };

  const toggleColumn = (key: keyof LlmUsage | 'totalTokens') => {
    setColumns(prev =>
      prev.map(col => (col.key === key ? { ...col, visible: !col.visible } : col))
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(6)}`;
  };

  const totalCostCurrentPage = data.reduce((sum, row) => sum + (row.totalCostUsd || 0), 0);

  if (loading) {
    return <div className="text-center p-4">Loading usage data...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <Menu />
      <h1 className="text-2xl font-bold mb-4">LLM Usage</h1>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
            <input
              type="text"
              value={filters.symbol}
              onChange={(e) => handleFilterChange('symbol', e.target.value)}
              placeholder="e.g. AAPL"
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operation Type</label>
            <input
              type="text"
              value={filters.operationType}
              onChange={(e) => handleFilterChange('operationType', e.target.value)}
              placeholder="e.g. sentiment"
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="datetime-local"
              step="1"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              onPaste={(e) => handleDatePaste(e, 'fromDate')}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="datetime-local"
              step="1"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              onPaste={(e) => handleDatePaste(e, 'toDate')}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setFilters({ symbol: '', operationType: '', fromDate: '', toDate: '', page: 0, size: 50 });
              fetchData();
            }}
            className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {columns.map(col => (
          <button
            key={col.key}
            onClick={() => toggleColumn(col.key)}
            className={`px-3 py-1 rounded text-sm ${
              col.visible
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {col.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="text-gray-500">No usage data available</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                {columns
                  .filter(col => col.visible)
                  .map(col => (
                    <th
                      key={col.key}
                      className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b ${sortableColumns.includes(col.key) ? 'cursor-pointer hover:bg-gray-200' : ''}`}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.key === 'totalCostUsd' ? (
                        <div>
                          <div className="flex items-center gap-1">
                            {col.label}
                            {sortField === col.key && (
                              <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-red-600">Sum: {formatCost(totalCostCurrentPage)}</div>
                        </div>
                      ) : sortableColumns.includes(col.key) ? (
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortField === col.key && (
                            <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      ) : (
                        col.label
                      )}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  {columns
                    .filter(col => col.visible)
                    .map(col => {
                      const value = row[col.key as keyof LlmUsage];
                      if (col.key === 'timestamp') {
                        return (
                          <td key={col.key} className="px-4 py-2 text-sm text-gray-800 border-b">
                            {formatTimestamp(value as string)}
                          </td>
                        );
                      }
                      if (col.key === 'totalCostUsd') {
                        return (
                          <td key={col.key} className="px-4 py-2 text-sm text-gray-800 border-b">
                            {formatCost(value as number)}
                          </td>
                        );
                      }
                      if (col.key === 'totalTokens') {
                        const total = row.promptTokens + row.completionTokens;
                        return (
                          <td key={col.key} className="px-4 py-2 text-sm text-gray-800 border-b">
                            {total}
                          </td>
                        );
                      }
                      if (col.key === 'success') {
                        return (
                          <td key={col.key} className="px-4 py-2 text-sm border-b">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {value ? 'Yes' : 'No'}
                            </span>
                          </td>
                        );
                      }
                      return (
                        <td key={col.key} className="px-4 py-2 text-sm text-gray-800 border-b">
                          {value !== null && value !== undefined ? String(value) : '-'}
                        </td>
                      );
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            Items per page:
          </label>
          <select
            value={filters.size}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
            <option value={2000}>2000</option>
            <option value={5000}>5000</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(0)}
            disabled={filters.page === 0}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            First
          </button>
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 0}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="flex items-center px-4">
            Page {filters.page + 1} of {totalPages || 1} ({totalElements} items)
          </span>
          <button
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page >= totalPages - 1}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Next
          </button>
          <button
            onClick={() => handlePageChange(totalPages - 1)}
            disabled={filters.page >= totalPages - 1}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsagePage;