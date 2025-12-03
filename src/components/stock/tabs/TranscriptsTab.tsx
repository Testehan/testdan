import React, { useState, useEffect } from 'react';

interface TranscriptItem {
  speaker: string;
  title?: string;
  content: string;
}

interface QuarterlyEarningsTranscript {
  quarter: string;
  transcript: TranscriptItem[];
  lastUpdated: string | null;
}

interface TranscriptsTabProps {
  symbol: string;
}

const SPEAKER_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
];

const TranscriptsTab: React.FC<TranscriptsTabProps> = ({ symbol }) => {
  const [quarters, setQuarters] = useState<string[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<string | null>(null);
  const [transcriptData, setTranscriptData] = useState<QuarterlyEarningsTranscript | null>(null);
  const [loading, setLoading] = useState(true);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSpeakerColor = (speaker: string) => {
    let hash = 0;
    for (let i = 0; i < speaker.length; i++) {
      hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
    }
    return SPEAKER_COLORS[Math.abs(hash) % SPEAKER_COLORS.length];
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [quartersRes, latestRes] = await Promise.all([
          fetch(`http://localhost:8080/stocks/earnings-call-transcript/${symbol}/quarters`),
          fetch(`http://localhost:8080/stocks/earnings-call-transcript/${symbol}/latest`),
        ]);

        if (!quartersRes.ok) {
          throw new Error(`Failed to fetch quarters: ${quartersRes.statusText}`);
        }
        const quartersData = await quartersRes.json();
        const sortedQuarters = [...quartersData].sort((a, b) => {
          const normalizeQuarter = (q: string) => {
            const match = q.match(/(\d{4})[Qq](\d)/);
            if (match) {
              return { year: parseInt(match[1]), quarter: parseInt(match[2]) };
            }
            return { year: 0, quarter: 0 };
          };
          const aNorm = normalizeQuarter(a);
          const bNorm = normalizeQuarter(b);
          if (aNorm.year !== bNorm.year) return bNorm.year - aNorm.year;
          return bNorm.quarter - aNorm.quarter;
        });
        setQuarters(sortedQuarters);

        if (latestRes.ok) {
          const latestData = await latestRes.json();
          setTranscriptData(latestData);
          setSelectedQuarter(latestData.quarter);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  const handleQuarterClick = async (quarter: string) => {
    setSelectedQuarter(quarter);
    setTranscriptLoading(true);
    setTranscriptData(null);
    try {
      const response = await fetch(`http://localhost:8080/stocks/earnings-call-transcript/${symbol}/${quarter}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch transcript: ${response.statusText}`);
      }
      const data = await response.json();
      setTranscriptData(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setTranscriptLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading transcripts...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  if (quarters.length === 0) {
    return (
      <div className="p-4 bg-white shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Earnings Call Transcripts</h2>
        <p className="text-gray-500">No transcripts available for {symbol}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Earnings Call Transcripts for {symbol}</h2>
      <div className="flex gap-6">
        <div className="w-48 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Available Quarters</h3>
          <div className="space-y-1">
            {quarters.map((quarter) => (
              <button
                key={quarter}
                onClick={() => handleQuarterClick(quarter)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedQuarter === quarter
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {quarter}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          {!selectedQuarter && (
            <div className="text-gray-500 text-center py-8">
              Select a quarter to view the transcript
            </div>
          )}
          {transcriptLoading && (
            <div className="text-center py-8">Loading transcript...</div>
          )}
          {transcriptData && !transcriptLoading && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{transcriptData.quarter}</h3>
                {transcriptData.lastUpdated && (
                  <span className="text-sm text-gray-500">
                    Last Updated: {new Date(transcriptData.lastUpdated).toLocaleString()}
                  </span>
                )}
              </div>
              {transcriptData.transcript && transcriptData.transcript.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {transcriptData.transcript.map((item, index) => {
                    const colors = getSpeakerColor(item.speaker);
                    return (
                      <div key={index} className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold ${colors.text}`}>{item.speaker}</span>
                          {item.title && (
                            <span className={`text-xs ${colors.text} opacity-75`}>- {item.title}</span>
                          )}
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">{item.content}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8 bg-gray-50 rounded">
                  Transcript is not available for that date
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptsTab;
