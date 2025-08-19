import React, { useState, useEffect } from 'react';
import { IncomeStatementReport } from './types';
import { formatLargeNumber, formatMonthYear } from './utils';

const IncomeStatementTab: React.FC = () => {
    const [annualReports, setAnnualReports] = useState<IncomeStatementReport[]>([]);
    const [quarterlyReports, setQuarterlyReports] = useState<IncomeStatementReport[]>([]);
    const [reportType, setReportType] = useState<'annual' | 'quarterly'>('annual');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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

    const handleReportTypeChange = (type: 'annual' | 'quarterly') => {
        setReportType(type);
    };

    if (loading) {
        return <div className="text-center p-4">Loading income statement...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500">Error: {error}</div>;
    }

    const reports = reportType === 'annual' ? annualReports : quarterlyReports;
    if (reports.length === 0) {
        return <div className="text-center p-4">No data available for the selected period.</div>;
    }

    const allKeys = reports.reduce((keys, report) => {
        Object.keys(report).forEach(key => {
            if (!keys.includes(key)) {
                keys.push(key);
            }
        });
        return keys;
    }, [] as (keyof IncomeStatementReport)[]);

    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${reportType === 'annual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleReportTypeChange('annual')}
                    >
                        Annual
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ml-2 ${reportType === 'quarterly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleReportTypeChange('quarterly')}
                    >
                        Quarterly
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Metric</th>
                            {reports.map(report => (
                                <th key={report.fiscalDateEnding} scope="col" className="px-6 py-3 whitespace-nowrap">{formatMonthYear(report.fiscalDateEnding)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {allKeys.map(key => {
                            if (key === 'fiscalDateEnding') return null;
                            return (
                                <tr key={key} className="bg-white border-b">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </th>
                                    {reports.map(report => {
                                        const value = report[key];
                                        if (value === 'None' || value === null) return <td key={report.fiscalDateEnding} className="px-6 py-4">-</td>;
                                        const displayValue = !isNaN(parseFloat(value as string)) ? formatLargeNumber(value as string) : value;
                                        return (
                                            <td key={report.fiscalDateEnding} className="px-6 py-4">
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
