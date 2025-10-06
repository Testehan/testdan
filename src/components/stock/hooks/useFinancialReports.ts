import { useState, useEffect, useMemo, useCallback } from 'react';

interface UseFinancialReportsProps<T> {
    symbol: string;
    reportEndpoint: string; // e.g., 'income-statement'
    fieldOrder: (keyof T)[];
    baseURL?: string; // Optional base URL
}

interface FinancialReportData<T> {
    annualReports: T[];
    quarterlyReports: T[];
    currentReports: T[];
    reportType: 'annual' | 'quarterly';
    setReportType: (type: 'annual' | 'quarterly') => void;
    loading: boolean;
    error: string | null;
    availablePeriods: string[];
    selectedStartPeriod: string;
    selectedEndPeriod: string;
    handlePeriodRangeChange: (start: string, end: string) => void;
    reportsToDisplay: T[];
    allKeys: (keyof T)[];
}

// ... other interfaces and code ...

export const useFinancialReports = <T extends { date: string }>(
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
                const upperCaseSymbol = symbol.toUpperCase(); // Convert symbol to uppercase
                const response = await fetch(`${baseURL}/${reportEndpoint}/${upperCaseSymbol}`);
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
                .map(report => new Date(report.date).getFullYear().toString())
                .sort((a, b) => parseInt(b) - parseInt(a));
            setAvailableYears(Array.from(new Set(years)));
        } else {
            setAvailableYears([]);
        }

        if (quarterlyReports.length > 0) {
            const quarters = quarterlyReports
                .map(report => {
                    const date = new Date(report.date);
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
            const reportDate = new Date(report.date);
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
        const excludedKeys = ['symbol', 'cik', 'filingDate', 'acceptedDate', 'fiscalYear', 'period', 'reportedCurrency', 'link', 'finalLink'];
        const uniqueKeys = currentReports.reduce((keys, report) => {
            Object.keys(report).forEach(key => {
                if (!keys.includes(key as keyof T) && key !== 'date' && !excludedKeys.includes(key)) { // Exclude date and other unwanted keys
                    keys.push(key as keyof T);
                }
            });
            return keys;
        }, [] as (keyof T)[]);

        return uniqueKeys.sort((a, b) => {
            const indexA = fieldOrder.indexOf(a);
            const indexB = fieldOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return 0; // if both are not in fieldOrder, keep original order
            if (indexA === -1) return 1; // if a is not in fieldOrder, it comes after b
            if (indexB === -1) return -1; // if b is not in fieldOrder, it comes after a
            return indexA - indexB; // sort based on fieldOrder
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

export const useEarningsHistory = (
    { symbol, baseURL = 'http://localhost:8080/stocks' }: { symbol: string; baseURL?: string }
  ) => {
    const [earningsHistory, setEarningsHistory] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const upperCaseSymbol = symbol.toUpperCase();
          const response = await fetch(`${baseURL}/earnings-history/${upperCaseSymbol}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setEarningsHistory(data);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      })();
    }, [symbol, baseURL]);
  
    return {
      earningsHistory,
      loading,
      error,
    };
  };

  export const useGlobalQuote = (
    { symbol, baseURL = 'http://localhost:8080/stocks' }: { symbol: string; baseURL?: string }
  ) => {
    const [quote, setQuote] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    const fetchQuote = async () => {
      if (!symbol) { // Add this check
        setQuote(null);
        setLoading(false);
        setError(null); // Clear error if symbol becomes empty
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const upperCaseSymbol = symbol.toUpperCase();
        const response = await fetch(`${baseURL}/global-quote/${upperCaseSymbol}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQuote(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchQuote();
      const interval = setInterval(fetchQuote, 5 * 60 * 1000); // 5 minutes
      return () => clearInterval(interval);
    }, [symbol, baseURL]); // Ensure fetchQuote is in the dependency array if it uses any outside state/props
  
    return {
      quote,
      loading,
      error,
    };
  };
