import React, { useState, useEffect } from 'react';
import InfoIcon from './InfoIcon';
import { metricDescriptions } from './metricDescriptions';

interface IncomeStatement {
  fiscalYear: number;
  revenue: number;
  operatingIncome: number;
  pretaxIncome: number;
  netIncome: number;
}

interface BalanceSheet {
  fiscalYear: number;
  cashAndEquivalents: number;
  shortTermDebt: number;
  longTermDebt: number;
  totalAssets: number;
  totalEquity: number;
}

interface CashFlow {
  fiscalYear: number;
  operatingCashFlow: number;
  capitalExpenditures: number;
  depreciationAndAmortization: number;
  changeInWorkingCapital: number;
}

interface GrowthData {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  currency: string;
  currentSharePrice: number;
  marketCapitalization: number;
  riskFreeRate: number;
  incomeStatements: IncomeStatement[];
  balanceSheets: BalanceSheet[];
  cashFlows: CashFlow[];
  netOperatingLossCarryforward: number;
  nolExpirationYears: number;
  marginalTaxRate: number;
  totalDebt: number;
  averageInterestRate: number;
  cashBalance: number;
  commonSharesOutstanding: number;
}

interface GrowthTabProps {
  symbol: string;
}

interface GrowthHistoryEntry {
  valuationDate: string;
  growthValuationData: GrowthData;
  growthUserInput: {
    initialRevenueGrowthRate: number;
    growthFadePeriod: number;
    terminalGrowthRate: number;
    yearsToProject: number;
    targetOperatingMargin: number;
    yearsToReachTargetMargin: number;
    reinvestmentAsPctOfRevenue: number;
    initialCostOfCapital: number;
    terminalCostOfCapital: number;
    yearsOfRiskConvergence: number;
    probabilityOfFailure: number;
    distressProceedsPctOfBookOrRevenue: number;
  };
  growthOutput: {
    intrinsicValuePerShare: string;
    verdict: string;
  };
}

const formatLargeNumber = (value: number): string => {
  if (value >= 1e12) return (value / 1e12).toFixed(2) + 'T';
  if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  return value.toLocaleString();
};

// Sort data by fiscal year in descending order (newest first)
const sortByYearDesc = <T extends { fiscalYear: number }>(data: T[]): T[] => {
  return [...data].sort((a, b) => b.fiscalYear - a.fiscalYear);
};

const GrowthTab: React.FC<GrowthTabProps> = ({ symbol }) => {
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Input fields for growth valuation
  const [initialRevenueGrowthRate, setInitialRevenueGrowthRate] = useState<number>(15);
  const [growthFadePeriod, setGrowthFadePeriod] = useState<number>(5);
  const [terminalGrowthRate, setTerminalGrowthRate] = useState<number>(2);
  const [targetOperatingMargin, setTargetOperatingMargin] = useState<number>(20);
  const [yearsToReachTargetMargin, setYearsToReachTargetMargin] = useState<number>(10);
  const [reinvestmentRate, setReinvestmentRate] = useState<number>(30);
  const [initialCostOfCapital, setInitialCostOfCapital] = useState<number>(10);
  const [terminalCostOfCapital, setTerminalCostOfCapital] = useState<number>(8);
  const [yearsOfRiskConvergence, setYearsOfRiskConvergence] = useState<number>(10);
  const [probabilityOfFailure, setProbabilityOfFailure] = useState<number>(0);
  const [distressProceeds, setDistressProceeds] = useState<number>(0);
  const [yearsToProject, setYearsToProject] = useState<number>(10);
  const [calculatedPricePerShare, setCalculatedPricePerShare] = useState<number | null>(null);
  
  // Save functionality
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // History functionality
  const [valuationHistory, setValuationHistory] = useState<GrowthHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Default values for reset
  const defaultValues = {
    initialRevenueGrowthRate: 15,
    growthFadePeriod: 5,
    terminalGrowthRate: 2,
    targetOperatingMargin: 20,
    yearsToReachTargetMargin: 10,
    reinvestmentRate: 30,
    yearsToProject: 10,
    initialCostOfCapital: 10,
    terminalCostOfCapital: 8,
    yearsOfRiskConvergence: 10,
    probabilityOfFailure: 0,
    distressProceeds: 0
  };

  const resetCalculator = () => {
    setInitialRevenueGrowthRate(defaultValues.initialRevenueGrowthRate);
    setGrowthFadePeriod(defaultValues.growthFadePeriod);
    setTerminalGrowthRate(defaultValues.terminalGrowthRate);
    setTargetOperatingMargin(defaultValues.targetOperatingMargin);
    setYearsToReachTargetMargin(defaultValues.yearsToReachTargetMargin);
    setReinvestmentRate(defaultValues.reinvestmentRate);
    setYearsToProject(defaultValues.yearsToProject);
    setInitialCostOfCapital(defaultValues.initialCostOfCapital);
    setTerminalCostOfCapital(defaultValues.terminalCostOfCapital);
    setYearsOfRiskConvergence(defaultValues.yearsOfRiskConvergence);
    setProbabilityOfFailure(defaultValues.probabilityOfFailure);
    setDistressProceeds(defaultValues.distressProceeds);
    setCalculatedPricePerShare(null);
  };

  // Load historical valuation
  const loadHistoricalValuation = (entry: GrowthHistoryEntry) => {
    // Update input states with historical data
    setInitialRevenueGrowthRate(entry.growthUserInput.initialRevenueGrowthRate);
    setGrowthFadePeriod(entry.growthUserInput.growthFadePeriod);
    setTerminalGrowthRate(entry.growthUserInput.terminalGrowthRate);
    setYearsToProject(entry.growthUserInput.yearsToProject);
    setTargetOperatingMargin(entry.growthUserInput.targetOperatingMargin);
    setYearsToReachTargetMargin(entry.growthUserInput.yearsToReachTargetMargin);
    setReinvestmentRate(entry.growthUserInput.reinvestmentAsPctOfRevenue);
    setInitialCostOfCapital(entry.growthUserInput.initialCostOfCapital);
    setTerminalCostOfCapital(entry.growthUserInput.terminalCostOfCapital);
    setYearsOfRiskConvergence(entry.growthUserInput.yearsOfRiskConvergence);
    setProbabilityOfFailure(entry.growthUserInput.probabilityOfFailure);
    setDistressProceeds(entry.growthUserInput.distressProceedsPctOfBookOrRevenue);
    
    // Set the calculated result
    setCalculatedPricePerShare(parseFloat(entry.growthOutput.intrinsicValuePerShare));
  };

  // Save functionality
  const handleSaveGrowth = async () => {
    if (calculatedPricePerShare === null || !growthData) {
      setSaveError("Cannot save before a calculation is performed.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Calculate upside/downside for verdict (matching DCF logic: +/- 20% threshold)
      const upsideDownside = ((calculatedPricePerShare - growthData.currentSharePrice) / growthData.currentSharePrice * 100);
      let verdict = "Neutral";
      if (upsideDownside > 20) verdict = "Undervalued";
      else if (upsideDownside < -20) verdict = "Overvalued";

      const payload = {
        valuationDate: new Date().toISOString(),
        growthValuationData: growthData,
        growthUserInput: {
          initialRevenueGrowthRate: initialRevenueGrowthRate,
          growthFadePeriod: growthFadePeriod,
          terminalGrowthRate: terminalGrowthRate,
          yearsToProject: yearsToProject,
          targetOperatingMargin: targetOperatingMargin,
          yearsToReachTargetMargin: yearsToReachTargetMargin,
          reinvestmentAsPctOfRevenue: reinvestmentRate,
          initialCostOfCapital: initialCostOfCapital,
          terminalCostOfCapital: terminalCostOfCapital,
          yearsOfRiskConvergence: yearsOfRiskConvergence,
          probabilityOfFailure: probabilityOfFailure,
          distressProceedsPctOfBookOrRevenue: distressProceeds
        },
        growthOutput: {
          intrinsicValuePerShare: calculatedPricePerShare.toFixed(2),
          verdict: verdict
        }
      };

      const response = await fetch(`http://localhost:8080/stock/valuation/growth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save growth valuation');
      }

      setSaveSuccess(true);
      // Reload history table after successful save
      await fetchValuationHistory(symbol);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchValuationHistory = async (currentSymbol: string) => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const historyResponse = await fetch(`http://localhost:8080/stock/valuation/growth/history/${currentSymbol}`);
      if (!historyResponse.ok && historyResponse.status !== 404) {
        throw new Error(`History data HTTP error! status: ${historyResponse.status}`);
      }
      const historyData: GrowthHistoryEntry[] = historyResponse.status === 404 ? [] : await historyResponse.json();
      // Sort historyData by valuationDate in descending order
      const sortedHistoryData = historyData.sort((a, b) => {
        return new Date(b.valuationDate).getTime() - new Date(a.valuationDate).getTime();
      });
      setValuationHistory(sortedHistoryData);
    } catch (e) {
      setHistoryError((e as Error).message);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Growth valuation calculation functions
  const calculateGrowthValuation = () => {
    if (!growthData) return;

    const projectRevenue = (currentRevenue: number, year: number): number => {
      const nearTermYears = 3; // Near-term years 1-3
      let growthRate: number;
      
      if (year <= nearTermYears) {
        growthRate = initialRevenueGrowthRate / 100;
      } else if (year <= nearTermYears + growthFadePeriod) {
        const fadeYears = year - nearTermYears;
        growthRate = (initialRevenueGrowthRate / 100) - ((initialRevenueGrowthRate / 100 - terminalGrowthRate / 100) / growthFadePeriod) * fadeYears;
      } else {
        growthRate = terminalGrowthRate / 100;
      }
      
      return currentRevenue * (1 + growthRate);
    };

    const projectOperatingMargin = (currentMargin: number, year: number): number => {
      if (year >= yearsToReachTargetMargin) return targetOperatingMargin / 100;
      return currentMargin + (targetOperatingMargin / 100 - currentMargin) / yearsToReachTargetMargin * year;
    };

    const computeFCF = (revenue: number, operatingMargin: number): number => {
      const operatingIncome = revenue * operatingMargin;
      return operatingIncome * (1 - growthData.marginalTaxRate) - revenue * (reinvestmentRate / 100);
    };

    const discountRate = (year: number): number => {
      if (year >= yearsOfRiskConvergence) return terminalCostOfCapital / 100;
      return (initialCostOfCapital / 100) - ((initialCostOfCapital / 100 - terminalCostOfCapital / 100) / yearsOfRiskConvergence) * year;
    };

    const discountedFCF = (fcf: number, year: number): number => {
      const rate = discountRate(year);
      return fcf / Math.pow(1 + rate, year);
    };

    const terminalValue = (finalFCF: number): number => {
      return finalFCF * (1 + terminalGrowthRate / 100) / ((terminalCostOfCapital / 100) - (terminalGrowthRate / 100));
    };

    const calculateEquityValue = (currentRevenue: number, currentMargin: number, totalYears: number): number => {
      let revenue = currentRevenue;
      let equityValue = 0;
      let fcf = 0;

      for (let year = 1; year <= totalYears; year++) {
        revenue = projectRevenue(revenue, year);
        const margin = projectOperatingMargin(currentMargin, year);
        fcf = computeFCF(revenue, margin);
        equityValue += discountedFCF(fcf, year);
      }

      const terminalVal = terminalValue(fcf);
      equityValue += terminalVal / Math.pow(1 + discountRate(totalYears), totalYears);

      // Adjust for failure
      equityValue = (1 - probabilityOfFailure / 100) * equityValue + (probabilityOfFailure / 100) * distressProceeds;

      // Subtract debt, add cash
      return (equityValue - growthData.totalDebt + growthData.cashBalance) / growthData.commonSharesOutstanding;
    };

    // Get current data (latest year)
    const sortedStatements = [...growthData.incomeStatements].sort((a, b) => a.fiscalYear - b.fiscalYear);
    const latestStatement = sortedStatements[sortedStatements.length - 1];
    const currentRevenue = latestStatement.revenue;
    const currentMargin = latestStatement.operatingIncome / currentRevenue;

    const pricePerShare = calculateEquityValue(currentRevenue, currentMargin, yearsToProject);
    setCalculatedPricePerShare(pricePerShare);
  };

  useEffect(() => {
    const fetchGrowthData = async () => {
      if (!symbol) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:8080/stock/valuation/growth/${symbol.toUpperCase()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: GrowthData = await response.json();
        setGrowthData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
    fetchValuationHistory(symbol);
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-500">Loading growth data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Error loading growth data: {error}
      </div>
    );
  }

  if (!growthData) {
    return (
      <div className="text-center p-4 text-gray-500">
        No growth data available.
      </div>
    );
  }

  // Sort data by fiscal year in descending order
  const sortedIncomeStatements = sortByYearDesc(growthData.incomeStatements);
  const sortedBalanceSheets = sortByYearDesc(growthData.balanceSheets);
  const sortedCashFlows = sortByYearDesc(growthData.cashFlows);

  // Get all unique years from all three datasets for aligned columns
  const allYears = Array.from(new Set([
    ...growthData.incomeStatements.map(s => s.fiscalYear),
    ...growthData.balanceSheets.map(s => s.fiscalYear),
    ...growthData.cashFlows.map(s => s.fiscalYear)
  ])).sort((a, b) => b - a);

  // Create lookup maps for each dataset
  const incomeMap = new Map(sortedIncomeStatements.map(s => [s.fiscalYear, s]));
  const balanceMap = new Map(sortedBalanceSheets.map(s => [s.fiscalYear, s]));
  const cashFlowMap = new Map(sortedCashFlows.map(s => [s.fiscalYear, s]));

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Growth Calculator for {growthData.name} ({growthData.ticker})
      </h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <span className="text-gray-600 font-medium">Sector:</span>
          <span className="ml-2 text-gray-900">{growthData.sector}</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <span className="text-gray-600 font-medium">Industry:</span>
          <span className="ml-2 text-gray-900">{growthData.industry}</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <span className="text-gray-600 font-medium">Market Cap:</span>
          <span className="ml-2 text-gray-900">{formatLargeNumber(growthData.marketCapitalization)}</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <span className="text-gray-600 font-medium">Risk-Free Rate:</span>
          <span className="ml-2 text-gray-900">{(growthData.riskFreeRate * 100).toFixed(2)}%</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <span className="text-gray-600 font-medium">Total Debt:</span>
          <span className="ml-2 text-gray-900">{formatLargeNumber(growthData.totalDebt)}</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <span className="text-gray-600 font-medium">Cash Balance:</span>
          <span className="ml-2 text-gray-900">{formatLargeNumber(growthData.cashBalance)}</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <span className="text-gray-600 font-medium">Marginal Tax Rate:</span>
          <span className="ml-2 text-gray-900">{(growthData.marginalTaxRate * 100).toFixed(2)}%</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <span className="text-gray-600 font-medium">Shares Outstanding:</span>
          <span className="ml-2 text-gray-900">{formatLargeNumber(growthData.commonSharesOutstanding)}</span>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-bold mb-4">Growth Valuation Parameters</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Initial Revenue Growth Rate (%)
              <InfoIcon description={metricDescriptions.growthInputs.initialRevenueGrowthRate} />
            </label>
            <input
              type="number"
              value={initialRevenueGrowthRate}
              onChange={(e) => setInitialRevenueGrowthRate(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Growth Fade Period (years)
              <InfoIcon description={metricDescriptions.growthInputs.growthFadePeriod} />
            </label>
            <input
              type="number"
              value={growthFadePeriod}
              onChange={(e) => setGrowthFadePeriod(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Terminal Growth Rate (%)
              <InfoIcon description={`${metricDescriptions.growthInputs.terminalGrowthRate} Must be ≤ risk-free rate (${(growthData.riskFreeRate * 100).toFixed(2)}%)`} />
            </label>
            <input
              type="number"
              value={terminalGrowthRate}
              onChange={(e) => setTerminalGrowthRate(parseFloat(e.target.value))}
              max={growthData.riskFreeRate * 100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Years to Project
              <InfoIcon description={metricDescriptions.growthInputs.yearsToProject} />
            </label>
            <input
              type="number"
              value={yearsToProject}
              onChange={(e) => setYearsToProject(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Target Operating Margin (%)
              <InfoIcon description={metricDescriptions.growthInputs.targetOperatingMargin} />
            </label>
            <input
              type="number"
              value={targetOperatingMargin}
              onChange={(e) => setTargetOperatingMargin(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Years to Reach Target Margin
              <InfoIcon description={metricDescriptions.growthInputs.yearsToReachTargetMargin} />
            </label>
            <input
              type="number"
              value={yearsToReachTargetMargin}
              onChange={(e) => setYearsToReachTargetMargin(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Reinvestment as % of Revenue
              <InfoIcon description={metricDescriptions.growthInputs.reinvestmentRate} />
            </label>
            <input
              type="number"
              value={reinvestmentRate}
              onChange={(e) => setReinvestmentRate(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Initial Cost of Capital (%)
              <InfoIcon description={metricDescriptions.growthInputs.initialCostOfCapital} />
            </label>
            <input
              type="number"
              value={initialCostOfCapital}
              onChange={(e) => setInitialCostOfCapital(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Terminal Cost of Capital (%)
              <InfoIcon description={metricDescriptions.growthInputs.terminalCostOfCapital} />
            </label>
            <input
              type="number"
              value={terminalCostOfCapital}
              onChange={(e) => setTerminalCostOfCapital(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Years of Risk Convergence
              <InfoIcon description={metricDescriptions.growthInputs.yearsOfRiskConvergence} />
            </label>
            <input
              type="number"
              value={yearsOfRiskConvergence}
              onChange={(e) => setYearsOfRiskConvergence(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Probability of Failure (%)
              <InfoIcon description={metricDescriptions.growthInputs.probabilityOfFailure} />
            </label>
            <input
              type="number"
              value={probabilityOfFailure}
              onChange={(e) => setProbabilityOfFailure(parseFloat(e.target.value))}
              min={0}
              max={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Distress Proceeds (% of book or revenue)
              <InfoIcon description={metricDescriptions.growthInputs.distressProceeds} />
            </label>
            <input
              type="number"
              value={distressProceeds}
              onChange={(e) => setDistressProceeds(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={calculateGrowthValuation}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Calculate
          </button>
          <button
            onClick={resetCalculator}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Reset Calculator
          </button>
          <button
            onClick={handleSaveGrowth}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400"
            disabled={isSaving || calculatedPricePerShare === null}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          {saveSuccess && <span className="ml-4 text-green-500">Saved successfully!</span>}
          {saveError && <span className="ml-4 text-red-500">Error: {saveError}</span>}
        </div>

        {calculatedPricePerShare !== null && growthData && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-lg font-bold text-green-800 mb-2">Calculated Valuation</h4>
            {(() => {
              const percentageDifference = (calculatedPricePerShare - growthData.currentSharePrice) / growthData.currentSharePrice;
              let verdictText = '';
              let bgColorClass = '';
              
              if (percentageDifference > 0.20) {
                verdictText = 'Undervalued';
                bgColorClass = 'bg-green-200 text-green-800';
              } else if (percentageDifference < -0.20) {
                verdictText = 'Overvalued';
                bgColorClass = 'bg-red-200 text-red-800';
              } else {
                verdictText = 'Neutral';
                bgColorClass = 'bg-yellow-200 text-yellow-800';
              }
              
              return (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Intrinsic Value per Share:</span>
                    <span className="text-2xl font-bold text-green-600">${calculatedPricePerShare.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <span className="text-gray-600">Current Market Price:</span>
                    <span className="text-gray-800">${growthData.currentSharePrice.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <span className="text-gray-600">Upside/Downside:</span>
                    <span className={`font-bold ${percentageDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(percentageDifference * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 rounded font-semibold ${bgColorClass}`}>
                      <strong>Verdict:</strong> {verdictText}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {valuationHistory.length > 0 ? (
                  valuationHistory.map((entry, index) => (
                    <tr key={index} onClick={() => loadHistoricalValuation(entry)} className="cursor-pointer hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entry.valuationDate).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.growthOutput.intrinsicValuePerShare}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.growthValuationData.currentSharePrice.toFixed(2)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                        entry.growthOutput.verdict === 'Undervalued' ? 'bg-green-200 text-green-800' : 
                        entry.growthOutput.verdict === 'Overvalued' ? 'bg-red-200 text-red-800' : 
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {entry.growthOutput.verdict}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4">No valuation history found for this stock.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">Income Statements</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                {allYears.map((year) => (
                  <th key={year} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Revenue</td>
                {allYears.map((year) => {
                  const data = incomeMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.revenue) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Operating Income</td>
                {allYears.map((year) => {
                  const data = incomeMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.operatingIncome) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pre-tax Income</td>
                {allYears.map((year) => {
                  const data = incomeMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.pretaxIncome) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Net Income</td>
                {allYears.map((year) => {
                  const data = incomeMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.netIncome) : '-'}</td>;
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">Balance Sheets</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                {allYears.map((year) => (
                  <th key={year} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Cash & Equivalents</td>
                {allYears.map((year) => {
                  const data = balanceMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.cashAndEquivalents) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Short-term Debt</td>
                {allYears.map((year) => {
                  const data = balanceMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.shortTermDebt) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Long-term Debt</td>
                {allYears.map((year) => {
                  const data = balanceMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.longTermDebt) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Assets</td>
                {allYears.map((year) => {
                  const data = balanceMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.totalAssets) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Equity</td>
                {allYears.map((year) => {
                  const data = balanceMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.totalEquity) : '-'}</td>;
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">Cash Flows</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                {allYears.map((year) => (
                  <th key={year} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Operating Cash Flow</td>
                {allYears.map((year) => {
                  const data = cashFlowMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.operatingCashFlow) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Capital Expenditures</td>
                {allYears.map((year) => {
                  const data = cashFlowMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.capitalExpenditures) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Depreciation & Amortization</td>
                {allYears.map((year) => {
                  const data = cashFlowMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.depreciationAndAmortization) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Change in Working Capital</td>
                {allYears.map((year) => {
                  const data = cashFlowMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.changeInWorkingCapital) : '-'}</td>;
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default GrowthTab;
