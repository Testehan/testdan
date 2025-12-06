import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface GurusTabProps {
  symbol: string;
}

interface Question {
  id: string;
  text: string;
}

const GurusTab: React.FC<GurusTabProps> = ({ symbol }) => {
  const [activeSubTab, setActiveSubTab] = useState<'buffett' | 'munger' | 'lynch' | 'gardner' | 'damodaran' | 'other'>('buffett');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Map<string, { status: string; answer: string | null }>>(new Map());
  const [answeringQuestionIds, setAnsweringQuestionIds] = useState<Set<string>>(new Set());
  const [aiLoadingIds, setAiLoadingIds] = useState<Set<string>>(new Set());
  const eventSources = useRef<Map<string, EventSource>>(new Map());

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
      eventSources.current.forEach((es) => es.close());
      eventSources.current.clear();
    };
  }, []);

  useEffect(() => {
    if (activeSubTab === 'buffett' || activeSubTab === 'munger' || activeSubTab === 'lynch' || activeSubTab === 'gardner' || activeSubTab === 'damodaran') {
      const fetchQuestions = async () => {
        setLoading(true);
        setError(null);
        try {
          const endpoint = activeSubTab === 'buffett' ? 'guru/buffett' : activeSubTab === 'munger' ? 'guru/munger' : activeSubTab === 'lynch' ? 'guru/lynch' : activeSubTab === 'gardner' ? 'guru/gardner' : 'guru/damodaran';
          const response = await fetch(`http://localhost:8080/stocks/questions/${endpoint}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: Question[] = await response.json();
          setQuestions(data);
          const initialAnswers = new Map<string, { status: string; answer: string | null }>();
          data.forEach((q: Question) => {
            initialAnswers.set(q.id, { status: 'NONE', answer: null });
          });
          setAnswers(initialAnswers);
        } catch (e: unknown) {
          setError((e as Error).message);
        } finally {
          setLoading(false);
        }
      };

      fetchQuestions();
    }
  }, [activeSubTab]);

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

    eventSource.addEventListener('COMPLETED', () => {
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
        }
      }, 50);
    };
  };

  const isQuestionUnlocked = (questionIndex: number): boolean => {
    if (activeSubTab !== 'damodaran') return true;
    if (questionIndex === 0) return true;
    
    for (let i = 0; i < questionIndex; i++) {
      const questionId = questions[i]?.id;
      const answer = answers.get(questionId);
      if (!answer || answer.status !== 'COMPLETED') {
        return false;
      }
    }
    return true;
  };

  const handleQuestionClick = (questionId: string, questionIndex?: number) => {
    if (!answeringQuestionIds.has(questionId) && !aiLoadingIds.has(questionId)) {
      if (activeSubTab === 'damodaran' && questionIndex !== undefined && !isQuestionUnlocked(questionIndex)) {
        return;
      }
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
    <div className="p-4 bg-white shadow rounded-lg">
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveSubTab('buffett')}
          className={`px-4 py-2 text-sm font-medium ${
            activeSubTab === 'buffett'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Buffett
        </button>
        <button
          onClick={() => setActiveSubTab('munger')}
          className={`px-4 py-2 text-sm font-medium ${
            activeSubTab === 'munger'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Munger
        </button>
        <button
          onClick={() => setActiveSubTab('lynch')}
          className={`px-4 py-2 text-sm font-medium ${
            activeSubTab === 'lynch'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Lynch
        </button>
        <button
          onClick={() => setActiveSubTab('gardner')}
          className={`px-4 py-2 text-sm font-medium ${
            activeSubTab === 'gardner'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Gardner
        </button>
        <button
          onClick={() => setActiveSubTab('damodaran')}
          className={`px-4 py-2 text-sm font-medium ${
            activeSubTab === 'damodaran'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Damodaran
        </button>
        <button
          onClick={() => setActiveSubTab('other')}
          className={`px-4 py-2 text-sm font-medium ${
            activeSubTab === 'other'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Other Gurus
        </button>
      </div>

      {activeSubTab === 'buffett' && (
        <div>
          {loading && <p>Loading questions...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!loading && !error && questions.length > 0 && (
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
                      <div className="text-md text-gray-800 mt-2 flex flex-col" onClick={(e) => e.stopPropagation()}>
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
                          <div className="markdown-answer user-select-text cursor-text">
                            <ReactMarkdown>{content}</ReactMarkdown>
                          </div>
                        )}
                        {!dateStr && currentAnswer?.answer && (
                          <div className="markdown-answer user-select-text cursor-text">
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
          {!loading && !error && questions.length === 0 && (
            <div className="text-gray-500">No questions available</div>
          )}
        </div>
      )}

      {activeSubTab === 'munger' && (
        <div>
          {loading && <p>Loading questions...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!loading && !error && questions.length > 0 && (
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
                      <div className="text-md text-gray-800 mt-2 flex flex-col" onClick={(e) => e.stopPropagation()}>
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
                          <div className="markdown-answer user-select-text cursor-text">
                            <ReactMarkdown>{content}</ReactMarkdown>
                          </div>
                        )}
                        {!dateStr && currentAnswer?.answer && (
                          <div className="markdown-answer user-select-text cursor-text">
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
          {!loading && !error && questions.length === 0 && (
            <div className="text-gray-500">No questions available</div>
          )}
        </div>
      )}

      {activeSubTab === 'lynch' && (
        <div>
          {loading && <p>Loading questions...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!loading && !error && questions.length > 0 && (
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
                      <div className="text-md text-gray-800 mt-2 flex flex-col" onClick={(e) => e.stopPropagation()}>
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
                          <div className="markdown-answer user-select-text cursor-text">
                            <ReactMarkdown>{content}</ReactMarkdown>
                          </div>
                        )}
                        {!dateStr && currentAnswer?.answer && (
                          <div className="markdown-answer user-select-text cursor-text">
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
          {!loading && !error && questions.length === 0 && (
            <div className="text-gray-500">No questions available</div>
          )}
        </div>
      )}

      {activeSubTab === 'gardner' && (
        <div>
          {loading && <p>Loading questions...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!loading && !error && questions.length > 0 && (
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
                      <div className="text-md text-gray-800 mt-2 flex flex-col" onClick={(e) => e.stopPropagation()}>
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
                          <div className="markdown-answer user-select-text cursor-text">
                            <ReactMarkdown>{content}</ReactMarkdown>
                          </div>
                        )}
                        {!dateStr && currentAnswer?.answer && (
                          <div className="markdown-answer user-select-text cursor-text">
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
          {!loading && !error && questions.length === 0 && (
            <div className="text-gray-500">No questions available</div>
          )}
        </div>
      )}

      {activeSubTab === 'damodaran' && (
        <div>
          {loading && <p>Loading questions...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!loading && !error && questions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map((question, index) => {
                const currentAnswer = answers.get(question.id);
                const { isOlder, dateStr, content } = getAnswerDetails(currentAnswer?.answer);
                const isAnswering = answeringQuestionIds.has(question.id);
                const isAiLoading = aiLoadingIds.has(question.id);
                const inProgress = currentAnswer?.status === 'IN_PROGRESS';
                const isUnlocked = isQuestionUnlocked(index);
                const isLocked = !isUnlocked;
                
                return (
                  <div
                    key={question.id}
                    onClick={() => handleQuestionClick(question.id, index)}
                    className={`bg-white rounded-lg shadow-md p-6 transition-all flex flex-col text-left relative ${
                      isLocked
                        ? 'opacity-60 cursor-not-allowed border-2 border-dashed border-gray-300'
                        : isAnswering || isAiLoading
                          ? 'cursor-not-allowed opacity-80'
                          : 'hover:shadow-lg hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    {isLocked && (
                      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-red-600 font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-sm">Complete Q{index} first</span>
                      </div>
                    )}
                    <div className="mb-2">
                      <p className="text-xl font-semibold text-gray-800">{question.text}</p>
                    </div>

                    {(currentAnswer?.answer || (isAnswering && inProgress) || (isAiLoading && inProgress)) && (
                      <div className="text-md text-gray-800 mt-2 flex flex-col" onClick={(e) => e.stopPropagation()}>
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
                          <div className="markdown-answer user-select-text cursor-text">
                            <ReactMarkdown>{content}</ReactMarkdown>
                          </div>
                        )}
                        {!dateStr && currentAnswer?.answer && (
                          <div className="markdown-answer user-select-text cursor-text">
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
          {!loading && !error && questions.length === 0 && (
            <div className="text-gray-500">No questions available</div>
          )}
        </div>
      )}

      {activeSubTab === 'other' && (
        <div className="text-gray-500">
          Other guru data not yet implemented
        </div>
      )}
    </div>
  );
};

export default GurusTab;