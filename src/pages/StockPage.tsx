import React, { useState, useEffect } from 'react';

interface StockData {
  lastUpdated: string;
  Symbol: string;
  Name: string;
  Description: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  LatestQuarter: string;
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  RevenuePerShareTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  DilutedEPSTTM: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  '52WeekHigh': string;
  '52WeekLow': string;
  '50DayMovingAverage': string;
  '200DayMovingAverage': string;
  SharesOutstanding: string;
  DividendDate: string;
  ExDividendDate: string;
  OfficialSite: string;
  AnalystRatingStrongBuy: string;
  AnalystRatingBuy: string;
  AnalystRatingHold: string;
  AnalystRatingSell: string;
  AnalystRatingStrongSell: string;
  SharesFloat: string;
  PercentInsiders: string;
  PercentInstitutions: string;
}

const StockPage: React.FC = () => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const fieldsToRemove = ['id', 'AssetType', 'CIK', 'Exchange', 'Address', 'FiscalYearEnd', 'Description', 'OfficialSite'];
  const fieldsToFormatAsLargeNumber = [
    'MarketCapitalization',
    'EBITDA',
    'RevenueTTM',
    'GrossProfitTTM',
    'SharesOutstanding',
    'SharesFloat',
  ];
  const fieldsToAppendPercent = [
    'PercentInsiders',
    'PercentInstitutions',
  ];
  const fieldsToMultiplyBy100AndFormatPercent = [
    'DividendYield',
    'ProfitMargin',
    'OperatingMarginTTM',
    'QuarterlyEarningsGrowthYOY',
    'QuarterlyRevenueGrowthYOY',
    'ReturnOnAssetsTTM',
    'ReturnOnEquityTTM',
  ];

  const formatLargeNumber = (numStr: string): string => {
    const num = parseFloat(numStr);
    if (isNaN(num)) return numStr;

    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (absNum >= 1.0e12) return sign + (absNum / 1.0e12).toFixed(2) + 'T';
    if (absNum >= 1.0e9) return sign + (absNum / 1.0e9).toFixed(2) + 'B';
    if (absNum >= 1.0e6) return sign + (absNum / 1.0e6).toFixed(2) + 'M';
    if (absNum >= 1.0e3) return sign + (absNum / 1.0e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const formatPercentage = (numStr: string, multiplyBy100: boolean = false): string => {
    const num = parseFloat(numStr);
    if (isNaN(num)) return numStr;
    if (multiplyBy100) {
      return (num * 100).toFixed(2) + '%';
    }
    return num.toFixed(3) + '%';
  };

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch('http://localhost:8080/stocks/overview/AAPL');
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
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading stock data...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  if (!stockData) {
    return <div className="text-center p-4">No stock data available.</div>;
  }

  const renderOverviewTab = () => (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="text-xl font-semibold mb-4">{stockData.Name} ({stockData.Symbol})</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"> {/* Added mb-4 for spacing */}
        {Object.entries(stockData)
          .filter(([key]) => !fieldsToRemove.includes(key))
          .map(([key, value]) => {
            let displayValue = value;
            if (fieldsToFormatAsLargeNumber.includes(key)) {
              displayValue = formatLargeNumber(value as string);
            } else if (fieldsToMultiplyBy100AndFormatPercent.includes(key)) {
              displayValue = formatPercentage(value as string, true);
            } else if (fieldsToAppendPercent.includes(key)) {
              displayValue = formatPercentage(value as string, false);
            }
            return (
              <div key={key} className="flex justify-between items-center border-b border-gray-200 py-2">
                <span className="font-medium text-gray-600">{key}:</span>
                <span className="text-gray-800">{displayValue}</span>
              </div>
            );
          })}
      </div>

      {stockData.Description && (
        <div className="mt-4 pt-4 border-t border-gray-200"> {/* Separator and top margin */}
          <h4 className="text-lg font-semibold mb-2">Description:</h4>
          <p className="text-gray-700">{stockData.Description}</p>
        </div>
      )}

      {stockData.OfficialSite && (
        <div className="mt-2">
          <h4 className="text-lg font-semibold mb-1">Official Website:</h4>
          <a
            href={stockData.OfficialSite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {stockData.OfficialSite}
          </a>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Stock Details</h2>
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        {/* Future tabs will go here */}
      </div>
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
      </div>
    </div>
  );
};


export default StockPage;
