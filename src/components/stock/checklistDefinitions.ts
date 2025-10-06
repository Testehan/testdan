export const financialItems = [
  { key: 'financialResilience', label: 'Financial resilience: (Fragile / Averge / Citadel) (0-5)' },
  { key: 'grossMargin', label: 'Gross Margin: (<50% / 50% to 80% / > 80%) (0-3)' },
  { key: 'roic', label: 'Returns on Capital (Low / Average / high, +1 if rising) (0-3)' },
  { key: 'freeCashFlow', label: 'Free Cash Flow (Negative / Pozitive / Positive and growing fast) (0-3)' },
  { key: 'earningsPerShare', label: 'Earnings per share (Negative / Pozitive / Positive and growing fast) (0-3)' },
];

export const moatItems = [
  { key: 'networkEffect', label: 'Network effect, product ecosystem (None / Weak / Strong) (0-15)' },
  { key: 'switchingCosts', label: 'Switching costs (None / Weak / Strong) (0-15)' },
  { key: 'durableCostAdvantage', label: 'Durable cost advantage (Scale , Distribution , Physical location , Vertical integration) (0-15)' },
  { key: 'intangibles', label: 'Intangibles (Premium brand , Patent , Trade secrets , Licence) (0-15)' },
  { key: 'counterPositioning', label: 'Counter positioning (0-10)' },
  { key: 'moatDirection', label: 'Moat direction (Narrowing / Stable / Widening) (0-5)' },
];

export const potentialItems = [
  { key: 'optionality', label: 'Optionality (None / Within industry / New industry) (0-7)' },
  { key: 'organicGrowthRunway', label: 'Organic growth runway (<5% / <10% / <15% / >15% ) (0-4)' },
  { key: 'topDogFirstMover', label: 'Top dog and first mover in important, emerging industry / Industry disruptor (0-3)' },
  { key: 'operatingLeverage', label: 'Operating leverage ahead (Negative / None / Modest / Tonnes) (0-4)' },
];

export const customerItems = [
  { key: 'customerAcquisition', label: 'Acquisitions (Sales & Marketing % of gross profit: 50% / < 10%) (Expensive / Normal / Word of mouth) (0-5)' },
  { key: 'companyCyclicality', label: 'Dependence (Highly cyclical / Moderate / Recession proof) (0-5)' },
];

export const companySpecificFactorsItems = [
  { key: 'recurringRevenue', label: 'Recurring revenue (None / Some / Tons) (0-5)' },
  { key: 'pricingPower', label: 'Princing power (None / Some / Tons) (0-5)' },
];

export const managementAndCultureItems = [
  { key: 'soulInTheGame', label: 'Soul in the game (Founder / Family Run / Long time CEO) (0-4)' },
  { key: 'insideOwnership', label: 'Inside ownership (None / Modest / Very high) (0-3)' },
  { key: 'cultureRatings', label: 'Culture ratings (Overall score, CEO approval, Recommend to a friend) (0-4)' },
  { key: 'missionStatement', label: 'Mission statement (Simple, inspirational, optionable) (0-3)' },
];

export const stockItems = [
  { key: 'performanceVsIndex', label: '5 year performance vs S&P500 or Since IPO (+50% / +100% + Gain) (0-4)' },
  { key: 'shareholderFriendlyActivity', label: 'Shareholder friendly activity (Share buybacks, rising dividends, debt repayment) (0-3)' },
  { key: 'consistentlyBeatExpectations', label: 'Consistently beat expectations (+1 big beat, +0.5 beat, -1 miss) (0-4)' },
];

export const negativeItems = [
  { key: 'accountingIrregularities', label: 'Accounting irregularities ? (-10)' },
  { key: 'customerConcentration', label: 'Customer concentration (> 20% of revenue or account receivables / One or Few > 10% / None) (-5, -3, 0)' },
  { key: 'industryDisruption', label: 'Industry disruption (Active / Possible / None) (-5, -3, 0)' },
  { key: 'outsideForces', label: 'Outside forces (commodity prices, interest rates, stock price, strong economy) (-5, -3, 0)' },
  { key: 'bigMarketLoser', label: 'Big Market Loser (>50% loss to S&P500 over the past 5 years or since IPO) (-5, -3, 0)' },
  { key: 'binaryEvent', label: 'Binary event (loosing patent protection, legal ruling) (-5, 0)' },
  { key: 'extremeDilution', label: 'Extreme dilution (> 5% annual share count growth / 3% to 5% / <3%) (-4, -2, 0)' },
  { key: 'growthByAcquisition', label: 'Growth by acquisition (exclusively / partially / none) (-4, -2, 0)' },
  { key: 'complicatedFinancials', label: 'Complicated financials (-3, 0)' },
  { key: 'antitrustConcerns', label: 'Antitrust concerns (-3, 0)' },
  { key: 'headquarters', label: 'Headquarters (High risk country / Medium risk country / Low risk country) (-3, -2, 0)' },
  { key: 'currencyRisk', label: 'Currency risk (>75% foreign / >50% foreign / <50% foreign) (-2, -1, 0)' },
];
