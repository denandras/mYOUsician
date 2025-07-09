"use client";
import React, { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ArrowRight, Shield, Users, Search, UserCheck, MapPin, Video } from 'lucide-react';
import AuthAwareButtons from '@/components/AuthAwareButtons';
import DynamicHeader from '@/components/DynamicHeader';

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
        <DynamicHeader />
        <div className="flex-1">        <section className="relative pt-20 pb-24 overflow-hidden">
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
              
              {/* Database Quick Access */}
              <div className="mt-8 flex justify-center">
                <Link
                  href="/database"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-[#083e4d] text-white font-medium hover:bg-[#062f3b] transition-colors"
                >
                  <Search className="mr-2 h-5 w-5" />
                  {t('database.exploreDatabase')}
                </Link>
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