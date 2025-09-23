import React, { useState, useEffect, useRef, useCallback } from 'react';
import Spinner from './Spinner';

interface ChecklistTabProps {
  symbol: string;
}

interface ChecklistItem {
  name: string;
  score: number;
  explanation: string;
}

interface ReportData {
  generatedAt: string;
  finalScore: number;
  items: Record<string, ChecklistItem>;
}

interface Tooltip {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({ symbol }) => {
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [reportData, setReportData] = useState<Partial<ReportData>>({});
  const [tooltip, setTooltip] = useState<Tooltip>({ visible: false, content: '', x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isLogVisible, setIsLogVisible] = useState(true);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  // const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const hasReceivedMessages = useRef(false);
  const hideTimeoutId = useRef<NodeJS.Timeout | null>(null);

  const cancelHideTimer = useCallback(() => {
    if (hideTimeoutId.current) {
      clearTimeout(hideTimeoutId.current);
    }
  }, []);

  const startHideTimer = useCallback(() => {
    cancelHideTimer();
    hideTimeoutId.current = setTimeout(() => {
      setIsLogVisible(false);
    }, 6000);
  }, [cancelHideTimer]);

  useEffect(() => {
    setLogMessages([]);
    setReportData({});
    setError(null);
    hasReceivedMessages.current = false;
    setIsLogVisible(true);
    cancelHideTimer();
    setLoading(true);
    // setStartTime(new Date());
    setElapsedTime(0);

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    const url =
      regenerationCount > 0
        ? `http://localhost:8080/stocks/reporting/ferol/${symbol}?recreateReport=true`
        : `http://localhost:8080/stocks/reporting/ferol/${symbol}`;

    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setError(null);
      setIsLogVisible(true);
    };

    eventSource.addEventListener('MESSAGE', (event: MessageEvent) => {
      hasReceivedMessages.current = true;
      setLogMessages(prev => [event.data, ...prev]);
    });

    eventSource.addEventListener('COMPLETED', (event: MessageEvent) => {
      try {
        const rawData = JSON.parse(event.data);
        const finalScore = rawData.items.reduce((sum: number, item: ChecklistItem) => sum + item.score, 0);
        const itemsMap = rawData.items.reduce((map: Record<string, ChecklistItem>, item: ChecklistItem) => {
          map[item.name] = item;
          return map;
        }, {});

        setReportData({
          generatedAt: new Date(rawData.generatedAt).toLocaleString(),
          finalScore,
          items: itemsMap,
        });
      } catch (e) {
        console.error("Failed to parse checklist data:", e);
      }
      startHideTimer();
      eventSource.close();
      setLoading(false);
      clearInterval(timer);
    });

    eventSource.addEventListener('ERROR', (event: MessageEvent) => {
      setError(event.data);
      setIsLogVisible(true);
      setLoading(false);
      clearInterval(timer);
      eventSource.close();
    });

    eventSource.onerror = () => {
      if (!hasReceivedMessages.current) {
        setError('Error connecting to the SSE stream. Please check the connection.');
      }
      eventSource.close();
      setLoading(false);
      clearInterval(timer);
    };

    return () => {
      eventSource.close();
      cancelHideTimer();
      clearInterval(timer);
    };
  }, [symbol, regenerationCount, startHideTimer, cancelHideTimer]);

  const handleMouseOver = (e: React.MouseEvent, explanation: string) => {
    setTooltip({
      visible: true,
      content: explanation,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseOut = () => {
    setTooltip({ visible: false, content: '', x: 0, y: 0 });
  };

  const financialItems = [
    { key: 'financialResilience', label: 'Financial resilience: (Fragile / Averge / Citadel) (0-5)' },
    { key: 'grossMargin', label: 'Gross Margin: (<50% / 50% to 80% / > 80%) (0-3)' },
    { key: 'roic', label: 'Returns on Capital (Low / Average / high, +1 if rising) (0-3)' },
    { key: 'freeCashFlow', label: 'Free Cash Flow (Negative / Pozitive / Positive and growing fast) (0-3)' },
    { key: 'earningsPerShare', label: 'Earnings per share (Negative / Pozitive / Positive and growing fast) (0-3)' },
  ];

  const moatItems = [
    { key: 'networkEffect', label: 'Network effect, product ecosystem (None / Weak / Strong) (0-15)' },
    { key: 'switchingCosts', label: 'Switching costs (None / Weak / Strong) (0-15)' },
    { key: 'durableCostAdvantage', label: 'Durable cost advantage (Scale , Distribution , Physical location , Vertical integration) (0-15)' },
    { key: 'intangibles', label: 'Intangibles (Premium brand , Patent , Trade secrets , Licence) (0-15)' },
    { key: 'counterPositioning', label: 'Counter positioning (0-10)' },
    { key: 'moatDirection', label: 'Moat direction (Narrowing / Stable / Widening) (0-5)' },
  ];

  const potentialItems = [
    { key: 'optionality', label: 'Optionality (None / Within industry / New industry) (0-7)' },
    { key: 'organicGrowthRunway', label: 'Organic growth runway (<5% / <10% / <15% / >15% ) (0-4)' },
    { key: 'topDogFirstMover', label: 'Top dog and first mover in important, emerging industry / Industry disruptor (0-3)' },
    { key: 'operatingLeverage', label: 'Operating leverage ahead (Negative / None / Modest / Tonnes) (0-4)' },
  ];

  const customerItems = [
    { key: 'customerAcquisition', label: 'Acquisitions (Sales & Marketing % of gross profit: 50% / < 10%) (Expensive / Normal / Word of mouth) (0-5)' },
    { key: 'companyCyclicality', label: 'Dependence (Highly cyclical / Moderate / Recession proof) (0-5)' },
  ];

  const companySpecificFactorsItems = [
    { key: 'recurringRevenue', label: 'Recurring revenue (None / Some / Tons) (0-5)' },
    { key: 'pricingPower', label: 'Princing power (None / Some / Tons) (0-5)' },
  ];

  const managementAndCultureItems = [
    { key: 'soulInTheGame', label: 'Soul in the game (Founder / Family Run / Long time CEO) (0-4)' },
    { key: 'insideOwnership', label: 'Inside ownership (None / Modest / Very high) (0-3)' },
    { key: 'glassdoorRatings', label: 'Glassdoor ratings (Overall score, CEO approval, Recommend to a friend) (0-4)' },
    { key: 'missionStatement', label: 'Mission statement (Simple, inspirational, optionable) (0-3)' },
  ];

  const stockItems = [
    { key: 'performanceVsIndex', label: '5 year performance vs S&P500 or Since IPO (+50% / +100% + Gain) (0-4)' },
    { key: 'shareholderFriendlyActivity', label: 'Shareholder friendly activity (Share buybacks, rising dividends, debt repayment) (0-3)' },
    { key: 'consistentlyBeatExpectations', label: 'Consistently beat expectations (+1 big beat, +0.5 beat, -1 miss) (0-4)' },
  ];

  const negativeItems = [
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

  const renderChecklistTable = () => {
    const positiveScore = Object.values(reportData.items || {}).reduce((sum, item) => {
      if (item.score > 0) {
        return sum + item.score;
      }
      return sum;
    }, 0);

    const negativeScore = Object.values(reportData.items || {}).reduce((sum, item) => {
      if (item.score < 0) {
        return sum + item.score;
      }
      return sum;
    }, 0);

    return (
      <div className="p-4">
        {loading ? (
          <Spinner elapsedTime={elapsedTime} />
        ) : (
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-semibold">Financial Checklist</h3>
              <button
                onClick={() => setRegenerationCount(count => count + 1)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Regenerate
              </button>
            </div>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-600">Analysis Date</td>
                  <td className="py-2 text-gray-800">{reportData.generatedAt || '...'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-600">Final score</td>
                  <td className="py-2 text-gray-800 font-bold">{reportData.finalScore ?? '...'}</td>
                </tr>

                {/* Financials Sub-header */}
                <tr className="bg-gray-100">
                  <td colSpan={2} className="py-2 px-1 font-bold text-gray-800">
                    Financials
                  </td>
                </tr>

                {financialItems.map(({ key, label }, index) => {
                  const item = reportData.items?.[key];
                  const isLast = index === financialItems.length - 1;
                  return (
                    <tr
                      key={key}
                      className={!isLast ? 'border-b' : ''}
                      onMouseEnter={(e) => item && handleMouseOver(e, item.explanation)}
                      onMouseLeave={handleMouseOut}
                    >
                      <td className="py-2 font-medium text-gray-600">{label}</td>
                      <td className="py-2 text-gray-800">{item?.score ?? '...'}</td>
                    </tr>
                  );
                })}

                {/* Moat/Defence Sub-header */}
                <tr className="bg-gray-100">
                  <td colSpan={2} className="py-2 px-1 font-bold text-gray-800">
                    Moat/Defence
                  </td>
                </tr>

                {moatItems.map(({ key, label }, index) => {
                  const item = reportData.items?.[key];
                  const isLast = index === moatItems.length - 1;
                  return (
                    <tr
                      key={key}
                      className={!isLast ? 'border-b' : ''}
                      onMouseEnter={(e) => item && handleMouseOver(e, item.explanation)}
                      onMouseLeave={handleMouseOut}
                    >
                      <td className="py-2 font-medium text-gray-600">{label}</td>
                      <td className="py-2 text-gray-800">{item?.score ?? '...'}</td>
                    </tr>
                  );
                })}

                {/* Potential / Offense Sub-header */}
                <tr className="bg-gray-100">
                  <td colSpan={2} className="py-2 px-1 fontbold text-gray-800">
                    Potential / Offense
                  </td>
                </tr>

                {potentialItems.map(({ key, label }, index) => {
                  const item = reportData.items?.[key];
                  const isLast = index === potentialItems.length - 1;
                  return (
                    <tr
                      key={key}
                      className={!isLast ? 'border-b' : ''}
                      onMouseEnter={(e) => item && handleMouseOver(e, item.explanation)}
                      onMouseLeave={handleMouseOut}
                    >
                      <td className="py-2 font-medium text-gray-600">{label}</td>
                      <td className="py-2 text-gray-800">{item?.score ?? '...'}</td>
                    </tr>
                  );
                })}

                {/* Customers Sub-header */}
                <tr className="bg-gray-100">
                  <td colSpan={2} className="py-2 px-1 font-bold text-gray-800">
                    Customers
                  </td>
                </tr>

                {customerItems.map(({ key, label }, index) => {
                  const item = reportData.items?.[key];
                  const isLast = index === customerItems.length - 1;
                  return (
                    <tr
                      key={key}
                      className={!isLast ? 'border-b' : ''}
                      onMouseEnter={(e) => item && handleMouseOver(e, item.explanation)}
                      onMouseLeave={handleMouseOut}
                    >
                      <td className="py-2 font-medium text-gray-600">{label}</td>
                      <td className="py-2 text-gray-800">{item?.score ?? '...'}</td>
                    </tr>
                  );
                })}

                {/* Company specific factors Sub-header */}
                <tr className="bg-gray-100">
                  <td colSpan={2} className="py-2 px-1 font-bold text-gray-800">
                    Company specific factors
                  </td>
                </tr>

                {companySpecificFactorsItems.map(({ key, label }, index) => {
                  const item = reportData.items?.[key];
                  const isLast = index === companySpecificFactorsItems.length - 1;
                  return (
                    <tr
                      key={key}
                      className={!isLast ? 'border-b' : ''}
                      onMouseEnter={(e) => item && handleMouseOver(e, item.explanation)}
                      onMouseLeave={handleMouseOut}
                    >
                      <td className="py-2 font-medium text-gray-600">{label}</td>
                      <td className="py-2 text-gray-800">{item?.score ?? '...'}</td>
                    </tr>
                  );
                })}

                {/* Management and culture Sub-header */}
                <tr className="bg-gray-100">
                  <td colSpan={2} className="py-2 px-1 font-bold text-gray-800">
                    Management and culture
                  </td>
                </tr>

                {managementAndCultureItems.map(({ key, label }, index) => {
                  const item = reportData.items?.[key];
                  const isLast = index === managementAndCultureItems.length - 1;
                  return (
                    <tr
                      key={key}
                      className={!isLast ? 'border-b' : ''}
                      onMouseEnter={(e) => item && handleMouseOver(e, item.explanation)}
                      onMouseLeave={handleMouseOut}
                    >
                      <td className="py-2 font-medium text-gray-600">{label}</td>
                      <td className="py-2 text-gray-800">{item?.score ?? '...'}</td>
                    </tr>
                  );
                })}

                {/* Stock Sub-header */}
                <tr className="bg-gray-100">
                  <td colSpan={2} className="py-2 px-1 font-bold text-gray-800">
                    Stock
                  </td>
                </tr>

                {stockItems.map(({ key, label }, index) => {
                  const item = reportData.items?.[key];
                  const isLast = index === stockItems.length - 1;
                  return (
                    <tr
                      key={key}
                      className={!isLast ? 'border-b' : ''}
                      onMouseEnter={(e) => item && handleMouseOver(e, item.explanation)}
                      onMouseLeave={handleMouseOut}
                    >
                      <td className="py-2 font-medium text-gray-600">{label}</td>
                      <td className="py-2 text-gray-800">{item?.score ?? '...'}</td>
                    </tr>
                  );
                })}

                <tr className="bg-green-200 border-b">
                  <td className="py-2 font-medium text-gray-600">Positives score</td>
                  <td className="py-2 text-gray-800 font-bold">{positiveScore}</td>
                </tr>

                {/* The negatives :( Sub-header */}
                <tr className="bg-gray-100">
                  <td colSpan={2} className="py-2 px-1 font-bold text-gray-800">
                    The negatives :(
                  </td>
                </tr>

                {negativeItems.map(({ key, label }, index) => {
                  const item = reportData.items?.[key];
                  const isLast = index === negativeItems.length - 1;
                  return (
                    <tr
                      key={key}
                      className={!isLast ? 'border-b' : ''}
                      onMouseEnter={(e) => item && handleMouseOver(e, item.explanation)}
                      onMouseLeave={handleMouseOut}
                    >
                      <td className="py-2 font-medium text-gray-600">{label}</td>
                      <td className="py-2 text-gray-800">{item?.score ?? '...'}</td>
                    </tr>
                  );
                })}

                <tr className="bg-red-200 border-b">
                    <td className="py-2 font-medium text-gray-600">Negatives score</td>
                    <td className="py-2 text-gray-800 font-bold">{negativeScore}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  };

  const renderLogPanel = () => (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-gray-900 bg-opacity-90 text-white shadow-lg p-4 flex flex-col transition-opacity duration-500 ease-in-out ${
          isLogVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onMouseEnter={cancelHideTimer}
        onMouseLeave={startHideTimer}
      >
        <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
          <h3 className="text-xl font-semibold">Checklist Log</h3>
          <button
            onClick={() => setIsLogVisible(false)}
            className="text-gray-400 hover:text-white"
            aria-label="Close log"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {error && <div className="bg-red-900 text-white p-2 mb-4">{error}</div>}
        <div className="flex-grow overflow-y-auto">
          <ul>
            {logMessages.map((msg, index) => (
              <li key={index} className="border-b border-gray-700 p-2 font-mono text-sm">
                {msg}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {!isLogVisible && (
        <div
          className="fixed top-0 right-0 h-full w-2 bg-gray-700 hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
          onMouseEnter={() => setIsLogVisible(true)}
        />
      )}
    </>
  );

  return (
    <div className="container mx-auto">
      {renderChecklistTable()}
      {renderLogPanel()}
      {tooltip.visible && (
        <div
          className="fixed p-2 max-w-sm bg-black text-white text-sm rounded-md shadow-lg"
          style={{ top: tooltip.y + 15, left: tooltip.x + 15 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default ChecklistTab;
