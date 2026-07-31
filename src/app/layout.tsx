import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GOOGLE_ADS_ID = "AW-18361700035";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Floor Expert — Укладання ламінату, кварцвінілу та плінтуса",
  description:
    "Floor Expert — професійне встановлення ламінату, кварцвінілу (SPC) та плінтуса в Києві та області. Досвідчені майстри, якісні матеріали, прозора вартість.",
  keywords: [
    "укладання ламінату",
    "укладання кварцвінілу",
    "встановлення плінтуса",
    "Floor Expert",
    "укладка підлоги Київ",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream font-sans text-ink">
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
