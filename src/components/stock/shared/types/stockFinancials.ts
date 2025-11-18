export interface StockData {
    symbol: string;
    marketCap: string;
    beta: string;
    lastDividend: string;
    range: string;
    companyName: string;
    currency: string;
    industry: string;
    website: string;
    description: string;
    ceo: string;
    sector: string;
    country: string;
    fullTimeEmployees: string;
    lastUpdated: string;
    status: string;
}

  export interface IncomeStatementReport {
    date: string;
    revenue:  string;
    costOfRevenue:  string;
    grossProfit:  string;
    researchAndDevelopmentExpenses:  string;
    generalAndAdministrativeExpenses:  string;
    sellingAndMarketingExpenses:  string;
    sellingGeneralAndAdministrativeExpenses:  string;
    otherExpenses:  string;
    operatingExpenses:  string;
    costAndExpenses:  string;
    netInterestIncome:  string;
    interestIncome:  string;
    interestExpense:  string;
    depreciationAndAmortization:  string;
    ebitda:  string;
    ebit:  string;
    nonOperatingIncomeExcludingInterest:  string;
    operatingIncome:  string;
    totalOtherIncomeExpensesNet:  string;
    incomeBeforeTax:  string;
    incomeTaxExpense:  string;
    netIncomeFromContinuingOperations:  string;
    netIncomeFromDiscontinuedOperations:  string;
    otherAdjustmentsToNetIncome:  string;
    netIncome:  string;
    netIncomeDeductions:  string;
    bottomLineNetIncome:  string;
    eps:  string;
    epsDiluted:  string;
    weightedAverageShsOut:  string;
    weightedAverageShsOutDil:  string;
  }

  export interface BalanceSheetReport {
    date: string;
    fiscalYear: string;
    period: string;
    cashAndCashEquivalents: string;
    shortTermInvestments: string;
    cashAndShortTermInvestments: string;
    netReceivables: string;
    accountsReceivables: string;
    otherReceivables: string;
    inventory: string;
    prepaids: string;
    otherCurrentAssets: string;
    totalCurrentAssets: string;
    propertyPlantEquipmentNet: string;
    goodwill: string;
    intangibleAssets: string;
    goodwillAndIntangibleAssets: string;
    longTermInvestments: string;
    taxAssets: string;
    otherNonCurrentAssets: string;
    totalNonCurrentAssets: string;
    otherAssets: string;
    totalAssets: string;
    totalPayables: string;
    accountPayables: string;
    otherPayables: string;
    accruedExpenses: string;
    shortTermDebt: string;
    capitalLeaseObligationsCurrent: string;
    taxPayables: string;
    deferredRevenue: string;
    otherCurrentLiabilities: string;
    totalCurrentLiabilities: string;
    longTermDebt: string;
    deferredRevenueNonCurrent: string;
    deferredTaxLiabilitiesNonCurrent: string;
    otherNonCurrentLiabilities: string;
    totalNonCurrentLiabilities: string;
    otherLiabilities: string;
    capitalLeaseObligations: string;
    totalLiabilities: string;
    treasuryStock: string;
    preferredStock: string;
    commonStock: string;
    retainedEarnings: string;
    additionalPaidInCapital: string;
    accumulatedOtherComprehensiveIncomeLoss: string;
    otherTotalStockholdersEquity: string;
    totalStockholdersEquity: string;
    totalEquity: string;
    minorityInterest: string;
    totalLiabilitiesAndTotalEquity: string;
    totalInvestments: string;
    totalDebt: string;
    netDebt: string;
  }

  export interface CashFlowReport {
    date: string;
    fiscalYear: string;
    period: string;
    netIncome: string;
    depreciationAndAmortization: string;
    deferredIncomeTax: string;
    stockBasedCompensation: string;
    changeInWorkingCapital: string;
    accountsReceivables: string;
    inventory: string;
    accountsPayables: string;
    otherWorkingCapital: string;
    otherNonCashItems: string;
    netCashProvidedByOperatingActivities: string;
    investmentsInPropertyPlantAndEquipment: string;
    acquisitionsNet: string;
    purchasesOfInvestments: string;
    salesMaturitiesOfInvestments: string;
    otherInvestingActivities: string;
    netCashProvidedByInvestingActivities: string;
    netDebtIssuance: string;
    longTermNetDebtIssuance: string;
    shortTermNetDebtIssuance: string;
    netStockIssuance: string;
    netCommonStockIssuance: string;
    commonStockIssuance: string;
    commonStockRepurchased: string;
    netPreferredStockIssuance: string;
    netDividendsPaid: string;
    commonDividendsPaid: string;
    preferredDividendsPaid: string;
    otherFinancingActivities: string;
    netCashProvidedByFinancingActivities: string;
    effectOfForexChangesOnCash: string;
    netChangeInCash: string;
    cashAtEndOfPeriod: string;
    cashAtBeginningOfPeriod: string;
    operatingCashFlow: string;
    capitalExpenditure: string;
    freeCashFlow: string;
    incomeTaxesPaid: string;
    interestPaid: string;
  }

  export interface FinancialRatioReport {
    date: string;
    grossProfitMargin: number | null;
    netProfitMargin: number | null;
    returnOnAssets: number | null;
    returnOnEquity: number | null;
    operatingProfitMargin: number | null;
    ebitdaMargin: number | null;
    adjustedEbitdaMargin: number | null;
    freeCashflowMargin: number | null;
    roic: number | null;
    currentRatio: number | null;
    quickRatio: number | null;
    cashRatio: number | null;
    workingCapital: number | null;
    debtToAssetsRatio: number | null;
    debtToEquityRatio: number | null;
    interestCoverageRatio: number | null;
    debtServiceCoverageRatio: number | null;
    netDebtToEbitda: number | null;
    altmanZScore: number | null;
    assetTurnover: number | null;
    inventoryTurnover: number | null;
    receivablesTurnover: number | null;
    daysSalesOutstanding: number | null;
    payablesTurnover: number | null;
    cashConversionCycle: number | null;
    daysInventoryOutstanding: number | null;
    daysPayablesOutstanding: number | null;
    salesToCapitalRatio: number | null;
    dividendYield: number | null;
    dividendPayoutRatio: number | null;
    buybackYield: number | null;
    earningsPerShareBasic: number | null;
    earningsPerShareDiluted: number | null;
    bookValuePerShare: number | null;
    salesPerShare: number | null;
    freeCashFlowPerShare: number | null;
    operatingCashFlowPerShare: number | null;
    dividendPerShare: number | null;
    cashPerShare: number | null;
    freeCashFlow: number | null;
    operatingCashFlowRatio: number | null;
    cashFlowToDebtRatio: number | null;
    tangibleBookValuePerShare: number | null;
    priceToEarningsGrowthRatio: number | null;
    forwardPriceToEarningsGrowthRatio: number | null;
    priceToFairValue: number | null;
    enterpriseValueMultiple: number | null;
    peRatio: number | null;
    pbRatio: number | null;
    pfcfRatio: number | null;
    pocfratio: number | null;
    priceToSalesRatio: number | null;
  }
  
  export interface AnnualEarnings {
    date: string;
    reportedEPS: string;
  }
  
  export interface QuarterlyEarnings {
    date: string;
    reportedDate: string;
    reportedEPS: string;
    estimatedEPS: string;
    surprise: string;
    surprisePercentage: string;
  }
  
  export interface EarningsHistory {
    annualEarnings: AnnualEarnings[];
    quarterlyEarnings: QuarterlyEarnings[];
  }
  
  export interface GlobalQuote {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  }
  
  export interface GlobalQuoteResponse {
    symbol: string;
    quotes: GlobalQuote[];
    lastUpdated: string;
  }
  