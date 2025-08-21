import { formatLargeNumber, formatMonthYear, formatMetricName } from './utils';

interface FinancialStatementTableProps<T> {
    reportsToDisplay: T[];
    allKeys: (keyof T)[];
    numberScale: 'none' | 'millions' | 'billions'; // Updated type to include 'none'
    tableName: string; // e.g., "Income Statement"
    highlightKeys?: (keyof T)[]; // New optional prop
    percentageKeys?: (keyof T)[]; // New optional prop for keys that should be formatted as percentages
}

export const FinancialStatementTable = <T extends { fiscalDateEnding: string }>(
    { reportsToDisplay, allKeys, numberScale, tableName, highlightKeys, percentageKeys }: FinancialStatementTableProps<T>
) => {
    if (reportsToDisplay.length === 0) {
        return <div className="text-center p-4">No data available for the selected period or date range.</div>;
    }

    return (
        <div className="overflow-x-auto">
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
                        if (key === 'fiscalDateEnding' || key === 'reportedCurrency') return null; // Exclude these
                        if (!reportsToDisplay.some(report => Object.prototype.hasOwnProperty.call(report, key))) {
                            return null;
                        }
                        const formattedName = formatMetricName(key as string);
                        const isHighlighted = highlightKeys?.includes(key as keyof T);
                        const textClasses = `text-gray-900 ${isHighlighted ? 'font-semibold' : 'font-normal'}`;
                        const paddingClass = isHighlighted ? 'pl-6' : 'pl-10';
                        return (
                            <tr key={key as string} className={`border-b ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}>
                                <th scope="row"
                                    className={`py-2 w-60 truncate ${paddingClass} ${textClasses}`}
                                    title={formattedName}
                                >
                                    {formattedName}
                                </th>
                                {reportsToDisplay.map(report => {
                                    const value = report[key];
                                    if (value === 'None' || value === null || value === undefined) return <td key={report.fiscalDateEnding} className="px-6 py-2">-</td>;
                                    
                                    let displayValue: string;
                                    const numValue = parseFloat(value as string);

                                    if (!isNaN(numValue) && percentageKeys?.includes(key)) {
                                        displayValue = (numValue * 100).toFixed(2) + '%';
                                    } else if (!isNaN(numValue)) {
                                        // Apply scaling only if the number is large enough and a scale is selected
                                        if (Math.abs(numValue) >= 1000000 && numberScale !== 'none') {
                                            displayValue = formatLargeNumber(value as string, numberScale);
                                        } else {
                                            // Default formatting for ratios and smaller numbers
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
