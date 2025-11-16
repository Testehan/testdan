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
    marginalTaxRate: number;
  };
  growthOutput: {
    intrinsicValuePerShare: string;
    verdict: string;
  };
}

interface GrowthValuationResponse {
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
    marginalTaxRate: number;
  };
  growthOutput: {
    intrinsicValuePerShare: string;
    verdict: string;
  };
}

const formatLargeNumber = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1e12) return (value / 1e12).toFixed(2) + 'T';
  if (absValue >= 1e9) return (value / 1e9).toFixed(2) + 'B';
  if (absValue >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  return value.toLocaleString();
};

// Sort data by fiscal year in descending order (newest first)
const sortByYearDesc = <T extends { fiscalYear: number }>(data: T[]): T[] => {
  return [...data].sort((a, b) => b.fiscalYear - a.fiscalYear);
};

const dprnAndAmortizationBenchmarks: { [key: string]: number } = {
  'Software / Internet / Tech Services': 0.035, // 3.5%
  'Consumer Goods / Retail (non-heavy)': 0.045, // 4.5%
  'Advertising / Marketing': 0.03, // 3%
  'Pharmaceuticals / Biotech (mature)': 0.06, // 6%
  'Industrials / Manufacturing': 0.06, // 6%
  'Auto & Truck / Capital Goods': 0.07, // 7%
  'Telecom': 0.115, // 11.5%
  'Utilities / Electric': 0.095, // 9.5%
  'Oil & Gas / Energy (integrated/exploration)': 0.095, // 9.5%
  'Air Transport / Airlines': 0.09, // 9%
  'Real Estate / REITs': 0.075, // 7.5%
  'Technology': 0.035, // Default for broad 'Technology' sector
  'Consumer Cyclical': 0.045, // Default for broad 'Consumer Cyclical'
  'Consumer Defensive': 0.045, // Default for broad 'Consumer Defensive'
  'Healthcare': 0.06, // Default for broad 'Healthcare'
  'Basic Materials': 0.06, // Default for broad 'Basic Materials'
  'Financial Services': 0.01, // Asset-light, often low D&A
  'Communication Services': 0.115, // Similar to Telecom
  'Energy': 0.095, // Similar to Oil & Gas
  'Utilities': 0.095, // Similar to Utilities / Electric
  'Industrials': 0.06, // Similar to Industrials / Manufacturing
  'Real Estate': 0.075, // Similar to Real Estate / REITs
  'Unknown': 0.05, // Fallback for uncategorized
};

const capexBenchmarks: { [key: string]: number } = {
  'Software / Internet / Tech Services': 0.02, // 2%
  'Consumer Goods / Retail (non-heavy)': 0.045, // 4.5%
  'Advertising / Marketing': 0.015, // 1.5%
  'Pharmaceuticals / Biotech (mature)': 0.05, // 5%
  'Industrials / Manufacturing': 0.07, // 7%
  'Auto & Truck / Capital Goods': 0.08, // 8%
  'Telecom': 0.12, // 12%
  'Utilities / Electric': 0.1, // 10%
  'Oil & Gas / Energy (integrated/exploration)': 0.12, // 12%
  'Air Transport / Airlines': 0.1, // 10%
  'Real Estate / REITs': 0.08, // 8%
  'Technology': 0.02,
  'Consumer Cyclical': 0.045,
  'Consumer Defensive': 0.045,
  'Healthcare': 0.05,
  'Basic Materials': 0.07,
  'Financial Services': 0.01,
  'Communication Services': 0.12,
  'Energy': 0.12,
  'Utilities': 0.1,
  'Industrials': 0.07,
  'Real Estate': 0.08,
  'Unknown': 0.05, // Fallback
};

const deltaNwcBenchmarks: { [key: string]: number } = {
  'Software / Internet / Tech Services': 0.005,     // 0.5% — often near-zero or negative due to deferred revenue/subscriptions
  'Consumer Goods / Retail (non-heavy)': 0.01,      // 1.0% — moderate inventory/receivables needs
  'Advertising / Marketing': 0.005,                 // 0.5% — asset-light, low WC intensity
  'Pharmaceuticals / Biotech (mature)': 0.008,      // 0.8% — some receivables, but efficient mature ops
  'Industrials / Manufacturing': 0.015,             // 1.5% — inventory + receivables typical
  'Auto & Truck / Capital Goods': 0.02,             // 2.0% — higher inventory and supply chain
  'Telecom': 0.01,                                  // 1.0% — stable, regulated ops with moderate WC
  'Utilities / Electric': 0.005,                    // 0.5% — very low incremental needs once built
  'Oil & Gas / Energy (integrated/exploration)': 0.015, // 1.5% — moderate due to inventory/cycles
  'Air Transport / Airlines': 0.015,                // 1.5% — fuel/inventory + receivables
  'Real Estate / REITs': 0.01,                      // 1.0% — property-focused, low operating WC
  'Technology': 0.005,                              // 0.5% — broad tech, asset-light bias
  'Consumer Cyclical': 0.012,                       // 1.2% — retail/discretionary variability
  'Consumer Defensive': 0.008,                      // 0.8% — staples are efficient/stable
  'Healthcare': 0.008,                              // 0.8% — similar to pharma/biotech mature
  'Basic Materials': 0.015,                         // 1.5% — inventory-heavy
  'Financial Services': 0.002,                      // 0.2% — often minimal/non-positive WC needs
  'Communication Services': 0.01,                   // 1.0% — telecom/media mix
  'Energy': 0.015,                                  // 1.5% — broad energy
  'Utilities': 0.005,                               // 0.5% — infrastructure-heavy, low incremental
  'Industrials': 0.015,                             // 1.5% — manufacturing/capital goods
  'Real Estate': 0.01,                              // 1.0% — REIT/property
  'Unknown': 0.01                                   // 1.0% — fallback conservative default
};

const GrowthTab: React.FC<GrowthTabProps> = ({ symbol }) => {  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
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
  const [marginalTaxRateInput, setMarginalTaxRateInput] = useState<number>(0.25);
  const [calculatedPricePerShare, setCalculatedPricePerShare] = useState<number | null>(null);
  
  // Store original server values for reset
  const [serverGrowthUserInput, setServerGrowthUserInput] = useState<GrowthValuationResponse['growthUserInput'] | null>(null);
  
  // Save functionality
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // History functionality
  const [valuationHistory, setValuationHistory] = useState<GrowthHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const resetCalculator = () => {
    if (serverGrowthUserInput) {
      // Reset to server values
      setInitialRevenueGrowthRate(serverGrowthUserInput.initialRevenueGrowthRate);
      setGrowthFadePeriod(serverGrowthUserInput.growthFadePeriod);
      setTerminalGrowthRate(serverGrowthUserInput.terminalGrowthRate);
      setYearsToProject(serverGrowthUserInput.yearsToProject);
      setTargetOperatingMargin(serverGrowthUserInput.targetOperatingMargin);
      setYearsToReachTargetMargin(serverGrowthUserInput.yearsToReachTargetMargin);
      // Server sends reinvestmentAsPctOfRevenue as decimal (0.14), convert to percentage (14) for UI
      setReinvestmentRate(serverGrowthUserInput.reinvestmentAsPctOfRevenue * 100);
      setInitialCostOfCapital(serverGrowthUserInput.initialCostOfCapital);
      setTerminalCostOfCapital(serverGrowthUserInput.terminalCostOfCapital);
      setYearsOfRiskConvergence(serverGrowthUserInput.yearsOfRiskConvergence);
      setProbabilityOfFailure(serverGrowthUserInput.probabilityOfFailure);
      setDistressProceeds(serverGrowthUserInput.distressProceedsPctOfBookOrRevenue);
      setMarginalTaxRateInput(serverGrowthUserInput.marginalTaxRate);
    }

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
    setMarginalTaxRateInput(entry.growthUserInput.marginalTaxRate);
    
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

      // Create modified growth data with user-input values
      const modifiedGrowthData = {
        ...growthData
      };

      const payload = {
        valuationDate: new Date().toISOString(),
        growthValuationData: modifiedGrowthData,
        growthUserInput: {
          initialRevenueGrowthRate: initialRevenueGrowthRate,
          growthFadePeriod: growthFadePeriod,
          terminalGrowthRate: terminalGrowthRate,
          yearsToProject: yearsToProject,
          targetOperatingMargin: targetOperatingMargin,
          yearsToReachTargetMargin: yearsToReachTargetMargin,
          reinvestmentAsPctOfRevenue: reinvestmentRate / 100,
          initialCostOfCapital: initialCostOfCapital,
          terminalCostOfCapital: terminalCostOfCapital,
          yearsOfRiskConvergence: yearsOfRiskConvergence,
          probabilityOfFailure: probabilityOfFailure,
          distressProceedsPctOfBookOrRevenue: distressProceeds,
          marginalTaxRate: marginalTaxRateInput,
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

  // Growth valuation calculation - calls server API
  const calculateGrowthValuation = async () => {
    if (!growthData || !symbol) return;

    try {
      const sortedStatements = [...growthData.incomeStatements].sort((a, b) => a.fiscalYear - b.fiscalYear);
      const latestStatement = sortedStatements[sortedStatements.length - 1];
      
      // Create modified growth data with user-input values
      const modifiedGrowthData = {
        ...growthData
      };

      const growthValuationPayload = {
        valuationDate: new Date().toISOString(),
        growthValuationData: modifiedGrowthData,
        growthUserInput: {
          initialRevenueGrowthRate,
          growthFadePeriod,
          terminalGrowthRate,
          yearsToProject,
          targetOperatingMargin,
          yearsToReachTargetMargin,
          reinvestmentAsPctOfRevenue: reinvestmentRate / 100,
          initialCostOfCapital,
          terminalCostOfCapital,
          yearsOfRiskConvergence,
          probabilityOfFailure,
          distressProceedsPctOfBookOrRevenue: distressProceeds,
          marginalTaxRate: marginalTaxRateInput,
          // Add current year data needed for calculation
          currentRevenue: latestStatement.revenue,
          currentOperatingMargin: latestStatement.operatingIncome / latestStatement.revenue
        },
        growthOutput: {
          intrinsicValuePerShare: "0.00",
          verdict: "Neutral"
        }
      };

      const response = await fetch(`http://localhost:8080/stock/valuation/calculate/growth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(growthValuationPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // Handle both possible response formats
      const value = result.calculatedPricePerShare !== undefined ? result.calculatedPricePerShare : 
                    result.intrinsicValuePerShare !== undefined ? parseFloat(result.intrinsicValuePerShare) : null;
      setCalculatedPricePerShare(value);
    } catch (error) {
      console.error('Failed to calculate growth valuation:', error);
      setSaveError((error as Error).message);
    }
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
        const responseData: GrowthValuationResponse = await response.json();
        // Extract the growthValuationData from the response
        const data = responseData.growthValuationData;
        setGrowthData(data);
        // Store original server values for reset
        setServerGrowthUserInput(responseData.growthUserInput);
        // Initialize input fields from fetched data (use growthUserInput)
        setInitialRevenueGrowthRate(responseData.growthUserInput.initialRevenueGrowthRate);
        setGrowthFadePeriod(responseData.growthUserInput.growthFadePeriod);
        setTerminalGrowthRate(responseData.growthUserInput.terminalGrowthRate);
        setYearsToProject(responseData.growthUserInput.yearsToProject);
        setTargetOperatingMargin(responseData.growthUserInput.targetOperatingMargin);
        setYearsToReachTargetMargin(responseData.growthUserInput.yearsToReachTargetMargin);
        // Server sends reinvestmentAsPctOfRevenue as decimal (0.14), convert to percentage (14) for UI
        setReinvestmentRate(responseData.growthUserInput.reinvestmentAsPctOfRevenue * 100);
        setInitialCostOfCapital(responseData.growthUserInput.initialCostOfCapital);
        setTerminalCostOfCapital(responseData.growthUserInput.terminalCostOfCapital);
        setYearsOfRiskConvergence(responseData.growthUserInput.yearsOfRiskConvergence);
        setProbabilityOfFailure(responseData.growthUserInput.probabilityOfFailure);
        setDistressProceeds(responseData.growthUserInput.distressProceedsPctOfBookOrRevenue);
        setMarginalTaxRateInput(responseData.growthUserInput.marginalTaxRate);
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

  // Calculate projected year and revenue based on Growth Fade Period
  const currentYear = new Date().getFullYear();
  const projectedYear = currentYear + growthFadePeriod;
  const latestStatement = sortedIncomeStatements.reduce((latest, current) => 
    current.fiscalYear > latest.fiscalYear ? current : latest, sortedIncomeStatements[0]);
  const currentRevenue = latestStatement?.revenue || 0;
  const growthRateDecimal = initialRevenueGrowthRate / 100;
  const projectedRevenue = currentRevenue * Math.pow(1 + growthRateDecimal, growthFadePeriod);
  
  // Calculate projected income statement values using target operating margin and marginal tax rate
  const projectedOperatingIncome = projectedRevenue * (targetOperatingMargin / 100);
  const projectedPretaxIncome = projectedOperatingIncome;
  const projectedNetIncome = projectedPretaxIncome * (1 - marginalTaxRateInput);

  let averageDprnAndAmortizationAsPctOfRevenue = 0;
  let averageChangeInWcAsPctOfRevenue = 0;

  const numHistoricalYears = Math.min(sortedIncomeStatements.length, sortedCashFlows.length);
  let dprnAndAmortizationRatios: number[] = [];
  let changeInWcRatios: number[] = [];

  for (let i = 0; i < numHistoricalYears; i++) {
    const incomeStatement = sortedIncomeStatements[i];
    const cashFlow = sortedCashFlows[i];

    if (incomeStatement && cashFlow && incomeStatement.revenue !== 0) {
      // D&A as % of Revenue
      dprnAndAmortizationRatios.push(cashFlow.depreciationAndAmortization / incomeStatement.revenue);
      
      // Change in Working Capital as % of Revenue
      changeInWcRatios.push(cashFlow.changeInWorkingCapital / incomeStatement.revenue);
    }
  }

  if (dprnAndAmortizationRatios.length > 0) {
    averageDprnAndAmortizationAsPctOfRevenue = dprnAndAmortizationRatios.reduce((sum, ratio) => sum + ratio, 0) / dprnAndAmortizationRatios.length;
  }

  if (changeInWcRatios.length > 0) {
    averageChangeInWcAsPctOfRevenue = changeInWcRatios.reduce((sum, ratio) => sum + ratio, 0) / changeInWcRatios.length;
  }

  // Determine target D&A % based on sector for mature phase
  const targetDprnAsPctOfRevenue = dprnAndAmortizationBenchmarks[growthData.sector] || dprnAndAmortizationBenchmarks[growthData.industry] || dprnAndAmortizationBenchmarks['Unknown'];

  // Projected Cash Flow items
  const projectedDepreciationAndAmortization = projectedRevenue * targetDprnAsPctOfRevenue; // Use target for projected year
  // Determine target NWC Change % based on sector for mature phase
  const targetNwcChangeAsPctOfRevenue = deltaNwcBenchmarks[growthData.sector] || deltaNwcBenchmarks[growthData.industry] || deltaNwcBenchmarks['Unknown'];
  const projectedChangeInWorkingCapital = projectedRevenue * targetNwcChangeAsPctOfRevenue; // Use target for projected year
  const projectedOperatingCashFlow = projectedNetIncome + projectedDepreciationAndAmortization - projectedChangeInWorkingCapital;
  // Determine target CapEx % based on sector for mature phase
  const targetCapexAsPctOfRevenue = capexBenchmarks[growthData.sector] || capexBenchmarks[growthData.industry] || capexBenchmarks['Unknown'];
  const projectedCapitalExpenditures = projectedRevenue * targetCapexAsPctOfRevenue; // Use target for projected year

  // Add projected year to the years array for display
  const displayYears = [projectedYear, ...allYears];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Growth Calculator for {growthData.name} ({growthData.ticker})
      </h2>
      
      <div className="grid grid-cols-2 gap-2 mb-6">
        <div><strong>Sector:</strong> {growthData.sector}</div>
        <div><strong>Industry:</strong> {growthData.industry}</div>
        <div><strong>Market Cap:</strong> {formatLargeNumber(growthData.marketCapitalization)}</div>
        <div><strong>Total Debt:</strong> {formatLargeNumber(growthData.totalDebt)}</div>
        <div><strong>Cash Balance:</strong> {formatLargeNumber(growthData.cashBalance)}</div>
        <div><strong>Shares Outstanding:</strong> {formatLargeNumber(growthData.commonSharesOutstanding)}</div>
        <div><strong>Risk-Free Rate:</strong> {(growthData.riskFreeRate * 100).toFixed(2)}%</div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-bold mb-4">Growth Valuation Parameters</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Marginal Tax Rate (%)
              <InfoIcon description="The tax rate applied to the company's last dollar of income. Used to calculate the after-tax cost of debt and other tax-adjusted metrics." />
            </label>
            <input
              type="number"
              step="0.01"
              value={(marginalTaxRateInput * 100).toFixed(2)}
              onChange={(e) => setMarginalTaxRateInput(parseFloat(e.target.value) / 100)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Initial Revenue Growth Rate (%)
              <InfoIcon description={metricDescriptions.growthInputs.initialRevenueGrowthRate} />
            </label>
            <input
              type="number"
              step="0.01"
              value={initialRevenueGrowthRate.toFixed(2)}
              onChange={(e) => setInitialRevenueGrowthRate(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Terminal Growth Rate (%)
              <InfoIcon description={`${metricDescriptions.growthInputs.terminalGrowthRate} Must be ≤ risk-free rate (${(growthData.riskFreeRate * 100).toFixed(2)}%)`} />
            </label>
            <input
              type="number"
              step="0.01"
              value={terminalGrowthRate.toFixed(2)}
              onChange={(e) => setTerminalGrowthRate(parseFloat(e.target.value))}
              max={growthData.riskFreeRate * 100}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Target Operating Margin (%)
              <InfoIcon description={metricDescriptions.growthInputs.targetOperatingMargin} />
            </label>
            <input
              type="number"
              step="0.01"
              value={targetOperatingMargin.toFixed(2)}
              onChange={(e) => setTargetOperatingMargin(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Reinvestment Rate (%)
              <InfoIcon description={metricDescriptions.growthInputs.reinvestmentRate} />
            </label>
            <input
              type="number"
              step="0.01"
              value={reinvestmentRate.toFixed(2)}
              onChange={(e) => setReinvestmentRate(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Initial Cost of Capital (%)
              <InfoIcon description={metricDescriptions.growthInputs.initialCostOfCapital} />
            </label>
            <input
              type="number"
              step="0.01"
              value={initialCostOfCapital.toFixed(2)}
              onChange={(e) => setInitialCostOfCapital(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Terminal Cost of Capital (%)
              <InfoIcon description={metricDescriptions.growthInputs.terminalCostOfCapital} />
            </label>
            <input
              type="number"
              step="0.01"
              value={terminalCostOfCapital.toFixed(2)}
              onChange={(e) => setTerminalCostOfCapital(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Probability of Failure (%)
              <InfoIcon description={metricDescriptions.growthInputs.probabilityOfFailure} />
            </label>
            <input
              type="number"
              step="0.01"
              value={probabilityOfFailure.toFixed(2)}
              onChange={(e) => setProbabilityOfFailure(parseFloat(e.target.value))}
              min={0}
              max={100}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Distress Proceeds (% of book or revenue)
              <InfoIcon description={metricDescriptions.growthInputs.distressProceeds} />
            </label>
            <input
              type="number"
              step="0.01"
              value={distressProceeds.toFixed(2)}
              onChange={(e) => setDistressProceeds(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
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

        {calculatedPricePerShare !== null && calculatedPricePerShare !== undefined && !isNaN(calculatedPricePerShare as number) && growthData && (
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
                {displayYears.map((year) => (
                  <th key={year} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${year === projectedYear ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}>
                    {year === projectedYear ? `${year} (Proj)` : year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Revenue</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 bg-blue-50">{formatLargeNumber(projectedRevenue)}</td>;
                  }
                  const data = incomeMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.revenue) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Operating Income</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 bg-blue-50">{formatLargeNumber(projectedOperatingIncome)}</td>;
                  }
                  const data = incomeMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.operatingIncome) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pre-tax Income</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 bg-blue-50">{formatLargeNumber(projectedPretaxIncome)}</td>;
                  }
                  const data = incomeMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.pretaxIncome) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Net Income</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 bg-blue-50">{formatLargeNumber(projectedNetIncome)}</td>;
                  }
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
                {displayYears.map((year) => (
                  <th key={year} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${year === projectedYear ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}>
                    {year === projectedYear ? `${year} (Proj)` : year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Cash & Equivalents</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 bg-blue-50">-</td>;
                  }
                  const data = balanceMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.cashAndEquivalents) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Short-term Debt</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 bg-blue-50">-</td>;
                  }
                  const data = balanceMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.shortTermDebt) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Long-term Debt</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 bg-blue-50">-</td>;
                  }
                  const data = balanceMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.longTermDebt) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Assets</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 bg-blue-50">-</td>;
                  }
                  const data = balanceMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.totalAssets) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Equity</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 bg-blue-50">-</td>;
                  }
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
                {displayYears.map((year) => (
                  <th key={year} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${year === projectedYear ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}>
                    {year === projectedYear ? `${year} (Proj)` : year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Operating Cash Flow</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 bg-blue-50">{formatLargeNumber(projectedOperatingCashFlow)}</td>;
                  }
                  const data = cashFlowMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.operatingCashFlow) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Capital Expenditures</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 bg-blue-50">{formatLargeNumber(projectedCapitalExpenditures)}</td>;
                  }
                  const data = cashFlowMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.capitalExpenditures) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Depreciation & Amortization</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 bg-blue-50">{formatLargeNumber(projectedDepreciationAndAmortization)}</td>;
                  }
                  const data = cashFlowMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.depreciationAndAmortization) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Change in Working Capital</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 bg-blue-50">{formatLargeNumber(projectedChangeInWorkingCapital)}</td>;
                  }
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
