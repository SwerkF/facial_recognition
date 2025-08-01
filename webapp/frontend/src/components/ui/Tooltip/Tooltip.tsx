'use client';

import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

interface TooltipProps {
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    children: React.ReactNode;
    delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    position = 'top',
    children,
    delay = 0.3,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-gray-800',
        bottom: 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-gray-800',
        left: 'right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-l-gray-800',
        right: 'left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-r-gray-800',
    };

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
            >
                {children}
            </div>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, delay }}
                        className={`absolute z-10 ${positionClasses[position]}`}
                    >
                        <div className="max-w-xs rounded bg-gray-800 px-2 py-1 text-sm text-white">
                            {content}
                        </div>
                        <div
                            className={`absolute h-0 w-0 border-4 border-transparent ${arrowClasses[position]}`}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
