import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

// InfoIcon component for displaying tooltips with portal rendering
const InfoIcon: React.FC<{ description: React.ReactNode | undefined }> = ({ description }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const iconRef = useRef<HTMLDivElement>(null);

    if (!description) return null;

    const handleMouseEnter = () => {
        if (iconRef.current) {
            const rect = iconRef.current.getBoundingClientRect();
            setTooltipPosition({
                top: rect.top + rect.height / 2,
                left: rect.right + 8
            });
        }
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    const tooltip = isVisible ? (
        <div
            className="fixed z-[9999] w-72 p-3 text-sm text-white bg-gray-900 rounded-lg shadow-2xl whitespace-normal pointer-events-none"
            style={{
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                transform: 'translateY(-50%)'
            }}
        >
            {description}
            <div 
                className="absolute top-1/2 -translate-y-1/2 -left-2 w-0 h-0 border-8 border-transparent border-r-gray-900"
            />
        </div>
    ) : null;

    return (
        <>
            <div 
                ref={iconRef}
                className="relative flex-shrink-0 cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4 text-gray-400 hover:text-gray-600"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
            </div>
            {tooltip && createPortal(tooltip, document.body)}
        </>
    );
};

export default InfoIcon;
