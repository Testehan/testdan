import React, { useState, useEffect, useRef, useCallback } from 'react';
import Spinner from './Spinner';
import {
  financialItems,
  moatItems,
  potentialItems,
  customerItems,
  companySpecificFactorsItems,
  managementAndCultureItems,
  stockItems,
  negativeItems,
} from './checklistDefinitions';

import {
  reinvestmentEngineItems,
  managementItems as managementItems100Bagger,
  marketAndScalabilityItems,
  businessQualityItems,
  valuationItems,
  shareholderImpactItems,
  investorFitCoffeeCanItems,
  negativeItems100Bagger,
} from './100BaggerChecklistDefinitions';

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

const checklists = {
  Ferol: {
    name: 'Ferol',
    items: [
      { title: 'Financials', items: financialItems },
      { title: 'Moat/Defence', items: moatItems },
      { title: 'Potential / Offense', items: potentialItems },
      { title: 'Customers', items: customerItems },
      { title: 'Company specific factors', items: companySpecificFactorsItems },
      { title: 'Management and culture', items: managementAndCultureItems },
      { title: 'Stock', items: stockItems },
      { title: 'The negatives :(', items: negativeItems, scoreClass: 'bg-red-200' },
    ],
  },
  '100 Bagger': {
    name: '100 Bagger',
    items: [
      { title: 'Reinvestment Engine', items: reinvestmentEngineItems },
      { title: 'Management', items: managementItems100Bagger },
      { title: 'Market & Scalability', items: marketAndScalabilityItems },
      { title: 'Business Quality', items: businessQualityItems },
      { title: 'Valuation', items: valuationItems },
      { title: 'Shareholder Impact', items: shareholderImpactItems },
      { title: 'Investor Fit / Coffee Can', items: investorFitCoffeeCanItems },
      { title: 'The negatives :(', items: negativeItems100Bagger, scoreClass: 'bg-red-200' },
    ],
  },
};

const ChecklistTab: React.FC<ChecklistTabProps> = ({ symbol }) => {
  const [activeChecklist, setActiveChecklist] = useState('Ferol');
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [reportData, setReportData] = useState<Partial<ReportData>>({});
  const [editableScores, setEditableScores] = useState<Record<string, ChecklistItem>>({});
  const [hasScoresChanged, setHasScoresChanged] = useState<boolean>(false);
  const [tooltip, setTooltip] = useState<Tooltip>({ visible: false, content: '', x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isLogVisible, setIsLogVisible] = useState(true);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const hasReceivedMessages = useRef(false);
  const hideTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const isLoadedFromDbRef = useRef(false);

  useEffect(() => {
    if (reportData.items) {
      setEditableScores(reportData.items);
      setHasScoresChanged(false);
    }
  }, [reportData.items]);

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
    isLoadedFromDbRef.current = false;
    setIsLogVisible(true);
    cancelHideTimer();
    setLoading(true);
    setElapsedTime(0);

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    const url =
      regenerationCount > 0
        ? `http://localhost:8080/stocks/reporting/${activeChecklist.toLowerCase()}/${symbol}?recreateReport=true`
        : `http://localhost:8080/stocks/reporting/${activeChecklist.toLowerCase()}/${symbol}`;

    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setError(null);
      setIsLogVisible(true);
    };

    eventSource.addEventListener('MESSAGE', (event: MessageEvent) => {
      hasReceivedMessages.current = true;
      if (event.data.includes("Report loaded from database.")) {
        isLoadedFromDbRef.current = true;
      }
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
        setEditableScores(itemsMap);

        if (isLoadedFromDbRef.current) {
          setIsLogVisible(false);
          cancelHideTimer();
        } else {
          startHideTimer();
        }
      } catch (e) {
        console.error("Failed to parse checklist data:", e);
        startHideTimer();
      }
      eventSource.close();
      setLoading(false);
      clearInterval(timer);
    });

    eventSource.addEventListener('ERROR', (event: MessageEvent) => {
      setError(event.data);
      setIsLogVisible(true);
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
  }, [symbol, regenerationCount, startHideTimer, cancelHideTimer, activeChecklist]);

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

  const handleChangeScore = (key: string, value: string) => {
    setEditableScores(prevScores => {
      const newScores = {
        ...prevScores,
        [key]: {
          ...prevScores[key],
          score: parseFloat(value) || 0,
        },
      };
      return newScores;
    });
    setHasScoresChanged(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      const itemsArray = Object.keys(editableScores).map(key => ({
        name: key,
        score: editableScores[key].score,
        explanation: editableScores[key].explanation,
      }));

      const response = await fetch(`http://localhost:8080/stocks/reporting/${activeChecklist.toLowerCase()}/${symbol}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemsArray),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setHasScoresChanged(false);
      setLogMessages(prev => [`Scores saved successfully at ${new Date().toLocaleString()}`, ...prev]);

      const newFinalScore = Object.values(editableScores).reduce((sum, item) => sum + item.score, 0);
      setReportData(prevReportData => ({
        ...prevReportData,
        finalScore: newFinalScore,
      }));
    } catch (e: any) {
      setError(`Failed to save scores: ${e.message}`);
      setLogMessages(prev => [`Failed to save scores: ${e.message}`, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const renderChecklistTable = () => {
    const checklist = checklists[activeChecklist];
    const lastPositiveSectionIndex = checklist.items.findIndex(section => section.title.includes('The negatives :(')) - 1;
    const negativeSectionIndex = checklist.items.findIndex(section => section.title.includes('The negatives :('));

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
              <h3 className="text-lg font-semibold">{checklist.name} Checklist</h3>
              <div className="space-x-2">
                <button
                  onClick={() => setRegenerationCount(count => count + 1)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                  disabled={loading}
                >
                  Regenerate
                </button>
                <button
                  onClick={handleSave}
                  className={`font-bold py-1 px-3 rounded text-sm ${
                    hasScoresChanged && !loading
                      ? 'bg-green-500 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!hasScoresChanged || loading}
                >
                  Save
                </button>
              </div>
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

                {checklist.items.map((section, sectionIndex) => (
                  <React.Fragment key={section.title}>
                    <tr className="bg-gray-100">
                      <td colSpan={2} className="py-2 px-1 font-bold text-gray-800">
                        {section.title}
                      </td>
                    </tr>
                    {section.items.map(({ key, label }, index) => {
                      const item = editableScores?.[key];
                      const isLast = index === section.items.length - 1;
                      return (
                        <tr
                          key={key}
                          className={!isLast ? 'border-b' : ''}
                          onMouseEnter={(e) => item && handleMouseOver(e, item.explanation)}
                          onMouseLeave={handleMouseOut}
                        >
                          <td className="py-2 font-medium text-gray-600">{label}</td>
                          <td className="py-2 text-gray-800">
                            <input
                              type="number"
                              value={item?.score ?? ''}
                              onChange={(e) => handleChangeScore(key, e.target.value)}
                              className="w-20 p-1 border rounded-md text-gray-800 text-right"
                            />
                          </td>
                        </tr>
                      );
                    })}
                    {sectionIndex === lastPositiveSectionIndex && (
                      <tr className="bg-green-200 border-b">
                        <td className="py-2 font-medium text-gray-600">Positives score</td>
                        <td className="py-2 text-gray-800 font-bold">{positiveScore}</td>
                      </tr>
                    )}
                    {sectionIndex === negativeSectionIndex && (
                      <tr className="bg-red-200 border-b">
                          <td className="py-2 font-medium text-gray-600">Negatives score</td>
                          <td className="py-2 text-gray-800 font-bold">{negativeScore}</td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
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
      <div className="flex border-b">
        {Object.keys(checklists).map(name => (
          <button
            key={name}
            onClick={() => setActiveChecklist(name)}
            className={`py-2 px-4 text-sm font-medium ${
              activeChecklist === name
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
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
