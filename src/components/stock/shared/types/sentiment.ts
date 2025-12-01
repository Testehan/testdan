export interface SentimentData {
  ticker: string;
  score: number;
  label: string;
  sourcesAnalyzed: number;
  summary: string;
  catalysts: string[];
  date: string; // LocalDate from Java usually comes as ISO string
}
