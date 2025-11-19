import React from 'react';
import { HistoryEntry } from '../shared/types/valuation';

export interface ColumnConfig {
  key: string;
  header: string;
  render: (entry: unknown) => React.ReactNode;
  cellClassName?: string;
}

interface HistoryTableProps<T extends HistoryEntry> {
  data: T[];
  loading: boolean;
  error: string | null;
  onLoadEntry: (entry: T) => void;
  onDelete: (entry: T) => void;
  columns: ColumnConfig[];
  loadingMessage?: string;
  emptyMessage?: string;
  showVerdict?: boolean;
  verdictField?: string;
}

export function HistoryTable<T extends HistoryEntry>({
  data,
  loading,
  error,
  onLoadEntry,
  onDelete,
  columns,
  loadingMessage = 'Loading valuation history...',
  emptyMessage = 'No valuation history found.',
  showVerdict = false,
  verdictField = 'verdict',
}: HistoryTableProps<T>) {
  if (loading) {
    return <p>{loadingMessage}</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const getVerdictFromEntry = (entry: T): { verdict: string; bgColorClass: string } => {
    if (showVerdict) {
      const entryAny = entry as unknown as Record<string, unknown>;
      
      // Support dot notation for nested verdict fields (e.g., 'reverseDcfOutput.verdict')
      let verdict: string;
      if (verdictField.includes('.')) {
        const parts = verdictField.split('.');
        let current: unknown = entryAny;
        for (const part of parts) {
          if (current && typeof current === 'object') {
            current = (current as Record<string, unknown>)[part];
          } else {
            current = undefined;
            break;
          }
        }
        verdict = (current as string) || 'Neutral';
      } else {
        verdict = (entryAny[verdictField] as string) || 'Neutral';
      }
      
      // Use the saved verdict string to determine background color
      const bgColorClass = 
        verdict === 'Undervalued' ? 'bg-green-200 text-green-800' :
        verdict === 'Overvalued' ? 'bg-red-200 text-red-800' :
        'bg-yellow-200 text-yellow-800';
      
      return { verdict, bgColorClass };
    }
    return { verdict: 'Neutral', bgColorClass: '' };
  };

  const getCommentsFromEntry = (entry: T): string => {
    const entryAny = entry as unknown as Record<string, unknown>;
    
    // Support nested paths for comments (e.g., 'growthUserInput.userComments')
    const commentPaths = ['userComments', 'growthUserInput.userComments', 'dcfUserInput.userComments', 'reverseDcfUserInput.userComments'];
    
    for (const path of commentPaths) {
      if (path.includes('.')) {
        const parts = path.split('.');
        let current: unknown = entryAny;
        for (const part of parts) {
          if (current && typeof current === 'object') {
            current = (current as Record<string, unknown>)[part];
          } else {
            current = undefined;
            break;
          }
        }
        if (current && typeof current === 'string' && current.length > 0) {
          return current;
        }
      } else {
        const value = entryAny[path];
        if (value && typeof value === 'string' && value.length > 0) {
          return value;
        }
      }
    }
    
    return '';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Valuation</th>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
            {showVerdict && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verdict</th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((entry, index) => {
              const { verdict, bgColorClass } = getVerdictFromEntry(entry);
              const comments = getCommentsFromEntry(entry);
              
              return (
                <tr key={index} className="cursor-pointer hover:bg-gray-100">
                  <td 
                    onClick={() => onLoadEntry(entry)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {new Date(entry.valuationDate).toLocaleString()}
                  </td>
                  {columns.map((col) => (
                    <td 
                      key={col.key}
                      onClick={() => onLoadEntry(entry)}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${col.cellClassName || ''}`}
                    >
                      {col.render(entry)}
                    </td>
                  ))}
                  {showVerdict && (
                    <td 
                      onClick={() => onLoadEntry(entry)}
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${bgColorClass}`}
                    >
                      {verdict}
                    </td>
                  )}
                  <td 
                    className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs"
                    title={comments}
                  >
                    {comments.length > 50 
                      ? `${comments.substring(0, 47)}...` 
                      : comments || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(entry);
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length + (showVerdict ? 3 : 2)} className="text-center py-4">{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default HistoryTable;
