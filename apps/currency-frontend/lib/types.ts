export interface ExchangeRate {
  id: number;
  source: string;
  currency: string;
  // Strapi decimals may come back as string; and some banks don't have buy/sell.
  buyRate: number | string | null;
  sellRate: number | string | null;
  officialRate: number | string | null;
  scrapedAt: string;
}

export interface ExchangeRateResponse {
  data: ExchangeRate[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface GroupedRates {
  date: string;
  rates: ExchangeRate[];
}
