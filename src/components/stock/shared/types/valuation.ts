export interface CompanyMeta {
  ticker: string;
  companyName: string;
  currency: string;
  currentSharePrice: number;
  sharesOutstanding: number;
  lastUpdated: string;
}

export interface VerdictStyling {
  verdictText: string;
  bgColorClass: string;
}

export interface HistoryEntry {
  valuationDate: string;
  userComments?: string;
}

export interface IncomeStatementData {
  revenue: number;
  operatingIncome: number;
  pretaxIncome: number;
  netIncome: number;
}

export interface BalanceSheetData {
  cashAndEquivalents: number;
  shortTermDebt: number;
  longTermDebt: number;
  totalAssets: number;
  totalEquity: number;
}

export interface CashFlowData {
  operatingCashFlow: number;
  capitalExpenditures: number;
  depreciationAndAmortization: number;
  changeInWorkingCapital: number;
}

export interface GrowthValuationData extends CompanyMeta {
  riskFreeRate: number;
  marginalTaxRate: number;
  initialRevenueGrowthRate: number;
  targetOperatingMargin: number;
  reinvestmentAsPctOfRevenue: number;
}

export interface GrowthUserInput {
  marginalTaxRate: number;
  initialRevenueGrowthRate: number;
  targetOperatingMargin: number;
  reinvestmentAsPctOfRevenue: number;
  userComments?: string;
}

export interface GrowthOutput {
  intrinsicValuePerShare: number;
  verdict: string;
}

export interface GrowthHistoryEntry extends HistoryEntry {
  growthValuationData: GrowthValuationData;
  growthUserInput: GrowthUserInput;
  growthOutput: GrowthOutput;
}

export interface DcfValuationData extends CompanyMeta {
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

export interface DcfUserInput {
  beta: number;
  riskFreeRate: number;
  marketRiskPremium: number;
  fcfGrowthRate: number;
  terminalMultiple: number;
  sbcAdjustmentToggle: boolean;
  userComments?: string;
}

export interface DcfOutput {
  equityValue: number;
  intrinsicValuePerShare: number;
  wacc: number;
  verdict: string;
}

export interface DcfHistoryEntry extends HistoryEntry {
  dcfCalculationData: DcfValuationData;
  dcfUserInput: DcfUserInput;
  dcfOutput: DcfOutput;
}

export interface ReverseDcfValuationData extends CompanyMeta {
  income: {
    revenue: number;
    netIncome: number;
    interestExpense: number;
  };
  balanceSheet: {
    totalCashAndEquivalents: number;
    totalDebt: number;
    totalEquity: number;
  };
  cashFlow: {
    capitalExpenditures: number;
    depreciationAndAmortization: number;
    changeInWorkingCapital: number;
    freeCashFlow: number;
  };
  assumptions: {
    discountRate: number;
    terminalExitMultiple: number;
    currentSharePrice: number;
  };
}

export interface ReverseDcfUserInput {
  discountRate: number;
  targetSharePrice: number;
  userComments?: string;
}

export interface ReverseDcfOutput {
  impliedSharePrice: number;
  impliedFCFGrowthRate: number;
  verdict: string;
}

export interface ReverseDcfHistoryEntry extends HistoryEntry {
  reverseDcfValuationData: ReverseDcfValuationData;
  reverseDcfUserInput: ReverseDcfUserInput;
  reverseDcfOutput: ReverseDcfOutput;
}

export type ValuationHistoryEntry = DcfHistoryEntry | GrowthHistoryEntry | ReverseDcfHistoryEntry;
