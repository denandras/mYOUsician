"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ArrowRight, Shield, Users, Menu, X, Search, UserCheck, MapPin, Video } from 'lucide-react';
import AuthAwareButtons from '@/components/AuthAwareButtons';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const productName = process.env.NEXT_PUBLIC_PRODUCTNAME;
  // Debug logging to track locale and translations
  useEffect(() => {
    console.log('🌐 Homepage Debug:', {
      locale,
      productName,
      currentURL: window.location.href,
      translationsLoaded: !!t,
      sampleTranslation: t('hero.title'),
      welcomeMessage: t('home.welcomeTo')
    });
  }, [locale, t, productName]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Check if click is on the menu button
        const target = event.target as Element;
        if (!target.closest('[data-menu-trigger]')) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const features = [
    {
      icon: Search,
      title: t('home.advancedSearch.title'),
      description: t('home.advancedSearch.description'),
      color: 'text-primary'
    },
    {
      icon: UserCheck,
      title: t('home.richProfile.title'),
      description: t('home.richProfile.description'),
      color: 'text-primary'
    },
    {
      icon: MapPin,
      title: t('home.locationBased.title'),
      description: t('home.locationBased.description'),
      color: 'text-primary'
    },
    {
      icon: Video,
      title: t('home.videoPortfolio.title'),
      description: t('home.videoPortfolio.description'),
      color: 'text-primary'
    },
    {
      icon: Users,
      title: t('home.directNetworking.title'),
      description: t('home.directNetworking.description'),
      color: 'text-primary'
    },
    {
      icon: Shield,
      title: t('home.securePrivate.title'),
      description: t('home.securePrivate.description'),
      color: 'text-primary'
    }
  ];

  /*const stats = [
    { label: 'Active Users', value: '10K+' },
    { label: 'Organizations', value: '2K+' },
    { label: 'Countries', value: '50+' },
    { label: 'Uptime', value: '99.9%' }
  ];*/  return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
        <nav className="fixed top-0 w-full bg-[#083e4d] z-50 border-b border-[#062f3b] shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="block">
                  <Image 
                    src="/branding/text_vanilla.svg" 
                    alt={productName || "mYOUsician"}
                    width={120}
                    height={32}
                    className="h-8 w-auto"
                  />
                </Link>
              </div>

              <div className="flex items-center space-x-3">
                {/* Language Switcher */}
                <LanguageSwitcher variant="buttons" />
                
                {/* Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  data-menu-trigger
                  className="text-white hover:text-[#b5d1d6] transition-colors"
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
              {/* Collapsible Menu - Works on all screen sizes */}
            {isMenuOpen && (
              <div ref={menuRef} className="border-t border-[#062f3b] bg-[#083e4d]">
                <div className="px-4 py-4 space-y-3">
                  <AuthAwareButtons variant="mobile" />
                </div>
              </div>
            )}
          </div>
        </nav>        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">            <div className="text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 min-h-[4.5rem] md:min-h-[6.5rem]">
                <div className="order-2 sm:order-1">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                    {t('home.welcomeTo')}
                    <span className="block text-primary">{productName}</span>
                  </h1>
                </div>
                <Image
                  src="/branding/logo_red-teal.svg"
                  alt={`${productName} logo`}
                  width={80}
                  height={80}
                  className="self-center order-1 sm:order-2"
                  style={{ height: 'auto', width: 'auto', maxWidth: '5rem', maxHeight: '5rem' }}
                />
              </div>              <p className="mt-6 text-xl text-foreground/70 max-w-3xl mx-auto">
                {t('home.subtitle')}
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
        */}        {/* Features Section */}
        <section id="features" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground">{t('home.features')}</h2>
              <p className="mt-4 text-xl text-foreground/70">
                {t('home.featuresSubtitle')}
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
        </section>        <section className="py-24 bg-primary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground">
              {t('home.readyToJoin')}
            </h2>            <p className="mt-4 text-xl text-primary-foreground/80">
              {t('home.joinOthers', { productName: productName || 'mYOUsician' })}
            </p>
            <Link
                href="/auth/register"
                className="mt-8 inline-flex items-center px-6 py-3 rounded-lg bg-primary-foreground text-primary font-medium hover:bg-primary-foreground/90 transition-colors"
            >
              {t('navigation.register')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
        </div>
      </div>
  );
}