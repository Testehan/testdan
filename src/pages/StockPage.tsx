import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StockData } from '../components/stock/types/stockFinancials';
import OverviewTab from '../components/stock/OverviewTab';
import IncomeStatementTab from '../components/stock/IncomeStatementTab';

const StockPage: React.FC = () => {
  const { symbol } = useParams<{ symbol?: string }>(); // Make symbol optional to handle cases where it might not be in URL
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const fieldsToRemove = [
    'id', 'AssetType', 'CIK', 'Exchange', 'Address', 'FiscalYearEnd', 'Description', 'OfficialSite', 'Name', 'Symbol',
    'AnalystTargetPrice', 'AnalystRatingStrongBuy', 'AnalystRatingBuy', 'AnalystRatingHold', 'AnalystRatingSell', 'AnalystRatingStrongSell',
    'Country', 'Sector', 'Industry', 'Currency',
    'SharesOutstanding', 'SharesFloat', 'PercentInsiders', 'PercentInstitutions',
    'DividendPerShare', 'DividendYield', 'DividendDate', 'ExDividendDate',
    '52WeekHigh', '52WeekLow', '50DayMovingAverage', '200DayMovingAverage',
    'PERatio', 'ForwardPE', 'TrailingPE', 'PriceToSalesRatioTTM', 'EVToRevenue', 'EVToEBITDA', 'PriceToBookRatio', 'PEGRatio',
    'ProfitMargin', 'OperatingMarginTTM', 'ReturnOnAssetsTTM', 'ReturnOnEquityTTM'
  ];
  const fieldsToFormatAsLargeNumber = [
    'MarketCapitalization',
    'EBITDA',
    'RevenueTTM',
    'GrossProfitTTM',
    'SharesOutstanding',
    'SharesFloat',
  ];
  const fieldsToMultiplyBy100AndFormatPercent = [
    'DividendYield',
    'QuarterlyEarningsGrowthYOY',
    'QuarterlyRevenueGrowthYOY',
  ];
  const analystFields = [
    'AnalystTargetPrice', 'AnalystRatingStrongBuy', 'AnalystRatingBuy', 'AnalystRatingHold', 'AnalystRatingSell', 'AnalystRatingStrongSell'
  ];
  const descriptiveFields = [
    'Country', 'Currency', 'Sector', 'Industry'
  ];
  const shareOwnershipFields = [
    'SharesOutstanding', 'SharesFloat', 'PercentInsiders', 'PercentInstitutions'
  ];
  const dividendFields = [
    'DividendPerShare', 'DividendYield', 'DividendDate', 'ExDividendDate'
  ];
  const priceAveragesFields = [
    '52WeekHigh', '52WeekLow', '50DayMovingAverage', '200DayMovingAverage'
  ];
  const valuationFields = [
    'PERatio', 'ForwardPE', 'TrailingPE', 'PriceToSalesRatioTTM', 'EVToRevenue', 'EVToEBITDA', 'PriceToBookRatio', 'PEGRatio'
  ];
  const marginFields = ['ProfitMargin', 'OperatingMarginTTM'];
  const returnOnFields = ['ReturnOnAssetsTTM', 'ReturnOnEquityTTM'];

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

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Stock Details for {symbol.toUpperCase()}</h2>
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
            activeTab === 'incomeStatement' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('incomeStatement')}
        >
          Income Statement
        </button>
        {/* Future tabs will go here */}
      </div>
      <div>
        {activeTab === 'overview' && stockData && (
          <OverviewTab
            stockData={stockData}
            fieldsToRemove={fieldsToRemove}
            fieldsToFormatAsLargeNumber={fieldsToFormatAsLargeNumber}
            fieldsToMultiplyBy100AndFormatPercent={fieldsToMultiplyBy100AndFormatPercent}
            descriptiveFields={descriptiveFields}
            priceAveragesFields={priceAveragesFields}
            valuationFields={valuationFields}
            marginFields={marginFields}
            returnOnFields={returnOnFields}
            dividendFields={dividendFields}
            shareOwnershipFields={shareOwnershipFields}
            analystFields={analystFields}
          />
        )}
        {activeTab === 'incomeStatement' && <IncomeStatementTab symbol={symbol} />}
      </div>
    </div>
  );
};

export default StockPage;

