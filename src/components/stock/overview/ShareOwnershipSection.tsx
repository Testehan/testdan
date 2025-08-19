import { StockData } from '../types';
import { formatLargeNumber, formatPercentage } from '../utils';

interface ShareOwnershipSectionProps {
    stockData: StockData;
    shareOwnershipFields: string[];
}

const ShareOwnershipSection = ({ stockData, shareOwnershipFields }: ShareOwnershipSectionProps) => {
    if (!shareOwnershipFields.some(field => stockData[field as keyof StockData])) {
        return null;
    }

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold mb-2">Share Ownership:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center border-b border-gray-200 py-2">
                    <span className="font-medium text-gray-600">Shares Outstanding:</span>
                    <span className="text-gray-800">{formatLargeNumber(stockData.SharesOutstanding)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 py-2">
                    <span className="font-medium text-gray-600">Shares Float:</span>
                    <span className="text-gray-800">{formatLargeNumber(stockData.SharesFloat)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 py-2">
                    <span className="font-medium text-gray-600">Percent Insiders:</span>
                    <span className="text-gray-800">{formatPercentage(stockData.PercentInsiders, false)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 py-2">
                    <span className="font-medium text-gray-600">Percent Institutions:</span>
                    <span className="text-gray-800">{formatPercentage(stockData.PercentInstitutions, false)}</span>
                </div>
            </div>
        </div>
    );
};

export default ShareOwnershipSection;
