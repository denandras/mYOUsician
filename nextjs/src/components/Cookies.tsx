'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, X } from 'lucide-react';
import { setCookie, getCookie } from 'cookies-next/client';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'cookie-accept';
const COOKIE_EXPIRY_DAYS = 365;

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = getCookie(COOKIE_CONSENT_KEY);
        if (!consent) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        setCookie(COOKIE_CONSENT_KEY, 'accepted', {
            expires: new Date(Date.now() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        });
        setIsVisible(false);
    };

    const handleDecline = () => {
        setCookie(COOKIE_CONSENT_KEY, 'declined', {
            expires: new Date(Date.now() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        });
        setIsVisible(false);
    };    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 transform transition-transform duration-500 ease-in-out">
            <div className="w-full mx-auto px-2 py-3 sm:px-4 sm:py-4 md:px-6 lg:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex items-start gap-2 sm:items-center sm:gap-3 min-w-0 flex-1">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <div className="space-y-1 min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-600 leading-tight sm:leading-normal">
                                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                                By clicking &quot;Accept&quot;, you consent to our use of cookies.
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                                Read our{' '}
                                <Link href={`/legal/privacy`} className="text-blue-600 hover:text-blue-700 underline">
                                    Privacy Policy
                                </Link>{' '}
                                and{' '}
                                <Link href={`/legal/terms`} className="text-blue-600 hover:text-blue-700 underline">
                                    Terms of Service
                                </Link>{' '}
                                for more information.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 sm:justify-end sm:gap-3 flex-shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDecline}
                            className="text-xs sm:text-sm text-gray-600 hover:text-gray-700 px-2 py-1.5 sm:px-3"
                        >
                            Decline
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleAccept}
                            className="text-xs sm:text-sm bg-blue-600 text-white hover:bg-blue-700 px-2 py-1.5 sm:px-3"
                        >
                            Accept
                        </Button>
                        <button
                            onClick={handleDecline}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                            aria-label="Close"
                        >
                            <X className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;