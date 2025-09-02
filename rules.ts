
import { Marketplace, MarketplaceRules } from './types';
import { B2W_RATES, AMAZON_RATES } from './constants';

export const DEFAULT_RULES: MarketplaceRules = {
  [Marketplace.MERCADO_LIVRE]: {
    classicRate: 0.12,
    premiumRate: 0.17,
    fixedFeeTiers: [
      { upToPrice: 12.50, fee: 0.5, isMultiplier: true },
      { upToPrice: 29, fee: 6.25 },
      { upToPrice: 50, fee: 6.50 },
      { upToPrice: 79, fee: 6.75 },
      { upToPrice: Infinity, fee: 6.75 },
    ],
  },
  [Marketplace.SHOPEE]: {
    commissionRate: 0.14,
    transactionFee: 0.02,
    shippingProgramFee: 0.06,
    fixedFee: 4,
    lowPriceThreshold: 8,
    lowPriceFixedFeeMultiplier: 0.5,
  },
  [Marketplace.MAGALU]: {
    commissionRate: 0.16,
  },
  [Marketplace.B2W]: JSON.stringify(B2W_RATES, null, 2),
  [Marketplace.AMAZON]: JSON.stringify(AMAZON_RATES, null, 2),
};
