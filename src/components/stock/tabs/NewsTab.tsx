import React, { useState, useEffect } from 'react';
import { API_ENDPOINT } from '../../../config';

interface NewsTabProps {
  symbol: string;
}

interface Report {
  topic: string;
  executiveSummary: string;
  keyFindings: string[];
  themes: string[];
  openQuestions: string[];
  sources: { url: string; title: string }[];
  diagnostics: {
    queriesGenerated: number;
    urlsDiscovered: number;
    urlsFetched: number;
    sourcesUsed: number;
    durationMs: number;
  };
}

interface ResearchResponse {
  jobId: string;
  stockTicker: string;
  topic: string;
  report: Report;
  status: string;
  createdAt: string;
}

const NewsTab: React.FC<NewsTabProps> = ({ symbol }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResearchResponse | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_ENDPOINT}/research/${symbol}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [symbol]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">News & Research</h3>
        {data && data.createdAt && (
          <span className="text-sm text-gray-500">
            Last Updated: {new Date(data.createdAt).toLocaleString('en-GB')}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-500">Fetching research for {symbol}...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {data && data.status === 'completed' && data.report && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-bold text-lg mb-2">Executive Summary</h4>
            <p className="text-gray-700">{data.report.executiveSummary}</p>
          </div>

          {data.report.keyFindings.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h4 className="font-bold text-lg mb-2">Key Findings</h4>
              <ul className="list-disc pl-5 space-y-1">
                {data.report.keyFindings.map((finding, index) => (
                  <li key={index} className="text-gray-700" dangerouslySetInnerHTML={{ __html: finding }}></li>
                ))}
              </ul>
            </div>
          )}

          {data.report.themes.length > 0 && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <h4 className="font-bold text-lg mb-2">Themes</h4>
              <ul className="list-disc pl-5 space-y-1">
                {data.report.themes.map((theme, index) => (
                  <li key={index} className="text-gray-700">{theme}</li>
                ))}
              </ul>
            </div>
          )}

          {data.report.openQuestions.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-bold text-lg mb-2">Open Questions</h4>
              <ul className="list-disc pl-5 space-y-1">
                {data.report.openQuestions.map((question, index) => (
                  <li key={index} className="text-gray-700">{question}</li>
                ))}
              </ul>
            </div>
          )}

          {data.report.sources.length > 0 && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <h4 className="font-bold text-lg mb-2">Sources ({data.report.sources.length})</h4>
              <ul className="space-y-2">
                {data.report.sources.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-sm text-gray-500 p-2">
            <span>Queries: {data.report.diagnostics.queriesGenerated} | </span>
            <span>URLs Discovered: {data.report.diagnostics.urlsDiscovered} | </span>
            <span>URLs Fetched: {data.report.diagnostics.urlsFetched} | </span>
            <span>Sources Used: {data.report.diagnostics.sourcesUsed} | </span>
            <span>Duration: {formatDuration(data.report.diagnostics.durationMs)}</span>
          </div>
        </div>
      )}

      {data && data.status === 'completed' && !data.report && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          No report data available
        </div>
      )}
    </div>
  );
};

export default NewsTab;