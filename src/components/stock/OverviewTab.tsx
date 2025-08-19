import { StockData } from './types';
import DescriptionSection from './overview/DescriptionSection';
import PriceAveragesSection from './overview/PriceAveragesSection';
import ValuationSection from './overview/ValuationSection';
import MarginsSection from './overview/MarginsSection';
import ReturnOnSection from './overview/ReturnOnSection';
import DividendsSection from './overview/DividendsSection';
import ShareOwnershipSection from './overview/ShareOwnershipSection';
import AnalystRatingsSection from './overview/AnalystRatingsSection';
import { formatLargeNumber, formatPercentage } from './utils';

interface OverviewTabProps {
    stockData: StockData;
    fieldsToRemove: string[];
    fieldsToFormatAsLargeNumber: string[];
    fieldsToMultiplyBy100AndFormatPercent: string[];
    descriptiveFields: string[];
    priceAveragesFields: string[];
    valuationFields: string[];
    marginFields: string[];
    returnOnFields: string[];
    dividendFields: string[];
    shareOwnershipFields: string[];
    analystFields: string[];
}

const OverviewTab = ({
    stockData,
    fieldsToRemove,
    fieldsToFormatAsLargeNumber,
    fieldsToMultiplyBy100AndFormatPercent,
    descriptiveFields,
    priceAveragesFields,
    valuationFields,
    marginFields,
    returnOnFields,
    dividendFields,
    shareOwnershipFields,
    analystFields
}: OverviewTabProps) => {
    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{stockData.Name} ({stockData.Symbol})</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {Object.entries(stockData)
                    .filter(([key]) => !fieldsToRemove.includes(key))
                    .map(([key, value]) => {
                        let displayValue = value;
                        if (fieldsToFormatAsLargeNumber.includes(key)) {
                            displayValue = formatLargeNumber(value as string);
                        } else if (fieldsToMultiplyBy100AndFormatPercent.includes(key)) {
                            displayValue = formatPercentage(value as string, true);
                        }
                        return (
                            <div key={key} className="flex justify-between items-center border-b border-gray-200 py-2">
                                <span className="font-medium text-gray-600">{key}:</span>
                                <span className="text-gray-800">{displayValue as string}</span>
                            </div>
                        );
                    })}
            </div>

            <PriceAveragesSection stockData={stockData} priceAveragesFields={priceAveragesFields} />
            <ValuationSection stockData={stockData} valuationFields={valuationFields} />
            <MarginsSection stockData={stockData} marginFields={marginFields} />
            <ReturnOnSection stockData={stockData} returnOnFields={returnOnFields} />
            <DividendsSection stockData={stockData} dividendFields={dividendFields} />
            <ShareOwnershipSection stockData={stockData} shareOwnershipFields={shareOwnershipFields} />
            <AnalystRatingsSection stockData={stockData} analystFields={analystFields} />
            <DescriptionSection stockData={stockData} descriptiveFields={descriptiveFields} />
        </div>
    );
};

export default OverviewTab;
