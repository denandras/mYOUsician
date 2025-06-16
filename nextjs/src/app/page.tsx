import { redirect } from 'next/navigation';

export default function RootPage() {
  // Always redirect to English as default locale
  redirect('/en');
}