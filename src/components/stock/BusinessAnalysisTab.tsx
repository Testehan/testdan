import React, { useState, useEffect } from 'react';
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

  const fetchAnswer = async (stockId: string, questionId: string) => {
    setAnsweringQuestionId(questionId);
    try {
      const response = await fetch(`http://localhost:8080/stocks/questions/answer?stockId=${stockId}&questionId=${questionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ /* No body needed as parameters are in URL */ }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setAnswers(prevAnswers => new Map(prevAnswers).set(questionId, result));

      if (result.status === 'PENDING' || result.status === 'IN_PROGRESS') {
        setTimeout(() => fetchAnswer(stockId, questionId), 3000); // Retry after 3 seconds
      } else {
        setAnsweringQuestionId(null);
      }
    } catch (e: any) {
      setAnswers(prevAnswers => new Map(prevAnswers).set(questionId, { status: 'FAILED', answer: 'Failed to fetch answer.' }));
      setAnsweringQuestionId(null);
    }
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
              className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg ${answeringQuestionId === question.id ? 'cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'} transition-all flex flex-col items-start text-left`}
            >
              <p className="text-xl font-semibold text-gray-800">{question.text}</p>
              {answeringQuestionId === question.id && (
                <p className="text-sm text-blue-600 mt-2 animate-pulse">Loading answer...</p>
              )}
              {answers.get(question.id)?.status === 'COMPLETED' && (
                <div className="text-md text-gray-800 mt-2">
                  <ReactMarkdown>{answers.get(question.id)?.answer}</ReactMarkdown>
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
