import { getExchangeRates } from "./actions/exchange-rates";
import { groupRatesByDate } from "@/lib/helpers";
import { ExchangeRatesClient } from "@/components/exchange-rates-client";
import { GroupedRates } from "@/lib/types";

export default async function Home() {
  let groups: GroupedRates[] = [];
  let error: string | null = null;

  try {
    const response = await getExchangeRates();
    groups = groupRatesByDate(response.data);
  } catch (err) {
    error = "Failed to load exchange rates. Make sure Strapi is running.";
    console.error(err);
  }

  return <ExchangeRatesClient initialGroups={groups} initialError={error} />;
}
