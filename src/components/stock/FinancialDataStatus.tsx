import React, { useState, useEffect } from 'react';

interface FinancialDataStatusProps {
    symbol: string;
}

const FinancialDataStatus: React.FC<FinancialDataStatusProps> = ({ symbol }) => {
    const [status, setStatus] = useState<Record<string, boolean> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showTooltip, setShowTooltip] = useState<boolean>(false);

    useEffect(() => {
        const fetchFinancialDataStatus = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:8080/stocks/presentfinancialdata/${symbol}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: Record<string, boolean> = await response.json();
                setStatus(data);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFinancialDataStatus();
    }, [symbol]);

    if (loading) {
        return <span className="ml-4 text-sm">Loading status...</span>;
    }

    if (error) {
        return <span className="ml-4 text-sm text-red-500">Error loading status</span>;
    }

    if (!status) {
        return null;
    }

    const allPresent = Object.values(status).every(value => value);

    return (
        <span
            className="ml-4 relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {allPresent ? (
                <span className="text-green-500">✓</span>
            ) : (
                <span className="text-red-500">✗</span>
            )}
            {showTooltip && (
                <div className="absolute left-0 mt-2 p-2 bg-white border border-gray-300 rounded shadow-lg z-10 whitespace-nowrap">
                    {Object.entries(status).map(([key, value]) => (
                        <div key={key} className={value ? 'text-black' : 'text-red-500'}>
                            {key}: {value.toString()}
                        </div>
                    ))}
                </div>
            )}
        </span>
    );
};

export default FinancialDataStatus;

