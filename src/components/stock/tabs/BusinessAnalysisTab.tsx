import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface BusinessAnalysisTabProps {
  symbol: string;
}

interface Question {
  id: string;
  text: string;
}

const BusinessAnalysisTab: React.FC<BusinessAnalysisTabProps> = ({ symbol }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Map<string, { status: string; answer: string | null }>>(new Map());
  
  // Track multiple questions being answered concurrently
  const [answeringQuestionIds, setAnsweringQuestionIds] = useState<Set<string>>(new Set());
  const [aiLoadingIds, setAiLoadingIds] = useState<Set<string>>(new Set());
  
  // Track multiple EventSources
  const eventSources = useRef<Map<string, EventSource>>(new Map());

  // Helper to check if the answer is older than 3 days and extract components
  const getAnswerDetails = (answerText: string | null | undefined) => {
    if (!answerText) return { isOlder: false, dateStr: null, content: null };
    
    // Supporting space or 'T' separator, and optional fractional seconds
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

  useEffect(() => {
    return () => {
      // Close all active event sources on unmount
      eventSources.current.forEach((es) => es.close());
      eventSources.current.clear();
    };
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8080/stocks/questions`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Question[] = await response.json();
        setQuestions(data);
      } catch (e: unknown) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const fetchAnswer = (stockId: string, questionId: string, regenerate: boolean = false) => {
    // If there's an existing EventSource for this specific question, close it
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
    
    const url = regenerate
      ? `${baseUrl}?stockId=${stockId}&questionId=${questionId}&regenerate=true`
      : `${baseUrl}?stockId=${stockId}&questionId=${questionId}`;
      
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
    // Only fetch if this specific question is not already being answered
    if (!answeringQuestionIds.has(questionId) && !aiLoadingIds.has(questionId)) {
      fetchAnswer(symbol, questionId, false);
    }
  };

  const handleAiClick = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation();
    if (!answeringQuestionIds.has(questionId) && !aiLoadingIds.has(questionId)) {
      fetchAnswer(symbol, questionId, true);
    }
  };

  return (
    <div className="p-4">
      {loading && <p>Loading questions...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {questions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        {isOlder && (
                          <button
                            onClick={(e) => handleAiClick(e, question.id)}
                            disabled={isAiLoading || isAnswering}
                            className="px-2 py-0.5 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-purple-300 transition-colors font-bold text-xs"
                          >
                            AI
                          </button>
                        )}
                      </div>
                    )}
                    {content && (
                      <div className="markdown-answer">
                        <ReactMarkdown>{content}</ReactMarkdown>
                      </div>
                    )}
                    {!dateStr && currentAnswer?.answer && (
                       <div className="markdown-answer">
                        <ReactMarkdown>{currentAnswer.answer}</ReactMarkdown>
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
    </div>
  );
};

export default BusinessAnalysisTab;
