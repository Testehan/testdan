import React, { useMemo } from 'react';
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
    reportType?: 'annual' | 'quarterly';
    onRevenueDetailToggle?: () => void;
    isRevenueDetailVisible?: boolean;
    revenueSegmentation?: any | null;
    revenueGeography?: any | null;
    revenueDetailLoading?: boolean;
}

export const FinancialStatementTable = <T extends { date: string }>(
    { reportsToDisplay, allKeys, numberScale, tableName, highlightKeys, percentageKeys, reportType, onRevenueDetailToggle, isRevenueDetailVisible, revenueSegmentation, revenueGeography, revenueDetailLoading }: FinancialStatementTableProps<T>
) => {
    if (reportsToDisplay.length === 0) {
        return <div className="text-center p-4">No data available for the selected period or date range.</div>;
    }

    const allSegmentKeys = useMemo(() => {
        if (!revenueSegmentation?.annualReports) return [];
        const keys = new Set<string>();
        revenueSegmentation.annualReports.forEach((report: any) => {
            if (report.data) {
                Object.keys(report.data).forEach(key => keys.add(key));
            }
        });
        return Array.from(keys);
    }, [revenueSegmentation]);

    const allGeographyKeys = useMemo(() => {
        if (!revenueGeography?.reports) return [];
        const keys = new Set<string>();
        revenueGeography.reports.forEach((report: any) => {
            if (report.data) {
                Object.keys(report.data).forEach(key => keys.add(key));
            }
        });
        return Array.from(keys);
    }, [revenueGeography]);
    
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
        tableName === "Cash Flow" || // This "Cash Flow" is for ratios
        tableName === "Valuation"
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

                        const SmallSpinner = () => (
                            <div className="w-4 h-4 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
                        );

                        return (
                            <React.Fragment key={key as string}>
                                <tr className={`border-b ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}>
                                    <th
                                        scope="row"
                                        className={`py-2 w-60 ${paddingClass} ${textClasses} relative overflow-visible`}

                                    >
                                        <div className="flex items-center">
                                            <div className="w-7 flex-shrink-0">
                                                {key === 'revenue' && reportType === 'annual' && (
                                                    <button onClick={onRevenueDetailToggle} disabled={revenueDetailLoading} className="p-0.5 rounded-full hover:bg-gray-300">
                                                        {revenueDetailLoading ? <SmallSpinner /> : (
                                                            isRevenueDetailVisible ? (
                                                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                            ) : (
                                                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                            )
                                                        )}
                                                    </button>
                                                )}
                                            </div>
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
                                {key === 'revenue' && isRevenueDetailVisible && (
                                    <tr className="bg-gray-200">
                                        <th colSpan={reportsToDisplay.length + 1} className="px-6 py-2 text-sm font-semibold text-gray-700">
                                            Revenue Segmentation
                                        </th>
                                    </tr>
                                )}
                                {key === 'revenue' && isRevenueDetailVisible && revenueSegmentation && allSegmentKeys.map(segmentKey => {
                                    const isRowVisible = reportsToDisplay.some(report => {
                                        const reportYear = new Date(report.date).getFullYear();
                                        const segmentationForYear = revenueSegmentation.annualReports.find((r: any) => r.fiscalYear === reportYear);
                                        return !!segmentationForYear?.data[segmentKey];
                                    });

                                    if (!isRowVisible) {
                                        return null;
                                    }

                                    return (
                                        <tr key={segmentKey} className={`border-b ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}>
                                            <th scope="row" className={`py-2 w-60 pl-12 ${textClasses} relative overflow-visible`}>
                                                {formatMetricName(segmentKey)}
                                            </th>
                                            {reportsToDisplay.map(report => {
                                                const reportYear = new Date(report.date).getFullYear();
                                                const segmentationReportForYear = revenueSegmentation.annualReports.find((r: any) => r.fiscalYear === reportYear);
                                                const value = segmentationReportForYear?.data[segmentKey];
                                                
                                                let displayValue = '-';
                                                if (value) {
                                                    if (numberScale === 'none') {
                                                        const num = parseFloat(value);
                         
                                                       displayValue = isNaN(num) ? value : num.toLocaleString();
                                                    } else {
                                                        displayValue = formatLargeNumber(value, numberScale);
                                                    }
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
                                {key === 'revenue' && isRevenueDetailVisible && (
                                    <tr className="bg-gray-200">
                                        <th colSpan={reportsToDisplay.length + 1} className="px-6 py-2 text-sm font-semibold text-gray-700">
                                            Revenue Geography
                                        </th>
                                    </tr>
                                )}
                                {key === 'revenue' && isRevenueDetailVisible && revenueGeography && allGeographyKeys.map(geoKey => {
                                    const isRowVisible = reportsToDisplay.some(report => {
                                        const reportYear = new Date(report.date).getFullYear();
                                        const geoForYear = revenueGeography.reports.find((r: any) => r.fiscalYear === reportYear);
                                        return !!geoForYear?.data[geoKey];
                                    });

                                    if (!isRowVisible) {
                                        return null;
                                    }

                                    return (
                                        <tr key={geoKey} className={`border-b ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}>
                                            <th scope="row" className={`py-2 w-60 pl-12 ${textClasses} relative overflow-visible`}>
                                                {formatMetricName(geoKey)}
                                            </th>
                                            {reportsToDisplay.map(report => {
                                                const reportYear = new Date(report.date).getFullYear();
                                                const geoForYear = revenueGeography.reports.find((r: any) => r.fiscalYear === reportYear);
                                                const value = geoForYear?.data[geoKey];
                                                
                                                let displayValue = '-';
                                                if (value) {
                                                    if (numberScale === 'none') {
                                                        const num = parseFloat(value);
                                                        displayValue = isNaN(num) ? value : num.toLocaleString();
                                                    } else {
                                                        displayValue = formatLargeNumber(value, numberScale);
                                                    }
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
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

