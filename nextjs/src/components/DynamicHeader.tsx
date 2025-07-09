"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
    Home,
    User,
    Menu,
    X,
    ChevronDown,
    LogOut,
    Database,
    FileText
} from 'lucide-react';
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import AuthAwareButtons from '@/components/AuthAwareButtons';

// Safe hook that doesn't throw if GlobalProvider is not available
const useSafeGlobal = () => {
    try {
        return useGlobal();
    } catch {
        return { user: null, loading: false };
    }
};

interface DynamicHeaderProps {
    showSidebar?: boolean;
}

export default function DynamicHeader({ showSidebar = false }: DynamicHeaderProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    const pathname = usePathname();
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const locale = useLocale();
    const t = useTranslations('common');
    const tNav = useTranslations('navigation');
    const tFooter = useTranslations('footer');

    const { user, loading } = useSafeGlobal();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle click outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setUserDropdownOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                const target = event.target as Element;
                if (!target.closest('[data-mobile-menu-trigger]')) {
                    setMobileMenuOpen(false);
                }
            }
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                const target = event.target as Element;
                if (!target.closest('[data-sidebar-trigger]') && !target.closest('[data-sidebar-backdrop]')) {
                    setSidebarOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            const client = await createSPASassClient();
            await client.logout();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const getInitials = (email: string) => {
        const parts = email.split('@')[0].split(/[._-]/);
        return parts.length > 1
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : parts[0].slice(0, 2).toUpperCase();
    };

    const productName = process.env.NEXT_PUBLIC_PRODUCTNAME;

    // Main navigation items for authenticated users
    const mainNavigation = [
        { name: tNav('home'), href: '/', icon: Home },
        { name: tNav('database'), href: '/database', icon: Database },
    ];

    // App navigation items for authenticated users
    const appNavigation = [
        { name: tNav('homepage'), href: '/app', icon: Home },
        { name: tNav('profile'), href: '/app/profile', icon: User },
        { name: tNav('database'), href: '/database', icon: Database },
    ];

    const navigation = showSidebar ? appNavigation : mainNavigation;

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

    return (
        <>
            {/* Backdrop for sidebar */}
            {isSidebarOpen && showSidebar && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40"
                    data-sidebar-backdrop
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar for app pages */}
            {showSidebar && (
                <div 
                    ref={sidebarRef}
                    className={`fixed inset-y-0 left-0 w-64 bg-white backdrop-blur-sm shadow-lg border-r border-border transform transition-transform duration-200 ease-in-out z-50 
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-[#083e4d]">
                        <Link href="/" className="block">
                            <Image 
                                src="/branding/text_vanilla.svg" 
                                alt={productName || "mYOUsician"}
                                width={120}
                                height={24}
                                className="h-6 w-auto"
                            />
                        </Link>
                        <button
                            onClick={toggleSidebar}
                            className="text-white hover:text-[#b5d1d6] transition-colors"
                            aria-label="Close sidebar"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="mt-4 px-2 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === `/${locale}${item.href}`;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                                        isActive
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    }`}
                                >
                                    <item.icon
                                        className={`mr-3 h-5 w-5 transition-colors ${
                                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
                                        }`}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                        
                        {/* Divider */}
                        <div className="border-t border-border my-4"></div>
                        
                        {/* Language Switcher in sidebar */}
                        <div className="px-3 py-2">
                            <div className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-2">
                                Language
                            </div>
                            <LanguageSwitcher variant="select" />
                        </div>
                    </nav>
                </div>
            )}

            {/* Main Header */}
            <header className="sticky top-0 z-30 bg-[#083e4d] bg-opacity-100 border-b border-[#062f3b] shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left section */}
                        <div className="flex items-center space-x-4">
                            {/* Sidebar toggle for app pages */}
                            {showSidebar && (
                                <button
                                    onClick={toggleSidebar}
                                    data-sidebar-trigger
                                    className="text-white hover:text-[#26545c] transition-colors lg:hidden"
                                    aria-label="Toggle sidebar"
                                >
                                    <Menu className="h-6 w-6"/>
                                </button>
                            )}
                            
                            {/* Menu toggle for all pages */}
                            <button
                                onClick={toggleMobileMenu}
                                data-mobile-menu-trigger
                                className="text-white hover:text-[#26545c] transition-colors"
                                aria-label="Toggle menu"
                            >
                                <Menu className="h-6 w-6"/>
                            </button>

                            {/* Logo */}
                            <Link href="/" className="block">
                                <Image 
                                    src="/branding/text_vanilla.svg" 
                                    alt={productName || "mYOUsician"}
                                    width={120}
                                    height={20}
                                    className="h-5 w-auto"
                                />
                            </Link>
                        </div>

                        {/* Right section */}
                        <div className="flex items-center space-x-3">
                            {/* User section for authenticated users */}
                            {user && (
                                <div className="relative" ref={userDropdownRef}>
                                    <button
                                        onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
                                        className="flex items-center space-x-2 text-sm text-white hover:text-[#b5d1d6] transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#dceaed]">
                                            <span className="text-[#083e4d] font-medium">
                                                {!mounted || loading ? '...' : getInitials(user.email)}
                                            </span>
                                        </div>
                                        <span className="hidden sm:inline">
                                            {!mounted || loading ? t('loading') : user?.email}
                                        </span>
                                        <ChevronDown className="h-4 w-4"/>
                                    </button>

                                    {isUserDropdownOpen && mounted && !loading && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-border">
                                            <div className="p-3 border-b border-border/50">
                                                <p className="text-xs text-muted-foreground">{t('signedInAs')}</p>
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {user?.email}
                                                </p>
                                            </div>
                                            <div className="py-1">
                                                <button
                                                    onClick={() => {
                                                        handleLogout();
                                                        setUserDropdownOpen(false);
                                                    }}
                                                    className="w-full flex items-center px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                                >
                                                    <LogOut className="mr-3 h-4 w-4 text-destructive"/>
                                                    {t('signOut')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stacked menu for all pages - available on all screen sizes */}
                {isMobileMenuOpen && (
                    <div 
                        ref={mobileMenuRef}
                        className="border-t border-[#062f3b] bg-[#083e4d]"
                    >
                        <nav className="px-4 py-3 space-y-2">
                            {navigation.map((item) => {
                                const isActive = pathname === `/${locale}${item.href}` || pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                            isActive
                                                ? 'bg-white/10 text-white'
                                                : 'text-white/80 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <item.icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                            
                            {/* Divider */}
                            <div className="border-t border-white/20 my-3"></div>
                            
                            {/* Language Switcher */}
                            <div className="px-3 py-2">
                                <div className="text-white/60 text-xs uppercase tracking-wide font-medium mb-2">
                                    Language
                                </div>
                                <LanguageSwitcher variant="buttons" />
                            </div>
                            
                            {/* Authentication */}
                            {!user && (
                                <div className="px-3 py-2">
                                    <AuthAwareButtons />
                                </div>
                            )}
                            
                            {/* User actions for authenticated users */}
                            {user && (
                                <div className="px-3 py-2">
                                    <div className="text-white/60 text-xs uppercase tracking-wide font-medium mb-2">
                                        {t('signedInAs')}
                                    </div>
                                    <div className="text-white text-sm mb-3 truncate">
                                        {user?.email}
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex items-center w-full px-3 py-2 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-md transition-colors"
                                    >
                                        <LogOut className="mr-3 h-4 w-4"/>
                                        {t('signOut')}
                                    </button>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </header>
        </>
    );
}
