import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NumericFormat } from 'react-number-format';
import { metricDescriptions } from './metricDescriptions';
import InfoIcon from './InfoIcon';
import ConfirmDialog from './common/ConfirmDialog';
import { getVerdictStyling } from '../../utils/valuation';

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
    interestExpense: number;
  };
  balanceSheet: {
    totalCashAndEquivalents: number;
    totalShortTermDebt: number;
    totalLongTermDebt: number;
  };
  cashFlow: {
    capitalExpenditure: number;
    operatingCashFlow: number;
    stockBasedCompensation: number;
  };
  assumptions: {
    beta: number;
    riskFreeRate: number;
    marketRiskPremium: number;
    fcfGrowthRate: number;
    marketCapToFcfMultiple: number;
  };
}

interface ProjectedFcf {
  year: number;
  fcf: number;
}

interface DcfHistoryEntry {
  valuationDate: string;
  dcfCalculationData: DcfData;
  dcfUserInput: {
    beta: number;
    riskFreeRate: number;
    marketRiskPremium: number;
    fcfGrowthRate: number;
    terminalMultiple: number;
    sbcAdjustmentToggle: boolean;
    userComments: string;
  };
  dcfOutput: {
    equityValue: number;
    intrinsicValuePerShare: number;
    wacc: number;
    verdict: string;
  };
}

interface DcfCalculatorProps {
  symbol: string;
}

// Interface for DCF calculation request
interface DcfValuation {
  dcfCalculationData: DcfData;
  dcfUserInput: {
    beta: number;
    riskFreeRate: number;
    marketRiskPremium: number;
    fcfGrowthRate: number;
    terminalMultiple: number;
    sbcAdjustmentToggle: boolean;
    userComments: string;
  };
}

// Interface for DCF calculation response
interface DcfOutput {
  wacc: number;
  projectedFcfs: ProjectedFcf[];
  terminalValue: number;
  equityValue: number;
  intrinsicValuePerShare: number;
  verdict: string;
}

const DcfCalculator: React.FC<DcfCalculatorProps> = ({ symbol }) => {
  const [dcfData, setDcfData] = useState<DcfData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const initialCalculationDone = useRef(false);

  // States for calculated values
  const [wacc, setWacc] = useState<number | null>(null);
  const [projectedFcfs, setProjectedFcfs] = useState<ProjectedFcf[]>([]);
  const [terminalValue, setTerminalValue] = useState<number | null>(null);
  const [intrinsicValue, setIntrinsicValue] = useState<number | null>(null);
  const [intrinsicValuePerShare, setIntrinsicValuePerShare] = useState<number | null>(null);
  // States for saving DCF
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [originalDcfData, setOriginalDcfData] = useState<DcfData | null>(null);

  // States for editable assumptions, initialized to 0 and updated when dcfData arrives
  const [inputBeta, setInputBeta] = useState<number>(0);
  const [inputRiskFreeRate, setInputRiskFreeRate] = useState<number>(0);
  const [inputMarketRiskPremium, setInputMarketRiskPremium] = useState<number>(0);
  
  // New editable projection fields
  const [fcfGrowthRate, setFcfGrowthRate] = useState<number>(0);
  const [userInputFcfGrowthRate, setUserInputFcfGrowthRate] = useState<number>(0);
  const [inputTerminalMultiple, setInputTerminalMultiple] = useState<number>(15);
  const [userInputTerminalMultiple, setUserInputTerminalMultiple] = useState<number>(15);
  const [sbcAdjustmentToggle, setSbcAdjustmentToggle] = useState<boolean>(true);
  const [userComments, setUserComments] = useState<string>('');
  const [valuationHistory, setValuationHistory] = useState<DcfHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  
  // Delete confirmation dialog state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [valuationDateToDelete, setValuationDateToDelete] = useState<string | null>(null);


  const fetchValuationHistory = useCallback(async (currentSymbol: string) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const historyResponse = await fetch(`http://localhost:8080/stock/valuation/dcf/history/${currentSymbol}`);
      if (!historyResponse.ok && historyResponse.status !== 404) {
        throw new Error(`History data HTTP error! status: ${historyResponse.status}`);
      }
      const historyData: DcfHistoryEntry[] = historyResponse.status === 404 ? [] : await historyResponse.json();
      // Sort historyData by valuationDate in descending order
      const sortedHistoryData = historyData.sort((a, b) => {
        const dateA = new Date(a.valuationDate);
        const dateB = new Date(b.valuationDate);
        return dateB.getTime() - dateA.getTime();
      });
      setValuationHistory(sortedHistoryData);
    } catch (e: unknown) {
      setHistoryError((e as Error).message);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Effect for fetching DCF data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dcfResponse = await fetch(`http://localhost:8080/stock/valuation/dcf/${symbol}`);

        if (!dcfResponse.ok) {
          throw new Error(`DCF data HTTP error! status: ${dcfResponse.status}`);
        }

        const dcfData: DcfData = await dcfResponse.json();

        setDcfData(dcfData);
        setOriginalDcfData(dcfData);
        // Initialize editable states with fetched data
        setInputBeta(dcfData.assumptions.beta);
        setInputRiskFreeRate(dcfData.assumptions.riskFreeRate);
        setInputMarketRiskPremium(dcfData.assumptions.marketRiskPremium);
        
        setFcfGrowthRate(dcfData.assumptions.fcfGrowthRate); // Initialize with average from dcfData
        setUserInputFcfGrowthRate(dcfData.assumptions.fcfGrowthRate);
        setInputTerminalMultiple(dcfData.assumptions.marketCapToFcfMultiple); // Initialize with a default, as it's a new input
        setUserInputTerminalMultiple(dcfData.assumptions.marketCapToFcfMultiple);
        setSbcAdjustmentToggle(true); // Initialize with default (checked)

        // Fetch history using the new function
        await fetchValuationHistory(symbol);

      } catch (e: unknown) {
        const errorMessage = (e as Error).message;
        setError(errorMessage);
        setHistoryError(errorMessage); // Set history error if main fetch fails
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchAllData();
    }
  }, [symbol, fetchValuationHistory]);

  // Server-side calculation function
  const performCalculations = useCallback(async () => {
    if (!dcfData) return;

    try {
      // Calculate FCF projections client-side for display
      const {
        cashFlow: { operatingCashFlow: initialOperatingCashFlowFetched, capitalExpenditure: initialCapitalExpenditure, stockBasedCompensation },
      } = dcfData;

      let initialOperatingCashFlow = initialOperatingCashFlowFetched;
      if (sbcAdjustmentToggle) {
        initialOperatingCashFlow -= stockBasedCompensation;
      }

      // --- FCF Projection ---
      const projectionYears = 5;
      const fcfProjections: ProjectedFcf[] = [];
      let currentOperatingCashFlow = initialOperatingCashFlow;
      let currentCapitalExpenditure = initialCapitalExpenditure;

      for (let i = 1; i <= projectionYears; i++) {
        currentOperatingCashFlow *= (1 + userInputFcfGrowthRate);
        currentCapitalExpenditure *= (1 + userInputFcfGrowthRate);
        const fcf = currentOperatingCashFlow - Math.abs(currentCapitalExpenditure);
        fcfProjections.push({ year: i, fcf });
      }
      setProjectedFcfs(fcfProjections);

      // Calculate terminal value client-side
      const lastProjectedFcf = fcfProjections[fcfProjections.length - 1].fcf;
      const calculatedTerminalValue = lastProjectedFcf * userInputTerminalMultiple;
      setTerminalValue(calculatedTerminalValue);

      // Send request to server for final valuation
      const dcfValuation: DcfValuation = {
        dcfCalculationData: dcfData,
        dcfUserInput: {
          beta: inputBeta,
          riskFreeRate: inputRiskFreeRate,
          marketRiskPremium: inputMarketRiskPremium,
          fcfGrowthRate: userInputFcfGrowthRate,
          terminalMultiple: userInputTerminalMultiple,
          sbcAdjustmentToggle: sbcAdjustmentToggle,
          userComments: userComments,
        },
      };

      const response = await fetch('http://localhost:8080/stock/valuation/calculate/dcf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dcfValuation),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const dcfOutput: DcfOutput = await response.json();

      // Update state with server response (use server's values as authoritative)
      setWacc(dcfOutput.wacc);
      setIntrinsicValue(dcfOutput.equityValue);
      setIntrinsicValuePerShare(dcfOutput.intrinsicValuePerShare);
    } catch (error) {
      console.error('Failed to calculate DCF:', error);
    }
  }, [
    dcfData,
    inputBeta,
    inputRiskFreeRate,
    inputMarketRiskPremium,
    userInputFcfGrowthRate,
    userInputTerminalMultiple,
    sbcAdjustmentToggle,
    userComments,
  ]);

  // Trigger calculation once when dcfData is first loaded
  useEffect(() => {
    if (dcfData && !loading && !initialCalculationDone.current) {
      initialCalculationDone.current = true;
      performCalculations().catch(console.error);
    }
  }, [dcfData, loading, performCalculations]);

  const resetCalculator = useCallback(() => {
    if (!originalDcfData) return;

    // Reset dcfData to its original fetched state
    setDcfData(originalDcfData);

    // Reset editable states with original fetched data
    setInputBeta(originalDcfData.assumptions.beta);
    setInputRiskFreeRate(originalDcfData.assumptions.riskFreeRate);
    setInputMarketRiskPremium(originalDcfData.assumptions.marketRiskPremium);
    
    setFcfGrowthRate(originalDcfData.assumptions.fcfGrowthRate); // Reset with average from original dcfData
    setUserInputFcfGrowthRate(originalDcfData.assumptions.fcfGrowthRate);
    setInputTerminalMultiple(originalDcfData.assumptions.marketCapToFcfMultiple); // Reset to default
    setUserInputTerminalMultiple(originalDcfData.assumptions.marketCapToFcfMultiple);
    setSbcAdjustmentToggle(true); // Reset to default (checked)
    setUserComments('');

    // Reset calculated values
    setWacc(null);
    setProjectedFcfs([]);
    setTerminalValue(null);
    setIntrinsicValue(null);
    setIntrinsicValuePerShare(null);

    // Calculations will NOT be triggered automatically. User must click Calculate button.
  }, [
    originalDcfData,
    // Add all setters to the dependency array
    setDcfData, setInputBeta, setInputRiskFreeRate, setInputMarketRiskPremium,
    setFcfGrowthRate,
    setUserInputFcfGrowthRate,
    setInputTerminalMultiple,
    setUserInputTerminalMultiple,
    setSbcAdjustmentToggle,
    setUserComments,
    setWacc, setProjectedFcfs,
    setTerminalValue, setIntrinsicValue, setIntrinsicValuePerShare
  ]);

  const loadHistoricalValuation = useCallback((entry: DcfHistoryEntry) => {
    // Update input states with historical data
    setInputBeta(entry.dcfUserInput.beta);
    setInputRiskFreeRate(entry.dcfUserInput.riskFreeRate);
    setInputMarketRiskPremium(entry.dcfUserInput.marketRiskPremium);
    setFcfGrowthRate(entry.dcfUserInput.fcfGrowthRate ?? 0); // Use 0 as default if undefined
    setUserInputFcfGrowthRate(entry.dcfUserInput.fcfGrowthRate ?? 0);
    setInputTerminalMultiple(entry.dcfUserInput.terminalMultiple ?? 15); // Use 15 as default if undefined
    setUserInputTerminalMultiple(entry.dcfUserInput.terminalMultiple ?? 15);
    setSbcAdjustmentToggle(entry.dcfUserInput.sbcAdjustmentToggle ?? false); // Use false as default if undefined
    setUserComments(entry.dcfUserInput.userComments);

    setDcfData(entry.dcfCalculationData);

    // User must click Calculate button to see updated results
  }, [
    setInputBeta, setInputRiskFreeRate, setInputMarketRiskPremium,
    setFcfGrowthRate,
    setUserInputFcfGrowthRate,
    setInputTerminalMultiple,
    setUserInputTerminalMultiple,
    setSbcAdjustmentToggle,
    setUserComments, setDcfData,
  ]);

  const handleSaveDcf = async () => {
    if (!dcfData || intrinsicValuePerShare === null || wacc === null || intrinsicValue === null) {
      setSaveError("Cannot save DCF before a calculation is performed.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    // Re-calculate verdict to ensure it's up-to-date
    const currentPrice = dcfData.meta.currentSharePrice;
    const intrinsicPrice = intrinsicValuePerShare;
    const { verdictText } = getVerdictStyling(intrinsicPrice, currentPrice);

    const dcfUserInput = {
      beta: inputBeta,
      riskFreeRate: inputRiskFreeRate,
      marketRiskPremium: inputMarketRiskPremium,
      fcfGrowthRate: userInputFcfGrowthRate,
      terminalMultiple: userInputTerminalMultiple, // Add terminal multiple
      sbcAdjustmentToggle: sbcAdjustmentToggle, // Add SBC adjustment toggle
      userComments: userComments,
    };

    const dcfOutput = {
      equityValue: intrinsicValue,
      intrinsicValuePerShare: intrinsicValuePerShare,
      wacc: wacc,
      verdict: verdictText,
    };

    const dcfValuation = {
      dcfCalculationData: dcfData,
      dcfUserInput: dcfUserInput,
      dcfOutput: dcfOutput,
    };

    try {
      const response = await fetch('http://localhost:8080/stock/valuation/dcf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dcfValuation),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSaveSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);

      // Reload history table
      await fetchValuationHistory(symbol);
    } catch (e: unknown) {
      setSaveError((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDcf = async () => {
    if (!symbol || !valuationDateToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:8080/stock/valuation/dcf/${symbol}?valuationDate=${encodeURIComponent(valuationDateToDelete)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reload history table
      await fetchValuationHistory(symbol);
    } catch (error) {
      console.error('Failed to delete DCF valuation:', error);
      setSaveError((error as Error).message);
    } finally {
      setIsDeleteConfirmOpen(false);
      setValuationDateToDelete(null);
    }
  };


  if (loading) {
    return <div className="text-center p-4">Loading DCF data...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  if (!dcfData) {
    return <div className="text-center p-4">No DCF data available.</div>;
  }

  return (
    <div className="p-4">
      <h4 className="text-xl font-semibold mb-3">DCF Calculator for {dcfData.meta.companyName} ({dcfData.meta.ticker})</h4>

      <div className="mb-6">
        <h5 className="text-lg font-medium mb-2">Inputs:</h5>
        <div className="grid grid-cols-2 gap-2">
          {/* Meta Data */}
          <div><strong>Current Share Price:</strong> {dcfData.meta.currentSharePrice} {dcfData.meta.currency}</div>
          <div><strong>Shares Outstanding:</strong> {dcfData.meta.sharesOutstanding.toLocaleString()}</div>
          <div>
            <strong>Free Cash flow Growth avg last 3 yrs:</strong>
            <NumericFormat
              value={fcfGrowthRate * 100}
              displayType="text"
              decimalScale={2}
              fixedDecimalScale={true}
              suffix="%"
            />
          </div>
          <div>
            <strong>MarketCap / FCF (ttm):</strong>
            <NumericFormat
                value={inputTerminalMultiple}
                displayType="text"
                decimalScale={2}
                fixedDecimalScale={true}
                suffix=""
            />
          </div>
          {/* Assumptions */}
          <label className="block">
            <div className="flex items-center">
              <span className="text-gray-700">Beta:</span>
              <InfoIcon description={metricDescriptions.dcfInputs.beta} />
            </div>
            <input
              type="number"
              step="0.01"
              value={inputBeta}
              onChange={(e) => setInputBeta(parseFloat(e.target.value))}
              className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </label>
          <label className="block">
            <div className="flex items-center">
              <span className="text-gray-700">Risk Free Rate:</span>
              <InfoIcon description={metricDescriptions.dcfInputs.riskFreeRate} />
            </div>
            <NumericFormat
              value={inputRiskFreeRate * 100}
              onValueChange={(values) => {
                setInputRiskFreeRate(values.floatValue ? values.floatValue / 100 : 0);
              }}
              suffix="%"
              decimalScale={3}
              fixedDecimalScale={true}
              className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </label>
          <label className="block">
            <div className="flex items-center">
              <span className="text-gray-700">Market Risk Premium:</span>
              <InfoIcon description={metricDescriptions.dcfInputs.marketRiskPremium} />
            </div>
            <NumericFormat
              value={inputMarketRiskPremium * 100}
              onValueChange={(values) => {
                setInputMarketRiskPremium(values.floatValue ? values.floatValue / 100 : 0);
              }}
              suffix="%"
              decimalScale={3}
              fixedDecimalScale={true}
              className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </label>


          {/* OCF-Based Inputs */}

          {/* Projected Editable Metrics */}
          <label className="block">
            <div className="flex items-center">
              <span className="text-gray-700">FCF Growth Rate (Years 1-5):</span>
              <InfoIcon description={metricDescriptions.dcfInputs.fcfGrowthRate} />
            </div>
            <NumericFormat
              value={userInputFcfGrowthRate * 100}
              onValueChange={(values) => {
                setUserInputFcfGrowthRate(values.floatValue ? values.floatValue / 100 : 0);
              }}
              suffix="%"
              decimalScale={3}
              fixedDecimalScale={true}
              className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </label>
          <label className="block">
            <div className="flex items-center">
              <span className="text-gray-700">Terminal Multiple:</span>
              <InfoIcon description={metricDescriptions.dcfInputs.terminalMultiple} />
            </div>
            <NumericFormat
              value={userInputTerminalMultiple}
              onValueChange={(values) => {
                setUserInputTerminalMultiple(values.floatValue || 0);
              }}
              decimalScale={2}
              fixedDecimalScale={false}
              className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </label>
          <label className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              checked={sbcAdjustmentToggle}
              onChange={(e) => setSbcAdjustmentToggle(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="text-gray-700">Adjust for Stock-Based Comp:</span>
            <InfoIcon description={metricDescriptions.dcfInputs.sbcAdjustmentToggle} />
          </label>


          <div className="col-span-2 mt-2">
              <label>
                  <span className="text-gray-700">Comments:</span>
                  <textarea
                      value={userComments}
                      onChange={(e) => setUserComments(e.target.value)}
                      className="mt-1 block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
                      rows={3}
                      placeholder="Enter any comments or notes about this valuation..."
                  />
              </label>
          </div>
        </div>
        <button
          onClick={performCalculations}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Calculate
        </button>
        <button
          onClick={resetCalculator}
          className="mt-4 ml-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          disabled={!originalDcfData}
        >
          Reset Calculator
        </button>
        <button
            onClick={handleSaveDcf}
            className="mt-4 ml-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400"
            disabled={isSaving || intrinsicValuePerShare === null}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        {saveSuccess && <span className="ml-4 text-green-500">Saved successfully!</span>}
        {saveError && <span className="ml-4 text-red-500">Error: {saveError}</span>}
      </div>

      <div className="mt-6">
        <h5 className="text-lg font-medium mb-2">DCF Calculation Results:</h5>
        {wacc !== null && (
          <p>
            <strong>WACC:</strong>
            <NumericFormat
              value={wacc * 100}
              displayType="text"
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale={true}
              suffix="%"
            />
          </p>
        )}

        <h6 className="text-lg font-medium mt-4 mb-2">Projected Free Cash Flows:</h6>
        {projectedFcfs && projectedFcfs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FCF</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectedFcfs.map((fcf) => (
                  <tr key={fcf.year}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fcf.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fcf.fcf.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No FCF projections available.</p>
        )}

        {terminalValue != null && (
          <p className="mt-4"><strong>Terminal Value:</strong> {terminalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        )}
        {intrinsicValue != null && (
          <p><strong>Intrinsic Value (Equity Value):</strong> {intrinsicValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        )}
        {intrinsicValuePerShare != null && (
          <p><strong>Intrinsic Value Per Share:</strong> {dcfData.meta.currency} {intrinsicValuePerShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        )}
        {intrinsicValuePerShare !== null && dcfData.meta.currentSharePrice !== null && (
          <p><strong>Current Share Price:</strong> {dcfData.meta.currency} {dcfData.meta.currentSharePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        )}
        {intrinsicValuePerShare !== null && dcfData.meta.currentSharePrice !== null && (
          (() => {
            const { verdictText, bgColorClass } = getVerdictStyling(intrinsicValuePerShare, dcfData.meta.currentSharePrice);

            return (
              <p className={`p-2 rounded-md inline-block ${bgColorClass}`}>
                <strong>Verdict:</strong> {verdictText}
              </p>
            );
          })()
        )}
      </div>

      {/* History Table */}
      <div className="mt-8">
        <h5 className="text-lg font-medium mb-2">History of valuations</h5>
        {historyLoading ? (
          <p>Loading valuation history...</p>
        ) : historyError ? (
          <p className="text-red-500">Could not load valuation history.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Valuation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intrinsic Value Per Share</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share Price at Valuation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verdict</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {valuationHistory.length > 0 ? (
                  valuationHistory.map((entry, index) => (
                    <tr key={index} className="cursor-pointer hover:bg-gray-100">
                      <td onClick={() => loadHistoricalValuation(entry)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entry.valuationDate).toLocaleString()}</td>
                      <td onClick={() => loadHistoricalValuation(entry)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.dcfCalculationData.meta.currency} {entry.dcfOutput.intrinsicValuePerShare.toFixed(2)}</td>
                      <td onClick={() => loadHistoricalValuation(entry)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.dcfCalculationData.meta.currency} {entry.dcfCalculationData.meta.currentSharePrice.toFixed(2)}</td>
                      <td onClick={() => loadHistoricalValuation(entry)} className={`px-6 py-4 whitespace-nowrap text-sm ${getVerdictStyling(entry.dcfOutput.intrinsicValuePerShare, entry.dcfCalculationData.meta.currentSharePrice).bgColorClass}`}>
                        {entry.dcfOutput.verdict}
                      </td>
                      <td onClick={() => loadHistoricalValuation(entry)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" title={entry.dcfUserInput.userComments}>
                        {entry.dcfUserInput.userComments ? entry.dcfUserInput.userComments.substring(0, 50) + (entry.dcfUserInput.userComments.length > 50 ? '...' : '') : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setValuationDateToDelete(entry.valuationDate);
                            setIsDeleteConfirmOpen(true);
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4">No valuation history found for this stock.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this valuation?"
        onConfirm={handleDeleteDcf}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setValuationDateToDelete(null);
        }}
      />
    </div>
  );
};

export default DcfCalculator;