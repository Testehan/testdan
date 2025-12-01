import React, { useState, useEffect } from 'react';
import { SentimentData } from '../shared/types/sentiment';
import Spinner from '../shared/components/Spinner';

interface SentimentTabProps {
  symbol: string;
}

const SentimentTab: React.FC<SentimentTabProps> = ({ symbol }) => {
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timer: number | undefined;
    if (loading || regenerating) {
      setElapsedTime(0);
      timer = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [loading, regenerating]);

  const fetchSentiment = async (regenerate = false) => {
    if (regenerate) setRegenerating(true);
    else setLoading(true);
    
    setError(null);
    try {
      const response = await fetch(`http://localhost:8080/stocks/questions/sentiment?stockId=${symbol}${regenerate ? '&regenerate=true' : ''}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sentiment: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchSentiment();
    }
  }, [symbol]);

  const handleRegenerate = () => {
    if (!regenerating && !loading) {
      fetchSentiment(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12 min-h-[400px]">
        <Spinner elapsedTime={elapsedTime} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">Error loading sentiment data: {error}</p>
            <button 
              onClick={() => fetchSentiment()}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-500 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const isOlderThan3Days = (dateStr: string) => {
    const genDate = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - genDate.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays > 3;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8 animate-in fade-in duration-500 relative">
      {regenerating && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-xl">
          <Spinner elapsedTime={elapsedTime} />
          <p className="text-purple-600 mt-2 font-bold animate-pulse text-sm text-center px-4">AI is re-analyzing market sentiment...</p>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Market Sentiment for {data.ticker}</h3>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500 text-sm">
              Last analyzed on {new Date(data.date).toLocaleDateString()} • Based on {data.sourcesAnalyzed} sources
            </p>
            <button
              onClick={handleRegenerate}
              disabled={regenerating || loading}
              className="px-2 py-0.5 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-purple-300 transition-colors font-bold text-xs"
              title="Re-analyze market sentiment with AI"
            >
              AI
            </button>
          </div>
        </div>
        <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl ${getScoreBg(data.score)}`}>
          <div className="text-center">
            <span className={`block text-3xl font-black ${getScoreColor(data.score)}`}>
              {data.score}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Sentiment Score</span>
          </div>
          <div className="h-10 w-[1px] bg-gray-300/50"></div>
          <div>
            <span className={`block text-xl font-bold uppercase ${getScoreColor(data.score)}`}>
              {data.label}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Market Outlook</span>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Analysis Summary
          </h4>
          <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed bg-gray-50/50 rounded-xl p-5 border border-gray-100">
            {data.summary}
          </div>
        </div>

        {/* Catalysts Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Key Catalysts
          </h4>
          <ul className="space-y-3">
            {data.catalysts.map((catalyst, index) => (
              <li 
                key={index} 
                className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:border-orange-200 transition-colors group"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-50 text-orange-600 text-xs flex items-center justify-center font-bold mt-0.5 group-hover:bg-orange-100 transition-colors">
                  {index + 1}
                </span>
                <span className="text-gray-700 text-sm leading-snug">{catalyst}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SentimentTab;
