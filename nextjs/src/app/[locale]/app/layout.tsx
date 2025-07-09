// src/app/[locale]/app/layout.tsx
import DynamicHeader from '@/components/DynamicHeader';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <DynamicHeader showSidebar={true} />
            <main className="p-2 sm:p-4 flex-1">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}