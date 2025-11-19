import React, {useCallback, useEffect, useState, useRef} from 'react';
import {NumericFormat} from 'react-number-format';
import {metricDescriptions} from '../shared/utils/metricDescriptions';
import InfoIcon from '../shared/components/InfoIcon';
import HistoryTable from '../common/HistoryTable';
import { useDeleteConfirmation } from '../common/DeleteConfirmationDialog';
import { useValuationHistory } from '../hooks/useValuation';

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
        operatingCashFlow: number;
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

interface ReverseDcfUserInput {
    discountRate: number;
    perpetualGrowthRate: number;
    projectionYears: number;
    userComments: string;
}

interface ReverseDcfOutput {
    impliedFCFGrowthRate: number;
    verdict: string;
}

interface ReverseDcfHistoryEntry {
    valuationDate: string;
    dcfCalculationData: DcfData;
    reverseDcfUserInput: ReverseDcfUserInput;
    reverseDcfOutput: ReverseDcfOutput;
}

// Interface for Reverse DCF calculation request
interface ReverseDcfValuation {
    dcfCalculationData: DcfData;
    reverseDcfUserInput: {
        discountRate: number;
        perpetualGrowthRate: number;
        projectionYears: number;
        userComments: string;
    };
}

// Interface for Reverse DCF calculation response
interface ReverseDcfCalculationOutput {
    impliedFCFGrowthRate: number;
    verdict: string;
}

const ReverseDcfCalculator: React.FC<ReverseDcfCalculatorProps> = ({ symbol }) => {
    const [data, setData] = useState<DcfData | null>(null);
    const [originalData, setOriginalData] = useState<DcfData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // States for editable assumptions
    const [wacc, setWacc] = useState(0);
    const [perpetualGrowthRate, setPerpetualGrowthRate] = useState(0.02); // Default consistent rate
    const [projectionYears, setProjectionYears] = useState(5);
    const [userComments, setUserComments] = useState<string>('');

    // State for the calculated implied growth rate
    const [impliedGrowthRate, setImpliedGrowthRate] = useState<number | null>(null);
    const [verdict, setVerdict] = useState<string>('');

    // States for saving Reverse DCF
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

    const { data: reverseDcfValuationHistory, loading: historyLoading, error: historyError, fetch: fetchReverseDcfHistory } = useValuationHistory<ReverseDcfHistoryEntry>('/stock/valuation/reverse-dcf/history');
    const initialCalculationDone = useRef(false);

    const { open: openDeleteDialog, Dialog: DeleteDialog } = useDeleteConfirmation(async (id: string) => {
      if (!symbol) return;
      
      try {
        const response = await fetch(`http://localhost:8080/stock/valuation/reverse-dcf/${symbol}?valuationDate=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete reverse DCF valuation');
        }

        await fetchReverseDcfHistory(symbol);
      } catch (error) {
        console.error('Failed to delete reverse DCF valuation:', error);
        setSaveError((error as Error).message);
      }
    });

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
                setOriginalData(fetchedData); // Set originalData here
                
                // Calculate WACC from the fetched data and pre-fill the input
                calculateWacc(fetchedData);
                // Keep the perpetual growth rate at a normal default, as requested
                setPerpetualGrowthRate(0.02);

                // Fetch history
                await fetchReverseDcfHistory(fetchedData.meta.ticker);

            } catch (e: unknown) {
                setError((e as Error).message);
            } finally {
                setLoading(false);
            }
        };

        if (symbol) {
            fetchData();
        }
    }, [symbol, calculateWacc, fetchReverseDcfHistory]);

    const calculateImpliedGrowth = useCallback(async () => {
        if (!data) return;

        try {
            const reverseDcfValuation: ReverseDcfValuation = {
                dcfCalculationData: data,
                reverseDcfUserInput: {
                    discountRate: wacc,
                    perpetualGrowthRate: perpetualGrowthRate,
                    projectionYears: projectionYears,
                    userComments: userComments,
                },
            };

            const response = await fetch('http://localhost:8080/stock/valuation/calculate/reverse-dcf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reverseDcfValuation),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ReverseDcfCalculationOutput = await response.json();
            setImpliedGrowthRate(result.impliedFCFGrowthRate);
            setVerdict(result.verdict);
        } catch (error) {
            console.error('Failed to calculate Reverse DCF:', error);
        }
    }, [data, wacc, perpetualGrowthRate, projectionYears, userComments]);

    // Trigger calculation once when data is first loaded
    useEffect(() => {
        if (data && !loading && !initialCalculationDone.current) {
            initialCalculationDone.current = true;
            calculateImpliedGrowth().catch(console.error);
        }
    }, [data, loading, calculateImpliedGrowth]);

    const loadHistoricalReverseDcfValuation = useCallback((entry: ReverseDcfHistoryEntry) => {
        // Update input states with historical data
        setWacc(entry.reverseDcfUserInput.discountRate);
        setPerpetualGrowthRate(entry.reverseDcfUserInput.perpetualGrowthRate);
        setProjectionYears(entry.reverseDcfUserInput.projectionYears);
        setUserComments(entry.reverseDcfUserInput.userComments);
        setData(entry.dcfCalculationData); // Update the main data state
        setVerdict(entry.reverseDcfOutput.verdict);

        // Explicitly re-run calculations with the loaded historical data
        // No need to call calculateImpliedGrowth directly here as updating
        // 'data' and other states will trigger the useEffect that calls it.
    }, [setData, setWacc, setPerpetualGrowthRate, setProjectionYears, setUserComments, setVerdict]);

    const resetCalculator = useCallback(() => {
        if (!originalData) return;

        // Reset editable states with original fetched data or defaults
        // WACC is calculated, so re-calculate from originalData
        calculateWacc(originalData);
        setPerpetualGrowthRate(0.02); // Default
        setProjectionYears(5); // Default
        setUserComments(''); // Default

        setData(originalData); // Reset the main data state

        // Reset calculated values
        setImpliedGrowthRate(null);

        // Reset save messages
        setSaveError(null);
        setSaveSuccess(false);

    }, [originalData, calculateWacc, setData, setImpliedGrowthRate, setPerpetualGrowthRate, setProjectionYears, setSaveError, setSaveSuccess, setUserComments]); // Removed calculateImpliedGrowth as a direct dependency for now.

    const handleSaveReverseDcf = async () => {
        if (!data || impliedGrowthRate === null) {
            setSaveError("Cannot save Reverse DCF before implied growth rate is calculated.");
            return;
        }

        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        const reverseDcfUserInput = {
            discountRate: wacc,
            perpetualGrowthRate: perpetualGrowthRate,
            projectionYears: projectionYears,
            userComments: userComments,
        };

        const reverseDcfOutput = {
            impliedFCFGrowthRate: impliedGrowthRate,
            verdict: verdict,
        };

        const reverseDcfValuation = {
            dcfCalculationData: data, // dcfCalculationData is the `data` state
            reverseDcfUserInput: reverseDcfUserInput,
            reverseDcfOutput: reverseDcfOutput,
        };

        try {
            const response = await fetch('http://localhost:8080/stock/valuation/reverse-dcf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reverseDcfValuation),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds

            // Reload history table
            await fetchReverseDcfHistory(data.meta.ticker);

        } catch (e: unknown) {
            setSaveError((e as Error).message);
        } finally {
            setIsSaving(false);
        }
    };


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
                                <InfoIcon description={metricDescriptions.dcfInputs.wacc} />
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
                                <InfoIcon description="The long-term sustainable growth rate that the company is expected to achieve in perpetuity. This should be close to or below the risk-free rate." />
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
                                <InfoIcon description="The total number of years to project future cash flows in the valuation model. A longer projection period captures more of the growth phase but increases uncertainty." />
                            </div>
                            <input
                                type="number"
                                value={projectionYears}
                                onChange={(e) => setProjectionYears(parseInt(e.target.value, 10))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </label>
                    </div>
                     <div className="col-span-2 mt-2">
                        <label>
                            <span className="text-gray-700">Comments:</span>
                            <textarea
                                value={userComments}
                                onChange={(e) => setUserComments(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
                                rows={3}
                                placeholder="Enter any comments or notes about this valuation..."
                            />
                        </label>
                    </div>
                     <button
                        onClick={calculateImpliedGrowth}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Calculate
                    </button>
                    <button
                        onClick={resetCalculator}
                        className="mt-4 ml-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        disabled={!originalData}
                    >
                        Reset calculator
                    </button>
                    <button
                        onClick={handleSaveReverseDcf}
                        className="mt-4 ml-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400"
                        disabled={isSaving || impliedGrowthRate === null}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    {saveSuccess && <span className="ml-4 text-green-500">Saved successfully!</span>}
                    {saveError && <span className="ml-4 text-red-500">Error: {saveError}</span>}
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
                        {verdict && (
                            <div>
                                <p className="text-gray-600">Verdict</p>
                                <p className="text-xl font-semibold">{verdict}</p>
                            </div>
                        )}
                        <div className="pt-4 border-t">
                            <p className="text-sm text-gray-600">
                                This is the compound annual growth rate (CAGR) for free cash flow over the next {projectionYears} years that the market is currently pricing into the stock.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="mt-8">
                <h5 className="text-lg font-medium mb-2">History of valuations</h5>
                <HistoryTable
                    data={reverseDcfValuationHistory}
                    loading={historyLoading}
                    error={historyError}
                    onLoadEntry={loadHistoricalReverseDcfValuation}
                    onDelete={(entry) => openDeleteDialog(entry.valuationDate)}
                    showVerdict={true}
                    verdictField="reverseDcfOutput.verdict"
                    columns={[
                        {
                            key: 'sharePrice',
                            header: 'Share Price at Valuation',
                            render: (entry: unknown) => {
                                const e = entry as ReverseDcfHistoryEntry;
                                return `${e.dcfCalculationData.meta.currency} ${e.dcfCalculationData.meta.currentSharePrice.toFixed(2)}`;
                            },
                        },
                        {
                            key: 'discountRate',
                            header: 'Discount Rate',
                            render: (entry: unknown) => {
                                const e = entry as ReverseDcfHistoryEntry;
                                return (
                                    <NumericFormat
                                        value={e.reverseDcfUserInput.discountRate * 100}
                                        displayType="text"
                                        thousandSeparator={true}
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                        suffix="%"
                                    />
                                );
                            },
                        },
                        {
                            key: 'impliedFCF',
                            header: 'Implied FCF Growth Rate',
                            render: (entry: unknown) => {
                                const e = entry as ReverseDcfHistoryEntry;
                                return `${(e.reverseDcfOutput.impliedFCFGrowthRate * 100).toFixed(2)}%`;
                            },
                        },
                    ]}
                />
            </div>

            <DeleteDialog
                title="Delete Valuation"
                message="Are you sure you want to delete this valuation? This action cannot be undone."
            />
        </div>
    );
};

export default ReverseDcfCalculator;
