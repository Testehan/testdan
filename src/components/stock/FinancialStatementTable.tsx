import { formatLargeNumber, formatMonthYear, formatMetricName } from './utils';
import { metricDescriptions } from './metricDescriptions'; // Import metric descriptions

interface FinancialStatementTableProps<T> {
    reportsToDisplay: T[];
    allKeys: (keyof T)[];
    numberScale: 'none' | 'millions' | 'billions';
    tableName: string; // e.g., "Income Statement"
    highlightKeys?: (keyof T)[];
    percentageKeys?: (keyof T)[];
}

export const FinancialStatementTable = <T extends { fiscalDateEnding: string }>(
    { reportsToDisplay, allKeys, numberScale, tableName, highlightKeys, percentageKeys }: FinancialStatementTableProps<T>
) => {
    if (reportsToDisplay.length === 0) {
        return <div className="text-center p-4">No data available for the selected period or date range.</div>;
    }

    return (
        <div className="overflow-y-visible">
            <table className="w-full text-sm text-left text-gray-500 table-fixed">
                <thead className="text-xs text-gray-700 uppercase">
                    <tr>
                        <th scope="col" className="px-6 py-2 w-60 bg-blue-50 font-semibold">{tableName}</th>
                        {reportsToDisplay.map(report => (
                            <th key={report.fiscalDateEnding} scope="col" className="px-6 py-2 whitespace-nowrap">{formatMonthYear(report.fiscalDateEnding)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {allKeys.map((key, index) => {
                        if (key === 'fiscalDateEnding' || key === 'reportedCurrency') return null;
                        if (!reportsToDisplay.some(report => Object.prototype.hasOwnProperty.call(report, key))) {
                            return null;
                        }
                        const formattedName = formatMetricName(key as string);
                        const description = metricDescriptions[key as string]; // Get description
                        const isHighlighted = highlightKeys?.includes(key as keyof T);
                        const textClasses = `text-gray-900 ${isHighlighted ? 'font-semibold' : 'font-normal'}`;
                        const paddingClass = isHighlighted ? 'pl-6' : 'pl-10';

                        return (
                            <tr key={key as string} className={`border-b ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}>
                                <th
                                    scope="row"
                                    className={`py-2 w-60 ${paddingClass} ${textClasses} relative overflow-visible`}

                                >
                                    <div className="flex ">
                                        {description && (
                                            <div className="relative group ml-1 flex-shrink-0">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                    className="w-4 h-4 text-gray-400 cursor-pointer"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                                </svg>
                                                {/* Tooltip positioned to escape the th boundary */}
                                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden w-64 p-3 text-sm text-white bg-gray-900 rounded-lg shadow-xl group-hover:block z-[9999] whitespace-normal pointer-events-none">
                                                    {description}
                                                    {/* Arrow pointing left */}
                                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900 -mr-px"></div>
                                                </div>
                                            </div>
                                        )}
                                        <span className="truncate" title={formattedName}>{formattedName}</span>
                                    </div>
                                </th>
                                {reportsToDisplay.map(report => {
                                    const value = report[key];
                                    if (value === 'None' || value === null || value === undefined) return <td key={report.fiscalDateEnding} className="px-6 py-2">-</td>;
                                    
                                    let displayValue: string;
                                    const numValue = parseFloat(value as string);

                                    if (!isNaN(numValue) && percentageKeys?.includes(key)) {
                                        displayValue = (numValue * 100).toFixed(2) + '%';
                                    } else if (!isNaN(numValue)) {
                                        if (Math.abs(numValue) >= 1000000 && numberScale !== 'none') {
                                            displayValue = formatLargeNumber(value as string, numberScale);
                                        } else {
                                            displayValue = numValue.toFixed(4); 
                                        }
                                    } else {
                                        displayValue = value as string;
                                    }

                                    return (
                                        <td key={report.fiscalDateEnding} className="px-6 py-2">
                                            {displayValue}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
