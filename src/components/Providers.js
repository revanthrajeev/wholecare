"use client";
import { CurrencyProvider, ToastProvider } from "@/components/ui/client";

export default function Providers({ currency, children }) {
  return (
    <CurrencyProvider initial={currency}>
      <ToastProvider>{children}</ToastProvider>
    </CurrencyProvider>
  );
}
