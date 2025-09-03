import React, { useState, useEffect, useRef, useCallback } from 'react';

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
    });

    eventSource.onerror = () => {
      if (!hasReceivedMessages.current) {
        setError('Error connecting to the SSE stream. Please check the connection.');
      }
      eventSource.close();
    };

    return () => {
      eventSource.close();
      cancelHideTimer();
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

  const renderChecklistTable = () => (
    <div className="p-4">
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
          </tbody>
        </table>
      </div>
    </div>
  );

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
        {error && <div className="text-red-400 mb-4">{error}</div>}
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
