import React, { useState, useEffect, useCallback } from 'react';
import { NumericFormat } from 'react-number-format';
import { metricDescriptions } from './metricDescriptions';
import InfoIcon from './InfoIcon';

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
  };
}

interface ProjectedFcf {
  year: number;
  revenue: number;
  ebit: number;
  nopat: number;
  depreciationAndAmortization: number;
  capitalExpenditure: number;
  fcf: number;
}

interface DcfHistoryEntry {
  valuationDate: string;
  dcfCalculationData: DcfData;
  dcfUserInput: {
    beta: number;
    riskFreeRate: number;
    marketRiskPremium: number;
    effectiveTaxRate: number;
    projectedRevenueGrowthRate: number;
    projectedEbitMargin: number;
    perpetualGrowthRate: number;
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


interface VerdictStyling {
  verdictText: string;
  bgColorClass: string;
}

const getVerdictStyling = (intrinsicPrice: number, currentPrice: number): VerdictStyling => {
  const percentageDifference = (intrinsicPrice - currentPrice) / currentPrice;

  let verdictText = '';
  let bgColorClass = '';

  if (percentageDifference > 0.20) { // More than 20% undervalued
    verdictText = 'Undervalued';
    bgColorClass = 'bg-green-200 text-green-800'; // Green for undervalued
  } else if (percentageDifference < -0.20) { // More than 20% overvalued
    verdictText = 'Overvalued';
    bgColorClass = 'bg-red-200 text-red-800'; // Red for overvalued
  } else {
    verdictText = 'Neutral'; // Within +/- 20%
    bgColorClass = 'bg-yellow-200 text-yellow-800'; // Yellow for neutral
  }
  return { verdictText, bgColorClass };
};

const DcfCalculator: React.FC<DcfCalculatorProps> = ({ symbol }) => {
  const [dcfData, setDcfData] = useState<DcfData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
  const [inputEffectiveTaxRate, setInputEffectiveTaxRate] = useState<number>(0);
  
  // New editable projection fields
  const [projectedRevenueGrowthRate, setProjectedRevenueGrowthRate] = useState<number>(0);
  const [projectedAverageEbitMargin, setProjectedAverageEbitMargin] = useState<number>(0);

  // Original historical metrics (display-only now)
  const [historicalRevenueGrowthCagr3Year, setHistoricalRevenueGrowthCagr3Year] = useState<number>(0);
  const [historicalAverageEbitMargin3Year, setHistoricalAverageEbitMargin3Year] = useState<number>(0);
  const [inputPerpetualGrowthRate, setInputPerpetualGrowthRate] = useState<number>(0.02);
  const [userComments, setUserComments] = useState<string>('');
  const [valuationHistory, setValuationHistory] = useState<DcfHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Remaining editable inputs (debt, cash, D&A, CapEx)
  // These are not displayed as inputs anymore based on the previous request, but their state is kept
  const [inputTotalCashAndEquivalents, setInputTotalCashAndEquivalents] = useState<number>(0);
  const [inputTotalShortTermDebt, setInputTotalShortTermDebt] = useState<number>(0);
  const [inputTotalLongTermDebt, setInputTotalLongTermDebt] = useState<number>(0);
  const [inputInterestExpense, setInputInterestExpense] = useState<number>(0);
  const [inputDepreciationAndAmortization, setInputDepreciationAndAmortization] = useState<number>(0);
  const [inputCapitalExpenditure, setInputCapitalExpenditure] = useState<number>(0);

  // Effect for fetching DCF data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setHistoryLoading(true);
      setError(null);
      setHistoryError(null);
      try {
        const [dcfResponse, historyResponse] = await Promise.all([
          fetch(`http://localhost:8080/stock/valuation/dcf/${symbol}`),
          fetch(`http://localhost:8080/stock/valuation/dcf/history/${symbol}`)
        ]);

        if (!dcfResponse.ok) {
          throw new Error(`DCF data HTTP error! status: ${dcfResponse.status}`);
        }
        if (!historyResponse.ok && historyResponse.status !== 404) {
          throw new Error(`History data HTTP error! status: ${historyResponse.status}`);
        }

        const dcfData: DcfData = await dcfResponse.json();
        const historyData: DcfHistoryEntry[] = historyResponse.status === 404 ? [] : await historyResponse.json();

        setDcfData(dcfData);
        setOriginalDcfData(dcfData);
        // Initialize editable states with fetched data
        setInputBeta(dcfData.assumptions.beta);
        setInputRiskFreeRate(dcfData.assumptions.riskFreeRate);
        setInputMarketRiskPremium(dcfData.assumptions.marketRiskPremium);
        setInputEffectiveTaxRate(dcfData.assumptions.effectiveTaxRate);
        
        setProjectedRevenueGrowthRate(dcfData.assumptions.revenueGrowthCagr3Year);
        setProjectedAverageEbitMargin(dcfData.assumptions.averageEbitMargin3Year);

        setHistoricalRevenueGrowthCagr3Year(dcfData.assumptions.revenueGrowthCagr3Year);
        setHistoricalAverageEbitMargin3Year(dcfData.assumptions.averageEbitMargin3Year);

        setInputTotalCashAndEquivalents(dcfData.balanceSheet.totalCashAndEquivalents);
        setInputTotalShortTermDebt(dcfData.balanceSheet.totalShortTermDebt);
        setInputTotalLongTermDebt(dcfData.balanceSheet.totalLongTermDebt);
        setInputInterestExpense(dcfData.income.interestExpense);
        setInputDepreciationAndAmortization(dcfData.cashFlow.depreciationAndAmortization);
        setInputCapitalExpenditure(dcfData.cashFlow.capitalExpenditure);

        setValuationHistory(historyData);

      } catch (e: unknown) {
        const errorMessage = (e as Error).message;
        setError(errorMessage);
        setHistoryError(errorMessage);
      } finally {
        setLoading(false);
        setHistoryLoading(false);
      }
    };

    if (symbol) {
      fetchAllData();
    }
  }, [symbol]);

  // Calculations are now wrapped in a useCallback so they can be triggered by input changes
  const performCalculations = useCallback(() => {
    if (!dcfData) return;

    const {
      meta: { currentSharePrice, sharesOutstanding },
      income: { revenue, ebit }, // Initial revenue and ebit for projection base
    } = dcfData;

    // Use input states for calculations
    const beta = inputBeta;
    const riskFreeRate = inputRiskFreeRate;
    const marketRiskPremium = inputMarketRiskPremium;
    const effectiveTaxRate = inputEffectiveTaxRate;
    
    // Use projected rates for FCF projection
    const revenueGrowthRateUsed = projectedRevenueGrowthRate;
    const ebitMarginUsed = projectedAverageEbitMargin;

    const totalCashAndEquivalents = inputTotalCashAndEquivalents;
    const interestExpense = inputInterestExpense;
    const depreciationAndAmortization = inputDepreciationAndAmortization;
    const capitalExpenditure = inputCapitalExpenditure;


    // --- WACC Calculation ---
    const costOfEquity = riskFreeRate + beta * marketRiskPremium;
    const totalDebt = inputTotalShortTermDebt + inputTotalLongTermDebt;
    const costOfDebt = totalDebt > 0 ? interestExpense / totalDebt : 0;
    const marketValueOfEquity = currentSharePrice * sharesOutstanding;
    const marketValueOfDebt = totalDebt;
    const totalCapital = marketValueOfEquity + marketValueOfDebt;

    let calculatedWacc = 0;
    if (totalCapital > 0) {
      const weightOfEquity = marketValueOfEquity / totalCapital;
      const weightOfDebt = marketValueOfDebt / totalCapital;
      calculatedWacc =
        costOfEquity * weightOfEquity +
        costOfDebt * weightOfDebt * (1 - effectiveTaxRate);
    }
    setWacc(calculatedWacc);

    // --- FCF Projection ---
    const projectionYears = 5;
    const fcfProjections: ProjectedFcf[] = [];

    let currentRevenue = revenue;
    let currentEbit = ebit;
    let currentDepreciationAndAmortizationVal = depreciationAndAmortization; // Use distinct variable name
    let currentCapitalExpenditureVal = capitalExpenditure; // Use distinct variable name

    for (let i = 1; i <= projectionYears; i++) {
      currentRevenue *= (1 + revenueGrowthRateUsed);
      currentEbit = currentRevenue * ebitMarginUsed;
      currentDepreciationAndAmortizationVal *= (1 + revenueGrowthRateUsed); // Assuming D&A grows with revenue
      currentCapitalExpenditureVal *= (1 + revenueGrowthRateUsed); // Assuming CapEx grows with revenue

      const nopat = currentEbit * (1 - effectiveTaxRate);
      const fcf = nopat + currentDepreciationAndAmortizationVal - currentCapitalExpenditureVal;

      fcfProjections.push({
        year: i,
        revenue: currentRevenue,
        ebit: currentEbit,
        nopat: nopat,
        depreciationAndAmortization: currentDepreciationAndAmortizationVal,
        capitalExpenditure: currentCapitalExpenditureVal,
        fcf: fcf,
      });
    }
    setProjectedFcfs(fcfProjections);

    // --- Terminal Value Calculation ---
    const perpetualGrowthRate = inputPerpetualGrowthRate; // Assuming 2% perpetual growth rate
    let calculatedTerminalValue = 0;
    if (fcfProjections.length > 0 && calculatedWacc > perpetualGrowthRate) {
      const lastProjectedFcf = fcfProjections[fcfProjections.length - 1].fcf;
      calculatedTerminalValue =
        (lastProjectedFcf * (1 + perpetualGrowthRate)) / (calculatedWacc - perpetualGrowthRate);
    }
    setTerminalValue(calculatedTerminalValue);

    // --- Discounting FCFs and Terminal Value ---
    let sumOfDiscountedFcfs = 0;
    fcfProjections.forEach((proj) => {
      sumOfDiscountedFcfs += proj.fcf / Math.pow(1 + calculatedWacc, proj.year);
    });

    const discountedTerminalValue = calculatedTerminalValue / Math.pow(1 + calculatedWacc, projectionYears);

    // --- Intrinsic Value Calculation ---
    const totalEnterpriseValue = sumOfDiscountedFcfs + discountedTerminalValue;

    // Adjust for Cash & Debt to get Equity Value
    const equityValue = totalEnterpriseValue + totalCashAndEquivalents - totalDebt;
    setIntrinsicValue(equityValue);

    // Intrinsic Value Per Share
    if (sharesOutstanding > 0) {
      setIntrinsicValuePerShare(equityValue / sharesOutstanding);
    }
  }, [
    dcfData, // dcfData is in the useCallback dependency
    inputBeta,
    inputRiskFreeRate,
    inputMarketRiskPremium,
    inputEffectiveTaxRate,
    projectedRevenueGrowthRate, // Use new projected state
    projectedAverageEbitMargin, // Use new projected state
    inputTotalCashAndEquivalents,
    inputTotalShortTermDebt,
    inputTotalLongTermDebt,
    inputInterestExpense,
    inputDepreciationAndAmortization,
    inputCapitalExpenditure,
    inputPerpetualGrowthRate,
  ]);

  // Effect to trigger calculations when dcfData changes (for initial load)
  useEffect(() => {
    if (dcfData) {
      performCalculations();
    }
  }, [dcfData, performCalculations]);

  const resetCalculator = useCallback(() => {
    if (!originalDcfData) return;

    // Reset dcfData to its original fetched state
    setDcfData(originalDcfData);

    // Reset editable states with original fetched data
    setInputBeta(originalDcfData.assumptions.beta);
    setInputRiskFreeRate(originalDcfData.assumptions.riskFreeRate);
    setInputMarketRiskPremium(originalDcfData.assumptions.marketRiskPremium);
    setInputEffectiveTaxRate(originalDcfData.assumptions.effectiveTaxRate);
    
    setProjectedRevenueGrowthRate(originalDcfData.assumptions.revenueGrowthCagr3Year);
    setProjectedAverageEbitMargin(originalDcfData.assumptions.averageEbitMargin3Year);

    // Reset original historical metrics (display-only)
    setHistoricalRevenueGrowthCagr3Year(originalDcfData.assumptions.revenueGrowthCagr3Year);
    setHistoricalAverageEbitMargin3Year(originalDcfData.assumptions.averageEbitMargin3Year);
    
    setInputPerpetualGrowthRate(0.02); // Assuming a default for this, or originalDcfData.assumptions.perpetualGrowthRate if it exists
    setUserComments('');

    setInputTotalCashAndEquivalents(originalDcfData.balanceSheet.totalCashAndEquivalents);
    setInputTotalShortTermDebt(originalDcfData.balanceSheet.totalShortTermDebt);
    setInputTotalLongTermDebt(originalDcfData.balanceSheet.totalLongTermDebt);
    setInputInterestExpense(originalDcfData.income.interestExpense);
    setInputDepreciationAndAmortization(originalDcfData.cashFlow.depreciationAndAmortization);
    setInputCapitalExpenditure(originalDcfData.cashFlow.capitalExpenditure);

    // Reset calculated values
    setWacc(null);
    setProjectedFcfs([]);
    setTerminalValue(null);
    setIntrinsicValue(null);
    setIntrinsicValuePerShare(null);

    // No need to explicitly call performCalculations here, as updating dcfData and input states
    // will trigger the useEffect that calls performCalculations.
  }, [
    originalDcfData,
    // Add all setters to the dependency array
    setDcfData, setInputBeta, setInputRiskFreeRate, setInputMarketRiskPremium,
    setInputEffectiveTaxRate, setProjectedRevenueGrowthRate,
    setProjectedAverageEbitMargin, setHistoricalRevenueGrowthCagr3Year,
    setHistoricalAverageEbitMargin3Year, setInputPerpetualGrowthRate,
    setUserComments, setInputTotalCashAndEquivalents,
    setInputTotalShortTermDebt, setInputTotalLongTermDebt,
    setInputInterestExpense, setInputDepreciationAndAmortization,
    setInputCapitalExpenditure, setWacc, setProjectedFcfs,
    setTerminalValue, setIntrinsicValue, setIntrinsicValuePerShare
  ]);

  const loadHistoricalValuation = useCallback((entry: DcfHistoryEntry) => {
    // Update input states with historical data
    setInputBeta(entry.dcfUserInput.beta);
    setInputRiskFreeRate(entry.dcfUserInput.riskFreeRate);
    setInputMarketRiskPremium(entry.dcfUserInput.marketRiskPremium);
    setInputEffectiveTaxRate(entry.dcfUserInput.effectiveTaxRate);
    setProjectedRevenueGrowthRate(entry.dcfUserInput.projectedRevenueGrowthRate);
    setProjectedAverageEbitMargin(entry.dcfUserInput.projectedEbitMargin);
    setInputPerpetualGrowthRate(entry.dcfUserInput.perpetualGrowthRate);
    setUserComments(entry.dcfUserInput.userComments);

    setDcfData(entry.dcfCalculationData);

    // Update display-only historical metrics
    setHistoricalRevenueGrowthCagr3Year(entry.dcfCalculationData.assumptions.revenueGrowthCagr3Year);
    setHistoricalAverageEbitMargin3Year(entry.dcfCalculationData.assumptions.averageEbitMargin3Year);

    // Also update the input states for other financial data that is used in calculations
    setInputTotalCashAndEquivalents(entry.dcfCalculationData.balanceSheet.totalCashAndEquivalents);
    setInputTotalShortTermDebt(entry.dcfCalculationData.balanceSheet.totalShortTermDebt);
    setInputTotalLongTermDebt(entry.dcfCalculationData.balanceSheet.totalLongTermDebt);
    setInputInterestExpense(entry.dcfCalculationData.income.interestExpense);
    setInputDepreciationAndAmortization(entry.dcfCalculationData.cashFlow.depreciationAndAmortization);
    setInputCapitalExpenditure(entry.dcfCalculationData.cashFlow.capitalExpenditure);

    // Explicitly re-run calculations with the loaded historical data
    // This ensures immediate update of derived values
    performCalculations();
  }, [
    performCalculations, // Add performCalculations to dependency array
    setInputBeta, setInputRiskFreeRate, setInputMarketRiskPremium,
    setInputEffectiveTaxRate, setProjectedRevenueGrowthRate,
    setProjectedAverageEbitMargin, setInputPerpetualGrowthRate,
    setUserComments, setDcfData
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
      effectiveTaxRate: inputEffectiveTaxRate,
      projectedRevenueGrowthRate: projectedRevenueGrowthRate,
      projectedEbitMargin: projectedAverageEbitMargin,
      perpetualGrowthRate: inputPerpetualGrowthRate,
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

    } catch (e: unknown) {
      setSaveError((e as Error).message);
    } finally {
      setIsSaving(false);
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
          {/* Historical Metrics (Display-Only) */}
          <div>
            <strong>Revenue Growth (3yr CAGR):</strong>
            <NumericFormat
              value={historicalRevenueGrowthCagr3Year * 100}
              displayType="text"
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale={true}
              suffix="%"
            />
          </div>
          <div>
            <strong>Avg EBIT Margin (3yr):</strong>
            <NumericFormat
              value={historicalAverageEbitMargin3Year * 100}
              displayType="text"
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale={true}
              suffix="%"
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
          <label className="block">
            <div className="flex items-center">
              <span className="text-gray-700">Effective Tax Rate:</span>
              <InfoIcon description={metricDescriptions.dcfInputs.effectiveTaxRate} />
            </div>
            <NumericFormat
              value={inputEffectiveTaxRate * 100}
              onValueChange={(values) => {
                setInputEffectiveTaxRate(values.floatValue ? values.floatValue / 100 : 0);
              }}
              suffix="%"
              decimalScale={3}
              fixedDecimalScale={true}
              className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </label>

          {/* Projected Editable Metrics */}
          <label className="block">
            <div className="flex items-center">
              <span className="text-gray-700">Projected Revenue Growth Rate:</span>
              <InfoIcon description={metricDescriptions.dcfInputs.projectedRevenueGrowthRate} />
            </div>
            <NumericFormat
              value={projectedRevenueGrowthRate * 100}
              onValueChange={(values) => {
                setProjectedRevenueGrowthRate(values.floatValue ? values.floatValue / 100 : 0);
              }}
              suffix="%"
              decimalScale={3}
              fixedDecimalScale={true}
              className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </label>
          <label className="block">
            <div className="flex items-center">
              <span className="text-gray-700">Projected EBIT Margin:</span>
              <InfoIcon description={metricDescriptions.dcfInputs.projectedEbitMargin} />
            </div>
            <NumericFormat
              value={projectedAverageEbitMargin * 100}
              onValueChange={(values) => {
                setProjectedAverageEbitMargin(values.floatValue ? values.floatValue / 100 : 0);
              }}
              suffix="%"
              decimalScale={3}
              fixedDecimalScale={true}
              className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </label>

          <label className="block">
            <div className="flex items-center">
              <span className="text-gray-700">Perpetual Growth Rate:</span>
              <InfoIcon description={metricDescriptions.dcfInputs.perpetualGrowthRate} />
            </div>
            <NumericFormat
              value={inputPerpetualGrowthRate * 100}
              onValueChange={(values) => {
                setInputPerpetualGrowthRate(values.floatValue ? values.floatValue / 100 : 0);
              }}
              suffix="%"
              decimalScale={3}
              fixedDecimalScale={true}
              className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
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
          Calculate DCF
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
          {isSaving ? 'Saving...' : 'Save DCF'}
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
        {projectedFcfs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EBIT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOPAT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">D&A</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CapEx</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FCF</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectedFcfs.map((fcf) => (
                  <tr key={fcf.year}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fcf.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fcf.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fcf.ebit.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fcf.nopat.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fcf.depreciationAndAmortization.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fcf.capitalExpenditure.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fcf.fcf.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No FCF projections available.</p>
        )}

        {terminalValue !== null && (
          <p className="mt-4"><strong>Terminal Value:</strong> {terminalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        )}
        {intrinsicValue !== null && (
          <p><strong>Intrinsic Value (Equity Value):</strong> {intrinsicValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        )}
        {intrinsicValuePerShare !== null && (
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {valuationHistory.length > 0 ? (
                  valuationHistory.map((entry, index) => (
                    <tr key={index} onClick={() => loadHistoricalValuation(entry)} className="cursor-pointer hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entry.valuationDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.dcfCalculationData.meta.currency} {entry.dcfOutput.intrinsicValuePerShare.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.dcfCalculationData.meta.currency} {entry.dcfCalculationData.meta.currentSharePrice.toFixed(2)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getVerdictStyling(entry.dcfOutput.intrinsicValuePerShare, entry.dcfCalculationData.meta.currentSharePrice).bgColorClass}`}>
                        {entry.dcfOutput.verdict}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" title={entry.dcfUserInput.userComments}>
                        {entry.dcfUserInput.userComments ? entry.dcfUserInput.userComments.substring(0, 50) + (entry.dcfUserInput.userComments.length > 50 ? '...' : '') : ''}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4">No valuation history found for this stock.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DcfCalculator;