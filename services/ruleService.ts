
import { MarketplaceRules } from '../types';
import { DEFAULT_RULES } from '../rules';

const RULES_STORAGE_KEY = 'marketplaceCalculator_rules';

export const getRules = (): MarketplaceRules => {
    try {
        const saved = localStorage.getItem(RULES_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge with defaults to ensure new marketplaces or rule structures are included
            return { ...DEFAULT_RULES, ...parsed };
        }
        return DEFAULT_RULES;
    } catch (error) {
        console.error("Failed to parse rules from localStorage, using defaults", error);
        return DEFAULT_RULES;
    }
};

export const saveRules = (rules: MarketplaceRules): void => {
    try {
        const rulesString = JSON.stringify(rules);
        localStorage.setItem(RULES_STORAGE_KEY, rulesString);
    } catch (error) {
        console.error("Failed to save rules to localStorage", error);
    }
};

export const resetRules = (): MarketplaceRules => {
    localStorage.removeItem(RULES_STORAGE_KEY);
    return DEFAULT_RULES;
};
