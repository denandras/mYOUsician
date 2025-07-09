"use client";
import React from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ExternalLink, Heart } from 'lucide-react';

const Footer = () => {
    const productName = process.env.NEXT_PUBLIC_PRODUCTNAME || 'mYOUsician';
    const currentYear = new Date().getFullYear();

    const navigation = {
        product: [
            { name: 'Features', href: '/#features' },
            { name: 'Database', href: '/database' },
            { name: 'Pricing', href: '/#pricing' },
        ],        support: [
            { name: 'Report an Issue', href: 'https://tally.so/r/wkQAZd', external: true },
            { name: 'Contact Us', href: 'mailto:support@myousician.com' },
        ],
        legal: [
            { name: 'Privacy Policy', href: '/legal/privacy' },
            { name: 'Terms of Service', href: '/legal/terms' },
            { name: 'Data Security', href: '/legal/data-security' },
            { name: 'Documentation', href: '/legal/docs' },
        ],
    };

    return (
        <footer className="bg-gradient-to-br from-background via-background/98 to-muted/20 border-t border-border/60 backdrop-blur-md relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>
            
            {/* Main content container with max-width for better layout on wide screens */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8 lg:py-12">
                    {/* Column 1: Brand and description */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-1 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                <Image
                                    src="/branding/logo_red-teal.svg"
                                    alt={`${productName} logo`}
                                    width={36}
                                    height={36}
                                    className="w-8 h-8 sm:w-9 sm:h-9"
                                />
                            </div>
                            <Image
                                src="/branding/text_teal.svg"
                                alt={productName}
                                width={140}
                                height={28}
                                className="h-6 sm:h-7 w-auto"
                            />
                        </div>
                        
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                            The premier platform for musicians to connect, collaborate, and grow their network. 
                            Discover talented artists and build meaningful musical relationships worldwide.
                        </p>
                    </div>
                    
                    {/* Column 2: Navigation links in grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                        {/* Product Links */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 tracking-wide">Product</h3>
                            <ul className="space-y-2">
                                {navigation.product.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center group text-sm"
                                        >
                                            <span className="relative">
                                                {item.name}
                                                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-all duration-300 ease-in-out origin-left" />
                                            </span>
                                            <span className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out group-hover:translate-x-1">
                                                →
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Support Links */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 tracking-wide">Support</h3>
                            <ul className="space-y-2">
                                {navigation.support.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center group text-sm"
                                            target={item.external ? '_blank' : undefined}
                                            rel={item.external ? 'noopener noreferrer' : undefined}
                                        >
                                            <span className="relative">
                                                {item.name}
                                                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-all duration-300 ease-in-out origin-left" />
                                            </span>
                                            {item.external ? (
                                                <ExternalLink className="w-3 h-3 ml-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300 ease-in-out" />
                                            ) : (
                                                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out group-hover:translate-x-1">
                                                    →
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Legal Links */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 tracking-wide">Legal</h3>
                            <ul className="space-y-2">
                                {navigation.legal.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center group text-sm"
                                        >
                                            <span className="relative">
                                                {item.name}
                                                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-all duration-300 ease-in-out origin-left" />
                                            </span>
                                            <span className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out group-hover:translate-x-1">
                                                →
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                
                {/* Bottom copyright bar */}
                <div className="py-4 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2 sm:mb-0">
                        <span>© {currentYear} {productName}. All rights reserved.</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>Made with</span>
                            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
                            <span>for musicians worldwide</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">v1.0</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
