export interface VerdictStyling {
  verdictText: string;
  bgColorClass: string;
}

export const getVerdictStyling = (intrinsicPrice: number, currentPrice: number): VerdictStyling => {
  const percentageDifference = (intrinsicPrice - currentPrice) / currentPrice;

  if (percentageDifference > 0.20) {
    return { verdictText: 'Undervalued', bgColorClass: 'bg-green-200 text-green-800' };
  } else if (percentageDifference < -0.20) {
    return { verdictText: 'Overvalued', bgColorClass: 'bg-red-200 text-red-800' };
  }
  return { verdictText: 'Neutral', bgColorClass: 'bg-yellow-200 text-yellow-800' };
};

export const formatLargeNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '-';
  }

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1_000_000_000_000) {
    return `${sign}${(absNum / 1_000_000_000_000).toFixed(2)}T`;
  } else if (absNum >= 1_000_000_000) {
    return `${sign}${(absNum / 1_000_000_000).toFixed(2)}B`;
  } else if (absNum >= 1_000_000) {
    return `${sign}${(absNum / 1_000_000).toFixed(2)}M`;
  } else if (absNum >= 1_000) {
    return `${sign}${(absNum / 1_000).toFixed(2)}K`;
  }
  return `${sign}${absNum.toFixed(2)}`;
};
