import React, { useState } from 'react';
import { IncomeStatementReport } from '../shared/types/stockFinancials';
import PeriodRangeSlider from '../shared/components/PeriodRangeSlider';
import { useFinancialReports } from '../hooks/useFinancialReports';
import { FinancialStatementTable } from '../tables/FinancialStatementTable';

import { incomeStatementFieldOrder } from '../shared/types/financialFieldOrders';

const IncomeStatementTab: React.FC<{ symbol: string }> = ({ symbol }) => {
    const [numberScale, setNumberScale] = useState<'millions' | 'billions'>('billions');
    const [revenueSegmentation, setRevenueSegmentation] = useState<any | null>(null);
    const [revenueGeography, setRevenueGeography] = useState<any | null>(null);
    const [isRevenueDetailVisible, setIsRevenueDetailVisible] = useState<boolean>(false);
    const [revenueDetailLoading, setRevenueDetailLoading] = useState<boolean>(false);

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
    } = useFinancialReports<IncomeStatementReport>({
        symbol: symbol,
        reportEndpoint: 'income-statement',
        fieldOrder: incomeStatementFieldOrder,
        baseURL: 'http://localhost:8080/stocks' // Hardcoded for now, ideally from env variables
    });

    const handleNumberScaleChange = (scale: 'millions' | 'billions') => {
        setNumberScale(scale);
    };

    const handleRevenueDetailToggle = async () => {
        if (isRevenueDetailVisible) {
            setIsRevenueDetailVisible(false);
            return;
        }

        if (revenueSegmentation && revenueGeography) {
            setIsRevenueDetailVisible(true);
            return;
        }

        try {
            setRevenueDetailLoading(true);
            const [segmentationResponse, geographyResponse] = await Promise.all([
                fetch(`http://localhost:8080/stocks/revenue-segmentation/${symbol}`),
                fetch(`http://localhost:8080/stocks/revenue-geography/${symbol}`)
            ]);

            if (!segmentationResponse.ok) {
                throw new Error('Failed to fetch revenue segmentation');
            }
            if (!geographyResponse.ok) {
                throw new Error('Failed to fetch revenue geography');
            }

            const segmentationData = await segmentationResponse.json();
            const geographyData = await geographyResponse.json();

            setRevenueSegmentation(segmentationData);
            setRevenueGeography(geographyData);
            setIsRevenueDetailVisible(true);
        } catch (error) {
            console.error(error);
        } finally {
            setRevenueDetailLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center p-4">Loading income statement...</div>;
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

            <FinancialStatementTable<IncomeStatementReport>
                reportsToDisplay={reportsToDisplay}
                allKeys={allKeys}
                numberScale={numberScale}
                tableName="Income Statement"
                reportType={reportType}
                onRevenueDetailToggle={handleRevenueDetailToggle}
                isRevenueDetailVisible={isRevenueDetailVisible}
                revenueSegmentation={revenueSegmentation}
                revenueGeography={revenueGeography}
                revenueDetailLoading={revenueDetailLoading}
            />
        </div>
    );
};

export default IncomeStatementTab;
