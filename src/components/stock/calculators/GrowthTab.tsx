import React, { useState, useEffect } from 'react';
import InfoIcon from '../shared/components/InfoIcon';
import { metricDescriptions } from '../shared/utils/metricDescriptions';
import HistoryTable from '../common/HistoryTable';
import { useDeleteConfirmation } from '../common/DeleteConfirmationDialog';
import { useValuationHistory } from '../hooks/useValuation';
import { formatLargeNumber } from '../shared/utils/valuation';
import Spinner from '../shared/components/Spinner';
import { STOCKS_ENDPOINT } from '../../../config';

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
    userComments: string;
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
    userComments: string;
  };
  growthOutput: {
    intrinsicValuePerShare: string;
    verdict: string;
  };
}

const sortByYearDesc = <T extends { fiscalYear: number }>(data: T[]): T[] => {
  return [...data].sort((a, b) => b.fiscalYear - a.fiscalYear);
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
  const [userComments, setUserComments] = useState<string>('');
  const [calculatedPricePerShare, setCalculatedPricePerShare] = useState<number | null>(null);

  // AI recommendation states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiElapsedTime, setAiElapsedTime] = useState(0);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [aiScenario, setAiScenario] = useState<'bear' | 'base' | 'bull'>('base');

  // Helper to render description with AI explanation if available
  const renderDescription = (key: string, baseDescription: string) => {
    const aiExp = aiExplanations[key];
    if (aiExp) {
      return (
        <div className="max-w-xs">
          <p>{baseDescription}</p>
          <div className="mt-2 pt-2 border-t border-purple-500/30">
            <p className="text-purple-600 font-bold flex items-center gap-1 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Recommendation
            </p>
            <p className="italic text-white font-medium text-xs leading-relaxed">{aiExp}</p>
          </div>
        </div>
      );
    }
    return baseDescription;
  };

  const handleAiCompletion = async () => {
    if (!symbol) return;
    setAiLoading(true);
    setAiElapsedTime(0);
    setSaveError(null);
    
    // Start elapsed time counter
    const startTime = Date.now();
    const timer = setInterval(() => {
      setAiElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      const response = await fetch(`${STOCKS_ENDPOINT}/valuation/growth/recommendation/${symbol.toUpperCase()}/${aiScenario}`);
      if (!response.ok) {
        throw new Error(`AI recommendation HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Update input fields
      setInitialRevenueGrowthRate(data.initialRevenueGrowthRate);
      setGrowthFadePeriod(data.growthFadePeriod);
      setTerminalGrowthRate(data.terminalGrowthRate);
      setYearsToProject(data.yearsToProject);
      setTargetOperatingMargin(data.targetOperatingMargin);
      setYearsToReachTargetMargin(data.yearsToReachTargetMargin);
      setReinvestmentRate(data.reinvestmentAsPctOfRevenue);
      setInitialCostOfCapital(data.initialCostOfCapital);
      setTerminalCostOfCapital(data.terminalCostOfCapital);
      setYearsOfRiskConvergence(data.yearsOfRiskConvergence);
      setProbabilityOfFailure(data.probabilityOfFailure);
      setDistressProceeds(data.distressProceedsPctOfBookOrRevenue);
      setMarginalTaxRateInput(data.marginalTaxRate / 100);
      setUserComments(data.userComments || '');

      // Store explanations
      setAiExplanations({
        initialRevenueGrowthRate: data.initialRevenueGrowthRateExplanation,
        growthFadePeriod: data.growthFadePeriodExplanation,
        terminalGrowthRate: data.terminalGrowthRateExplanation,
        yearsToProject: data.yearsToProjectExplanation,
        targetOperatingMargin: data.targetOperatingMarginExplanation,
        yearsToReachTargetMargin: data.yearsToReachTargetMarginExplanation,
        reinvestmentRate: data.reinvestmentAsPctOfRevenueExplanation,
        initialCostOfCapital: data.initialCostOfCapitalExplanation,
        terminalCostOfCapital: data.terminalCostOfCapitalExplanation,
        yearsOfRiskConvergence: data.yearsOfRiskConvergenceExplanation,
        probabilityOfFailure: data.probabilityOfFailureExplanation,
        distressProceeds: data.distressProceedsPctOfBookOrRevenueExplanation,
        marginalTaxRate: data.marginalTaxRateExplanation
      });
    } catch (e: unknown) {
      setSaveError(`AI error: ${(e as Error).message}`);
    } finally {
      clearInterval(timer);
      setAiLoading(false);
    }
  };
  
  // Store original server values for reset
  const [serverGrowthUserInput, setServerGrowthUserInput] = useState<GrowthValuationResponse['growthUserInput'] | null>(null);
  
  // Save functionality
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // History functionality
  const { data: valuationHistory, loading: historyLoading, error: historyError, fetch: fetchValuationHistory } = useValuationHistory<GrowthHistoryEntry>('/valuation/growth/history');
  
  const { open: openDeleteDialog, Dialog: DeleteDialog } = useDeleteConfirmation(async (id: string) => {
    if (!symbol) return;
    
    try {
      const response = await fetch(`${STOCKS_ENDPOINT}/valuation/growth/${symbol}?valuationDate=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete growth valuation');
      }

      await fetchValuationHistory(symbol);
    } catch (error) {
      console.error('Failed to delete growth valuation:', error);
      setSaveError((error as Error).message);
    }
  });

  const resetCalculator = () => {
    setAiExplanations({}); // Clear AI explanations on reset
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
    setUserComments(entry.growthUserInput.userComments || ''); // Set userComments, default to empty string if not present
    
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
          userComments: userComments,
        },
        growthOutput: {
          intrinsicValuePerShare: calculatedPricePerShare.toFixed(2),
          verdict: verdict
        }
      };

      const response = await fetch(`${STOCKS_ENDPOINT}/valuation/growth`, {
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

      const response = await fetch(`${STOCKS_ENDPOINT}/valuation/calculate/growth`, {
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
        const response = await fetch(`${STOCKS_ENDPOINT}/valuation/growth/${symbol.toUpperCase()}`);
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
        setUserComments(responseData.growthUserInput.userComments || ''); // Populate userComments on initial load
      } catch (e: unknown) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
    fetchValuationHistory(symbol);
  }, [symbol, fetchValuationHistory]); // Added fetchValuationHistory to dependencies to fix lint warning

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

      <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200 relative">
        {aiLoading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-lg">
            <Spinner elapsedTime={aiElapsedTime} />
          </div>
        )}
        <h3 className="text-xl font-bold mb-4">Growth Valuation Parameters</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              Marginal Tax Rate (%)
              <InfoIcon description={renderDescription('marginalTaxRate', "The tax rate applied to the company's last dollar of income. Used to calculate the after-tax cost of debt and other tax-adjusted metrics.")} />
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
              <InfoIcon description={renderDescription('initialRevenueGrowthRate', metricDescriptions.growthInputs.initialRevenueGrowthRate)} />
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
              <InfoIcon description={renderDescription('growthFadePeriod', metricDescriptions.growthInputs.growthFadePeriod)} />
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
              <InfoIcon description={renderDescription('terminalGrowthRate', `${metricDescriptions.growthInputs.terminalGrowthRate} Must be ≤ risk-free rate (${(growthData.riskFreeRate * 100).toFixed(2)}%)`)} />
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
              <InfoIcon description={renderDescription('yearsToProject', metricDescriptions.growthInputs.yearsToProject)} />
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
              <InfoIcon description={renderDescription('targetOperatingMargin', metricDescriptions.growthInputs.targetOperatingMargin)} />
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
              <InfoIcon description={renderDescription('yearsToReachTargetMargin', metricDescriptions.growthInputs.yearsToReachTargetMargin)} />
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
              <InfoIcon description={renderDescription('reinvestmentRate', metricDescriptions.growthInputs.reinvestmentRate)} />
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
              <InfoIcon description={renderDescription('initialCostOfCapital', metricDescriptions.growthInputs.initialCostOfCapital)} />
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
              <InfoIcon description={renderDescription('terminalCostOfCapital', metricDescriptions.growthInputs.terminalCostOfCapital)} />
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
              <InfoIcon description={renderDescription('yearsOfRiskConvergence', metricDescriptions.growthInputs.yearsOfRiskConvergence)} />
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
              <InfoIcon description={renderDescription('probabilityOfFailure', metricDescriptions.growthInputs.probabilityOfFailure)} />
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
              <InfoIcon description={renderDescription('distressProceeds', metricDescriptions.growthInputs.distressProceeds)} />
            </label>
            <input
              type="number"
              step="0.01"
              value={distressProceeds.toFixed(2)}
              onChange={(e) => setDistressProceeds(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100"
            />
          </div>

          <div> {/* No longer spans two columns */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comments
            </label>
            <textarea
              value={userComments}
              onChange={(e) => setUserComments(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-blue-100 min-h-[100px] p-2"
              placeholder="Add any additional comments or notes here..."
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
          <div className="flex items-center gap-2 border border-purple-200 rounded-md p-1 bg-purple-50">
            {(['bear', 'base', 'bull'] as const).map((scenario) => (
              <button
                key={scenario}
                onClick={() => setAiScenario(scenario)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  aiScenario === scenario
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-600 hover:bg-purple-100'
                }`}
              >
                {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={handleAiCompletion}
            disabled={aiLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-purple-300 flex items-center gap-2"
          >
            {aiLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                AI Processing...
              </>
            ) : (
              'AI completion'
            )}
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

        <DeleteDialog
          title="Delete Valuation"
          message="Are you sure you want to delete this valuation? This action cannot be undone."
        />

      {/* History Table */}
      <div className="mt-8">
        <h5 className="text-lg font-medium mb-2">History of valuations</h5>
        <HistoryTable
          data={valuationHistory}
          loading={historyLoading}
          error={historyError}
          onLoadEntry={loadHistoricalValuation}
          onDelete={(entry) => openDeleteDialog(entry.valuationDate)}
          showVerdict={true}
          verdictField="growthOutput.verdict"
          columns={[
            {
              key: 'intrinsicValue',
              header: 'Intrinsic Value Per Share',
              render: (entry: unknown) => {
                const e = entry as GrowthHistoryEntry;
                return `$${e.growthOutput.intrinsicValuePerShare}`;
              },
            },
            {
              key: 'sharePrice',
              header: 'Share Price at Valuation',
              render: (entry: unknown) => {
                const e = entry as GrowthHistoryEntry;
                return `$${e.growthValuationData.currentSharePrice.toFixed(2)}`;
              },
            },
          ]}
        />
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">Income Statements</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">Metric</th>
                {displayYears.map((year) => (
                  <th key={year} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${year === projectedYear ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}>
                    {year === projectedYear ? `${year} (Proj)` : year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-64">Revenue</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 bg-blue-50">{formatLargeNumber(projectedRevenue)}</td>;
                  }
                  const data = incomeMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.revenue) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-64">Operating Income</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 bg-blue-50">{formatLargeNumber(projectedOperatingIncome)}</td>;
                  }
                  const data = incomeMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.operatingIncome) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-64">Pre-tax Income</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 bg-blue-50">{formatLargeNumber(projectedPretaxIncome)}</td>;
                  }
                  const data = incomeMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.pretaxIncome) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-64">Net Income</td>
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
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">Metric</th>
                {displayYears.map((year) => (
                  <th key={year} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${year === projectedYear ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}>
                    {year === projectedYear ? `${year} (Proj)` : year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-64">Cash & Equivalents</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 bg-blue-50">-</td>;
                  }
                  const data = balanceMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.cashAndEquivalents) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-64">Short-term Debt</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 bg-blue-50">-</td>;
                  }
                  const data = balanceMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.shortTermDebt) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-64">Long-term Debt</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 bg-blue-50">-</td>;
                  }
                  const data = balanceMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.longTermDebt) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-64">Total Assets</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 bg-blue-50">-</td>;
                  }
                  const data = balanceMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.totalAssets) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-64">Total Equity</td>
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
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">Metric</th>
                {displayYears.map((year) => (
                  <th key={year} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${year === projectedYear ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}>
                    {year === projectedYear ? `${year} (Proj)` : year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-64">Operating Cash Flow</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 bg-blue-50">-</td>;
                  }
                  const data = cashFlowMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.operatingCashFlow) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-64">Capital Expenditures</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 bg-blue-50">-</td>;
                  }
                  const data = cashFlowMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.capitalExpenditures) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-64">Depreciation & Amortization</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 bg-blue-50">-</td>;
                  }
                  const data = cashFlowMap.get(year);
                  return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data ? formatLargeNumber(data.depreciationAndAmortization) : '-'}</td>;
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-64">Change in Working Capital</td>
                {displayYears.map((year) => {
                  if (year === projectedYear) {
                    return <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 bg-blue-50">-</td>;
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
