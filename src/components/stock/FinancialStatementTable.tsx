import { formatLargeNumber, formatMonthYear, formatMetricName } from './utils';
import { metricDescriptions } from './metricDescriptions'; // Import metric descriptions
import InfoIcon from "./InfoIcon";

// Define a type for the structure of metricDescriptions for type safety
type MetricDescriptionsStructure = {
    incomeStatement: { [key: string]: string };
    balanceSheet: { [key: string]: string };
    cashFlow: { [key: string]: string };
    financialRatios: { [key: string]: string };
    dcfInputs: { [key: string]: string };
    [key: string]: { [key: string]: string }; // For other potential categories
};

interface FinancialStatementTableProps<T> {
    reportsToDisplay: T[];
    allKeys: (keyof T)[];
    numberScale: 'none' | 'millions' | 'billions';
    tableName: string; // e.g., "Income Statement"
    highlightKeys?: (keyof T)[];
    percentageKeys?: (keyof T)[];
}

export const FinancialStatementTable = <T extends { date: string }>(
    { reportsToDisplay, allKeys, numberScale, tableName, highlightKeys, percentageKeys }: FinancialStatementTableProps<T>
) => {
    if (reportsToDisplay.length === 0) {
        return <div className="text-center p-4">No data available for the selected period or date range.</div>;
    }

    // Map tableName to the correct metricDescriptions category key
    let currentMetricDescriptions: { [key: string]: string } = {};
    if (tableName === "Income Statement") {
        currentMetricDescriptions = (metricDescriptions as MetricDescriptionsStructure).incomeStatement;
    } else if (
        tableName === "Operating Activities" ||
        tableName === "Investing Activities" ||
        tableName === "Financing Activities" ||
        tableName === "Summary" // For cash flow items
    ) {
        currentMetricDescriptions = (metricDescriptions as MetricDescriptionsStructure).cashFlow;
    } else if (
        tableName.includes("Assets") ||
        tableName.includes("Liabilities") ||
        tableName.includes("Equity")
    ) {
        currentMetricDescriptions = (metricDescriptions as MetricDescriptionsStructure).balanceSheet;
    } else if ( // Explicitly check for RatiosTab table names
        tableName === "Profitability" ||
        tableName === "Liquidity" ||
        tableName === "Solvency" ||
        tableName === "Efficiency" ||
        tableName === "Shareholder Returns" ||
        tableName === "Per Share Metrics" ||
        tableName === "Cash & Returns Per Share" ||
        tableName === "Cash Flow" // This "Cash Flow" is for ratios
    ) {
        currentMetricDescriptions = (metricDescriptions as MetricDescriptionsStructure).financialRatios;
    }
    // Add other mappings as needed, e.g., for DCF inputs

    return (
        <div className="overflow-y-visible">
            <table className="w-full text-sm text-left text-gray-500 table-fixed">
                <thead className="text-xs text-gray-700 uppercase">
                    <tr>
                        <th scope="col" className="px-6 py-2 w-60 bg-blue-50 font-semibold">{tableName}</th>
                        {reportsToDisplay.map(report => (
                            <th key={report.date} scope="col" className="px-6 py-2 whitespace-nowrap">{formatMonthYear(report.date)}</th>
                        ))}
                    </tr>
</thead>                <tbody>
                    {allKeys.map((key, index) => {
                        if (key === 'date' || key === 'reportedCurrency') return null;
                        if (!reportsToDisplay.some(report => Object.prototype.hasOwnProperty.call(report, key))) {
                            return null;
                        }
                        const formattedName = formatMetricName(key as string);
                        const description = currentMetricDescriptions[key as string]; // Get description from context-specific object
                        const isHighlighted = highlightKeys?.includes(key as keyof T);
                        const textClasses = `text-gray-900 ${isHighlighted ? 'font-semibold' : 'font-normal'}`;
                        const paddingClass = isHighlighted ? 'pl-6' : 'pl-10';

                        return (
                            <tr key={key as string} className={`border-b ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}>
                                <th
                                    scope="row"
                                    className={`py-2 w-60 ${paddingClass} ${textClasses} relative overflow-visible`}

                                >
                                    <div className="flex items-center">
                                        <InfoIcon description={description} />
                                        <span className="truncate" title={formattedName}>{formattedName}</span>
                                    </div>
                                </th>
                                {reportsToDisplay.map(report => {
                                    const value = report[key];
                                    if (value === 'None' || value === null || value === undefined) return <td key={report.date} className="px-6 py-2">-</td>;
                                    
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
                                        <td key={report.date} className="px-6 py-2">
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
