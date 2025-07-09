'use client';

import React from 'react';
import LegalDocument from '@/components/LegalDocument';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';

const legalDocuments = {
    'privacy': {
        titleKey: 'legal.documents.privacy.title',
        filename: 'privacy-notice.md'
    },
    'terms': {
        titleKey: 'legal.documents.terms.title',
        filename: 'terms-of-service.md'
    },
    'data-security': {
        titleKey: 'legal.documents.dataSecurity.title',
        filename: 'data-security.md'
    },
    'docs': {
        titleKey: 'legal.documents.documentation.title',
        filename: 'documentation.md'
    }
} as const;

type LegalDocument = keyof typeof legalDocuments;

interface LegalPageProps {
    document: LegalDocument;
    locale: string;
}

interface LegalPageParams {
    params: Promise<LegalPageProps>
}

export default function LegalPage({ params }: LegalPageParams) {
    const { document, locale } = React.use<LegalPageProps>(params);
    const t = useTranslations();

    if (!legalDocuments[document]) {
        notFound();
    }

    const { titleKey, filename } = legalDocuments[document];
    const title = t(titleKey);
    
    // Construct the localized path, with fallback to default language
    const localizedPath = `/terms/${locale}/${filename}`;
    const fallbackPath = `/terms/en/${filename}`;

    return (
        <div className="container mx-auto px-4 py-8">
            <LegalDocument
                title={title}
                filePath={localizedPath}
                fallbackPath={fallbackPath}
            />
        </div>
    );
}