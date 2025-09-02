
import React, { useState, useEffect } from 'react';
import { Marketplace, MarketplaceRules, TieredFee } from '../types';
import { NumberInput } from './Input';
// FIX: `DEFAULT_RULES` is not exported from `ruleService` and was not used in this file.
// Removing it from the import resolves the error.
import { resetRules } from '../services/ruleService';

interface RuleEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentRules: MarketplaceRules;
    onSave: (newRules: MarketplaceRules) => void;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            active
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
    >
        {children}
    </button>
);

const isJsonString = (str: string) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

export const RuleEditorModal: React.FC<RuleEditorModalProps> = ({ isOpen, onClose, currentRules, onSave }) => {
    const [activeTab, setActiveTab] = useState<Marketplace>(Marketplace.MERCADO_LIVRE);
    const [rules, setRules] = useState<MarketplaceRules>(currentRules);
    const [jsonValidity, setJsonValidity] = useState<{ b2w: boolean, amazon: boolean }>({ b2w: true, amazon: true });

    useEffect(() => {
        setRules(currentRules);
        setJsonValidity({
            b2w: isJsonString(currentRules[Marketplace.B2W]),
            amazon: isJsonString(currentRules[Marketplace.AMAZON]),
        });
    }, [currentRules, isOpen]);

    if (!isOpen) return null;

    const handleTierChange = (index: number, field: keyof TieredFee, value: number) => {
        const updatedTiers = [...rules[Marketplace.MERCADO_LIVRE].fixedFeeTiers];
        (updatedTiers[index] as any)[field] = value;
        handleRuleChange(Marketplace.MERCADO_LIVRE, 'fixedFeeTiers', updatedTiers);
    };

    // FIX: The spread operator `...prev[marketplace]` could fail if `prev[marketplace]` is a string
    // (for B2W or Amazon). Added a type guard to prevent this.
    const handleRuleChange = (marketplace: Marketplace, key: string, value: any) => {
        setRules(prev => {
            const prevMarketplaceRules = prev[marketplace];

            // Type guard to ensure we're not spreading a string (for B2W/Amazon rules)
            if (typeof prevMarketplaceRules !== 'object' || prevMarketplaceRules === null) {
                console.error(`handleRuleChange called for ${marketplace}, which does not use object-based rules. This is likely a bug.`);
                return prev;
            }

            return {
                ...prev,
                [marketplace]: {
                    ...prevMarketplaceRules,
                    [key]: value
                }
            };
        });
    };
    
    const handleJsonChange = (marketplace: Marketplace.B2W | Marketplace.AMAZON, value: string) => {
        setRules(prev => ({ ...prev, [marketplace]: value }));
        if (marketplace === Marketplace.B2W) {
            setJsonValidity(prev => ({ ...prev, b2w: isJsonString(value) }));
        } else {
            setJsonValidity(prev => ({ ...prev, amazon: isJsonString(value) }));
        }
    };
    
    const handleReset = () => {
        if (window.confirm("Tem certeza que deseja redefinir TODAS as regras para os padrões?")) {
            const defaultRules = resetRules();
            setRules(defaultRules);
        }
    }

    const renderContent = () => {
        switch (activeTab) {
            case Marketplace.MERCADO_LIVRE:
                const mlRules = rules[Marketplace.MERCADO_LIVRE];
                return <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Taxas de Comissão (%)</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <NumberInput label="Clássico" value={mlRules.classicRate * 100} onChange={e => handleRuleChange(Marketplace.MERCADO_LIVRE, 'classicRate', parseFloat(e.target.value) / 100)} />
                       <NumberInput label="Premium" value={mlRules.premiumRate * 100} onChange={e => handleRuleChange(Marketplace.MERCADO_LIVRE, 'premiumRate', parseFloat(e.target.value) / 100)} />
                    </div>
                    <h4 className="font-semibold text-lg mt-4">Taxas Fixas por Faixa de Preço</h4>
                     {mlRules.fixedFeeTiers.filter(t => t.upToPrice !== Infinity).map((tier, index) => (
                        <div key={index} className="grid grid-cols-2 gap-4 items-center p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                           <NumberInput label={`Até R$`} value={tier.upToPrice} onChange={e => handleTierChange(index, 'upToPrice', parseFloat(e.target.value))} />
                           <NumberInput label={`Taxa ${tier.isMultiplier ? '(Multiplicador)' : '(R$)'}`} value={tier.fee} onChange={e => handleTierChange(index, 'fee', parseFloat(e.target.value))} />
                        </div>
                    ))}
                </div>;
            case Marketplace.SHOPEE:
                 const shopeeRules = rules[Marketplace.SHOPEE];
                 return <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <NumberInput label="Comissão Padrão (%)" value={shopeeRules.commissionRate * 100} onChange={e => handleRuleChange(Marketplace.SHOPEE, 'commissionRate', parseFloat(e.target.value) / 100)} />
                        <NumberInput label="Taxa de Transação (%)" value={shopeeRules.transactionFee * 100} onChange={e => handleRuleChange(Marketplace.SHOPEE, 'transactionFee', parseFloat(e.target.value) / 100)} />
                        <NumberInput label="Programa Frete Grátis (%)" value={shopeeRules.shippingProgramFee * 100} onChange={e => handleRuleChange(Marketplace.SHOPEE, 'shippingProgramFee', parseFloat(e.target.value) / 100)} />
                        <NumberInput label="Taxa Fixa (R$)" value={shopeeRules.fixedFee} onChange={e => handleRuleChange(Marketplace.SHOPEE, 'fixedFee', parseFloat(e.target.value))} />
                        <NumberInput label="Limite Preço Baixo (R$)" value={shopeeRules.lowPriceThreshold} onChange={e => handleRuleChange(Marketplace.SHOPEE, 'lowPriceThreshold', parseFloat(e.target.value))} />
                        <NumberInput label="Multiplicador Preço Baixo" value={shopeeRules.lowPriceFixedFeeMultiplier} onChange={e => handleRuleChange(Marketplace.SHOPEE, 'lowPriceFixedFeeMultiplier', parseFloat(e.target.value))} />
                    </div>
                 </div>
            case Marketplace.MAGALU:
                const magaluRules = rules[Marketplace.MAGALU];
                return <NumberInput label="Taxa de Comissão (%)" value={magaluRules.commissionRate * 100} onChange={e => handleRuleChange(Marketplace.MAGALU, 'commissionRate', parseFloat(e.target.value) / 100)} />;
            case Marketplace.B2W:
                return <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Regras de Categoria (JSON)</label>
                    <textarea 
                        value={rules[Marketplace.B2W]}
                        onChange={e => handleJsonChange(Marketplace.B2W, e.target.value)}
                        className={`w-full h-64 font-mono text-sm p-2 border rounded-md bg-gray-50 dark:bg-gray-900 ${jsonValidity.b2w ? 'border-gray-300 dark:border-gray-600 focus:ring-blue-500' : 'border-red-500 ring-red-500 focus:ring-red-500'}`}
                    />
                    {!jsonValidity.b2w && <p className="text-red-500 text-xs mt-1">JSON inválido!</p>}
                </div>;
            case Marketplace.AMAZON:
                return <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Regras de Categoria (JSON)</label>
                    <textarea 
                        value={rules[Marketplace.AMAZON]}
                         onChange={e => handleJsonChange(Marketplace.AMAZON, e.target.value)}
                        className={`w-full h-64 font-mono text-sm p-2 border rounded-md bg-gray-50 dark:bg-gray-900 ${jsonValidity.amazon ? 'border-gray-300 dark:border-gray-600 focus:ring-blue-500' : 'border-red-500 ring-red-500 focus:ring-red-500'}`}
                    />
                    {!jsonValidity.amazon && <p className="text-red-500 text-xs mt-1">JSON inválido!</p>}
                </div>;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Gerenciar Regras dos Marketplaces</h3>
                </div>
                <div className="flex border-b border-gray-200 dark:border-gray-700 px-4">
                    {Object.values(Marketplace).map(mp => (
                        <TabButton key={mp} active={activeTab === mp} onClick={() => setActiveTab(mp)}>{mp}</TabButton>
                    ))}
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {renderContent()}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg flex justify-between items-center gap-4">
                    <button onClick={handleReset} className="px-4 py-2 text-sm font-semibold text-white bg-yellow-600 rounded-md hover:bg-yellow-700">Redefinir Padrões</button>
                    <div className="flex gap-4">
                         <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-white bg-gray-500 rounded-md hover:bg-gray-600">Cancelar</button>
                         <button onClick={() => onSave(rules)} disabled={!jsonValidity.b2w || !jsonValidity.amazon} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">Salvar Regras</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
