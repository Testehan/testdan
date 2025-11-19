import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Menu from '../components/Menu';

interface ValuationAlert {
    ticker: string;
    valuationType: 'DCF' | 'REVERSE_DCF' | 'GROWTH';
    verdict: string;
    currentPrice: number | null;
    intrinsicValue: number | null;
    upside: number | null;
    valuationData: Record<string, unknown>;
    timestamp: string;
}

interface TickerAlerts {
    ticker: string;
    latestTimestamp: string;
    valuations: ValuationAlert[];
}

function AlertsPage() {
    const [tickerAlerts, setTickerAlerts] = useState<Map<string, TickerAlerts>>(new Map());
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        const connectToAlerts = () => {
            setError(null);
            const eventSource = new EventSource('http://localhost:8080/stock/valuation/alerts/dante');
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                setIsConnected(true);
                setError(null);
            };

            eventSource.onerror = () => {
                setIsConnected(false);
                setError('Connection lost. Reconnecting...');
                eventSource.close();
                setTimeout(() => {
                    if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
                        connectToAlerts();
                    }
                }, 5000);
            };

            eventSource.addEventListener('VALUATION_ALERT', (event: MessageEvent) => {
                try {
                    const rawData = event.data;
                    console.log('Raw SSE data:', rawData);

                    const data: ValuationAlert = JSON.parse(rawData);
                    console.log('Received alert:', data);
                    console.log('Timestamp field:', data.timestamp, 'Type:', typeof data.timestamp);

                    const allKeys = Object.keys(data);
                    console.log('All keys in data:', allKeys);

                    if (!data.timestamp) {
                        const possibleTimestampKeys = ['createdAt', 'created_at', 'date', 'time', 'timestampMs', 'timestampMs'];
                        const dataAsUnknown = data as unknown as Record<string, unknown>;
                        for (const key of possibleTimestampKeys) {
                            if (dataAsUnknown[key]) {
                                console.log(`Found possible timestamp field: ${key} =`, dataAsUnknown[key]);
                            }
                        }
                    }

                    setTickerAlerts(prevMap => {
                        const newMap = new Map(prevMap);
                        const existing = newMap.get(data.ticker);
                        const timestamp = data.valuationData?.valuationDate as string || data.timestamp;

                        if (existing) {
                            const updatedValuations = existing.valuations.filter(v => v.valuationType !== data.valuationType);
                            updatedValuations.push(data);
                            newMap.set(data.ticker, {
                                ...existing,
                                latestTimestamp: timestamp,
                                valuations: updatedValuations,
                            });
                        } else {
                            newMap.set(data.ticker, {
                                ticker: data.ticker,
                                latestTimestamp: timestamp,
                                valuations: [data],
                            });
                        }

                        return newMap;
                    });
                } catch (e) {
                    console.error('Failed to parse valuation alert:', e);
                }
            });
        };

        connectToAlerts();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const getVerdictBadgeColor = (verdict: string) => {
        switch (verdict) {
            case 'Undervalued':
                return 'bg-green-200 text-green-800';
            case 'Overvalued':
                return 'bg-red-200 text-red-800';
            default:
                return 'bg-yellow-200 text-yellow-800';
        }
    };

    const getVerdictBorderColor = (verdict: string) => {
        switch (verdict) {
            case 'Undervalued':
                return 'border-green-500';
            case 'Overvalued':
                return 'border-red-500';
            default:
                return 'border-yellow-500';
        }
    };

    const getValuationTypeLabel = (type: string) => {
        switch (type) {
            case 'DCF':
                return 'DCF';
            case 'Reverse DCF':
                return 'Reverse DCF';
            case 'GROWTH':
                return 'Growth';
            default:
                return type;
        }
    };

    const isReverseDCF = (type: string) => {
        return type === 'REVERSE_DCF' || type === 'Reverse DCF';
    };

    const formatCurrency = (value: number | null) => {
        if (value === null || value === undefined) {
            return '-';
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatUpside = (upside: number | null) => {
        if (upside === null || upside === undefined) {
            return '-';
        }
        return `${upside > 0 ? '+' : ''}${upside.toFixed(2)}%`;
    };

    const getUpsideColor = (upside: number | null) => {
        if (upside === null || upside === undefined) {
            return '';
        }
        if (upside > 0) return 'text-green-600';
        if (upside < 0) return 'text-red-600';
        return '';
    };

    const formatImpliedFCFGrowth = (val: unknown) => {
        if (val == null) return '-';
        const output = val as { impliedFCFGrowthRate?: number };
        if (output?.impliedFCFGrowthRate == null) return '-';
        return `${(output.impliedFCFGrowthRate * 100).toFixed(2)}%`;
    };

    const formatTimestamp = (timestamp: string | undefined) => {
        if (!timestamp) return '-';

        let date: Date;

        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(timestamp)) {
            date = new Date(timestamp);
        } else if (/^\d{4}-\d{2}-\d{2}/.test(timestamp)) {
            date = new Date(timestamp + 'T00:00:00');
        } else if (/^\d{10}$/.test(timestamp)) {
            date = new Date(parseInt(timestamp) * 1000);
        } else if (/^\d{13}$/.test(timestamp)) {
            date = new Date(parseInt(timestamp));
        } else {
            date = new Date(timestamp);
        }

        if (isNaN(date.getTime())) {
            console.log('Invalid timestamp format:', timestamp);
            return timestamp;
        }

        return date.toLocaleString();
    };

    const sortedTickers = Array.from(tickerAlerts.values()).sort(
        (a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime()
    );

    return (
        <div className="container mx-auto p-4">
            <Menu />

            <div className="mb-4 flex items-center space-x-4">
                <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
                {error && <span className="text-sm text-red-500">{error}</span>}
            </div>

            {sortedTickers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-xl">No alerts yet</p>
                    <p className="text-sm mt-2">Waiting for new alerts...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedTickers.map((tickerData) => (
                        <div
                            key={tickerData.ticker}
                            className="bg-white shadow rounded-lg overflow-hidden"
                        >
                            <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <span className="font-bold text-lg">{tickerData.ticker}</span>
                                    <span className="text-sm text-gray-500">
                                        {formatTimestamp(tickerData.latestTimestamp)}
                                    </span>
                                </div>
                                <Link
                                    to={`/stocks/${tickerData.ticker}#valuation`}
                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                >
                                    View Stock →
                                </Link>
                            </div>
                            
                            <div className="divide-y divide-gray-200">
                                {tickerData.valuations.map((valuation) => (
                                    <div
                                        key={valuation.valuationType}
                                        className={`p-4 border-l-4 ${getVerdictBorderColor(valuation.verdict)}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 rounded text-sm font-semibold ${getVerdictBadgeColor(valuation.verdict)}`}>
                                                    {valuation.verdict}
                                                </span>
                                                <span className="text-gray-600 font-medium">
                                                    {getValuationTypeLabel(valuation.valuationType)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className={`grid gap-4 grid-cols-3`}>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 uppercase">Current Price</p>
                                                <p className="font-semibold">{formatCurrency(valuation.currentPrice)}</p>
                                            </div>
                                            {!isReverseDCF(valuation.valuationType) && (
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 uppercase">Intrinsic Value</p>
                                                    <p className="font-semibold">{formatCurrency(valuation.intrinsicValue)}</p>
                                                </div>
                                            )}
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 uppercase">
                                                    {isReverseDCF(valuation.valuationType) ? 'Implied FCF Growth' : 'Upside'}
                                                </p>
                                                {isReverseDCF(valuation.valuationType) ? (
                                                    <p className="font-semibold">
                                                        {formatImpliedFCFGrowth(valuation.valuationData?.reverseDcfOutput)}
                                                    </p>
                                                ) : (
                                                    <p className={`font-semibold ${getUpsideColor(valuation.upside)}`}>
                                                        {formatUpside(valuation.upside)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AlertsPage;
