import { Inter, Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import CommandSearch from "@/components/CommandSearch";
import AssistantWidget from "@/components/AssistantWidget";
import { getCurrentUser } from "@/lib/auth";
import { CURRENCY_COOKIE } from "@/lib/currency";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["500", "600", "700", "800"], display: "swap" });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], style: ["italic"], weight: ["400", "500"], display: "swap" });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Whole Care — Coordinated medical travel, from first opinion to full recovery",
    template: "%s · Whole Care",
  },
  description:
    "Compare treatment prices across countries, get specialist second opinions and itemized hospital quotes, and plan travel and aftercare in one place.",
  applicationName: "Whole Care",
  keywords: ["medical tourism", "treatment abroad", "surgery cost India", "second opinion", "hospital quotes", "medical travel"],
  openGraph: {
    type: "website",
    siteName: "Whole Care",
    title: "Whole Care — Coordinated medical travel",
    description: "Specialist opinions, itemized quotes, travel and aftercare — one case room from first message to full recovery.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport = {
  themeColor: "#04142a",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();
  const jar = await cookies();
  const currency = jar.get(CURRENCY_COOKIE)?.value || "USD";

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${jakarta.variable} ${fraunces.variable} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <Providers currency={currency}>
          <Nav user={user} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <CommandSearch />
          <AssistantWidget />
        </Providers>
      </body>
    </html>
  );
}
