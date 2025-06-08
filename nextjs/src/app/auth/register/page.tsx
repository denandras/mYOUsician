'use client';

import {createSPASassClient} from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SSOButtons from "@/components/SSOButtons";

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!acceptedTerms) {
            setError('You must accept the Terms of Service and Privacy Policy');
            return;
        }        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        // Check if user has already attempted to register with this email
        const registrationAttempt = localStorage.getItem(`registration_attempt_${email}`);
        if (registrationAttempt) {
            const attemptTime = new Date(registrationAttempt);
            const now = new Date();
            const timeDiff = now.getTime() - attemptTime.getTime();
            
            // If attempt was made within the last 5 minutes, prevent duplicate registration
            if (timeDiff < 300000) { // 5 minutes in milliseconds
                setError('A registration attempt for this email was already made recently. Please check your email for a verification link or wait before trying again.');
                return;
            }
        }

        setLoading(true);try {
            const supabase = await createSPASassClient();
            const { error } = await supabase.registerEmail(email, password);

            if (error) {
                // Handle specific signup errors
                if (error.message.includes('User already registered') || 
                    error.message.includes('already registered') ||
                    error.message.includes('Email rate limit exceeded') ||
                    error.message.includes('already exists')) {
                    setError('An account with this email address already exists. Please sign in instead or check your email for a verification link.');
                } else if (error.message.includes('Signup is disabled')) {
                    setError('Account registration is currently disabled. Please contact support.');
                } else if (error.message.includes('Password')) {
                    setError('Password does not meet security requirements. Please use a stronger password.');
                } else {
                    setError(error.message);
                }                return;
            }

            // Store the registration attempt timestamp
            localStorage.setItem(`registration_attempt_${email}`, new Date().toISOString());

            router.push('/auth/verify-email');
        } catch (err: Error | unknown) {
            if(err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">            {error && (
                <div className="mb-4 p-4 text-sm text-[#083e4d] bg-[#dceaed] rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
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
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div className="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password
                    </label>
                    <div className="mt-1">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start">
                        <div className="flex h-5 items-center">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="text-gray-600">
                                I agree to the{' '}
                                <Link
                                    href="/legal/terms"
                                    className="font-medium text-primary-600 hover:text-primary-500"
                                    target="_blank"
                                >
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link
                                    href="/legal/privacy"
                                    className="font-medium text-primary-600 hover:text-primary-500"
                                    target="_blank"
                                >
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>
                    </div>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </div>
            </form>

            <SSOButtons onError={setError}/>

            <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">Already have an account?</span>
                {' '}
                <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                    Sign in
                </Link>
            </div>
        </div>
    );
}