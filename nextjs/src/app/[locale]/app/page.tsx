"use client";
import React from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalendarDays, Settings, Database } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';

export default function DashboardContent() {
    const { loading, user } = useGlobal();
    const t = useTranslations();
    const locale = useLocale();

    // Debug logging for translations
    React.useEffect(() => {
        console.log('🏠 Dashboard Debug:', {
            locale,
            translationsLoaded: !!t,
            sampleTranslations: {
                title: t('dashboard.title'),
                welcome: t('dashboard.welcome'),
                quickActions: t('dashboard.quickActions')
            }
        });
    }, [locale, t]);

    const getDaysSinceRegistration = () => {
        if (!user?.registered_at) return 0;
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - user.registered_at.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const daysSinceRegistration = getDaysSinceRegistration();

    return (
        <div className="space-y-6 p-3 sm:p-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.welcomeUser', { name: user?.email?.split('@')[0] || 'User' })}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {t('dashboard.memberFor', { days: daysSinceRegistration })}
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.quickActions')}</CardTitle>
                    <CardDescription>{t('dashboard.quickActionsDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Link
                            href="/app/profile"
                            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Settings className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">{t('dashboard.profileEditor')}</h3>
                                <p className="text-sm text-muted-foreground">{t('dashboard.profileEditorDescription')}</p>
                            </div>
                        </Link>

                        <Link
                            href="/app/database"
                            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Database className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">{t('dashboard.databaseTitle')}</h3>
                                <p className="text-sm text-muted-foreground">{t('dashboard.databaseDescription')}</p>
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}