import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StockData } from '../components/stock/types/stockFinancials';
import OverviewTab from '../components/stock/OverviewTab';
import FinancialsTab from '../components/stock/FinancialsTab';
import ChecklistTab from '../components/stock/ChecklistTab';
import ValuationTab from '../components/stock/ValuationTab';
import { useGlobalQuote } from '../components/stock/hooks/useFinancialReports';
import FinancialDataStatus from '../components/stock/FinancialDataStatus';
import StockSummaryTable from '../components/stock/StockSummaryTable';
import NotesDialog from '../components/stock/NotesDialog';

const StockPage: React.FC = () => {
  const { symbol } = useParams<{ symbol?: string }>();
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeSubTab, setActiveSubTab] = useState<string>('');
  const [status, setStatus] = useState('');
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [personalNotes, setPersonalNotes] = useState('');
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });

  const statusOptions = [
    'NEW',
    'RESEARCHING',
    'WATCHLIST',
    'BUY_CANDIDATE',
    'OWNED',
    'TRIM',
    'SELL',
    'PASS',
    'BLACKLIST',
  ];


  const { quote, loading: quoteLoading, error: quoteError } = useGlobalQuote({ symbol: symbol || '' });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const [main, sub] = hash.split('/');
      setActiveTab(main || 'overview');
      setActiveSubTab(sub ? decodeURIComponent(sub) : '');
    };

    handleHashChange(); // Initial check
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [symbol]);

  const handleTabClick = (tabName: string) => {
    let newHash = tabName;
    if (tabName === 'financials') {
      newHash += '/incomeStatement';
    } else if (tabName === 'checklist') {
      newHash += '/Ferol';
    } else if (tabName === 'valuation') {
      newHash += '/dcf';
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: personalNotes,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setIsNotesDialogOpen(false);
    } catch (e: any) {
      setDataError(e.message);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!symbol) return;
    try {
      const response = await fetch(`http://localhost:8080/users/dante/stocks/${symbol}/status/${newStatus}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setStatus(newStatus.toUpperCase());
    } catch (e: any) {
      setDataError(e.message);
    }
  };

  const handleMouseOver = (e: React.MouseEvent, content: string) => {
    setTooltip({
      visible: true,
      content: content,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseOut = () => {
    setTooltip({ visible: false, content: '', x: 0, y: 0 });
  };

  useEffect(() => {
    if (!symbol) {
      setDataLoading(false);
      setStockData(null);
      setDataError(null);
      return;
    }

    const fetchStockData = async () => {
      setDataLoading(true);
      setDataError(null);
      try {
        const response = await fetch(`http://localhost:8080/stocks/overview/${symbol}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: StockData = await response.json();
        setStockData(data);
      } catch (e: any) {
        setDataError(e.message);
      } finally {
        setDataLoading(false);
      }
    };

    const fetchStockStatus = async () => {
      if (!symbol) return;
      try {
        const response = await fetch(`http://localhost:8080/users/dante/stocks/${symbol}/status`);
        if (response.ok) {
          const status = await response.json();
          setStatus(status.toUpperCase() || 'NEW');
        } else {
          // If the stock doesn't have a status, default to "New"
          setStatus('NEW');
        }
      } catch (error) {
        console.error('Failed to fetch stock status:', error);
        setStatus('NEW'); // Default to "New" on error
      }
    };

    const fetchPersonalNotes = async () => {
      if (!symbol) return;
      try {
        const response = await fetch(`http://localhost:8080/users/dante/stocks/${symbol}/personalnotes`);
        if (response.ok) {
          const notes = await response.text();
          setPersonalNotes(notes);
        }
      } catch (error) {
        console.error('Failed to fetch personal notes:', error);
      }
    };

    fetchStockData();
    fetchStockStatus();
    fetchPersonalNotes();
  }, [symbol]);

  const isLoading = dataLoading || quoteLoading;
  const hasError = dataError || quoteError;
  if (!symbol) {
    return (
      <div className="container mx-auto p-4">
        <StockSummaryTable />
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center p-4">Loading stock data...</div>;
  }

  if (hasError) {
    return <div className="text-center p-4 text-red-500">Error: {hasError}</div>;
  }

  if (!stockData) {
    return <div className="text-center p-4">No stock data available.</div>;
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

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-4">
        <i className="text-red-500">
          “Let us fall back on the principle that when any rule or formula become a substitute for thought rather than an aid to thinking, it is dangerous and should be discarded.”
        </i>
      </h2>
      <div className="text-center mb-4">
        <Link to="/stocks">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Home
          </button>
        </Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Stock Details for {symbol.toUpperCase()}
          {!dataLoading && !quoteLoading && symbol && <FinancialDataStatus symbol={symbol} />}
          {quote && (
            <span className={`ml-4 ${priceColor}`}>
              {quote.adjClose} {currencySymbol[stockData.currency] || stockData.currency}{' '}
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
          <OverviewTab
            stockData={stockData}
          />
        )}
        {activeTab === 'financials' && <FinancialsTab symbol={symbol} activeSubTab={activeSubTab} onSubTabClick={handleSubTabClick} />}
        {activeTab === 'checklist' && <ChecklistTab symbol={symbol} activeSubTab={activeSubTab} onSubTabClick={handleSubTabClick} />}
        {activeTab === 'valuation' && <ValuationTab symbol={symbol} activeSubTab={activeSubTab} onSubTabClick={handleSubTabClick} />}
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
