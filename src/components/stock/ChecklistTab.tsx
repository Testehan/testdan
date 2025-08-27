import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ChecklistTabProps {
  symbol: string;
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({ symbol }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const hasReceivedMessages = useRef(false);
  const hideTimeoutId = useRef<NodeJS.Timeout | null>(null);

  const cancelHideTimer = useCallback(() => {
    if (hideTimeoutId.current) {
      clearTimeout(hideTimeoutId.current);
    }
  }, []);

  const startHideTimer = useCallback(() => {
    cancelHideTimer();
    hideTimeoutId.current = setTimeout(() => {
      setIsVisible(false);
    }, 6000); // 6-second delay
  }, [cancelHideTimer]);

  useEffect(() => {
    // Reset state for when the symbol changes
    setMessages([]);
    setError(null);
    hasReceivedMessages.current = false;
    setIsVisible(true);
    cancelHideTimer();

    const eventSource = new EventSource(`http://localhost:8080/stocks/reporting/ferol/${symbol}`);

    eventSource.onopen = () => {
      setError(null);
      setIsVisible(true); // Make sure it's visible on new connection
    };

    const messageHandler = (event: MessageEvent) => {
      hasReceivedMessages.current = true;
      setMessages(prevMessages => [event.data, ...prevMessages]);
    };

    eventSource.addEventListener('MESSAGE', messageHandler);

    eventSource.addEventListener('COMPLETED', () => {
      startHideTimer();
      eventSource.close();
    });

    eventSource.onerror = () => {
      if (!hasReceivedMessages.current) {
        setError('Error connecting to the SSE stream. Please check the connection.');
      }
      eventSource.close();
    };

    return () => {
      eventSource.close();
      cancelHideTimer();
    };
  }, [symbol, startHideTimer, cancelHideTimer]);

  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-gray-900 bg-opacity-90 text-white shadow-lg p-4 flex flex-col transition-opacity duration-500 ease-in-out ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onMouseEnter={cancelHideTimer}
        onMouseLeave={startHideTimer}
      >
        <h3 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">Checklist Log</h3>
        {error && <div className="text-red-400 mb-4">{error}</div>}
        <div className="flex-grow overflow-y-auto">
          <ul>
            {messages.map((msg, index) => (
              <li key={index} className="border-b border-gray-700 p-2 font-mono text-sm">
                {msg}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Visible trigger bar on the right edge */}
      {!isVisible && (
        <div
          className="fixed top-0 right-0 h-full w-2 bg-gray-700 hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
          onMouseEnter={() => setIsVisible(true)}
        />
      )}
    </>
  );
};

export default ChecklistTab;
