'use client';

import { useState, useEffect } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CheckCircle, Key } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ResetPasswordPage() {
    const t = useTranslations('auth.resetPassword');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    // Check if we have a valid recovery session
    useEffect(() => {
        const checkSession = async () => {
            try {
                const supabase = await createSPASassClient();
                const { data: { user }, error } = await supabase.getSupabaseClient().auth.getUser();                if (error || !user) {
                    setError(t('invalidSession'));
                }            } catch {
                setError(t('sessionCheckFailed'));
            }        };

        checkSession();
    }, [t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');        if (newPassword !== confirmPassword) {
            setError(t('passwordMismatch'));
            return;
        }

        if (newPassword.length < 6) {
            setError(t('passwordTooShort'));
            return;
        }

        setLoading(true);

        try {
            const supabase = await createSPASassClient();
            const { error } = await supabase.getSupabaseClient().auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.push('/app');
            }, 3000);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);            } else {
                setError(t('unknownError'));
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-background py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-primary" />
                    </div>                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {t('success')}
                    </h2>

                    <p className="text-gray-600 mb-8">
                        {t('successMessage')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <Key className="h-12 w-12 text-primary-600" />
                </div>                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                    {t('title')}
                </h2>
            </div>            {error && (
                <div className="mb-4 p-4 text-sm text-[#083e4d] bg-[#dceaed] rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">                <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                        {t('newPassword')}
                    </label>
                    <div className="mt-1">
                        <input
                            id="new-password"
                            name="new-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                        />
                    </div>
                </div>                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                        {t('confirmPassword')}
                    </label>
                    <div className="mt-1">
                        <input
                            id="confirm-password"
                            name="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                        />
                    </div>                    <p className="mt-2 text-sm text-gray-500">
                        {t('passwordTooShort')}
                    </p>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? t('resetting') : t('resetPassword')}
                    </button>
                </div>
            </form>
        </div>
    );
}