export interface StockData {
    lastUpdated: string;
    Symbol: string;
    Name: string;
    Description: string;
    Currency: string;
    Country: string;
    Sector: string;
    Industry: string;
    LatestQuarter: string;
    MarketCapitalization: string;
    EBITDA: string;
    PERatio: string;
    PEGRatio: string;
    BookValue: string;
    DividendPerShare: string;
    DividendYield: string;
    EPS: string;
    RevenuePerShareTTM: string;
    ProfitMargin: string;
    OperatingMarginTTM: string;
    ReturnOnAssetsTTM: string;
    ReturnOnEquityTTM: string;
    RevenueTTM: string;
    GrossProfitTTM: string;
    DilutedEPSTTM: string;
    QuarterlyEarningsGrowthYOY: string;
    QuarterlyRevenueGrowthYOY: string;
    AnalystTargetPrice: string;
    TrailingPE: string;
    ForwardPE: string;
    PriceToSalesRatioTTM: string;
    PriceToBookRatio: string;
    EVToRevenue: string;
    EVToEBITDA: string;
    Beta: string;
    '52WeekHigh': string;
    '52WeekLow': string;
    '50DayMovingAverage': string;
    '200DayMovingAverage': string;
    SharesOutstanding: string;
    DividendDate: string;
    ExDividendDate: string;
    OfficialSite: string;
    AnalystRatingStrongBuy: string;
    AnalystRatingBuy: string;
    AnalystRatingHold: string;
    AnalystRatingSell: string;
    AnalystRatingStrongSell: string;
    SharesFloat: string;
    PercentInsiders: string;
    PercentInstitutions: string;
  }

  export interface IncomeStatementReport {
    fiscalDateEnding: string;
    reportedCurrency: string;
    grossProfit: string;
    totalRevenue: string;
    costOfRevenue: string;
    costofGoodsAndServicesSold: string;
    operatingIncome: string;
    sellingGeneralAndAdministrative: string;
    researchAndDevelopment: string;
    operatingExpenses: string;
    investmentIncomeNet: string;
    netInterestIncome: string;
    interestIncome: string;
    interestExpense: string;
    nonInterestIncome: string;
    otherNonOperatingIncome: string;
    depreciation: string;
    depreciationAndAmortization: string;
    incomeBeforeTax: string;
    incomeTaxExpense: string;
    interestAndDebtExpense: string;
    netIncomeFromContinuingOperations: string;
    comprehensiveIncomeNetOfTax: string;
    ebit: string;
    ebitda: string;
    netIncome: string;
  }

  export interface BalanceSheetReport {
    fiscalDateEnding: string;
    reportedCurrency: string;
    totalAssets: string;
    totalCurrentAssets: string;
    cashAndCashEquivalentsAtCarryingValue: string;
    cashAndShortTermInvestments: string;
    inventory: string;
    currentNetReceivables: string;
    totalNonCurrentAssets: string;
    propertyPlantEquipment: string;
    accumulatedDepreciationAmortizationPPE: string;
    intangibleAssets: string;
    intangibleAssetsExcludingGoodwill: string;
    goodwill: string;
    investments: string;
    longTermInvestments: string;
    shortTermInvestments: string;
    otherCurrentAssets: string;
    otherNonCurrentAssets: string;
    totalLiabilities: string;
    totalCurrentLiabilities: string;
    currentAccountsPayable: string;
    deferredRevenue: string;
    currentDebt: string;
    shortTermDebt: string;
    totalNonCurrentLiabilities: string;
    capitalLeaseObligations: string;
    longTermDebt: string;
    currentLongTermDebt: string;
    longTermDebtNoncurrent: string;
    shortLongTermDebtTotal: string;
    otherCurrentLiabilities: string;
    otherNonCurrentLiabilities: string;
    totalShareholderEquity: string;
    treasuryStock: string;
    retainedEarnings: string;
    commonStock: string;
    commonStockSharesOutstanding: string;
    accumulatedOtherComprehensiveIncome: string;
  }

  export interface CashFlowReport {
    fiscalDateEnding: string;
    reportedCurrency: string;
    netIncome: string;
    profitLoss: string;
    depreciationDepletionAndAmortization: string;
    changeInReceivables: string;
    changeInInventory: string;
    changeInOperatingAssets: string;
    changeInOperatingLiabilities: string;
    proceedsFromOperatingActivities: string;
    paymentsForOperatingActivities: string;
    operatingCashflow: string;
    capitalExpenditures: string;
    cashflowFromInvestment: string;
    proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet: string;
    proceedsFromRepaymentsOfShortTermDebt: string;
    proceedsFromIssuanceOfCommonStock: string;
    proceedsFromIssuanceOfPreferredStock: string;
    proceedsFromSaleOfTreasuryStock: string;
    proceedsFromRepurchaseOfEquity: string;
    paymentsForRepurchaseOfEquity: string;
    paymentsForRepurchaseOfCommonStock: string;
    paymentsForRepurchaseOfPreferredStock: string;
    dividendPayoutCommonStock: string;
    dividendPayoutPreferredStock: string;
    dividendPayout: string;
    cashflowFromFinancing: string;
    changeInExchangeRate: string;
    changeInCashAndCashEquivalents: string;
  }

  export interface FinancialRatioReport {
    fiscalDateEnding: string;
    grossProfitMargin: number | null;
    netProfitMargin: number | null;
    returnOnAssets: number | null;
    returnOnEquity: number | null;
    operatingProfitMargin: number | null;
    ebitdaMargin: number | null;
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
  }
  
  export interface AnnualEarnings {
    fiscalDateEnding: string;
    reportedEPS: string;
  }
  
  export interface QuarterlyEarnings {
    fiscalDateEnding: string;
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
  