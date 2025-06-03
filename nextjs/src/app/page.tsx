"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Globe, Shield, Users, Key, Database, Clock, Menu, X } from 'lucide-react';
import AuthAwareButtons from '@/components/AuthAwareButtons';
export default function Home() {
  const productName = process.env.NEXT_PUBLIC_PRODUCTNAME;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Secure login with email/password, Multi-Factor Authentication, and SSO providers',
      color: 'text-primary'
    },
    {
      icon: Database,
      title: 'Musician Database',
      description: 'Easy-to-search database of musicians with advanced filtering',
      color: 'text-primary'
    },
    {
      icon: Users,
      title: 'Profile Editor',
      description: 'Profile editor instead of CV uploads',
      color: 'text-primary'
    },
    {
      icon: Clock,
      title: 'Time Saver',
      description: 'Spare your time of asking for CVs and waiting for responses',
      color: 'text-primary'
    },
    {
      icon: Globe,
      title: 'Legal Documents',
      description: 'Privacy policy, terms of service, and refund policy',
      color: 'text-primary'
    },
    {
      icon: Key,
      title: 'Cookies',
      description: 'GDPR-compliant cookie system',
      color: 'text-primary'
    }
  ];

  /*const stats = [
    { label: 'Active Users', value: '10K+' },
    { label: 'Organizations', value: '2K+' },
    { label: 'Countries', value: '50+' },
    { label: 'Uptime', value: '99.9%' }
  ];*/

  return (
      <div className="min-h-screen">
        <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm z-50 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {productName}
              </span>
              </div>
              
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="#features" className="text-foreground/70 hover:text-foreground">
                  Features
                </Link>

                <Link
                    href="https://github.com/Razikus/supabase-nextjs-template"
                    className="text-foreground/70 hover:text-foreground"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  Documentation
                </Link>

                <AuthAwareButtons variant="nav" />
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-foreground hover:text-primary transition-colors"
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
                <div className="px-4 pt-4 pb-4 space-y-3">
                  <Link 
                    href="#features" 
                    className="block px-3 py-2 text-foreground/70 hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="https://github.com/Razikus/supabase-nextjs-template"
                    className="block px-3 py-2 text-foreground/70 hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Documentation
                  </Link>
                  <div className="pt-2 border-t border-border/50">
                    <AuthAwareButtons variant="mobile" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                Welcome to
                <span className="block text-primary">{productName}</span>
              </h1>
              <p className="mt-6 text-xl text-foreground/70 max-w-3xl mx-auto">
                A database of musicians, for musicians!
              </p>
              <div className="mt-10 flex gap-4 justify-center">

                <AuthAwareButtons />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Commented Out
        <section className="py-16 bg-gradient-to-b from-background to-background/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl font-bold text-primary">{stat.value}</div>
                    <div className="mt-2 text-sm text-foreground/70">{stat.label}</div>
                  </div>
              ))}
            </div>
          </div>
        </section>
        */}

        {/* Features Section */}
        <section id="features" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground">Features</h2>
              <p className="mt-4 text-xl text-foreground/70">
                Built with musicians in mind, for reliability and speed
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                  <div
                      key={index}
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                    <h3 className="mt-4 text-xl font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-foreground/70">{feature.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-primary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground">
              Ready to put yourself out to the market?
            </h2>
            <p className="mt-4 text-xl text-primary-foreground/80">
              Join other musicians on {productName}
            </p>
            <Link
                href="/auth/register"
                className="mt-8 inline-flex items-center px-6 py-3 rounded-lg bg-primary-foreground text-primary font-medium hover:bg-primary-foreground/90 transition-colors"
            >
              Sign up
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        <footer className="bg-background border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Product</h4>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="#features" className="text-foreground/70 hover:text-foreground">
                      Features
                    </Link>
                  </li>

                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Resources</h4>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="#features" className="text-foreground/70 hover:text-foreground">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://github.com/Razikus/supabase-nextjs-template"
                      className="text-foreground/70 hover:text-foreground"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Documentation
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Legal</h4>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="/legal/privacy" className="text-foreground/70 hover:text-foreground">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal/terms" className="text-foreground/70 hover:text-foreground">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-foreground/70">
                © {new Date().getFullYear()} {productName}. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
  );
}