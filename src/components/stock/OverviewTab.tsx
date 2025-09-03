import { StockData } from './types/stockFinancials';
import GeneralInfoSection from './overview/GeneralInfoSection';

interface OverviewTabProps {
    stockData: StockData;
}

const OverviewTab = ({ stockData }: OverviewTabProps) => {
    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{stockData.companyName} ({stockData.symbol})</h3>
            <GeneralInfoSection stockData={stockData} />
        </div>
    );
};

export default OverviewTab;

