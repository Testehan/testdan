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
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const currentEventSource = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => {
      if (currentEventSource.current) {
        currentEventSource.current.close();
      }
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
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const fetchAnswer = (stockId: string, questionId: string) => {
    // If there's an existing EventSource, close it before opening a new one
    if (currentEventSource.current) {
      currentEventSource.current.close();
    }
    setAnsweringQuestionId(questionId);
    setAnswers(prevAnswers => new Map(prevAnswers).set(questionId, { status: 'IN_PROGRESS', answer: null }));

    const url = `http://localhost:8080/stocks/questions/answer?stockId=${stockId}&questionId=${questionId}`;
    const eventSource = new EventSource(url);
    currentEventSource.current = eventSource;

    let receivedAnswer = '';
    let completedReceived = false;

    eventSource.onmessage = (event) => {
      console.log('EventSource MESSAGE:', event.data);
      receivedAnswer += event.data;
      setAnswers(prevAnswers => new Map(prevAnswers).set(questionId, { status: 'IN_PROGRESS', answer: receivedAnswer }));
    };

    eventSource.addEventListener('COMPLETED', (event: MessageEvent) => {
      console.log('EventSource COMPLETED:', event.data);
      completedReceived = true;
      setAnswers(prevAnswers => new Map(prevAnswers).set(questionId, { status: 'COMPLETED', answer: receivedAnswer }));
      setAnsweringQuestionId(null);
      eventSource.close();
    });

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      // Give COMPLETED event a tiny moment to fire
      setTimeout(() => {
        if (!completedReceived) {
          console.log('COMPLETED event not received after onerror grace period, setting status to FAILED.');
          setAnswers(prevAnswers => new Map(prevAnswers).set(questionId, { status: 'FAILED', answer: 'Failed to get answer.' }));
          setAnsweringQuestionId(null);
          eventSource.close(); // Close only after grace period if not completed
        } else {
          console.log('COMPLETED event received during onerror grace period.');
          setAnsweringQuestionId(null); // Clear loading state even if onerror fired but completed later
          // EventSource is already closed by COMPLETED handler
        }
      }, 50); // 50ms grace period
    };
  };

  const handleQuestionClick = (questionId: string) => {
    if (!answeringQuestionId) { // Prevent multiple requests for the same question
      fetchAnswer(symbol, questionId);
    }
  };

  return (
    <div className="p-4">
      {loading && <p>Loading questions...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {questions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map((question) => (
            <div
              key={question.id}
              onClick={() => handleQuestionClick(question.id)}
              className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg ${answeringQuestionId === question.id ? 'cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'} transition-all flex flex-col text-left`}
            >
              <p className="text-xl font-semibold text-gray-800">{question.text}</p>

              {(answers.get(question.id)?.answer || (answeringQuestionId === question.id && answers.get(question.id)?.status === 'IN_PROGRESS')) && (
                <div className="text-md text-gray-800 mt-2 flex flex-col items-center">
                  {answers.get(question.id)?.answer && (
                    <ReactMarkdown>{answers.get(question.id)?.answer}</ReactMarkdown>
                  )}
                  {answeringQuestionId === question.id && answers.get(question.id)?.status === 'IN_PROGRESS' && (
                    <div className="my-4">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {answers.get(question.id)?.status === 'FAILED' && (
                <p className="text-sm text-red-500 mt-2">Failed to get answer. Please try again.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessAnalysisTab;
