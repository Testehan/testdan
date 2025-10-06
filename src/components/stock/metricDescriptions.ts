// src/components/stock/metricDescriptions.ts

export const metricDescriptions: { [key: string]: string } = {
    // Profitability Ratios
    grossProfitMargin: "Indicates the percentage of revenue left after deducting the cost of goods sold. A higher margin suggests more money is available to cover operating expenses and profit.",
    netProfitMargin: "Represents the percentage of revenue left after all expenses, including taxes and interest, have been deducted. It's a key indicator of a company's overall profitability.",
    returnOnAssets: "Measures how efficiently a company uses its assets to generate earnings. A higher ROA indicates better asset efficiency.",
    returnOnEquity: "Measures the rate of return on the ownership interest (shareholders' equity) of the common stock owners. It shows how much profit a company generates for each dollar of shareholders' equity.",
    operatingProfitMargin: "Indicates how much profit a company makes on each dollar of sales after paying for variable costs of production, but before interest and tax.",
    ebitdaMargin: "Measures a company's operating profit as a percentage of its revenue, before interest, taxes, depreciation, and amortization. It's a good indicator of operational efficiency.",
    adjustedEbitdaMargin: "Adjusted EBITDA Margin is EBITDA (excluding one-time items, stock-based comp, etc.) divided by revenue, expressed as a percentage. It measures adjusted operating profitability.",
    roic: "Return on Invested Capital (ROIC) measures the percentage return that a company makes from capital (both debt and equity) invested in the business. It shows how well a company is converting its invested capital into profits.",

    // Liquidity Ratios
    currentRatio: "Measures a company's ability to pay off its short-term liabilities with its current assets. A ratio between 1.5 and 2.0 is often considered healthy.",
    quickRatio: "Similar to the current ratio, but excludes inventory from current assets, providing a stricter measure of short-term liquidity. Also known as the acid-test ratio.",
    cashRatio: "Measures a company's ability to cover its short-term liabilities with only cash and cash equivalents. It's the most conservative liquidity ratio.",
    workingCapital: "The difference between current assets and current liabilities. Positive working capital indicates that a company has enough short-term assets to cover its short-term debts.",

    // Solvency Ratios
    debtToAssetsRatio: "Indicates the proportion of a company's assets that are financed by debt. A higher ratio suggests higher financial risk.",
    debtToEquityRatio: "Measures the proportion of equity and debt used to finance a company's assets. A high D/E ratio usually means higher risk.",
    interestCoverageRatio: "Measures a company's ability to make interest payments on its debt. It is calculated by dividing earnings before interest and taxes (EBIT) by interest expenses.",
    debtServiceCoverageRatio: "Measures the cash flow available to pay current debt obligations. It indicates a company's ability to service its debt.",
    netDebtToEbitda: "Measures a company's ability to pay off its net debt from its operating profit. A lower ratio implies less leverage and lower risk.",
    altmanZScore: "A formula used to predict the probability of a company going bankrupt within two years. Scores below 1.8 typically indicate distress.",

    // Efficiency Ratios
    assetTurnover: "Measures a company's efficiency in using its assets to generate sales revenue. A higher ratio indicates more efficient asset utilization.",
    inventoryTurnover: "Measures how many times inventory is sold or used in a period. A high inventory turnover generally indicates good sales and efficient inventory management.",
    receivablesTurnover: "Measures how efficiently a company collects its receivables. A higher ratio generally means the company collects its debts faster.",
    daysSalesOutstanding: "The average number of days it takes for a company to collect payment after a sale. A lower number is generally better.",
    payablesTurnover: "Measures the rate at which a company pays off its suppliers. A higher ratio indicates a company is paying its suppliers quickly.",
    cashConversionCycle: "Measures the number of days it takes for a company to convert its investments in inventory and accounts receivable into cash flows.",
    daysInventoryOutstanding: "Measures the average number of days a company holds its inventory before selling it.",
    daysPayablesOutstanding: "Measures the average number of days a company takes to pay its trade payables.",
    salesToCapitalRatio: "how much a company needs to reinvest to generate future growth. for every 1$ invested, this tells us how much sales it will generate",

    // Shareholder Returns
    dividendYield: "The dividend per share divided by the share price. Represents the return on investment from dividends alone.",
    dividendPayoutRatio: "The percentage of earnings paid out as dividends to shareholders. Indicates how much profit is being returned to shareholders versus reinvested.",
    buybackYield: "Measures the percentage reduction in a company's outstanding shares due to share repurchases over a specific period.",

    // Per Share Metrics
    earningsPerShareBasic: "The portion of a company's profit allocated to each outstanding share of common stock. A key measure of profitability.",
    earningsPerShareDiluted: "Calculates a company's EPS if all convertible securities were exercised. It's a more conservative measure.",
    bookValuePerShare: "The book value of a company divided by the number of outstanding shares. Represents the per-share value of a company if it were to liquidate.",
    tangibleBookValuePerShare: "Similar to book value per share but excludes intangible assets, providing a more conservative liquidation value.",
    salesPerShare: "A company's total revenue divided by the number of outstanding shares. Useful for comparing sales productivity on a per-share basis.",

    // Cash & Returns Per Share
    freeCashFlowPerShare: "Measures the amount of cash a company generates on a per-share basis after accounting for capital expenditures.",
    operatingCashFlowPerShare: "Measures the cash generated by a company's operations on a per-share basis.",
    dividendPerShare: "The total amount of dividends declared by a company for every ordinary share outstanding.",
    cashPerShare: "The amount of cash a company has on hand for each outstanding share. Indicates a company's liquidity.",

    // Cash Flow Ratios
    freeCashFlow: "The cash a company generates after accounting for cash outflows to support operations and maintain its capital assets. Represents the cash available to pay debt and dividends.",
    operatingCashFlowRatio: "Measures how efficiently a company's operations are generating cash to cover sales. A higher ratio is generally better.",
    cashFlowToDebtRatio: "Compares a company's operating cash flow to its total debt, indicating its ability to pay off debt with cash generated from operations.",

    // DCF Inputs
    beta: "Beta measures a stock's volatility in relation to the overall market. A beta greater than 1 indicates the stock is more volatile than the market, while a beta less than 1 indicates it's less volatile.",
    riskFreeRate: "The theoretical rate of return of an investment with zero risk. It's often represented by the yield on a government bond.",
    marketRiskPremium: "The excess return that investing in the stock market provides over a risk-free rate. It's the compensation for taking on the higher risk of equity investing.",
    effectiveTaxRate: "The percentage of its pre-tax profits that a company pays in taxes. It's calculated by dividing the tax expense by the pre-tax income.",
    projectedRevenueGrowthRate: "The estimated annual percentage increase in a company's revenue over a future period. It's a key assumption in projecting future cash flows.",
    projectedEbitMargin: "The estimated Earnings Before Interest and Taxes (EBIT) as a percentage of revenue for future periods. It reflects the assumed future profitability of the company's core operations.",
    perpetualGrowthRate: "The rate at which a company's free cash flow is expected to grow forever after the initial projection period. It's used to calculate the terminal value.",
    wacc: "The Weighted Average Cost of Capital (WACC) represents a company's average after-tax cost of capital from all sources, including common stock, preferred stock, bonds, and other forms of debt. It is the discount rate used to value future cash flows in a DCF analysis.",
    projectionYears: "The number of years into the future for which free cash flows are explicitly projected. After this period, a terminal value is calculated."
};