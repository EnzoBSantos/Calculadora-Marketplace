
import { useState, useEffect } from 'react';
import { CalculationInput, CalculationResult, Marketplace, MercadoLivreAdType, MarketplaceRules, B2WRate, AmazonRate } from '../types';

const ZERO_RESULT: CalculationResult = {
    totalExpenses: 0,
    grossRevenue: 0,
    grossProfit: 0,
    netProfit: 0,
    grossMargin: 0,
    netMargin: 0,
    simulatedProfit: 0,
    marketplaceFee: 0,
};

export const useMarketplaceCalculator = (
    input: CalculationInput,
    feeOverrides: { commissionRate: number | null, fixedFee: number | null },
    rules: MarketplaceRules
) => {
    const [results, setResults] = useState<CalculationResult>(ZERO_RESULT);
    const [defaultFees, setDefaultFees] = useState({ commissionRate: 0, fixedFee: 0 });

    useEffect(() => {
        const sellingPrice = parseFloat(input.sellingPrice) || 0;
        const purchasePrice = parseFloat(input.purchasePrice) || 0;
        const quantity = parseFloat(input.quantity) || 0;
        const additionalCostFixed = parseFloat(input.additionalCostFixed) || 0;
        const additionalCostPercent = parseFloat(input.additionalCostPercent) || 0;
        const shippingCost = parseFloat(input.shippingCost) || 0;

        const {
            marketplace,
            mercadoLivreAdType,
            b2wCategory,
            amazonCategory
        } = input;

        let commissionRate = 0;
        let fixedFee = 0;

        switch (marketplace) {
            case Marketplace.MERCADO_LIVRE:
                const mlRules = rules[Marketplace.MERCADO_LIVRE];
                commissionRate = mercadoLivreAdType === MercadoLivreAdType.CLASSICO
                    ? mlRules.classicRate
                    : mlRules.premiumRate;
                
                const tier = [...mlRules.fixedFeeTiers].sort((a, b) => a.upToPrice - b.upToPrice).find(t => sellingPrice <= t.upToPrice);
                if (tier) {
                    fixedFee = tier.isMultiplier ? sellingPrice * tier.fee : tier.fee;
                }
                break;

            case Marketplace.SHOPEE:
                const shopeeRules = rules[Marketplace.SHOPEE];
                commissionRate = shopeeRules.commissionRate + shopeeRules.transactionFee + shopeeRules.shippingProgramFee;
                fixedFee = sellingPrice < shopeeRules.lowPriceThreshold
                    ? sellingPrice * shopeeRules.lowPriceFixedFeeMultiplier
                    : shopeeRules.fixedFee;
                break;

            case Marketplace.MAGALU:
                commissionRate = rules[Marketplace.MAGALU].commissionRate;
                fixedFee = 0;
                break;

            case Marketplace.B2W:
                try {
                    const b2wRates: B2WRate[] = JSON.parse(rules[Marketplace.B2W]);
                    commissionRate = b2wRates.find(r => r.category === b2wCategory)?.rate || 0.16;
                } catch (e) {
                    console.error("Invalid B2W rules JSON, using fallback", e);
                    commissionRate = 0.16;
                }
                fixedFee = 0;
                break;
            
            case Marketplace.AMAZON:
                try {
                    const amazonRates: AmazonRate[] = JSON.parse(rules[Marketplace.AMAZON]);
                    const categoryInfo = amazonRates.find(r => r.category === amazonCategory);

                    if (categoryInfo) {
                        commissionRate = categoryInfo.rate;
                        const minFee = categoryInfo.minFee;
                        let calculatedCommission = sellingPrice * commissionRate;

                        if (categoryInfo.tiered) {
                            const { threshold, aboveRate } = categoryInfo.tiered;
                            if (sellingPrice > threshold) {
                                calculatedCommission = (threshold * commissionRate) + ((sellingPrice - threshold) * aboveRate);
                                commissionRate = calculatedCommission / sellingPrice;
                            }
                        }
                        
                        fixedFee = Math.max(0, minFee - calculatedCommission);
                    } else {
                        commissionRate = 0.15;
                        fixedFee = 2.00;
                    }
                } catch (e) {
                    console.error("Invalid Amazon rules JSON, using fallback", e);
                    commissionRate = 0.15;
                    fixedFee = 2.00;
                }
                break;
        }

        setDefaultFees({ commissionRate, fixedFee });
        
        const finalCommissionRate = feeOverrides.commissionRate !== null ? feeOverrides.commissionRate / 100 : commissionRate;
        const finalFixedFee = feeOverrides.fixedFee !== null ? feeOverrides.fixedFee : fixedFee;

        const grossRevenue = sellingPrice;
        const commissionAmount = grossRevenue * finalCommissionRate;
        const marketplaceFee = commissionAmount + finalFixedFee;
        
        const otherCosts = additionalCostFixed + (grossRevenue * (additionalCostPercent / 100));

        const totalExpenses = purchasePrice + marketplaceFee + shippingCost + otherCosts;
        
        const grossProfit = grossRevenue - purchasePrice - shippingCost;
        const netProfit = grossRevenue - totalExpenses;
        
        const grossMargin = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;
        const netMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

        const simulatedProfit = netProfit * quantity;

        setResults({
            totalExpenses,
            grossRevenue,
            grossProfit,
            netProfit,
            grossMargin,
            netMargin,
            simulatedProfit,
            marketplaceFee,
        });

    }, [input, feeOverrides, rules]);

    return { results, defaultFees };
};
