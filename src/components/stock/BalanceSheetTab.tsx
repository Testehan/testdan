import React, { useState } from 'react';
import { BalanceSheetReport } from './types/stockFinancials';
import PeriodRangeSlider from './PeriodRangeSlider';
import { useFinancialReports } from './hooks/useFinancialReports';
import { FinancialStatementTable } from './FinancialStatementTable';
import { balanceSheetFieldOrder } from './types/financialFieldOrders';

const BalanceSheetTab: React.FC<{ symbol: string }> = ({ symbol }) => {
    const [numberScale, setNumberScale] = useState<'millions' | 'billions'>('billions');

    const {
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
    } = useFinancialReports<BalanceSheetReport>({
        symbol: symbol,
        reportEndpoint: 'balance-sheet',
        fieldOrder: balanceSheetFieldOrder,
        baseURL: 'http://localhost:8080/stocks' // Hardcoded for now, ideally from env variables
    });

    const handleNumberScaleChange = (scale: 'millions' | 'billions') => {
        setNumberScale(scale);
    };

    if (loading) {
        return <div className="text-center p-4">Loading balance sheet...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <div className="flex items-center mb-4 flex-wrap space-x-2">
                <div className="flex space-x-1 border rounded-lg px-1 py-0.5">
                    <button
                        className={`px-2 py-1 text-sm font-medium ${reportType === 'annual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => setReportType('annual')}
                    >
                        Annual
                    </button>
                    <button
                        className={`px-2 py-1 text-sm font-medium ${reportType === 'quarterly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => setReportType('quarterly')}
                    >
                        Quarterly
                    </button>
                </div>
                <div className="flex space-x-1 border rounded-lg px-1 py-0.5">
                    <button
                        className={`px-2 py-1 text-sm font-medium ${numberScale === 'millions' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleNumberScaleChange('millions')}
                    >
                        Millions
                    </button>
                    <button
                        className={`px-2 py-1 text-sm font-medium ${numberScale === 'billions' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleNumberScaleChange('billions')}
                    >
                        Billions
                    </button>
                </div>
            </div>
            <div className="mb-4">
                {availablePeriods.length > 0 && (
                    <PeriodRangeSlider
                        periods={availablePeriods}
                        selectedStart={selectedStartPeriod}
                        selectedEnd={selectedEndPeriod}
                        onRangeChange={handlePeriodRangeChange}
                        isQuarterly={reportType === 'quarterly'}
                    />
                )}
            </div>

            <FinancialStatementTable<BalanceSheetReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={allKeys}
                numberScale={numberScale}
                tableName="Balance Sheet"
            />
        </div>
    );
};

export default BalanceSheetTab;
