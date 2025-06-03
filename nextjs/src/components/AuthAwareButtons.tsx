"use client";
import { useState, useEffect } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Link from "next/link";

export default function AuthAwareButtons({ variant = 'primary' }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

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
    }, []);

    if (loading) {
        return null;
    }    // Navigation buttons for the header
    if (variant === 'nav') {
        return isAuthenticated ? (
            <Link
                href="/app"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
            >
                Go to Dashboard
            </Link>
        ) : (
            <>
                <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
                    Login
                </Link>
                <Link
                    href="/auth/register"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
                >
                    Sign Up
                </Link>
            </>
        );
    }

    // Mobile navigation buttons - stacked vertically
    if (variant === 'mobile') {
        return isAuthenticated ? (
            <Link
                href="/app"
                className="block w-full text-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-lg transition-colors"
            >
                Go to Dashboard
            </Link>
        ) : (
            <div className="flex flex-col space-y-2 w-full">
                <Link 
                    href="/auth/login"
                    className="block w-full text-center px-4 py-3 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    Login
                </Link>
                <Link 
                    href="/auth/register"
                    className="block w-full text-center px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    Sign Up
                </Link>
            </div>
        );
    }

    // Primary buttons for the hero section
    return isAuthenticated ? (
        <Link
            href="/app"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
    ) : (
        <>
            <Link
                href="/auth/register"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
                Sign Up
                <ArrowRight className="ml-2 h-5 w-5" />
            </Link>            <Link
                href="/auth/login"
                className="inline-flex items-center px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors"
            >
                Login
                <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
        </>
    );
}