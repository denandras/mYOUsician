// src/app/[locale]/app/layout.tsx
import AppLayoutIntl from '@/components/AppLayoutIntl';
import { GlobalProvider } from '@/lib/context/GlobalContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <GlobalProvider>
            <AppLayoutIntl>{children}</AppLayoutIntl>
        </GlobalProvider>
    );
}