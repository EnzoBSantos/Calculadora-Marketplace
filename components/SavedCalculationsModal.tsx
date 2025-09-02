
import React from 'react';
import { SavedCalculation } from '../types';

interface SavedCalculationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    calculations: SavedCalculation[];
    onLoad: (calculation: SavedCalculation) => void;
    onDelete: (id: string) => void;
}

export const SavedCalculationsModal: React.FC<SavedCalculationsModalProps> = ({ isOpen, onClose, calculations, onLoad, onDelete }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Cálculos Salvos</h3>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                    {calculations.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">Nenhum cálculo salvo.</p>
                    ) : (
                        <ul className="space-y-3">
                            {calculations.map(calc => (
                                <li key={calc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{calc.name}</span>
                                    <div className="space-x-2">
                                        <button onClick={() => onLoad(calc)} className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Carregar</button>
                                        <button onClick={() => onDelete(calc.id)} className="px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Excluir</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                    <button onClick={onClose} className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
