import React from 'react';

interface SpinnerProps {
    elapsedTime: number;
}

const Spinner: React.FC<SpinnerProps> = ({ elapsedTime }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-semibold">Thinking...</p>
            <p className="text-sm text-gray-500">Elapsed time: {elapsedTime} seconds</p>
        </div>
    );
};

export default Spinner;
