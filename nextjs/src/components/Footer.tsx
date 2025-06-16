"use client";
import React from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Github, Twitter, Linkedin, ExternalLink, Heart } from 'lucide-react';

const Footer = () => {
    const productName = process.env.NEXT_PUBLIC_PRODUCTNAME || 'mYOUsician';
    const currentYear = new Date().getFullYear();

    const navigation = {
        product: [
            { name: 'Features', href: '/#features' },
            { name: 'Database', href: '/app/database' },
            { name: 'Pricing', href: '/#pricing' },
        ],        support: [
            { name: 'Report an Issue', href: 'https://tally.so/r/wkQAZd', external: true },
            { name: 'Contact Us', href: 'mailto:support@myousician.com' },
        ],
        legal: [
            { name: 'Privacy Policy', href: '/legal/privacy' },
            { name: 'Terms of Service', href: '/legal/terms' },
        ],        social: [
            { name: 'Twitter', href: '#', icon: Twitter },
            { name: 'GitHub', href: 'https://github.com/denandras/mYOUsician/', icon: Github },
            { name: 'LinkedIn', href: '#', icon: Linkedin },
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
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Main Footer Content */}
                <div className="py-8 sm:py-12 lg:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">                        {/* Brand Section */}
                        <div className="lg:col-span-5">
                            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
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
                            </div>                            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-md mb-6 sm:mb-8">
                                The premier platform for musicians to connect, collaborate, and grow their network. 
                                Discover talented artists and build meaningful musical relationships worldwide.
                            </p>
                        </div>                        {/* Navigation Sections */}
                        <div className="lg:col-span-2">
                            <h3 className="text-sm font-semibold text-foreground mb-3 sm:mb-4 lg:mb-6 tracking-wide">Product</h3>
                            <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                                {navigation.product.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center group text-sm"
                                        >
                                            <span className="relative">
                                                {item.name}
                                                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                                            </span>
                                            <span className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1">
                                                →
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>                        <div className="lg:col-span-2">
                            <h3 className="text-sm font-semibold text-foreground mb-3 sm:mb-4 lg:mb-6 tracking-wide">Support</h3>
                            <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
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
                                                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                                            </span>
                                            {item.external ? (
                                                <ExternalLink className="w-3 h-3 ml-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                                            ) : (
                                                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1">
                                                    →
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>                        <div className="lg:col-span-3">
                            <h3 className="text-sm font-semibold text-foreground mb-3 sm:mb-4 lg:mb-6 tracking-wide">Legal & More</h3>
                            <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                                {navigation.legal.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center group text-sm"
                                        >
                                            <span className="relative">
                                                {item.name}
                                                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                                            </span>
                                            <span className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1">
                                                →
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>                {/* Bottom Bar */}
                <div className="py-4 sm:py-6 lg:py-8 border-t border-border/40">
                    <div className="flex flex-col lg:flex-row justify-between items-center space-y-3 sm:space-y-4 lg:space-y-0">
                        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground">
                            <p className="flex items-center space-x-2">
                                <span>© {currentYear} {productName}. All rights reserved.</span>
                            </p>
                            <div className="flex items-center space-x-2">
                                <span>Made with</span>
                                <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
                                <span>for musicians worldwide</span>
                            </div>
                        </div>
                          <div className="flex items-center space-x-6 text-xs text-muted-foreground">
                            <span>v0.1</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
