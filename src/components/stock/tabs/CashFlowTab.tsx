import React, { useState } from 'react';
import { CashFlowReport } from '../shared/types/stockFinancials';
import PeriodRangeSlider from '../shared/components/PeriodRangeSlider';
import { useFinancialReports } from '../hooks/useFinancialReports';
import { FinancialStatementTable } from '../tables/FinancialStatementTable';
import { cashFlowFieldOrder } from '../shared/types/financialFieldOrders';

const operatingActivitiesKeys: (keyof CashFlowReport)[] = [
    'netIncome',
    'depreciationAndAmortization',
    'deferredIncomeTax',
    'stockBasedCompensation',
    'changeInWorkingCapital',
    'accountsReceivables',
    'inventory',
    'accountsPayables',
    'otherWorkingCapital',
    'otherNonCashItems',
    'netCashProvidedByOperatingActivities',
];

const investingActivitiesKeys: (keyof CashFlowReport)[] = [
    'investmentsInPropertyPlantAndEquipment',
    'acquisitionsNet',
    'purchasesOfInvestments',
    'salesMaturitiesOfInvestments',
    'otherInvestingActivities',
    'netCashProvidedByInvestingActivities',
];

const financingActivitiesKeys: (keyof CashFlowReport)[] = [
    'netDebtIssuance',
    'longTermNetDebtIssuance',
    'shortTermNetDebtIssuance',
    'netStockIssuance',
    'netCommonStockIssuance',
    'commonStockIssuance',
    'commonStockRepurchased',
    'netPreferredStockIssuance',
    'netDividendsPaid',
    'commonDividendsPaid',
    'preferredDividendsPaid',
    'otherFinancingActivities',
    'netCashProvidedByFinancingActivities',
];

const summaryKeys: (keyof CashFlowReport)[] = [
    'effectOfForexChangesOnCash',
    'netChangeInCash',
    'cashAtEndOfPeriod',
    'cashAtBeginningOfPeriod',
    'operatingCashFlow',
    'capitalExpenditure',
    'freeCashFlow',
];


const CashFlowTab: React.FC<{ symbol: string }> = ({ symbol }) => {
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
    } = useFinancialReports<CashFlowReport>({
        symbol: symbol,
        reportEndpoint: 'cash-flow',
        fieldOrder: cashFlowFieldOrder,
        baseURL: 'http://localhost:8080/stocks' // Hardcoded for now, ideally from env variables
    });

    const handleNumberScaleChange = (scale: 'millions' | 'billions') => {
        setNumberScale(scale);
    };

    if (loading) {
        return <div className="text-center p-4">Loading cash flow...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-4 bg-white shadow rounded-lg space-y-6">
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

            <FinancialStatementTable<CashFlowReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={operatingActivitiesKeys}
                numberScale={numberScale}
                tableName="Operating Activities"
                highlightKeys={['netCashProvidedByOperatingActivities']}
            />

            <FinancialStatementTable<CashFlowReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={investingActivitiesKeys}
                numberScale={numberScale}
                tableName="Investing Activities"
                highlightKeys={['netCashProvidedByInvestingActivities']}
            />

            <FinancialStatementTable<CashFlowReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={financingActivitiesKeys}
                numberScale={numberScale}
                tableName="Financing Activities"
                highlightKeys={['netCashProvidedByFinancingActivities']}
            />

            <FinancialStatementTable<CashFlowReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={summaryKeys}
                numberScale={numberScale}
                tableName="Summary"
                highlightKeys={['netChangeInCash']}
            />
        </div>
    );
};

export default CashFlowTab;
