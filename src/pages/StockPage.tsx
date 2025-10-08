import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StockData } from '../components/stock/types/stockFinancials';
import OverviewTab from '../components/stock/OverviewTab';
import FinancialsTab from '../components/stock/FinancialsTab';
import ChecklistTab from '../components/stock/ChecklistTab';
import ValuationTab from '../components/stock/ValuationTab';
import { useGlobalQuote } from '../components/stock/hooks/useFinancialReports';
import StockSummaryTable from '../components/stock/StockSummaryTable';

const StockPage: React.FC = () => {
  const { symbol } = useParams<{ symbol?: string }>();
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeSubTab, setActiveSubTab] = useState<string>('');

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
  }, []);

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

    fetchStockData();
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
      <h2 className="text-2xl font-bold mb-4">
        <i className=" text-red-500">“Let us fall back on the principle that when any rule or formula become a
          substitute for thought rather than an aid to thinking, it is dangerous and should be discarded.” </i>
        <br />
        Stock Details for {symbol.toUpperCase()}
        {quoteLoading && <span className="ml-4 text-sm">Loading quote...</span>}
        {quoteError && <span className="ml-4 text-sm text-red-500">Error loading quote</span>}
        {quote && (
          <span className={`ml-4 ${priceColor}`}>
            {quote.adjClose} {currencySymbol[stockData.currency] || stockData.currency}{' '}
            <span className="text-sm ml-2">({changePercent.toFixed(2)}%)</span>
          </span>
        )}
      </h2>
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
    </div>
  );
};

export default StockPage;
