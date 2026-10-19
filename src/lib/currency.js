// Indicative rates from USD for display only — hospitals quote in USD or local currency.
export const CURRENCIES = {
  USD: { symbol: "$", rate: 1, name: "US Dollar" },
  EUR: { symbol: "€", rate: 0.92, name: "Euro" },
  GBP: { symbol: "£", rate: 0.79, name: "British Pound" },
  AED: { symbol: "AED ", rate: 3.67, name: "UAE Dirham" },
  SAR: { symbol: "SAR ", rate: 3.75, name: "Saudi Riyal" },
  INR: { symbol: "₹", rate: 84, name: "Indian Rupee" },
  NGN: { symbol: "₦", rate: 1550, name: "Nigerian Naira" },
  KES: { symbol: "KSh ", rate: 129, name: "Kenyan Shilling" },
  BDT: { symbol: "৳", rate: 120, name: "Bangladeshi Taka" },
  CAD: { symbol: "CA$", rate: 1.37, name: "Canadian Dollar" },
  AUD: { symbol: "A$", rate: 1.52, name: "Australian Dollar" },
};

export const CURRENCY_COOKIE = "wc_currency";

function nice(n) {
  if (n >= 100000) return Math.round(n / 1000) * 1000;
  if (n >= 10000) return Math.round(n / 100) * 100;
  if (n >= 1000) return Math.round(n / 10) * 10;
  return Math.round(n);
}

export function formatMoney(usd, code = "USD") {
  const c = CURRENCIES[code] || CURRENCIES.USD;
  const value = code === "USD" ? Math.round(usd) : nice(usd * c.rate);
  return `${c.symbol}${value.toLocaleString("en-US")}`;
}

export function formatRange(lo, hi, code = "USD") {
  return `${formatMoney(lo, code)}–${formatMoney(hi, code).replace(CURRENCIES[code]?.symbol || "$", "")}`;
}
