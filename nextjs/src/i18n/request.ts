import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as 'en' | 'hu')) {
    locale = routing.defaultLocale;
  }
  
  const messages = (await import(`../../messages/${locale}.json`)).default;
  
  return {
    locale: locale as string,
    messages
  };
});
