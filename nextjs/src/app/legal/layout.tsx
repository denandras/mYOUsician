"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, ShieldAlert } from 'lucide-react';

const legalDocuments = [
    {
        id: 'privacy',
        title: 'Privacy Policy',
        icon: ShieldAlert,
        description: 'How we handle and protect your data'
    },
    {
        id: 'terms',
        title: 'Terms of Service',
        icon: FileText,
        description: 'Rules and guidelines for using our service'
    }
];

export default function LegalLayout({ children } : { children: React.ReactNode }) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center text-sm text-foreground/70 hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
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