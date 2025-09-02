
import { CalculationInput, SavedCalculation } from '../types';

const STORAGE_KEY = 'marketplaceCalculator_saved';

export const getSavedCalculations = (): SavedCalculation[] => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Failed to parse saved calculations from localStorage", error);
        return [];
    }
};

export const saveCalculation = (name: string, input: CalculationInput): void => {
    const calculations = getSavedCalculations();
    const newCalculation: SavedCalculation = {
        id: new Date().toISOString(),
        name,
        input
    };
    calculations.push(newCalculation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations));
};

export const deleteCalculation = (id: string): void => {
    let calculations = getSavedCalculations();
    calculations = calculations.filter(calc => calc.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations));
};
