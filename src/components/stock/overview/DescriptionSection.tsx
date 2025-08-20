import { StockData } from '../types/stockFinancials';

interface DescriptionSectionProps {
    stockData: StockData;
    descriptiveFields: string[];
}

const DescriptionSection = ({ stockData, descriptiveFields }: DescriptionSectionProps) => {
    if (!stockData.Description) {
        return null;
    }

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold mb-2">Description:</h4>
            <p className="text-gray-700">{stockData.Description}</p>
            {descriptiveFields.some(field => stockData[field as keyof StockData]) && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {descriptiveFields.map(key => {
                        const value = stockData[key as keyof StockData];
                        if (value === undefined) return null;
                        return (
                            <div key={key} className="flex justify-between items-center border-b border-gray-200 py-2">
                                <span className="font-medium text-gray-600">{key}:</span>
                                <span className="text-gray-800">{value as string}</span>
                            </div>
                        );
                    })}
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
};

export default DescriptionSection;
