
import React, { useState, useEffect, useMemo } from 'react';
import { CalculationInput, Marketplace, MercadoLivreAdType, SavedCalculation, MarketplaceRules, B2WRate, AmazonRate } from './types';
import { useMarketplaceCalculator } from './hooks/useMarketplaceCalculator';
import { getSavedCalculations, saveCalculation, deleteCalculation as removeCalculation } from './services/localStorage';
import { getRules, saveRules } from './services/ruleService';
import { Card } from './components/Card';
import { Input, NumberInput } from './components/Input';
import { Select } from './components/Select';
import { ResultCard } from './components/ResultCard';
import { SavedCalculationsModal } from './components/SavedCalculationsModal';
import { RuleEditorModal } from './components/RuleEditorModal';

const App: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRuleEditorOpen, setIsRuleEditorOpen] = useState(false);
    const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
    const [rules, setRules] = useState<MarketplaceRules>(getRules);

    const [input, setInput] = useState<CalculationInput>({
        productName: '',
        sellingPrice: '',
        purchasePrice: '',
        quantity: '',
        additionalCostFixed: '',
        additionalCostPercent: '',
        shippingCost: '',
        marketplace: Marketplace.MERCADO_LIVRE,
        mercadoLivreAdType: MercadoLivreAdType.CLASSICO,
        b2wCategory: 'Telefonia Fixa / Celular',
        amazonCategory: 'Comidas e Bebidas',
    });

    const [feeOverrides, setFeeOverrides] = useState<{ commissionRate: number | null, fixedFee: number | null }>({
        commissionRate: null,
        fixedFee: null
    });

    const { results, defaultFees } = useMarketplaceCalculator(input, feeOverrides, rules);

    const b2wCategories = useMemo(() => {
        try {
            const parsedRules: B2WRate[] = JSON.parse(rules[Marketplace.B2W]);
            return parsedRules.map(r => r.category);
        } catch (e) {
            console.error("Failed to parse B2W rules for categories", e);
            return [];
        }
    }, [rules]);

    const amazonCategories = useMemo(() => {
        try {
            const parsedRules: AmazonRate[] = JSON.parse(rules[Marketplace.AMAZON]);
            return parsedRules.map(r => r.category);
        } catch (e) {
            console.error("Failed to parse Amazon rules for categories", e);
            return [];
        }
    }, [rules]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);
    
    useEffect(() => {
        setSavedCalculations(getSavedCalculations());
    }, []);

     // Effect to reset category if it's no longer valid after rule change
    useEffect(() => {
        if (input.marketplace === Marketplace.B2W && b2wCategories.length > 0 && !b2wCategories.includes(input.b2wCategory)) {
            setInput(prev => ({ ...prev, b2wCategory: b2wCategories[0] }));
        }
    }, [input.marketplace, b2wCategories, input.b2wCategory]);

    useEffect(() => {
        if (input.marketplace === Marketplace.AMAZON && amazonCategories.length > 0 && !amazonCategories.includes(input.amazonCategory)) {
            setInput(prev => ({ ...prev, amazonCategory: amazonCategories[0] }));
        }
    }, [input.marketplace, amazonCategories, input.amazonCategory]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInput(prev => ({ ...prev, [name]: value }));
        
        if (name === 'marketplace') {
            setFeeOverrides({ commissionRate: null, fixedFee: null });
        }
    };
    
    const handleFeeOverrideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFeeOverrides(prev => ({ ...prev, [name]: value === '' ? null : parseFloat(value) }));
    };

    const handleSave = () => {
        const name = prompt("Enter a name for this calculation:", input.productName);
        if (name) {
            saveCalculation(name, input);
            setSavedCalculations(getSavedCalculations());
        }
    };

    const handleLoad = (calculation: SavedCalculation) => {
        setInput(calculation.input);
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        removeCalculation(id);
        setSavedCalculations(getSavedCalculations());
    };

    const handleSaveRules = (newRules: MarketplaceRules) => {
        saveRules(newRules);
        setRules(newRules);
        setIsRuleEditorOpen(false);
    };

    const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;
    const formatPercent = (value: number) => `${value.toFixed(2)}%`;
    
    return (
        <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
            <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calculadora de Precificação</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsRuleEditorOpen(true)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
                        ⚙️
                    </button>
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            </header>

            <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Informações do Produto e Custos">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input name="productName" label="Nome/Link do Produto" value={input.productName} onChange={handleInputChange} />
                            <NumberInput name="sellingPrice" label="Preço de Venda (R$)" value={input.sellingPrice} onChange={handleInputChange} />
                            <NumberInput name="purchasePrice" label="Preço de Compra (R$)" value={input.purchasePrice} onChange={handleInputChange} />
                            <NumberInput name="shippingCost" label="Frete Pago (R$)" value={input.shippingCost} onChange={handleInputChange} />
                            <NumberInput name="additionalCostFixed" label="Custos Adicionais Fixos (R$)" value={input.additionalCostFixed} onChange={handleInputChange} />
                            <NumberInput name="additionalCostPercent" label="Custos Adicionais (%)" value={input.additionalCostPercent} onChange={handleInputChange} />
                        </div>
                    </Card>
                    
                    <Card title="Configuração do Marketplace">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select name="marketplace" label="Marketplace" value={input.marketplace} onChange={handleInputChange}>
                                {Object.values(Marketplace).map(mp => <option key={mp} value={mp}>{mp}</option>)}
                            </Select>

                            {input.marketplace === Marketplace.MERCADO_LIVRE && (
                                <Select name="mercadoLivreAdType" label="Tipo de Anúncio" value={input.mercadoLivreAdType} onChange={handleInputChange}>
                                    {Object.values(MercadoLivreAdType).map(type => <option key={type} value={type}>{type}</option>)}
                                </Select>
                            )}
                            
                            {input.marketplace === Marketplace.B2W && (
                                <Select name="b2wCategory" label="Categoria" value={input.b2wCategory} onChange={handleInputChange}>
                                    {b2wCategories.map(category => <option key={category} value={category}>{category}</option>)}
                                </Select>
                            )}

                            {input.marketplace === Marketplace.AMAZON && (
                                <Select name="amazonCategory" label="Categoria" value={input.amazonCategory} onChange={handleInputChange}>
                                    {amazonCategories.map(category => <option key={category} value={category}>{category}</option>)}
                                </Select>
                            )}
                            
                            <NumberInput
                                name="commissionRate"
                                label={`Comissão Padrão (%) - Padrão: ${formatPercent(defaultFees.commissionRate * 100)}`}
                                value={feeOverrides.commissionRate ?? ''}
                                onChange={handleFeeOverrideChange}
                            />
                            <NumberInput
                                name="fixedFee"
                                label={`Taxa Fixa (R$) - Padrão: ${formatCurrency(defaultFees.fixedFee)}`}
                                value={feeOverrides.fixedFee ?? ''}
                                onChange={handleFeeOverrideChange}
                            />
                        </div>
                    </Card>

                     <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex gap-4">
                        <button onClick={handleSave} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            Salvar Cálculo
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                            Carregar Cálculos
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                   <Card title="Resultados da Precificação">
                        <div className="space-y-4">
                            <ResultCard label="Receita Bruta" value={formatCurrency(results.grossRevenue)} />
                            <ResultCard label="Taxa do Marketplace" value={formatCurrency(results.marketplaceFee)} isNegative />
                            <ResultCard label="Despesas Totais" value={formatCurrency(results.totalExpenses)} isNegative />
                            <ResultCard label="Lucro Bruto (por unidade)" value={formatCurrency(results.grossProfit)} isProfit={results.grossProfit > 0} />
                            <ResultCard label="Lucro Líquido (por unidade)" value={formatCurrency(results.netProfit)} isProfit={results.netProfit > 0} />
                            <ResultCard label="Margem Bruta" value={formatPercent(results.grossMargin)} isProfit={results.grossMargin > 0} />
                            <ResultCard label="Margem Líquida" value={formatPercent(results.netMargin)} isProfit={results.netMargin > 0} />
                        </div>
                    </Card>
                    <Card title="Simulação de Vendas">
                         <div className="flex flex-col items-center">
                            <NumberInput name="quantity" label="Quantidade de Vendas Estimada" value={input.quantity} onChange={handleInputChange} containerClassName="w-full" />
                            <div className="mt-4 text-center">
                                <p className="text-lg text-gray-600 dark:text-gray-400">Lucro Total Estimado</p>
                                <p className={`text-4xl font-bold ${results.simulatedProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {formatCurrency(results.simulatedProfit)}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
            <SavedCalculationsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                calculations={savedCalculations}
                onLoad={handleLoad}
                onDelete={handleDelete}
            />
            <RuleEditorModal
                isOpen={isRuleEditorOpen}
                onClose={() => setIsRuleEditorOpen(false)}
                currentRules={rules}
                onSave={handleSaveRules}
            />
        </div>
    );
};

export default App;
