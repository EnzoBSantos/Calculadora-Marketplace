
import React from 'react';

interface ResultCardProps {
    label: string;
    value: string;
    isProfit?: boolean;
    isNegative?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ label, value, isProfit, isNegative }) => {
    const valueColor = isProfit === true ? 'text-green-500' : 
                       isProfit === false ? 'text-red-500' : 
                       isNegative ? 'text-red-500' : 'text-gray-900 dark:text-white';

    return (
        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <span className="text-md text-gray-600 dark:text-gray-300">{label}</span>
            <span className={`text-lg font-bold ${valueColor}`}>{value}</span>
        </div>
    );
};
