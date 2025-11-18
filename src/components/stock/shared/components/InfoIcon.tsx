import React from 'react';

// InfoIcon component for displaying tooltips
const InfoIcon: React.FC<{ description: string | undefined }> = ({ description }) => {
    if (!description) return null;
    return (
        <div className="relative group ml-1 flex-shrink-0">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4 text-gray-400 cursor-pointer"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-64 p-3 text-sm text-white bg-gray-900 rounded-lg shadow-xl group-hover:block z-10 whitespace-normal pointer-events-none">
                {description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
            </div>
        </div>
    );
};

export default InfoIcon;
