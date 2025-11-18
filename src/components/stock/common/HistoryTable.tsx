import React from 'react';
import { HistoryEntry } from '../types/valuation';
import { getVerdictStyling } from '../../../utils/valuation';

interface HistoryTableProps<T extends HistoryEntry> {
  data: T[];
  loading: boolean;
  error: string | null;
  onLoadEntry: (entry: T) => void;
  onDelete: (entry: T) => void;
  loadingMessage?: string;
  emptyMessage?: string;
  renderIntrinsicValue?: (entry: T) => React.ReactNode;
  renderSharePrice?: (entry: T) => React.ReactNode;
  renderExtraColumns?: (entry: T) => React.ReactNode;
}

export function HistoryTable<T extends HistoryEntry & { 
  userComments?: string;
  output?: { intrinsicValuePerShare: number; verdict: string };
  valuationData?: { meta: { currentSharePrice: number; currency: string } };
}>({
  data,
  loading,
  error,
  onLoadEntry,
  onDelete,
  loadingMessage = 'Loading valuation history...',
  emptyMessage = 'No valuation history found.',
  renderIntrinsicValue,
  renderSharePrice,
  renderExtraColumns
}: HistoryTableProps<T>) {
  if (loading) {
    return <p>{loadingMessage}</p>;
  }

  if (error) {
    return <p className="text-red-500">Could not load valuation history.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Valuation</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intrinsic Value Per Share</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share Price at Valuation</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verdict</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((entry, index) => {
              const verdict = entry.output?.verdict || 'Neutral';
              const verdictStyling = getVerdictStyling(
                entry.output?.intrinsicValuePerShare || 0,
                entry.valuationData?.meta?.currentSharePrice || 0
              );
              
              return (
                <tr key={index} className="cursor-pointer hover:bg-gray-100">
                  <td 
                    onClick={() => onLoadEntry(entry)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {new Date(entry.valuationDate).toLocaleString()}
                  </td>
                  <td 
                    onClick={() => onLoadEntry(entry)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {renderIntrinsicValue ? renderIntrinsicValue(entry) : `$${entry.output?.intrinsicValuePerShare?.toFixed(2) || '-'}`}
                  </td>
                  <td 
                    onClick={() => onLoadEntry(entry)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {renderSharePrice ? renderSharePrice(entry) : `$${entry.valuationData?.meta?.currentSharePrice?.toFixed(2) || '-'}`}
                  </td>
                  <td 
                    onClick={() => onLoadEntry(entry)}
                    className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${verdictStyling.bgColorClass}`}
                  >
                    {verdict}
                  </td>
                  <td 
                    onClick={() => onLoadEntry(entry)}
                    className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs"
                    title={entry.userComments}
                  >
                    {entry.userComments && entry.userComments.length > 50 
                      ? `${entry.userComments.substring(0, 47)}...` 
                      : entry.userComments || ''}
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
                  {renderExtraColumns && (
                    <td>
                      {renderExtraColumns(entry)}
                    </td>
                  )}
                </tr>
              );
            })
              ) : (
            <tr>
              <td colSpan={renderExtraColumns ? 7 : 6} className="text-center py-4">{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default HistoryTable;
