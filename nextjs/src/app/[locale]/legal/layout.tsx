"use client";
import React from 'react';
import { Link } from '@/i18n/routing';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, FileText, ShieldAlert, Shield, Lock, BookOpen } from 'lucide-react';
import DynamicHeader from '@/components/DynamicHeader';

export default function LegalLayout({ children } : { children: React.ReactNode }) {
    const router = useRouter();
    const t = useTranslations('legal');
    const tCommon = useTranslations('common');

    const legalDocuments = [
        {
            id: 'privacy',
            title: t('documents.privacy.title'),
            icon: ShieldAlert,
            description: t('documents.privacy.description')
        },
        {
            id: 'terms',
            title: t('documents.terms.title'),
            icon: FileText,
            description: t('documents.terms.description')
        },
        {
            id: 'data-security',
            title: t('documents.dataSecurity.title'),
            icon: Lock,
            description: t('documents.dataSecurity.description')
        },
        {
            id: 'docs',
            title: t('documents.documentation.title'),
            icon: BookOpen,
            description: t('documents.documentation.description')
        }
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <DynamicHeader />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
                <div className="py-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center text-sm text-foreground/70 hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {tCommon('back')}
                    </button>
                </div>

                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full xl:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm border border-border">
                            <div className="p-4 border-b border-border">
                                <h2 className="text-lg font-semibold text-foreground">Legal Documents</h2>
                                <p className="text-sm text-foreground/70 mt-1">Important information about our services</p>
                            </div>
                            <nav className="p-4 space-y-2">
                                {legalDocuments.map((doc) => (
                                    <Link
                                        key={doc.id}
                                        href={`/legal/${doc.id}`}
                                        className="block p-3 rounded-md hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <doc.icon className="w-5 h-5 text-foreground/50" />
                                            <div>
                                                <div className="text-sm font-medium text-foreground">{doc.title}</div>
                                                <div className="text-xs text-foreground/70">{doc.description}</div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}