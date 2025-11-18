import React from 'react';

interface EarningsHistoryTableProps {
  title: string;
  data: any[];
  columns: string[];
}

const EarningsHistoryTable: React.FC<EarningsHistoryTableProps> = ({ title, data, columns }) => {

  const getRowColor = (row: any) => {
    if (title !== 'Quarterly Earnings' || !row.surprisePercentage) {
      return '';
    }
    const surprise = parseFloat(row.surprisePercentage);
    if (surprise > 0) {
      return 'bg-green-100';
    } else if (surprise < 0) {
      return 'bg-red-100';
    } else if (surprise === 0) {
      return 'bg-yellow-100';
    }
    return '';
  };

  return (
    <div className="mb-4">
      <h4 className="text-lg font-bold mb-2">{title}</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              {columns.map(col => (
                <th key={col} className="text-left py-2 px-3">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={`border-b ${getRowColor(row)}`}>
                {columns.map(col => (
                  <td key={col} className="py-2 px-3">
                    {col === 'surprise' || col === 'surprisePercentage'
                      ? (typeof row[col] === 'number' ? row[col].toFixed(3) : parseFloat(row[col]).toFixed(3)) + (col === 'surprisePercentage' ? '%' : '')
                      : row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EarningsHistoryTable;
