import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'hu'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // localeDetection: false  // Temporarily re-enable to test
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
