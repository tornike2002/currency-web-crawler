export interface ExchangeRate {
  id: number;
  source: string;
  currency: string;
  buyRate: number;
  sellRate: number;
  officialRate: number | null;
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
