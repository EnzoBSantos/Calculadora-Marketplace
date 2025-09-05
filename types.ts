
export enum Marketplace {
  MERCADO_LIVRE = 'Mercado Livre',
  SHOPEE = 'Shopee',
  MAGALU = 'Magalu',
  B2W = 'B2W',
  AMAZON = 'Amazon',
}

export enum MercadoLivreAdType {
  CLASSICO = 'Clássico',
  PREMIUM = 'Premium',
}

export interface CalculationInput {
  productName: string;
  sellingPrice: string;
  purchasePrice: string;
  quantity: string;
  additionalCostFixed: string;
  additionalCostPercent: string;
  shippingCost: string;
  marketplace: Marketplace;
  mercadoLivreAdType: MercadoLivreAdType;
  b2wCategory: string;
  amazonCategory: string;
}

export interface CalculationResult {
  totalExpenses: number;
  grossRevenue: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  simulatedProfit: number;
  marketplaceFee: number;
}

export interface SavedCalculation {
  id: string;
  name: string;
  input: CalculationInput;
}

// Rule Structures
export interface TieredFee {
  upToPrice: number;
  fee: number;
  isMultiplier?: boolean;
}

export interface MercadoLivreRules {
  classicRate: number;
  premiumRate: number;
  fixedFeeTiers: TieredFee[];
}

export interface ShopeeRules {
    commissionRate: number;
    transactionFee: number;
    shippingProgramFee: number;
    fixedFee: number;
    lowPriceThreshold: number;
    lowPriceFixedFeeMultiplier: number;
}

export interface MagaluRules {
    commissionRate: number;
}

export interface MarketplaceRules {
  [Marketplace.MERCADO_LIVRE]: MercadoLivreRules;
  [Marketplace.SHOPEE]: ShopeeRules;
  [Marketplace.MAGALU]: MagaluRules;
  [Marketplace.B2W]: string; // JSON string for B2W category rates
  [Marketplace.AMAZON]: string; // JSON string for Amazon category rates
}

export interface B2WRate {
    category: string;
    rate: number;
}

export interface AmazonTieredRate {
    threshold: number;
    aboveRate: number;
}

export interface AmazonRate {
    category: string;
    rate: number;
    minFee: number;
    tiered?: AmazonTieredRate;
}
