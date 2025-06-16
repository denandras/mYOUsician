'use client';

import { useState } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/routing';
import { CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ForgotPasswordPage() {
    const t = useTranslations('auth.forgotPassword');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const supabase = await createSPASassClient();
            const { error } = await supabase.getSupabaseClient().auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) throw error;

            setSuccess(true);        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(t('unknownError'));
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-primary" />
                    </div>                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {t('checkEmail')}
                    </h2>

                    <p className="text-gray-600 mb-8">
                        {t('checkEmailMessage')}
                    </p>

                    <div className="mt-6 text-center text-sm">
                        <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                            {t('backToLogin')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                    {t('title')}
                </h2>
            </div>{error && (
                <div className="mb-4 p-4 text-sm text-[#083e4d] bg-[#dceaed] rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        {t('email')}
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        {t('subtitle')}
                    </p>
                </div>

                <div>                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? t('sending') : t('sendReset')}
                    </button>
                </div>
            </form>            <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">{t('backToLogin')}?</span>
                {' '}
                <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                    {t('backToLogin')}
                </Link>
            </div>
        </div>
    );
}