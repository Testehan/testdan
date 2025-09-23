import React, { useState, useEffect, useCallback } from 'react';
import { NumericFormat } from 'react-number-format';
import { metricDescriptions } from './metricDescriptions';

// InfoIcon component for displaying tooltips
const InfoIcon: React.FC<{ description: string | undefined }> = ({ description }) => {
    if (!description) return null;
    return (
        <div className="relative group ml-1 flex-shrink-0">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4 text-gray-400 cursor-pointer"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-64 p-3 text-sm text-white bg-gray-900 rounded-lg shadow-xl group-hover:block z-10 whitespace-normal pointer-events-none">
                {description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
            </div>
        </div>
    );
};

// Using the full DcfData structure as confirmed by the user
interface DcfData {
    meta: {
        ticker: string;
        companyName: string;
        currency: string;
        currentSharePrice: number;
        sharesOutstanding: number;
        lastUpdated: string;
    };
    income: {
        revenue: number;
        ebit: number;
        interestExpense: number;
        incomeTaxExpense: number;
    };
    balanceSheet: {
        totalCashAndEquivalents: number;
        totalShortTermDebt: number;
        totalLongTermDebt: number;
        totalCurrentAssets: number;
        totalCurrentLiabilities: number;
    };
    cashFlow: {
        depreciationAndAmortization: number;
        capitalExpenditure: number;
        stockBasedCompensation: number;
    };
    assumptions: {
        beta: number;
        riskFreeRate: number;
        marketRiskPremium: number;
        effectiveTaxRate: number;
        revenueGrowthCagr3Year: number;
        averageEbitMargin3Year: number;
        perpetualGrowthRate: number; // This will be ignored in favor of a default
    };
}


interface ReverseDcfCalculatorProps {
    symbol: string;
}

const ReverseDcfCalculator: React.FC<ReverseDcfCalculatorProps> = ({ symbol }) => {
    const [data, setData] = useState<DcfData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // States for editable assumptions
    const [wacc, setWacc] = useState(0);
    const [perpetualGrowthRate, setPerpetualGrowthRate] = useState(0.02); // Default consistent rate
    const [projectionYears, setProjectionYears] = useState(5);

    // State for the calculated implied growth rate
    const [impliedGrowthRate, setImpliedGrowthRate] = useState<number | null>(null);

    const calculateWacc = useCallback((dcfData: DcfData) => {
        const { assumptions, income, balanceSheet, meta } = dcfData;
        const { riskFreeRate, beta, marketRiskPremium, effectiveTaxRate } = assumptions;
        const { interestExpense } = income;
        const { totalShortTermDebt, totalLongTermDebt } = balanceSheet;
        const { currentSharePrice, sharesOutstanding } = meta;

        const costOfEquity = riskFreeRate + beta * marketRiskPremium;
        const totalDebt = totalShortTermDebt + totalLongTermDebt;
        const costOfDebt = totalDebt > 0 ? interestExpense / totalDebt : 0;
        const marketValueOfEquity = currentSharePrice * sharesOutstanding;
        const marketValueOfDebt = totalDebt;
        const totalCapital = marketValueOfEquity + marketValueOfDebt;

        if (totalCapital > 0) {
            const weightOfEquity = marketValueOfEquity / totalCapital;
            const weightOfDebt = marketValueOfDebt / totalCapital;
            const calculatedWacc =
                costOfEquity * weightOfEquity +
                costOfDebt * weightOfDebt * (1 - effectiveTaxRate);
            setWacc(calculatedWacc);
        } else {
            setWacc(0);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:8080/stock/valuation/reverse-dcf/${symbol}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const fetchedData: DcfData = await response.json();
                setData(fetchedData);
                
                // Calculate WACC from the fetched data and pre-fill the input
                calculateWacc(fetchedData);
                // Keep the perpetual growth rate at a normal default, as requested
                setPerpetualGrowthRate(0.02);

            } catch (e: unknown) {
                setError((e as Error).message);
            } finally {
                setLoading(false);
            }
        };

        if (symbol) {
            fetchData();
        }
    }, [symbol, calculateWacc]);

    const calculateImpliedGrowth = useCallback(() => {
        if (!data) return;

        const { meta, balanceSheet, income, cashFlow, assumptions } = data;
        const targetPrice = meta.currentSharePrice;
        const totalDebt = balanceSheet.totalShortTermDebt + balanceSheet.totalLongTermDebt;
        const enterpriseValue = (targetPrice * meta.sharesOutstanding) - balanceSheet.totalCashAndEquivalents + totalDebt;
        
        const nopat = income.ebit * (1 - assumptions.effectiveTaxRate);
        const baseFcf = nopat + cashFlow.depreciationAndAmortization - cashFlow.capitalExpenditure;

        let low = -1.0;
        let high = 2.0;
        let mid = 0;
        let iteration = 0;
        const maxIterations = 100;

        while (iteration < maxIterations) {
            mid = (low + high) / 2;
            let presentValue = 0;
            let lastFcf = 0;

            for (let i = 1; i <= projectionYears; i++) {
                const fcf = baseFcf * Math.pow(1 + mid, i);
                presentValue += fcf / Math.pow(1 + wacc, i);
                if (i === projectionYears) {
                    lastFcf = fcf;
                }
            }
            
            if (wacc <= perpetualGrowthRate) {
                setImpliedGrowthRate(null);
                return;
            }

            const terminalValue = (lastFcf * (1 + perpetualGrowthRate)) / (wacc - perpetualGrowthRate);
            const discountedTerminalValue = terminalValue / Math.pow(1 + wacc, projectionYears);
            const calculatedEv = presentValue + discountedTerminalValue;
            
            const difference = calculatedEv - enterpriseValue;

            if (Math.abs(difference) < 1e-9) {
                break;
            }

            if (difference > 0) {
                high = mid;
            } else {
                low = mid;
            }
            iteration++;
        }

        setImpliedGrowthRate(mid);

    }, [data, wacc, perpetualGrowthRate, projectionYears]);

    useEffect(() => {
        if (data) {
            calculateImpliedGrowth();
        }
    }, [data, calculateImpliedGrowth]);


    if (loading) return <div className="text-center p-4">Loading Reverse DCF data...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
    if (!data) return <div className="text-center p-4">No data available.</div>;

    return (
        <div className="p-4">
            <h4 className="text-xl font-semibold mb-3">Reverse DCF Calculator for {data.meta.companyName} ({data.meta.ticker})</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h5 className="text-lg font-medium mb-4">Assumptions</h5>
                    <div className="space-y-4">
                        <label className="block">
                            <div className="flex items-center">
                                <span className="text-gray-700">Discount Rate - minimum annual return from your investment (WACC)</span>
                                <InfoIcon description={metricDescriptions.wacc} />
                            </div>
                            <NumericFormat
                                value={wacc * 100}
                                onValueChange={(values) => setWacc(values.floatValue ? values.floatValue / 100 : 0)}
                                suffix="%"
                                decimalScale={2}
                                fixedDecimalScale={true}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </label>
                        <label className="block">
                            <div className="flex items-center">
                                <span className="text-gray-700">Perpetual Growth Rate</span>
                                <InfoIcon description={metricDescriptions.perpetualGrowthRate} />
                            </div>
                            <NumericFormat
                                value={perpetualGrowthRate * 100}
                                onValueChange={(values) => setPerpetualGrowthRate(values.floatValue ? values.floatValue / 100 : 0)}
                                suffix="%"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </label>
                        <label className="block">
                            <div className="flex items-center">
                                <span className="text-gray-700">Projection Years</span>
                                <InfoIcon description={metricDescriptions.projectionYears} />
                            </div>
                            <input
                                type="number"
                                value={projectionYears}
                                onChange={(e) => setProjectionYears(parseInt(e.target.value, 10))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </label>
                    </div>
                     <button
                        onClick={calculateImpliedGrowth}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Recalculate
                    </button>
                </div>

                {/* Results */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h5 className="text-lg font-medium mb-4">Results</h5>
                    <div className="space-y-4">
                        <div>
                            <p className="text-gray-600">Current Share Price</p>
                            <p className="text-2xl font-semibold">{data.meta.currency} {data.meta.currentSharePrice.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Implied FCF Growth Rate</p>
                            {impliedGrowthRate !== null ? (
                                <p className="text-2xl font-semibold text-green-600">
                                    {(impliedGrowthRate * 100).toFixed(2)}%
                                </p>
                            ) : (
                                <p className="text-gray-500">Could not calculate. Check assumptions (WACC must be {'>'} Perpetual Growth Rate).</p>
                            )}
                        </div>
                        <div className="pt-4 border-t">
                            <p className="text-sm text-gray-600">
                                This is the compound annual growth rate (CAGR) for free cash flow over the next {projectionYears} years that the market is currently pricing into the stock.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReverseDcfCalculator;
