import { Providers } from "@tripian/model";

const calculateExchangeRates = (amount: number, exchangeRates: Providers.Viator.ExchangeRates[]) => {
  if (exchangeRates.length === 0) {
    return amount;
  }

  const exchangeRate = exchangeRates.find((rate) => rate.targetCurrency === "USD");

  if (!exchangeRate) {
    console.error(`Exchange rate from EUR to USD not found.`);
    return null;
  }

  const convertedAmount = amount * exchangeRate.rate;
  return convertedAmount.toFixed(1);
};

export { calculateExchangeRates };
