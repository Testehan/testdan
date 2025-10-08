export const reinvestmentEngineItems = [
  {
    key: 'reinvestmentCapacity',
    label: 'Reinvestment (5y): ' +
        '(Cannot reinvest profitably = 0 / ' +
        '<50% earnings reinvested OR ROIC/ROE <15% = 5 / ' +
        '>50% earnings reinvested at sustained 20%+ ROIC/ROE = 10) (0-10)'
  },
  {
    key: 'sustainedHighReturns',
    label: 'Sustained returns on capital (avg ROE or ROIC 5y): (<12% = 0 / 12–20% = 3 / >20% consistently = 5) (0-5)'
  },
  { key: 'reinvestmentRunway', label: 'Reinvestment runway: (<5 yrs or M&A-dependent = 0 / 5–10 yrs = 5 / 10–20+ yrs = 10) (0-10)' },
];

export const managementItems = [
  { key: 'insideOwnership', label: 'Skin in the game: (<5% = 0 / 5–15% = 7 / Founder-led or insiders own 15–30%+ = 15) (0-15)' },
  { key: 'capitalAllocationSkill', label: 'Capital allocation skill: (value-destructive M&A, chronic dilution = 0 / Mixed record, improving = 5 / Disciplined reinvestment, min dilution, rational buybacks = 10) (0-10)' },
];

export const marketAndScalabilityItems = [
  {
    key: 'totalAddressableMarket',
    label: 'Total Addressable Market (TAM): (Niche or <$10B market = 0 / $10–50B market = 3 / >$50B global market = 5) (0-5)',
  },
  {
    key: 'tamPenetrationRunway',
    label: 'Current TAM penetration: (>30% of TAM already captured = 0 / 10–30% penetration = 3 / <10% penetration with clear share-gain path = 5) (0-5)',
  },
  { key: 'scalabilityOfModel', label: 'Scalability of business: (Requires heavy ongoing capital or labor to grow = 0 / Moderately scalable = 3 / Capital-light with low marginal costs (e.g., software, brands) = 5) (0-5)' },
];

export const businessQualityItems = [
  { key: 'competitiveAdvantageMoat', label: 'Moat: (None or easily replicable = 0 / Temporary advantage (e.g., early mover) or weak moat = 5 / Durable and widening moat = 10) (0-10)' },
  { key: 'earlyGrowthCurveInflection', label: 'Growth Curve / Inflection Point: (Declining/stagnant business = 0 / Mature but steady growth = 3 / Entering hyper-growth phase (e.g., early adoption, market share gains) = 5) (0-5)' },
];

export const valuationItems = [
  { key: 'marketCapSize', label: 'Starting Market Cap: (> $5B = 0 / < $5B = 3 / < $2B = 5) (0-5)'},
  { key: 'valuationContext', label: 'Valuation & Multiple Expansion: (Overvalued/Hype priced = 0 / Fair Price = 3 / Bargain price allowing for "Twin Engine" (EPS growth + Multiple expansion) = 5) (0-5)'}
];

export const shareholderImpactItems = [
  { key: 'dilution', label: 'Dilution: (>50% shares added over last 5 yrs = 0 / 10–50% = 3 / <10% = 5) (0/5)' },
];

export const investorFitCoffeeCanItems = [
  { key: 'holdabilityVolatility', label: 'Holdability / Volatility: (You cannot survive 50%+ drops or hold for 15+ years = 0 / Manageable = 3 / Can hold long-term = 5) (0-5)' },
];

export const negativeItems100Bagger = [
  { key: 'noReinvestmentCapacity', label: 'Cannot reinvest most earnings at high returns? (No meaningful compounding engine) (0/-25)' },
  { key: 'shortReinvestmentRunway', label: 'Growth runway too short? (<5 years organic or reliant on acquisitions) (0/-25)' },
  { key: 'noOwnerOperator', label: 'No real owner-operator? (Insiders own <5% of the company) (0/-20)' },
  {key: 'questionableManagementIntegrity', label: 'Questionable management integrity? (Governance issues, scandals, misaligned incentives) (0/-25)'},
  { key: 'noDurableMoat', label: 'No durable moat? (Easy for others to copy or compete away profits) (0/-20)' },
  { key: 'poorCapitalAllocation', label: 'Bad capital allocation history? (Wasteful acquisitions or constant heavy dilution) (0/-15)' },
  { key: 'financialFragility', label: 'Existential Financial Risk? (Net Debt/EBITDA > 5x OR Interest Coverage < 2x OR <12 months cash runway) (0/-20)'}
];