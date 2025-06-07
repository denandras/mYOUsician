"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {
    Home,
    User,
    Menu,
    X,
    ChevronDown,
    LogOut,
    Key,
    Database,
} from 'lucide-react';
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const { user, loading } = useGlobal();

    useEffect(() => {
        setMounted(true);
    }, []);    // Handle click outside user dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setUserDropdownOpen(false);
            }
        };

        if (isUserDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserDropdownOpen]);

    // Handle click outside sidebar (mobile)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                // Check if click is on the menu button or backdrop
                const target = event.target as Element;
                if (!target.closest('[data-sidebar-trigger]') && !target.closest('[data-sidebar-backdrop]')) {
                    setSidebarOpen(false);
                }
            }
        };

        if (isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen]);

    const handleLogout = async () => {
        try {
            const client = await createSPASassClient();
            await client.logout();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    const handleChangePassword = async () => {
        router.push('/app/user-settings')
    };

    const getInitials = (email: string) => {
        const parts = email.split('@')[0].split(/[._-]/);
        return parts.length > 1
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : parts[0].slice(0, 2).toUpperCase();
    };

    const productName = process.env.NEXT_PUBLIC_PRODUCTNAME;

    const navigation = [
        { name: 'Homepage', href: '/app', icon: Home },
        { name: 'Profile Editor', href: '/app/user-settings', icon: User },
        { name: 'Database', href: '/app/database', icon: Database },
    ];

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    return (        <div className="min-h-screen bg-background">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
                    data-sidebar-backdrop
                    onClick={toggleSidebar}
                />
            )}            {/* Sidebar */}
            <div 
                ref={sidebarRef}
                className={`fixed inset-y-0 left-0 w-64 bg-white backdrop-blur-sm shadow-lg border-r border-border transform transition-transform duration-200 ease-in-out z-30 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:bg-white lg:backdrop-blur-none`}
            >

                <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-[#083e4d]">
                    <span className="text-xl font-semibold text-white">{productName}</span>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-white hover:text-[#b5d1d6] transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                {/* Navigation */}
                <nav className="mt-4 px-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)} // Close sidebar on menu click
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
                </nav>

            </div>            <div className="lg:pl-64">
                <div className="sticky top-0 z-10 flex items-center justify-between h-16 bg-[#083e4d] bg-opacity-100 border-b border-[#062f3b] px-4 shadow-md">
                    <button
                        onClick={toggleSidebar}
                        data-sidebar-trigger
                        className="lg:hidden text-white hover:text-[#26545c] transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="h-6 w-6"/>
                    </button>

                    <div className="relative ml-auto" ref={userDropdownRef}>
                        <button
                            onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
                            className="flex items-center space-x-2 text-sm text-white hover:text-[#b5d1d6] transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#dceaed]">
                                <span className="text-[#083e4d] font-medium">
                                    {!mounted || loading ? '...' : user ? getInitials(user.email) : '??'}
                                </span>
                            </div>
                            <span className="hidden sm:inline">
                                {!mounted || loading ? 'Loading...' : user?.email || 'Not signed in'}
                            </span>
                            <ChevronDown className="h-4 w-4"/>
                        </button>{isUserDropdownOpen && mounted && !loading && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-border">
                                <div className="p-3 border-b border-border/50">
                                    <p className="text-xs text-muted-foreground">Signed in as</p>
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {user?.email || 'Not signed in'}
                                    </p>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setUserDropdownOpen(false);
                                            handleChangePassword()
                                        }}
                                        className="w-full flex items-center px-4 py-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        <Key className="mr-3 h-4 w-4 text-muted-foreground"/>
                                        Change Password
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setUserDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                        <LogOut className="mr-3 h-4 w-4 text-destructive"/>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>                <main className="p-2 sm:p-4">
                    {children}
                </main>
            </div>
        </div>
    );
}