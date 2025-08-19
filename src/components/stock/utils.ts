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
  