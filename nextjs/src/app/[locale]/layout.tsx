import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import "../globals.css";
import { Poppins } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import CookieConsent from "@/components/Cookies";
import { GoogleAnalytics } from '@next/third-parties/google';
import Footer from "@/components/Footer";
import { GlobalProvider } from '@/lib/context/GlobalContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_PRODUCTNAME,
  description: "Discover musicians, connect with talent - the global musician database.",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await the params as required in Next.js 15
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages({ locale });

  let theme = process.env.NEXT_PUBLIC_THEME
  if(!theme) {
    theme = "theme-red"
  }
  const gaID = process.env.NEXT_PUBLIC_GOOGLE_TAG;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${theme} ${poppins.variable} font-sans flex flex-col min-h-screen`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <GlobalProvider>
            <div className="flex-1">
              {children}
            </div>
            <Footer />
            <Analytics />
            <CookieConsent />
            { gaID && (
                <GoogleAnalytics gaId={gaID}/>
            )}
          </GlobalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
