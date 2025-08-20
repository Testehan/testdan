import React, { useState, useEffect, useMemo } from 'react';
import { IncomeStatementReport } from './types';
import { formatLargeNumber, formatMonthYear, formatMetricName } from './utils';
import PeriodRangeSlider from './PeriodRangeSlider'; // Import the new custom slider

// Define the explicit order of income statement fields for display
const incomeStatementFieldOrder: (keyof IncomeStatementReport)[] = [
    'totalRevenue',
    'costOfRevenue',
    'costofGoodsAndServicesSold',
    'grossProfit',
    'researchAndDevelopment',
    'sellingGeneralAndAdministrative',
    'operatingExpenses',
    'operatingIncome',
    'investmentIncomeNet',
    'netInterestIncome',
    'interestIncome',
    'interestExpense',
    'interestAndDebtExpense',
    'nonInterestIncome',
    'otherNonOperatingIncome',
    'incomeBeforeTax',
    'incomeTaxExpense',
    'netIncomeFromContinuingOperations',
    'netIncome',
    'comprehensiveIncomeNetOfTax',
    'depreciation',
    'depreciationAndAmortization',
    'ebit',
    'ebitda'
];

const IncomeStatementTab: React.FC = () => {

    const [annualReports, setAnnualReports] = useState<IncomeStatementReport[]>([]);
    const [quarterlyReports, setQuarterlyReports] = useState<IncomeStatementReport[]>([]);
    const [reportType, setReportType] = useState<'annual' | 'quarterly'>('annual');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for available periods for the slider
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [availableQuarters, setAvailableQuarters] = useState<string[]>([]);
    // State for the currently selected period range
    const [selectedStartPeriod, setSelectedStartPeriod] = useState<string>('');
    const [selectedEndPeriod, setSelectedEndPeriod] = useState<string>('');
    const [numberScale, setNumberScale] = useState<'millions' | 'billions'>('billions');


    const currentReports = reportType === 'annual' ? annualReports : quarterlyReports;

    const allKeys = useMemo(() => {
        const uniqueKeys = currentReports.reduce((keys, report) => {
            Object.keys(report).forEach(key => {
                if (!keys.includes(key as keyof IncomeStatementReport)) {
                    keys.push(key as keyof IncomeStatementReport);
                }
            });
            return keys;
        }, [] as (keyof IncomeStatementReport)[]);

        return uniqueKeys.sort((a, b) => {
            const indexA = incomeStatementFieldOrder.indexOf(a);
            const indexB = incomeStatementFieldOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return 0; // Keep original order if both not found
            if (indexA === -1) return 1; // 'a' not found, move to end
            if (indexB === -1) return -1; // 'b' not found, move to end
            return indexA - indexB;
        });
    }, [currentReports, incomeStatementFieldOrder]);

    useEffect(() => {
        const fetchIncomeStatement = async () => {
            try {
                const response = await fetch('http://localhost:8080/stocks/income-statement/AAPL');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setAnnualReports(data.annualReports);
                setQuarterlyReports(data.quarterlyReports);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchIncomeStatement();
    }, []);

    // Effect to extract available years and quarters once reports are fetched
    useEffect(() => {
        if (annualReports.length > 0) {
            const years = annualReports
                .map(report => new Date(report.fiscalDateEnding).getFullYear().toString())
                .sort((a, b) => parseInt(b) - parseInt(a)); // Sort in descending order
            setAvailableYears(Array.from(new Set(years)));
        } else {
            setAvailableYears([]);
        }

        if (quarterlyReports.length > 0) {
            const quarters = quarterlyReports
                .map(report => {
                    const date = new Date(report.fiscalDateEnding);
                    const year = date.getFullYear();
                    const quarter = Math.floor(date.getMonth() / 3) + 1;
                    return `${year}-Q${quarter}`;
                })
                .sort((a, b) => {
                    const [yearA, qA] = a.split('-Q').map(Number);
                    const [yearB, qB] = b.split('-Q').map(Number);
                    if (yearA !== yearB) return yearB - yearA; // Sort years in descending order
                    return qB - qA; // Sort quarters in descending order
                });
            setAvailableQuarters(Array.from(new Set(quarters)));
        } else {
            setAvailableQuarters([]);
        }
    }, [annualReports, quarterlyReports]);

    // Effect to initialize or update selected periods when reportType or available periods change
    useEffect(() => {
        if (reportType === 'annual' && availableYears.length > 0) {
            setSelectedStartPeriod(availableYears[0]); // Latest year
            setSelectedEndPeriod(availableYears[Math.min(4, availableYears.length - 1)]); // Latest 5 years, or fewer if not enough
        } else if (reportType === 'quarterly' && availableQuarters.length > 0) {
            setSelectedStartPeriod(availableQuarters[0]); // Latest quarter
            setSelectedEndPeriod(availableQuarters[Math.min(4, availableQuarters.length - 1)]); // Latest 5 quarters, or fewer if not enough
        } else {
            // Clear selection if no reports available for the current type
            setSelectedStartPeriod('');
            setSelectedEndPeriod('');
        }
    }, [reportType, availableYears, availableQuarters]);


    const handleReportTypeChange = (type: 'annual' | 'quarterly') => {
        setReportType(type);
    };

    const handlePeriodRangeChange = (start: string, end: string) => {
        setSelectedStartPeriod(start);
        setSelectedEndPeriod(end);
    };

    const handleNumberScaleChange = (scale: 'millions' | 'billions') => {
        setNumberScale(scale);
    };

    if (loading) {
        return <div className="text-center p-4">Loading income statement...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500">Error: {error}</div>;
    }


    const filteredReports = currentReports.filter(report => {
        if (!selectedStartPeriod || !selectedEndPeriod) {
            return false; // No selection means no reports to display
        }

        const reportDate = new Date(report.fiscalDateEnding);
        let reportPeriod: string;

        if (reportType === 'annual') {
            reportPeriod = reportDate.getFullYear().toString();
        } else { // quarterly
            const year = reportDate.getFullYear();
            const quarter = Math.floor(reportDate.getMonth() / 3) + 1;
            reportPeriod = `${year}-Q${quarter}`;
        }

        const allPeriods = reportType === 'annual' ? availableYears : availableQuarters;
        const startIndex = allPeriods.indexOf(selectedStartPeriod);
        const endIndex = allPeriods.indexOf(selectedEndPeriod);
        const currentReportIndex = allPeriods.indexOf(reportPeriod);

        // Ensure currentReportIndex is within the selected range (inclusive)
        return currentReportIndex >= startIndex && currentReportIndex <= endIndex;
    });

    const reportsToDisplay = filteredReports;

    if (reportsToDisplay.length === 0) {
        return <div className="text-center p-4">No data available for the selected period or date range.</div>;
    }



    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-y-2">
                <div className="flex space-x-2 border rounded-lg p-1">
                    <button
                        className={`px-4 py-2 text-sm font-medium ${reportType === 'annual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleReportTypeChange('annual')}
                    >
                        Annual
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${reportType === 'quarterly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleReportTypeChange('quarterly')}
                    >
                        Quarterly
                    </button>
                </div>
                <div className="flex space-x-2 border rounded-lg p-1">
                    <button
                        className={`px-4 py-2 text-sm font-medium ${numberScale === 'millions' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleNumberScaleChange('millions')}
                    >
                        Millions
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${numberScale === 'billions' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleNumberScaleChange('billions')}
                    >
                        Billions
                    </button>
                </div>
            </div>
            {/* Render the PeriodRangeSlider beneath the toggle buttons */}
            <div className="mb-4"> {/* Added margin bottom for spacing */}
                {(reportType === 'annual' && availableYears.length > 0) && (
                    <PeriodRangeSlider
                        periods={availableYears}
                        selectedStart={selectedStartPeriod}
                        selectedEnd={selectedEndPeriod}
                        onRangeChange={handlePeriodRangeChange}
                        isQuarterly={false} // Pass false for annual reports
                    />
                )}
                {(reportType === 'quarterly' && availableQuarters.length > 0) && (
                    <PeriodRangeSlider
                        periods={availableQuarters}
                        selectedStart={selectedStartPeriod}
                        selectedEnd={selectedEndPeriod}
                        onRangeChange={handlePeriodRangeChange}
                        isQuarterly={true} // Pass true for quarterly reports
                    />
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-2 w-48">Income Statement</th>
                            {reportsToDisplay.map(report => (
                                <th key={report.fiscalDateEnding} scope="col" className="px-6 py-2 whitespace-nowrap">{formatMonthYear(report.fiscalDateEnding)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {allKeys.map((key, index) => { // Added index here for row styling
                            if (key === 'fiscalDateEnding') return null;
                            if (!reportsToDisplay.some(report => Object.prototype.hasOwnProperty.call(report, key))) {
                                return null;
                            }
                            return (
                                <tr key={key} className={`border-b ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}><th scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap w-48">
                                        {formatMetricName(key as string)}
                                    </th>
                                    {reportsToDisplay.map(report => {
                                        const value = report[key];
                                        if (value === 'None' || value === null || value === undefined) return <td key={report.fiscalDateEnding} className="px-6 py-2">-</td>;
                                        const displayValue = !isNaN(parseFloat(value as string)) ? formatLargeNumber(value as string, numberScale) : value;
                                        return (
                                            <td key={report.fiscalDateEnding} className="px-6 py-2">
                                                {displayValue as string}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IncomeStatementTab;
