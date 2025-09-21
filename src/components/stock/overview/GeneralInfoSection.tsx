import React from 'react';
import { StockData } from '../types/stockFinancials';

interface GeneralInfoSectionProps {
  stockData: StockData;
}

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ stockData }) => {
  const generalInfo = {
    "Company Name": stockData.companyName,
    "Symbol": stockData.symbol,
    "Industry": stockData.industry,
    "Sector": stockData.sector,
    "Country": stockData.country,
    "Currency": stockData.currency,
    "Website": stockData.website,
    "CEO": stockData.ceo,
    "Full Time Employees": stockData.fullTimeEmployees,
    "Market Cap": stockData.marketCap,
    "Beta": stockData.beta,
    "Last Dividend": stockData.lastDividend,
    "52 Week Range": stockData.range,
    "Last Updated": stockData.lastUpdated,
  };

  return (
    <div className="p-4 bg-gray-50 shadow rounded-lg mb-4">
      <h4 className="text-lg font-semibold mb-3">General Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        {Object.entries(generalInfo).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center border-b border-gray-200 py-2">
            <span className="font-medium text-gray-600">{key}:</span>
            <span className="text-gray-800">{value}</span>
          </div>
        ))}
      </div>
      <div>
        <h4 className="text-lg font-semibold mt-4 mb-2">Description</h4>
        <p className="text-gray-700">{stockData.description}</p>
      </div>
    </div>
  );
};

export default GeneralInfoSection;
