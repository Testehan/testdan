import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StockData } from '../components/stock/types/stockFinancials';
import OverviewTab from '../components/stock/OverviewTab';
import FinancialsTab from '../components/stock/FinancialsTab';
import ChecklistTab from '../components/stock/ChecklistTab';
import { useGlobalQuote } from '../components/stock/hooks/useFinancialReports';

const StockPage: React.FC = () => {
  const { symbol } = useParams<{ symbol?: string }>(); // Make symbol optional to handle cases where it might not be in URL
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const { quote, loading: quoteLoading, error: quoteError } = useGlobalQuote({ symbol: symbol || '' });

  useEffect(() => {
    if (!symbol) {
      setError('No stock symbol provided in the URL.');
      setLoading(false);
      return;
    }

    const fetchStockData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/stocks/overview/${symbol}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: StockData = await response.json();
        setStockData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]); // Add symbol to dependency array

  if (loading) {
    return <div className="text-center p-4">Loading stock data...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  if (!stockData || !symbol) { // Check for symbol here too
    return <div className="text-center p-4">No stock data available or symbol missing.</div>;
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
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === 'financials' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('financials')}
        >
          Financials
        </button>
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === 'checklist' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('checklist')}
        >
          Checklist
        </button>
      </div>
      <div>
        {activeTab === 'overview' && stockData && (
          <OverviewTab
            stockData={stockData}
          />
        )}
        {activeTab === 'financials' && <FinancialsTab symbol={symbol} />}
        {activeTab === 'checklist' && <ChecklistTab symbol={symbol} />}
      </div>
    </div>
  );
};

export default StockPage;
