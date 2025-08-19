export const formatLargeNumber = (numStr: string): string => {
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
  
  export const formatPercentage = (numStr: string, multiplyBy100: boolean = false): string => {
    const num = parseFloat(numStr);
    if (isNaN(num)) return numStr;
    if (multiplyBy100) {
      return (num * 100).toFixed(2) + '%';
    }
    return num.toFixed(3) + '%';
  };
  
  export const formatCurrency = (numStr: string): string => {
    const num = parseFloat(numStr);
    if (isNaN(num)) return numStr;
    return '$' + num.toFixed(2);
  };
  
  export const formatDate = (dateStr: string): string => {
    if (!dateStr) return dateStr;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(); // Formats to local date string
  };

  export const formatMonthYear = (dateStr: string): string => {
    if (!dateStr) return dateStr;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${month} '${year}`;
  }

export const formatMetricName = (key: string): string => {
    // Handle specific problematic keys with a mapping for exact desired output
    const specificNames: { [key: string]: string } = {
        'costofGoodsAndServicesSold': 'Cost of Goods and Services Sold',
        'sellingGeneralAndAdministrative': 'Selling, General and Administrative',
        'researchAndDevelopment': 'Research and Development',
        'depreciationAndAmortization': 'Depreciation and Amortization',
        'netInterestIncome': 'Net Interest Income',
        'investmentIncomeNet': 'Investment Income Net',
        'otherNonOperatingIncome': 'Other Non Operating Income',
        'incomeBeforeTax': 'Income Before Tax',
        'incomeTaxExpense': 'Income Tax Expense',
        'netIncomeFromContinuingOperations': 'Net Income From Continuing Operations',
        // Add other specific mappings here
    };

    if (specificNames[key]) {
        return specificNames[key];
    }

    // Convert camelCase to space-separated words, capitalizing each word
    const result = key.replace(/([A-Z])/g, ' $1') // Add space before capital letters
                      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter of the string

    // Optional: Lowercase conjunctions/prepositions like "and", "of", "in" if not the first word
    const words = result.split(' ');
    const formattedWords = words.map((word, index) => {
        if (index > 0 && ['and', 'of', 'in', 'the', 'for', 'with', 'on', 'at'].includes(word.toLowerCase())) {
            return word.toLowerCase();
        }
        return word;
    });

    return formattedWords.join(' ');
};  