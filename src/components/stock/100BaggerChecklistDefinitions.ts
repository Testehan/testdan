export const reinvestmentEngineItems = [
  { key: 'reinvestmentCapacity', label: 'Internal Reinvestment capacity: (Cannot reinvest = 0 / <50% FCF reinvested = 7 / >50% FCF at 20%+ ROIC = 15) (0-15)' },
  { key: 'reinvestmentRunway', label: 'Reinvestment runway: (<5 yrs or M&A-dependent = 0 / 5–10 yrs = 5 / 10–20+ yrs = 10) (0-10)' },
];

export const managementItems = [
  { key: 'skinInTheGame', label: 'Skin in the game: (<5% = 0 / 5–15% = 7 / Founder-led or insiders own 15–30%+ = 15) (0-15)' },
  { key: 'capitalAllocationSkill', label: 'Capital allocation skill: (value-destructive M&A, chronic dilution = 0 / Mixed record, improving = 5 / Disciplined reinvestment, min dilution, rational buybacks = 10) (0-10)' },
];

export const marketAndScalabilityItems = [
  { key: 'totalAddressableMarket', label: 'TAM & Penetration runway: (Niche/<$10B or limited share potential = 0 / $10–50B moderate opportunity = 3 / >$50B global/underpenetrated with meaningful share path = 5) (0-5)' },
  { key: 'scalabilityOfModel', label: 'Scalability of business: (Requires heavy ongoing capital or labor to grow = 0 / Moderately scalable = 5 / Capital-light with low marginal costs (e.g., software, brands) = 10) (0-10)' },
];

export const businessQualityItems = [
  { key: 'competitiveAdvantageMoat', label: 'Moat: (None or easily replicable = 0 / Temporary advantage (e.g., early mover) or weak moat = 7 / Durable and widening moat = 13) (0-13)' },
  { key: 'earlyGrowthCurveInflection', label: 'Early Growth Curve / Inflection Point: (Declining/stagnant business = 0 / Mature but steady growth = 5 / Entering hyper-growth phase (e.g., early adoption, market share gains) = 7) (0-7)' },
];

export const valuationItems = [
  { key: 'startingValuation', label: 'Starting valuation: (>50x earnings OR >3-4x sales with no clear profit path = 0 / 20–50x trailing (or 2–4x sales for growth) = 3 / <20x trailing (or <2x sales) with strong growth runway = 5) (0-5)' },
];

export const shareholderImpactItems = [
  { key: 'dilution', label: 'Dilution: (>50% shares added over last 5 yrs = 0 / 10–50% = 3 / <10% = 5) (0/5)' },
];

export const investorFitCoffeeCanItems = [
  { key: 'holdabilityVolatility', label: 'Holdability / Volatility: (You cannot survive 50%+ drops or hold for 15+ years = 0 / Manageable = 3 / Can hold long-term = 5) (0-5)' },
];
