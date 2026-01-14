"use server";

import axios from "axios";
import { ExchangeRateResponse } from "@/lib/types";

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function getExchangeRates(): Promise<ExchangeRateResponse> {
  try {
    const response = await axios.get(`${STRAPI_URL}/api/exchange-rates`, {
      params: {
        "sort[0]": "scrapedAt:desc",
        "pagination[limit]": 1000,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    throw new Error("Failed to fetch exchange rates");
  }
}
