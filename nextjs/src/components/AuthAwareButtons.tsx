"use client";
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { createSPASassClient } from '@/lib/supabase/client';
import { ArrowRight, ChevronRight } from 'lucide-react';

export default function AuthAwareButtons({ variant = 'primary' }) {
    const t = useTranslations();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Debug logging for translation debugging
    useEffect(() => {
        console.log('🔐 AuthAwareButtons Debug:', {
            variant,
            isAuthenticated,
            loading,
            translationsLoaded: !!t,
            sampleTranslations: {
                login: t('navigation.login'),
                register: t('navigation.register'),
                goDashboard: t('navigation.goDashboard')
            }
        });
    }, [t, variant, isAuthenticated, loading]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const supabase = await createSPASassClient();
                const { data: { user } } = await supabase.getSupabaseClient().auth.getUser();
                setIsAuthenticated(!!user);
            } catch (error) {
                console.error('Error checking auth status:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);    if (loading) {
        // Render skeleton buttons to prevent hydration mismatch
        if (variant === 'nav') {
            return (
                <>
                    <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                </>
            );
        }        if (variant === 'mobile') {
            return (
                <div className="flex flex-col space-y-2 w-full min-h-[96px] justify-center">
                    <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
            );
        }
        
        // Primary variant loading state
        return (
            <>
                <div className="w-24 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-20 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </>
        );
    }// Navigation buttons for the header
    if (variant === 'nav') {
        return isAuthenticated ? (
            <Link
                href="/app"                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"            >
                {t('navigation.goDashboard')}
            </Link>        ) : (
            <>
                <Link href="/auth/login" className="text-white hover:text-[#b5d1d6]">
                    {t('navigation.login')}
                </Link>
                <Link
                    href="/auth/register"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
                >
                    {t('navigation.register')}
                </Link>
            </>
        );
    }    // Mobile navigation buttons - stacked vertically
    if (variant === 'mobile') {
        return isAuthenticated ? (
            <div className="flex flex-col space-y-2 w-full min-h-[96px] justify-center">
                <Link
                    href="/app"                    className="block w-full text-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-lg transition-colors"                >
                    {t('navigation.goDashboard')}
                </Link>
            </div>
        ) : (
            <div className="flex flex-col space-y-2 w-full min-h-[96px]">
                <Link 
                    href="/auth/login"
                    className="block w-full text-center px-4 py-3 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    {t('navigation.login')}
                </Link>
                <Link 
                    href="/auth/register"
                    className="block w-full text-center px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    {t('navigation.register')}
                </Link>
            </div>
        );
    }

    // Primary buttons for the hero section
    return isAuthenticated ? (
        <Link
            href="/app"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"        >
            {t('navigation.goDashboard')}
            <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
    ) : (
        <>
            <Link
                href="/auth/register"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
                {t('navigation.register')}
                <ArrowRight className="ml-2 h-5 w-5" />
            </Link>            <Link
                href="/auth/login"
                className="inline-flex items-center px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors"
            >
                {t('navigation.login')}
                <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
        </>
    );
}