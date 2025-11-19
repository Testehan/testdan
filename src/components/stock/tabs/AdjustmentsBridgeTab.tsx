import React, { useState, useEffect, useMemo } from 'react';
import { useFinancialAdjustments } from '../hooks/useFinancialReports';
import { FinancialAdjustmentReport } from '../shared/types/stockFinancials';
import PeriodRangeSlider from '../shared/components/PeriodRangeSlider';
import { formatLargeNumber } from '../shared/utils/utils';
import InfoIcon from '../shared/components/InfoIcon';

interface AdjustmentsBridgeTabProps {
  symbol: string;
}

interface MetricRow {
  label: string;
  reportedKey: keyof FinancialAdjustmentReport;
  adjustedKey: keyof FinancialAdjustmentReport;
  isRatio?: boolean;
  description: string;
}

const metricRows: MetricRow[] = [
     { label: 'Operating Income', reportedKey: 'reportedOperatingIncome', adjustedKey: 'adjustedOperatingIncome', description:
        'Profit from core business operations before interest and taxes. Adjusted for R&D and Marketing/SGA capitalization to reflect true operating performance.' },
     { label: 'Net Income', reportedKey: 'reportedNetIncome', adjustedKey: 'adjustedNetIncome', description: 'Bottom-line profit after all expenses and taxes. Adjusted to account for R&D and Brand investments as capital assets rather than expenses.' },
     { label: 'EPS', reportedKey: 'reportedEps', adjustedKey: 'adjustedEps', isRatio: true, description: 'Earnings per share - net income divided by shares outstanding. Adjusted EPS reflects R&D and Marketing capitalization impact on profitability.' },
     { label: 'Free Cash Flow', reportedKey: 'reportedFreeCashFlow', adjustedKey: 'adjustedFreeCashFlow', description: 'Cash available after capital expenditures. Adjusted to treat R&D and Brand-building as capital investments rather than operating expenses.' },
     { label: 'EBITDA', reportedKey: 'reportedEbitda', adjustedKey: 'adjustedEbitda', description: 'Earnings before interest, taxes, depreciation and amortization. Adjusted to capitalize R&D and Marketing expenses.' },
     { label: 'ROIC', reportedKey: 'reportedRoic', adjustedKey: 'adjustedRoic', isRatio: true, description: 'Return on Invested Capital measures efficiency in using capital to generate profits. Adjusted ROIC accounts for R&D and Brand value as part of invested capital.' },
     { label: 'P/E', reportedKey: 'reportedPe', adjustedKey: 'adjustedPe', isRatio: true, description: 'Price-to-Earnings ratio - stock price divided by earnings per share. Adjusted P/E uses R&D and Marketing-adjusted earnings for a truer valuation.' },
     { label: 'P/B', reportedKey: 'reportedPb', adjustedKey: 'adjustedPb', isRatio: true, description: 'Price-to-Book ratio - stock price divided by book value per share. Adjusted P/B uses R&D and Brand-adjusted book value for a truer valuation.' },
     { label: 'Invested Capital', reportedKey: 'reportedInvestedCapital', adjustedKey: 'adjustedInvestedCapital', description: 'Total capital invested in the business. Adjusted to include accumulated R&D and Brand name value as capital assets.' },
     { label: 'Book Value of Equity', reportedKey: 'reportedBookValueOfEquity', adjustedKey: 'adjustedBookValueOfEquity',  description: 'Net asset value of the company. Adjusted to include R&D and Brand capital on the balance sheet.' },
     { label: 'NOPAT', reportedKey: 'reportedNopat', adjustedKey: 'adjustedNopat', description: 'Net Operating Profit After Tax. Adjusted to reflect the tax impact of capitalizing R&D and Marketing/SGA.' },
     { label: 'Sales to Capital', reportedKey: 'reportedSalesToCapital', adjustedKey: 'adjustedSalesToCapital', isRatio: true, description: 'Measures revenue generated per dollar of invested capital. Higher is better. Adjusted to account for R&D and Brand value in the capital base.' },
     { label: 'Net Debt to EBITDA', reportedKey: 'reportedNetDebtToEbitda', adjustedKey: 'adjustedNetDebtToEbitda', isRatio: true,  description: 'Leverage ratio comparing net debt to earnings. Lower is generally better. Adjusted to use R&D and Marketing-adjusted EBITDA.' },
     { label: 'EBIT to Interest', reportedKey: 'reportedEbitToInterest', adjustedKey: 'adjustedEbitToInterest', isRatio: true, description: 'Interest coverage ratio - ability to pay interest expenses. Higher is better. Adjusted EBIT accounts for R&D and Brand treatment.' },
     { label: 'EV to EBITDA', reportedKey: 'reportedEvToEbitda', adjustedKey: 'adjustedEvToEbitda', isRatio: true, description: 'Enterprise Value to EBITDA ratio for company valuation. Lower may indicate undervaluation. Adjusted to use R&D and Marketing-adjusted EBITDA.' },
     { label: 'Marginal Tax Rate', reportedKey: 'adjustedMarginalTaxRate', adjustedKey: 'adjustedMarginalTaxRate', isRatio: true, description: 'The tax rate applied to the last dollar of income. Used to calculate after-tax adjustments and true cost of capitalized assets.' },
 ];

const AdjustmentsBridgeTab: React.FC<AdjustmentsBridgeTabProps> = ({ symbol }) => {
  const { adjustments, loading, error } = useFinancialAdjustments({ symbol });
  const [selectedStartPeriod, setSelectedStartPeriod] = useState<string>('');
  const [selectedEndPeriod, setSelectedEndPeriod] = useState<string>('');
  const [numberScale, setNumberScale] = useState<'millions' | 'billions'>('billions');

  const availablePeriods = useMemo(() => {
    if (!adjustments?.annualAdjustments) return [];
    return adjustments.annualAdjustments
      .map(a => a.calendarYear.toString())
      .sort((a, b) => parseInt(a) - parseInt(b));
  }, [adjustments]);

  useEffect(() => {
    if (availablePeriods.length > 0) {
      setSelectedStartPeriod(availablePeriods[0]);
      setSelectedEndPeriod(availablePeriods[Math.min(4, availablePeriods.length - 1)]);
    }
  }, [availablePeriods]);

  const handlePeriodRangeChange = (start: string, end: string) => {
    setSelectedStartPeriod(start);
    setSelectedEndPeriod(end);
  };

  const reportsToDisplay = useMemo(() => {
    if (!adjustments?.annualAdjustments || !selectedStartPeriod || !selectedEndPeriod) return [];
    
    const startIndex = availablePeriods.indexOf(selectedStartPeriod);
    const endIndex = availablePeriods.indexOf(selectedEndPeriod);
    
    return adjustments.annualAdjustments.filter(a => {
      const yearStr = a.calendarYear.toString();
      const periodIndex = availablePeriods.indexOf(yearStr);
      return periodIndex >= startIndex && periodIndex <= endIndex;
    });
  }, [adjustments, selectedStartPeriod, selectedEndPeriod, availablePeriods]);

  const formatValue = (value: string, isRatio: boolean | undefined): string => {
    if (!value || value === 'null' || value === 'undefined') return '—';
    
    if (isRatio) {
      const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
      if (!isNaN(num)) {
        return num.toFixed(2);
      }
      return value;
    }
    
    const numStr = value.replace(/[^0-9.-]/g, '');
    if (numStr) {
      return formatLargeNumber(numStr, numberScale);
    }
    return value;
  };

  const calculateChange = (reported: string, adjusted: string, isRatio: boolean | undefined): { value: string; percent: string; isPositive: boolean | null } => {
    const reportedNum = parseFloat(reported.replace(/[^0-9.-]/g, '') || '0');
    const adjustedNum = parseFloat(adjusted.replace(/[^0-9.-]/g, '') || '0');
    
    if (isNaN(reportedNum) || isNaN(adjustedNum) || reportedNum === 0) {
      return { value: '—', percent: '—', isPositive: null };
    }
    
    const diff = adjustedNum - reportedNum;
    const diffPercent = (diff / reportedNum) * 100;
    
    if (isRatio) {
      return {
        value: diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2),
        percent: diffPercent > 0 ? `+${diffPercent.toFixed(1)}%` : `${diffPercent.toFixed(1)}%`,
        isPositive: diff > 0
      };
    }
    
    const formattedDiff = formatLargeNumber(Math.abs(diff).toString(), numberScale);
    return {
      value: diff > 0 ? `+${formattedDiff}` : `-${formattedDiff}`,
      percent: diffPercent > 0 ? `+${diffPercent.toFixed(1)}%` : `${diffPercent.toFixed(1)}%`,
      isPositive: diff > 0
    };
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          Error loading adjustments: {error}
        </div>
      </div>
    );
  }

  if (!adjustments || availablePeriods.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-500">No adjustment data available for {symbol}.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Adjustments Bridge</h2>
        {adjustments.lastUpdated && (
          <span className="text-sm text-gray-600">
            Last Updated: {new Date(adjustments.lastUpdated).toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex items-center mb-4 flex-wrap space-x-2">
        <div className="flex space-x-1 border rounded-lg px-1 py-0.5">
          <button
            className={`px-2 py-1 text-sm font-medium ${numberScale === 'millions' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setNumberScale('millions')}
          >
            Millions
          </button>
          <button
            className={`px-2 py-1 text-sm font-medium ${numberScale === 'billions' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setNumberScale('billions')}
          >
            Billions
          </button>
        </div>
      </div>

      <div className="mb-4">
        {availablePeriods.length > 0 && (
          <PeriodRangeSlider
            periods={availablePeriods}
            selectedStart={selectedStartPeriod}
            selectedEnd={selectedEndPeriod}
            onRangeChange={handlePeriodRangeChange}
            isQuarterly={false}
          />
        )}
      </div>

      {reportsToDisplay.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th 
                  scope="col" 
                  rowSpan={2}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 border-b border-r border-gray-200 z-10"
                >
                  Metric
                </th>
                {reportsToDisplay.map(report => (
                  <th 
                    key={report.calendarYear} 
                    scope="col" 
                    colSpan={3}
                    className="px-4 py-2 text-center text-sm font-bold text-gray-800 border-b border-r border-gray-200 bg-gray-100"
                  >
                    {report.calendarYear}
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-50">
                {reportsToDisplay.map(report => (
                  <React.Fragment key={`sub-${report.calendarYear}`}>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 border-b border-r border-gray-200 bg-red-50">
                      <span className="text-red-700">Reported</span>
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 border-b border-r border-gray-200 bg-blue-50">
                      <span className="text-blue-700">Adjusted</span>
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 border-b border-r border-gray-200 bg-green-50">
                      <span className="text-green-700">Change</span>
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {metricRows.map((row, index) => (
                <tr 
                  key={row.label} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-inherit border-r border-gray-200">
                    <div className="flex items-center">
                      <InfoIcon description={row.description} />
                      <span className="ml-2">{row.label}</span>
                    </div>
                  </td>
                  {reportsToDisplay.map(report => {
                    const reported = String(report[row.reportedKey] || '');
                    const adjusted = String(report[row.adjustedKey] || '');
                    const formattedReported = formatValue(reported, row.isRatio);
                    const formattedAdjusted = formatValue(adjusted, row.isRatio);
                    const change = calculateChange(reported, adjusted, row.isRatio);

                    return (
                      <React.Fragment key={report.calendarYear}>
                        <td className="px-3 py-3 text-sm text-right text-gray-600 border-r border-gray-100">
                          {formattedReported}
                        </td>
                        <td className="px-3 py-3 text-sm text-right font-medium text-gray-900 border-r border-gray-100">
                          {formattedAdjusted}
                        </td>
                        <td className="px-3 py-3 text-sm text-right border-r border-gray-100">
                          {change.isPositive !== null ? (
                            <div className="flex flex-col items-end">
                              <span className={`font-semibold ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {change.value}
                              </span>
                              <span className={`text-xs ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                {change.percent}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdjustmentsBridgeTab;
