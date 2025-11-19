import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { StockData } from '../components/stock/shared/types/stockFinancials';
import { useGlobalQuote } from '../components/stock/hooks/useFinancialReports';
import FinancialDataStatus from '../components/stock/shared/components/FinancialDataStatus';
import StockSummaryTable from '../components/stock/tables/StockSummaryTable';
import NotesDialog from '../components/stock/shared/components/NotesDialog';
import Menu from '../components/Menu';

// Lazy load tab components for code splitting and progressive loading
const OverviewTab = lazy(() => import('../components/stock/tabs/OverviewTab'));
const FinancialsTab = lazy(() => import('../components/stock/tabs/FinancialsTab'));
const ChecklistTab = lazy(() => import('../components/stock/tabs/ChecklistTab'));
const ValuationTab = lazy(() => import('../components/stock/tabs/ValuationTab'));
const BusinessAnalysisTab = lazy(() => import('../components/stock/tabs/BusinessAnalysisTab'));

// Loading fallback for lazy components
const TabLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex justify-center items-center p-8">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    {message && <span className="ml-2 text-gray-500">{message}</span>}
  </div>
);

const StockPage: React.FC = () => {
  const { symbol } = useParams<{ symbol?: string }>();
  
  // Active tab from URL determines priority loading
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeSubTab, setActiveSubTab] = useState<string>('');
  
  // Data states - all optional, loaded progressively
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [status, setStatus] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  
  // Cache to avoid redundant API calls when switching tabs
  const fetchedCache = useRef<{
    overview: string | null;
    status: string | null;
    notes: string | null;
  }>({
    overview: null,
    status: null,
    notes: null,
  });
  
  // Loading states per data type
  const [dataLoading, setDataLoading] = useState<{
    overview: boolean;
    status: boolean;
    notes: boolean;
    financials: boolean;
    checklist: boolean;
    valuation: boolean;
    businessAnalysis: boolean;
  }>({
    overview: true,
    status: false,
    notes: false,
    financials: false,
    checklist: false,
    valuation: false,
    businessAnalysis: false,
  });

  // Error states
  const [errors, setErrors] = useState<{
    overview?: string;
    status?: string;
    notes?: string;
    financials?: string;
    checklist?: string;
    valuation?: string;
    businessAnalysis?: string;
  }>({});

  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });

  const statusOptions = [
    'NEW',
    'RESEARCHING',
    'WATCHLIST',
    'BUY_CANDIDATE',
    'OWNED',
    'PASS',
  ];

  const { quote, loading: quoteLoading } = useGlobalQuote({ symbol: symbol || '' });

  // Parse URL hash to determine active tab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const [main, sub] = hash.split('/');
      setActiveTab(main || 'overview');
      setActiveSubTab(sub ? decodeURIComponent(sub) : '');
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [symbol]);

  // Core data fetching functions
  const fetchOverviewData = async (): Promise<StockData | null> => {
    if (!symbol) return null;
    try {
      const response = await fetch(`http://localhost:8080/stocks/overview/${symbol}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (e: any) {
      setErrors(prev => ({ ...prev, overview: e.message }));
      return null;
    }
  };

  const fetchStatusData = async (): Promise<string> => {
    if (!symbol) return 'NEW';
    try {
      const response = await fetch(`http://localhost:8080/users/dante/stocks/${symbol}/status`);
      if (!response.ok) return 'NEW';
      const data = await response.json();
      return (data as string).toUpperCase() || 'NEW';
    } catch (e: any) {
      setErrors(prev => ({ ...prev, status: 'Failed to load status' }));
      return 'NEW';
    }
  };

  const fetchNotesData = async (): Promise<string> => {
    if (!symbol) return '';
    try {
      const response = await fetch(`http://localhost:8080/users/dante/stocks/${symbol}/personalnotes`);
      if (!response.ok) return '';
      return await response.text();
    } catch (e: any) {
      setErrors(prev => ({ ...prev, notes: 'Failed to load notes' }));
      return '';
    }
  };

  // Reset all data when symbol changes
  useEffect(() => {
    setStockData(null);
    setStatus('');
    setPersonalNotes('');
    setErrors({});
    // Reset cache for new symbol
    fetchedCache.current = { overview: null, status: null, notes: null };
  }, [symbol]);

  // Smart data loading based on active tab - only fetches once per symbol
  useEffect(() => {
    if (!symbol) return;

    const loadData = async () => {
      // Check cache to avoid redundant API calls when switching tabs
      const needsOverview = fetchedCache.current.overview !== symbol;
      const needsStatus = fetchedCache.current.status !== symbol;
      const needsNotes = fetchedCache.current.notes !== symbol;

      // Fetch overview if not cached
      if (needsOverview) {
        setDataLoading(prev => ({ ...prev, overview: true }));
        const overviewData = await fetchOverviewData();
        if (overviewData) {
          setStockData(overviewData);
          fetchedCache.current.overview = symbol;
        }
        setDataLoading(prev => ({ ...prev, overview: false }));
      }

      // Fetch status and notes if not cached
      if (needsStatus || needsNotes) {
        setDataLoading(prev => ({ ...prev, status: true, notes: true }));
        const results = await Promise.all([
          needsStatus ? fetchStatusData() : Promise.resolve(status),
          needsNotes ? fetchNotesData() : Promise.resolve(personalNotes)
        ]);
        if (needsStatus) {
          setStatus(results[0]);
          fetchedCache.current.status = symbol;
        }
        if (needsNotes) {
          setPersonalNotes(results[1]);
          fetchedCache.current.notes = symbol;
        }
        setDataLoading(prev => ({ ...prev, status: false, notes: false }));
      }
    };

    loadData();
  }, [symbol, activeTab]);

  const handleTabClick = (tabName: string) => {
    let newHash = tabName;
    if (tabName === 'financials') {
      newHash += '/incomeStatement';
    } else if (tabName === 'checklist') {
      newHash += '/Ferol';
    } else if (tabName === 'valuation') {
      newHash += '/dcf';
    } else if (tabName === 'businessAnalysis') {
      // No sub-tab for now
    }
    window.location.hash = newHash;
  };

  const handleSubTabClick = (subTabName: string) => {
    window.location.hash = `${activeTab}/${encodeURIComponent(subTabName)}`;
  };

  const handleSaveNotes = async () => {
    if (!symbol) return;
    try {
      const response = await fetch(`http://localhost:8080/users/dante/stocks/${symbol}/personalnotes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: personalNotes,
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setIsNotesDialogOpen(false);
    } catch (e: any) {
      console.error('Failed to save notes:', e.message);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!symbol) return;
    try {
      const response = await fetch(`http://localhost:8080/users/dante/stocks/${symbol}/status/${newStatus}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setStatus(newStatus.toUpperCase());
    } catch (e: any) {
      console.error('Failed to update status:', e.message);
    }
  };

  const handleMouseOver = (e: React.MouseEvent, content: string) => {
    setTooltip({
      visible: true,
      content,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseOut = () => {
    setTooltip({ visible: false, content: '', x: 0, y: 0 });
  };

  const showTabLoading = () => {
    switch (activeTab) {
      case 'overview':
        return dataLoading.overview;
      case 'financials':
        return dataLoading.financials;
      case 'checklist':
        return dataLoading.checklist;
      case 'valuation':
        return dataLoading.valuation;
      case 'businessAnalysis':
        return dataLoading.businessAnalysis;
      default:
        return false;
    }
  };

  if (!symbol) {
    return (
      <div className="container mx-auto p-4">
        <Menu />
        <StockSummaryTable />
      </div>
    );
  }

  if (showTabLoading()) {
    return <TabLoader message={`Loading ${activeTab}...`} />;
  }

  if (errors.overview && !stockData) {
    return <div className="text-center p-4 text-red-500">Error: {errors.overview}</div>;
  }

  const changePercent =
    quote && quote.adjOpen !== 0
      ? ((quote.adjClose - quote.adjOpen) / quote.adjOpen) * 100
      : 0;
  const priceColor = changePercent >= 0 ? 'text-green-600' : 'text-red-600';

  const currencySymbol: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    JPY: '¥',
    GBP: '£',
  };

  const displayCurrency = stockData?.currency ? currencySymbol[stockData.currency] : '$';
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-4">
        <i className="text-red-500">
          “Let us fall back on the principle that when any rule or formula become a substitute for thought rather than an aid to thinking, it is dangerous and should be discarded.”
        </i>
      </h2>
      <Menu />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Stock Details for {symbol?.toUpperCase()}
          {!dataLoading.overview && !quoteLoading && symbol && <FinancialDataStatus symbol={symbol} />}
          {quote && (
            <span className={`ml-4 ${priceColor}`}>
              {quote.adjClose} {displayCurrency}{' '}
              <span className="text-sm ml-2">({changePercent.toFixed(2)}%)</span>
            </span>
          )}
        </h2>
        <div className="flex items-center">
          <select
            value={status.toUpperCase()}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button
              onClick={() => setIsNotesDialogOpen(true)}
              onMouseOver={(e) => {
                e.stopPropagation();
                if (personalNotes) {
                  handleMouseOver(e, personalNotes);
                } else {
                  handleMouseOut();
                }
              }}
              className={`mr-4 p-2 rounded-md hover:bg-gray-200 ${personalNotes ? 'text-blue-500' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {(dataLoading.status || dataLoading.notes) && (
            <div className="flex items-center text-gray-500 text-sm" title="Loading additional data...">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            </div>
          )}
        </div>
      </div>
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => handleTabClick('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === 'businessAnalysis' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => handleTabClick('businessAnalysis')}
        >
          Business Analysis
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === 'financials' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => handleTabClick('financials')}
        >
          Financials
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === 'checklist' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => handleTabClick('checklist')}
        >
          Checklist
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === 'valuation' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => handleTabClick('valuation')}
        >
          Valuation
        </button>
      </div>
      <div>
        {activeTab === 'overview' && stockData && (
          <Suspense fallback={<TabLoader message="Loading overview..." />}>
            <OverviewTab stockData={stockData} />
          </Suspense>
        )}
        {activeTab === 'businessAnalysis' && (
          <Suspense fallback={<TabLoader message="Loading business analysis..." />}>
            <BusinessAnalysisTab symbol={symbol || ''} />
          </Suspense>
        )}
        {activeTab === 'financials' && (
          <Suspense fallback={<TabLoader message="Loading financials..." />}>
            <FinancialsTab symbol={symbol || ''} activeSubTab={activeSubTab} onSubTabClick={handleSubTabClick} />
          </Suspense>
        )}
        {activeTab === 'checklist' && (
          <Suspense fallback={<TabLoader message="Loading checklist..." />}>
            <ChecklistTab symbol={symbol || ''} activeSubTab={activeSubTab} onSubTabClick={handleSubTabClick} />
          </Suspense>
        )}
        {activeTab === 'valuation' && (
          <Suspense fallback={<TabLoader message="Loading valuation..." />}>
            <ValuationTab symbol={symbol || ''} activeSubTab={activeSubTab} onSubTabClick={handleSubTabClick} />
          </Suspense>
        )}
      </div>
      <NotesDialog
        isOpen={isNotesDialogOpen}
        onClose={() => setIsNotesDialogOpen(false)}
        onSave={handleSaveNotes}
        notes={personalNotes}
        onNotesChange={setPersonalNotes}
      />
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


export default StockPage;
