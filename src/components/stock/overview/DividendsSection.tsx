import { StockData } from '../../types/stockFinancials';
import { formatCurrency, formatDate, formatPercentage } from '../utils';

interface DividendsSectionProps {
    stockData: StockData;
    dividendFields: string[];
}

const DividendsSection = ({ stockData, dividendFields }: DividendsSectionProps) => {
    if (!dividendFields.some(field => stockData[field as keyof StockData])) {
        return null;
    }

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold mb-2">Dividends:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center border-b border-gray-200 py-2">
                    <span className="font-medium text-gray-600">Dividend Per Share:</span>
                    <span className="text-gray-800">{formatCurrency(stockData.DividendPerShare)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 py-2">
                    <span className="font-medium text-gray-600">Dividend Yield:</span>
                    <span className="text-gray-800">{formatPercentage(stockData.DividendYield, true)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 py-2">
                    <span className="font-medium text-gray-600">Dividend Date:</span>
                    <span className="text-gray-800">{formatDate(stockData.DividendDate)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 py-2">
                    <span className="font-medium text-gray-600">Ex-Dividend Date:</span>
                    <span className="text-gray-800">{formatDate(stockData.ExDividendDate)}</span>
                </div>
            </div>
        </div>
    );
};

export default DividendsSection;
