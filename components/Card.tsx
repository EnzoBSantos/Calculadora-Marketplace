
import React from 'react';

interface CardProps {
    title: string;
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                {title}
            </h2>
            {children}
        </div>
    );
};
