import { useState, useEffect, useMemo, useCallback } from 'react';
import { IncomeStatementReport } from '../types/stockFinancials';

interface UseFinancialReportsProps<T> {
    symbol: string;
    reportEndpoint: string; // e.g., 'income-statement'
    fieldOrder: (keyof T)[];
    baseURL?: string; // Optional base URL
}

// ... other interfaces and code ...

export const useFinancialReports = <T extends { fiscalDateEnding: string }>(
    { symbol, reportEndpoint, fieldOrder, baseURL = 'http://localhost:8080/stocks' }: UseFinancialReportsProps<T>
): FinancialReportData<T> => {
    const [annualReports, setAnnualReports] = useState<T[]>([]);
    const [quarterlyReports, setQuarterlyReports] = useState<T[]>([]);
    const [reportType, setReportType] = useState<'annual' | 'quarterly'>('annual');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [availableQuarters, setAvailableQuarters] = useState<string[]>([]);
    const [selectedStartPeriod, setSelectedStartPeriod] = useState<string>('');
    const [selectedEndPeriod, setSelectedEndPeriod] = useState<string>('');

    const currentReports = reportType === 'annual' ? annualReports : quarterlyReports;
    const availablePeriods = reportType === 'annual' ? availableYears : availableQuarters;
    useEffect(() => {
        (async () => { // Immediately Invoked Async Function Expression (IIAFE)
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${baseURL}/${reportEndpoint}/${symbol}`);
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
        })();
    }, [symbol, reportEndpoint, baseURL]);

    useEffect(() => {
        if (annualReports.length > 0) {
            const years = annualReports
                .map(report => new Date(report.fiscalDateEnding).getFullYear().toString())
                .sort((a, b) => parseInt(b) - parseInt(a));
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
                    if (yearA !== yearB) return yearB - yearA;
                    return qB - qA;
                });
            setAvailableQuarters(Array.from(new Set(quarters)));
        } else {
            setAvailableQuarters([]);
        }
    }, [annualReports, quarterlyReports]);

    useEffect(() => {
        if (reportType === 'annual' && availableYears.length > 0) {
            setSelectedStartPeriod(availableYears[0]);
            setSelectedEndPeriod(availableYears[Math.min(4, availableYears.length - 1)]);
        } else if (reportType === 'quarterly' && availableQuarters.length > 0) {
            setSelectedStartPeriod(availableQuarters[0]);
            setSelectedEndPeriod(availableQuarters[Math.min(4, availableQuarters.length - 1)]);
        } else {
            setSelectedStartPeriod('');
            setSelectedEndPeriod('');
        }
    }, [reportType, availableYears, availableQuarters]);

    const handlePeriodRangeChange = useCallback((start: string, end: string) => {
        setSelectedStartPeriod(start);
        setSelectedEndPeriod(end);
    }, []);

    const reportsToDisplay = useMemo(() => {
        if (!selectedStartPeriod || !selectedEndPeriod || currentReports.length === 0) {
            return [];
        }

        return currentReports.filter(report => {
            const reportDate = new Date(report.fiscalDateEnding);
            let reportPeriod: string;

            if (reportType === 'annual') {
                reportPeriod = reportDate.getFullYear().toString();
            } else {
                const year = reportDate.getFullYear();
                const quarter = Math.floor(reportDate.getMonth() / 3) + 1;
                reportPeriod = `${year}-Q${quarter}`;
            }

            const startIndex = availablePeriods.indexOf(selectedStartPeriod);
            const endIndex = availablePeriods.indexOf(selectedEndPeriod);
            const currentReportIndex = availablePeriods.indexOf(reportPeriod);

            return currentReportIndex >= startIndex && currentReportIndex <= endIndex;
        });
    }, [currentReports, selectedStartPeriod, selectedEndPeriod, reportType, availablePeriods]);


    const allKeys = useMemo(() => {
        const uniqueKeys = currentReports.reduce((keys, report) => {
            Object.keys(report).forEach(key => {
                if (!keys.includes(key as keyof T) && key !== 'fiscalDateEnding') { // Exclude fiscalDateEnding here
                    keys.push(key as keyof T);
                }
            });
            return keys;
        }, [] as (keyof T)[]);

        return uniqueKeys.sort((a, b) => {
            const indexA = fieldOrder.indexOf(a);
            const indexB = fieldOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [currentReports, fieldOrder]);

    return {
        annualReports,
        quarterlyReports,
        currentReports,
        reportType,
        setReportType,
        loading,
        error,
        availablePeriods,
        selectedStartPeriod,
        selectedEndPeriod,
        handlePeriodRangeChange,
        reportsToDisplay,
        allKeys,
    };
};
