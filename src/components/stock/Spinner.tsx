import React from 'react';

const Spinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
    );
};

export default Spinner;
