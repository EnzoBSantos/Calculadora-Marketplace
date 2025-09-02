
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    containerClassName?: string;
}

const baseInputClasses = "w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100";

export const Input: React.FC<InputProps> = ({ label, containerClassName = '', ...props }) => {
    return (
        <div className={containerClassName}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input {...props} className={baseInputClasses} />
        </div>
    );
};

export const NumberInput: React.FC<InputProps> = ({ label, containerClassName = '', ...props }) => {
    return (
        <div className={containerClassName}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input type="number" step="0.01" {...props} className={baseInputClasses} />
        </div>
    );
};
