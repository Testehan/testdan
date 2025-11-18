import React, { useState } from 'react';
import { FinancialRatioReport } from '../shared/types/stockFinancials';
import PeriodRangeSlider from '../shared/components/PeriodRangeSlider';
import { useFinancialReports } from '../hooks/useFinancialReports';
import { FinancialStatementTable } from '../tables/FinancialStatementTable';
// financialRatioFieldOrder is not directly used when displaying in sections

const profitabilityKeys: (keyof FinancialRatioReport)[] = [
    'grossProfitMargin',
    'netProfitMargin',
    'returnOnAssets',
    'returnOnEquity',
    'operatingProfitMargin',
    'ebitdaMargin',
    'adjustedEbitdaMargin',
    'freeCashflowMargin',
    'roic',
];

const liquidityKeys: (keyof FinancialRatioReport)[] = [
    'currentRatio',
    'quickRatio',
    'cashRatio',
    'workingCapital',
];

const solvencyKeys: (keyof FinancialRatioReport)[] = [
    'debtToAssetsRatio',
    'debtToEquityRatio',
    'interestCoverageRatio',
    'debtServiceCoverageRatio',
    'netDebtToEbitda',
    'altmanZScore',
];

const efficiencyKeys: (keyof FinancialRatioReport)[] = [
    'assetTurnover',
    'inventoryTurnover',
    'receivablesTurnover',
    'daysSalesOutstanding',
    'payablesTurnover',
    'cashConversionCycle',
    'daysInventoryOutstanding',
    'daysPayablesOutstanding',
    'salesToCapitalRatio'
];

const shareholderReturnsKeys: (keyof FinancialRatioReport)[] = [
    'dividendYield',
    'dividendPayoutRatio',
    'buybackYield',
];

const perShareMetricsKeys: (keyof FinancialRatioReport)[] = [
    'earningsPerShareBasic',
    'earningsPerShareDiluted',
    'bookValuePerShare',
    'tangibleBookValuePerShare',
    'salesPerShare',
];

const cashAndReturnsPerShareKeys: (keyof FinancialRatioReport)[] = [
    'freeCashFlowPerShare',
    'operatingCashFlowPerShare',
    'dividendPerShare',
    'cashPerShare',
];

const cashFlowKeys: (keyof FinancialRatioReport)[] = [
    'freeCashFlow',
    'operatingCashFlowRatio',
    'cashFlowToDebtRatio',
];

const valuationKeys: (keyof FinancialRatioReport)[] = [
    'priceToEarningsGrowthRatio',
    'forwardPriceToEarningsGrowthRatio',
    'priceToFairValue',
    'enterpriseValueMultiple',
    'peRatio',
    'pbRatio',
    'pfcfRatio',
    'pocfratio',
    'priceToSalesRatio'
];

// All keys that should be formatted as percentages
const allPercentageKeys: (keyof FinancialRatioReport)[] = [
    'grossProfitMargin',
    'netProfitMargin',
    'returnOnAssets', // Added returnOnAssets
    'returnOnEquity', // This is also a percentage, let's add it
    'operatingProfitMargin',
    'ebitdaMargin',
    'adjustedEbitdaMargin',
    'freeCashflowMargin',
    'roic', // Added roic
    'dividendYield',
    'dividendPayoutRatio',
    'buybackYield',
    'operatingCashFlowRatio',
    'cashFlowToDebtRatio',
];

const RatiosTab: React.FC<{ symbol: string }> = ({ symbol }) => {
    const [numberScale, setNumberScale] = useState<'millions' | 'billions'>('billions'); // Default to 'billions'

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
    } = useFinancialReports<FinancialRatioReport>({
        symbol: symbol,
        reportEndpoint: 'financial-ratios',
        fieldOrder: [],
        baseURL: 'http://localhost:8080/stocks'
    });

    const handleNumberScaleChange = (scale: 'millions' | 'billions') => {
        setNumberScale(scale);
    };

    if (loading) {
        return <div className="text-center p-4">Loading financial ratios...</div>;
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

            <FinancialStatementTable<FinancialRatioReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={profitabilityKeys}
                numberScale={numberScale}
                tableName="Profitability"
                percentageKeys={allPercentageKeys} // Pass allPercentageKeys here
            />

            <FinancialStatementTable<FinancialRatioReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={liquidityKeys}
                numberScale={numberScale}
                tableName="Liquidity"
                percentageKeys={allPercentageKeys} // Pass allPercentageKeys here
            />

            <FinancialStatementTable<FinancialRatioReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={solvencyKeys}
                numberScale={numberScale}
                tableName="Solvency"
                percentageKeys={allPercentageKeys} // Pass allPercentageKeys here
            />

            <FinancialStatementTable<FinancialRatioReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={efficiencyKeys}
                numberScale={numberScale}
                tableName="Efficiency"
                percentageKeys={allPercentageKeys} // Pass allPercentageKeys here
            />

            <FinancialStatementTable<FinancialRatioReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={shareholderReturnsKeys}
                numberScale={numberScale}
                tableName="Shareholder Returns"
                percentageKeys={allPercentageKeys} // Pass allPercentageKeys here
            />

            <FinancialStatementTable<FinancialRatioReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={perShareMetricsKeys}
                numberScale={numberScale}
                tableName="Per Share Metrics"
                percentageKeys={allPercentageKeys} // Pass allPercentageKeys here
            />

            <FinancialStatementTable<FinancialRatioReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={cashAndReturnsPerShareKeys}
                numberScale={numberScale}
                tableName="Cash & Returns Per Share"
                percentageKeys={allPercentageKeys} // Pass allPercentageKeys here
            />

            <FinancialStatementTable<FinancialRatioReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={cashFlowKeys}
                numberScale={numberScale}
                tableName="Cash Flow"
                percentageKeys={allPercentageKeys} // Pass allPercentageKeys here
            />
            
            <FinancialStatementTable<FinancialRatioReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={valuationKeys}
                numberScale={numberScale}
                tableName="Valuation"
                percentageKeys={allPercentageKeys} // Pass allPercentageKeys here
            />
        </div>
    );
};

export default RatiosTab;
