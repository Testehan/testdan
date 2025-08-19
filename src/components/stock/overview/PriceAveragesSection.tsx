import { StockData } from '../types';

interface PriceAveragesSectionProps {
    stockData: StockData;
    priceAveragesFields: string[];
}

const PriceAveragesSection = ({ stockData, priceAveragesFields }: PriceAveragesSectionProps) => {
    if (!priceAveragesFields.some(field => stockData[field as keyof StockData])) {
        return null;
    }

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold mb-2">Price Averages:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {priceAveragesFields.map(key => {
                    const value = stockData[key as keyof StockData];
                    if (value === undefined) return null;

                    let displayValue = parseFloat(value as string).toFixed(2);

                    return (
                        <div key={key} className="flex justify-between items-center border-b border-gray-200 py-2">
                            <span className="font-medium text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="text-gray-800">{displayValue}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PriceAveragesSection;
