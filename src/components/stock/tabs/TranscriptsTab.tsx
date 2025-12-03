import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

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

interface Question {
  id: string;
  text: string;
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
  const [rightTab, setRightTab] = useState<'transcript' | 'questions'>('transcript');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [answers, setAnswers] = useState<Map<string, { status: string; answer: string | null }>>(new Map());
  const [answeringQuestionIds, setAnsweringQuestionIds] = useState<Set<string>>(new Set());
  const [aiLoadingIds, setAiLoadingIds] = useState<Set<string>>(new Set());
  const eventSources = useRef<Map<string, EventSource>>(new Map());
  const [loading, setLoading] = useState(true);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAnswerDetails = (answerText: string | null | undefined) => {
    if (!answerText) return { isOlder: false, dateStr: null, content: null };
    
    const dateMatch = answerText.match(/(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?)/);
    
    if (dateMatch) {
      const dateStr = dateMatch[0];
      const genDate = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - genDate.getTime());
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      const dateEndIndex = answerText.indexOf(dateStr) + dateStr.length;
      const prefixMatch = answerText.substring(0, answerText.indexOf(dateStr)).match(/.*[:\s]/);
      const fullDatePartIndex = prefixMatch ? answerText.indexOf(prefixMatch[0]) : answerText.indexOf(dateStr);
      const remainingContent = answerText.substring(dateEndIndex);

      const displayDate = genDate.getFullYear() + '-' + 
        String(genDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(genDate.getDate()).padStart(2, '0') + ' ' + 
        String(genDate.getHours()).padStart(2, '0') + ':' + 
        String(genDate.getMinutes()).padStart(2, '0');
      
      const prefix = prefixMatch ? prefixMatch[0] : '';
      const finalDisplayStr = prefix + displayDate;

      return { 
        isOlder: diffDays > 3, 
        dateStr: finalDisplayStr, 
        content: remainingContent.trim() 
      };
    }
    
    return { isOlder: false, dateStr: null, content: answerText };
  };

  const getSpeakerColor = (speaker: string) => {
    let hash = 0;
    for (let i = 0; i < speaker.length; i++) {
      hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
    }
    return SPEAKER_COLORS[Math.abs(hash) % SPEAKER_COLORS.length];
  };

  useEffect(() => {
    return () => {
      eventSources.current.forEach((es) => es.close());
      eventSources.current.clear();
    };
  }, []);

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

  useEffect(() => {
    if (rightTab === 'questions' && selectedQuarter) {
      fetchQuestions();
    }
  }, [rightTab, selectedQuarter]);

  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8080/stocks/questions/transcript`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setQuestions(data);
      const initialAnswers = new Map<string, { status: string; answer: string | null }>();
      data.forEach((q: Question) => {
        initialAnswers.set(q.id, { status: 'NONE', answer: null });
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const fetchAnswer = (stockId: string, questionId: string, regenerate = false) => {
    if (eventSources.current.has(questionId)) {
      eventSources.current.get(questionId)?.close();
    }
    
    if (regenerate) {
      setAiLoadingIds(prev => new Set(prev).add(questionId));
    } else {
      setAnsweringQuestionIds(prev => new Set(prev).add(questionId));
    }
    
    setAnswers(prevAnswers => new Map(prevAnswers).set(questionId, { status: 'IN_PROGRESS', answer: null }));

    const baseUrl = `http://localhost:8080/stocks/questions/answer`;
    const additionalInfo = selectedQuarter || '';
    
    const url = regenerate
      ? `${baseUrl}?stockId=${stockId}&questionId=${questionId}&regenerate=true&additionalInformation=${additionalInfo}`
      : `${baseUrl}?stockId=${stockId}&questionId=${questionId}&additionalInformation=${additionalInfo}`;
      
    const eventSource = new EventSource(url);
    eventSources.current.set(questionId, eventSource);

    let receivedAnswer = '';
    let completedReceived = false;

    eventSource.onmessage = (event) => {
      receivedAnswer += event.data;
      setAnswers(prevAnswers => new Map(prevAnswers).set(questionId, { status: 'IN_PROGRESS', answer: receivedAnswer }));
    };

    eventSource.addEventListener('COMPLETED', (event: MessageEvent) => {
      completedReceived = true;
      setAnswers(prevAnswers => new Map(prevAnswers).set(questionId, { status: 'COMPLETED', answer: receivedAnswer }));
      
      setAnsweringQuestionIds(prev => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
      setAiLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
      
      eventSources.current.delete(questionId);
      eventSource.close();
    });

    eventSource.onerror = (error) => {
      console.error('EventSource failed for question:', questionId, error);
      setTimeout(() => {
        if (!completedReceived) {
          setAnswers(prevAnswers => new Map(prevAnswers).set(questionId, { status: 'FAILED', answer: 'Failed to get answer.' }));
          
          setAnsweringQuestionIds(prev => {
            const next = new Set(prev);
            next.delete(questionId);
            return next;
          });
          setAiLoadingIds(prev => {
            const next = new Set(prev);
            next.delete(questionId);
            return next;
          });
          
          eventSources.current.delete(questionId);
          eventSource.close();
        } else {
          setAnsweringQuestionIds(prev => {
            const next = new Set(prev);
            next.delete(questionId);
            return next;
          });
          setAiLoadingIds(prev => {
            const next = new Set(prev);
            next.delete(questionId);
            return next;
          });
          eventSources.current.delete(questionId);
        }
      }, 50);
    };
  };

  const handleQuestionClick = (questionId: string) => {
    if (!answeringQuestionIds.has(questionId) && !aiLoadingIds.has(questionId)) {
      fetchAnswer(symbol, questionId, false);
    }
  };

  const handleQuarterClick = async (quarter: string) => {
    setSelectedQuarter(quarter);
    setTranscriptLoading(true);
    setTranscriptData(null);
    setAnswers(new Map());
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
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setRightTab('transcript')}
              className={`px-4 py-2 text-sm font-medium ${
                rightTab === 'transcript'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Transcript
            </button>
            <button
              onClick={() => setRightTab('questions')}
              className={`px-4 py-2 text-sm font-medium ${
                rightTab === 'questions'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              AI Summary
            </button>
          </div>

          {rightTab === 'transcript' && (
            <>
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
            </>
          )}

          {rightTab === 'questions' && (
            <>
              {questionsLoading && (
                <div className="text-center py-8">Loading questions...</div>
              )}
              {!questionsLoading && questions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questions.map((question) => {
                    const currentAnswer = answers.get(question.id);
                    const { isOlder, dateStr, content } = getAnswerDetails(currentAnswer?.answer);
                    const isAnswering = answeringQuestionIds.has(question.id);
                    const isAiLoading = aiLoadingIds.has(question.id);
                    const inProgress = currentAnswer?.status === 'IN_PROGRESS';
                    
                    return (
                      <div
                        key={question.id}
                        onClick={() => handleQuestionClick(question.id)}
                        className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg ${isAnswering || isAiLoading ? 'cursor-not-allowed opacity-80' : 'hover:bg-gray-50 cursor-pointer'} transition-all flex flex-col text-left relative`}
                      >
                        <div className="mb-2">
                          <p className="text-xl font-semibold text-gray-800">{question.text}</p>
                        </div>

                        {(currentAnswer?.answer || (isAnswering && inProgress) || (isAiLoading && inProgress)) && (
                          <div className="text-md text-gray-800 mt-2 flex flex-col">
                            {dateStr && (
                              <div className="flex items-center gap-3 mb-2 text-sm text-gray-500 font-medium">
                                <span>{dateStr}</span>
                              </div>
                            )}
                            {(content || (!dateStr && currentAnswer?.answer)) && (
                              <div className="markdown-answer">
                                <ReactMarkdown>{content || currentAnswer?.answer}</ReactMarkdown>
                              </div>
                            )}

                            {(isAnswering || isAiLoading) && inProgress && (
                              <div className="my-4 self-center">
                                <div className="flex flex-col items-center justify-center">
                                  <div className={`w-8 h-8 border-t-4 ${isAiLoading ? 'border-purple-500' : 'border-blue-500'} border-solid rounded-full animate-spin`}></div>
                                  {isAiLoading && <p className="text-xs text-purple-600 mt-1 font-semibold">AI is thinking...</p>}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {currentAnswer?.status === 'FAILED' && (
                          <p className="text-sm text-red-500 mt-2">Failed to get answer. Please try again.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {!questionsLoading && questions.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  No questions available for this quarter
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptsTab;