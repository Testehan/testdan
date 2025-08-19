import { StockData } from '../types';
import { formatCurrency } from '../utils';

interface AnalystRatingsSectionProps {
    stockData: StockData;
    analystFields: string[];
}

const AnalystRatingsSection = ({ stockData, analystFields }: AnalystRatingsSectionProps) => {
    if (!analystFields.some(field => stockData[field as keyof StockData])) {
        return null;
    }

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold mb-2">Analyst Ratings:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analystFields.map(key => {
                    const value = stockData[key as keyof StockData];
                    if (value === undefined) return null;

                    let displayValue = value;
                    if (key === 'AnalystTargetPrice') {
                        displayValue = formatCurrency(value as string);
                    }

                    return (
                        <div key={key} className="flex justify-between items-center border-b border-gray-200 py-2">
                            <span className="font-medium text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="text-gray-800">{displayValue as string}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AnalystRatingsSection;
