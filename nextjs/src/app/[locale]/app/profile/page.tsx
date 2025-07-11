"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from '@/components/ui/select-new';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASassClient } from '@/lib/supabase/client';
import { Key, User, Briefcase, Music, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { MFASetup } from '@/components/MFASetup';
import { Database } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { LoadingCard } from '@/components/ui/loading-card';
import { SOCIAL_PLATFORMS, validateSocialUrl as validateSocialUrlHelper } from '@/lib/socialPlatforms';
import { useTranslations, useLocale } from 'next-intl';

// Use the generated types directly
type Instrument = Database['public']['Tables']['instruments']['Row'];
type Genre = Database['public']['Tables']['genres']['Row'];
type EducationType = Database['public']['Tables']['education']['Row'];

interface ReferenceData {
    instruments: Instrument[];
    genres: Genre[];
    education_types: EducationType[];
}

interface LocationData {
  countries: Array<{ geonameId: number; countryName: string; countryCode: string }>;
  cities: Record<string, Array<{ geonameId: number; name: string; countryCode: string }>>;
}

export default function ProfilePage() {
    const { user, loading: userLoading } = useGlobal();
    const router = useRouter();
    const t = useTranslations();
    const locale = useLocale();

    // Debug logging for profile translations
    React.useEffect(() => {
        console.log('👤 Profile Debug:', {
            locale,
            translationsLoaded: !!t,
            sampleTranslations: {
                title: t('profile.title'),
                personalInfo: t('profile.personalInfo')
            }
        });
    }, [locale, t]);    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);    const [profileLoading, setProfileLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState('');    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [success, setSuccess] = useState('');

    const [personalDataSaved, setPersonalDataSaved] = useState(false);
    const [aboutSaved, setAboutSaved] = useState(false);
    const [artisticProfileSaved, setArtisticProfileSaved] = useState(false);
    const [passwordSaved, setPasswordSaved] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    // Danger Zone state
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Location service state
    const [locationServiceStatus, setLocationServiceStatus] = useState<'loading' | 'available' | 'unavailable'>('loading');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [locationError, setLocationError] = useState('');    // Reference data state
    const [referenceData, setReferenceData] = useState<ReferenceData>({
        instruments: [],
        genres: [],
        education_types: []
    });

    // Location data state
    const [locationData, setLocationData] = useState<LocationData>({
        countries: [],
        cities: {}
    });
    const [loadingLocations, setLoadingLocations] = useState(false);

    // Profile data state
    const [profile, setProfile] = useState({
        forename: '',
        surname: '',
        location: { country: '', countryCode: '', city: '' },
        phone: '',
        bio: '',
        occupation: [''],
        education: [{ type: '', school: '' }],
        certificates: [''],
        genre_instrument: [{ genre: '', instrument: '', category: '' }],
        video_links: [''],
        social: {} as Record<string, string>
    });    // Memoize instrumentsByCategory for the categorized dropdown with ranking
    const instrumentsByCategory = useMemo(() => {
        return referenceData.instruments.reduce((acc, instrument) => {
            const category = instrument.category || 'Other'; // Default to 'Other' if category is missing
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(instrument);
            return acc;
        }, {} as Record<string, Instrument[]>);
    }, [referenceData.instruments]);

    // Memoize sorted categories by category_rank for consistent ordering
    const sortedCategories = useMemo(() => {
        const categories = Object.keys(instrumentsByCategory);
        return categories.sort((a, b) => {
            // Find the category_rank for each category by looking at the first instrument in each category
            const categoryA = instrumentsByCategory[a][0];
            const categoryB = instrumentsByCategory[b][0];
            const rankA = categoryA?.category_rank ?? 999;
            const rankB = categoryB?.category_rank ?? 999;
            return rankA - rankB;
        });
    }, [instrumentsByCategory]);    // Memoize instruments sorted by instrument_rank within each category
    const sortedInstrumentsByCategory = useMemo(() => {
        const result: Record<string, Instrument[]> = {};
        sortedCategories.forEach(category => {
            result[category] = instrumentsByCategory[category].sort((a, b) => {
                // Sort by instrument_rank, fallback to name if ranks are equal or missing
                const rankA = a.instrument_rank ?? 999;
                const rankB = b.instrument_rank ?? 999;
                if (rankA !== rankB) {
                    return rankA - rankB;
                }
                return a.name.localeCompare(b.name);
            });
        });
        return result;
    }, [instrumentsByCategory, sortedCategories]);

    // Load reference data from Supabase with localStorage caching
    const loadReferenceData = useCallback(async () => {
        const cacheKey = 'musician_reference_data';
        const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        
        // Check localStorage first
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < cacheExpiry) {
                setReferenceData(data);
                return;
            }
        }

        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();            const [instrumentsRes, genresRes, educationRes] = await Promise.all([
                client.from('instruments').select('*').order('name'),
                client.from('genres').select('*').order('name'),
                client.from('education').select('*').order('rank', { nullsFirst: false }) // Order by rank, nulls last
            ]);

            const newReferenceData = {
                instruments: instrumentsRes.data || [],
                genres: genresRes.data || [],
                education_types: educationRes.data || []
            };

            setReferenceData(newReferenceData);

            // Cache to localStorage
            localStorage.setItem(cacheKey, JSON.stringify({
                data: newReferenceData,
                timestamp: Date.now()
            }));

        } catch (err) {
            console.error('Error loading reference data:', err);
        }
    }, []);

    // Enhanced location data loading with better error handling
    const loadLocationData = useCallback(async () => {
        setLocationServiceStatus('loading');
        const cacheKey = 'geonames_countries';
        const cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        // Always check localStorage first
        const cached = localStorage.getItem(cacheKey);
        let cachedData = null;
        
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            cachedData = data;
            
            // If cache is still valid, use it and set service as available
            if (Date.now() - timestamp < cacheExpiry) {
                setLocationData(prev => ({ ...prev, countries: data }));
                setLocationServiceStatus('available');
                return;
            }
        }

        // Try to fetch fresh data from API
        try {
            const GEONAMES_USERNAME = process.env.NEXT_PUBLIC_GEONAMES_USERNAME;
            if (!GEONAMES_USERNAME) {
                throw new Error('GeoNames username not configured');
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(
                `https://secure.geonames.org/countryInfoJSON?username=${GEONAMES_USERNAME}`,
                { signal: controller.signal }
            );
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status) {
                throw new Error(data.status.message || 'GeoNames API error');
            }

            const countries = data.geonames || [];

            if (countries.length === 0) {
                throw new Error('No countries returned from API');
            }

            setLocationData(prev => ({ ...prev, countries }));
            setLocationServiceStatus('available');

            // Cache the fresh data
            localStorage.setItem(cacheKey, JSON.stringify({
                data: countries,
                timestamp: Date.now()
            }));

        } catch (err: unknown) {
            console.error('Error loading countries from API:', err);
            
            // If we have cached data, use it as fallback
            if (cachedData && cachedData.length > 0) {
                setLocationData(prev => ({ ...prev, countries: cachedData }));
                setLocationServiceStatus('available');
                setLocationError('Using cached location data. Some locations may be outdated.');
            } else {
                // No cache available, service is unavailable
                setLocationServiceStatus('unavailable');
                setLocationError('Location service is currently unavailable. Please try again later.');
                
                // Set empty location data to disable dropdowns
                setLocationData({ countries: [], cities: {} });
            }
        }
    }, []);    // Load cities for a specific country with enhanced error handling
    const loadCitiesForCountry = useCallback(async (countryCode: string) => {
        // Check if service is available first
        if (locationServiceStatus === 'unavailable') {
            return; // Don't proceed if service is unavailable
        }
        
        // Check current state to see if cities already loaded
        setLocationData(current => {
            // If cities already loaded, don't load again
            if (current.cities[countryCode]) {
                return current; // Return unchanged state
            }
            
            // Start loading
            setLoadingLocations(true);
            
            // Return current state, actual loading happens below
            return current;
        });
        
        // If we already have cities, exit early
        const currentCities = locationData.cities[countryCode];
        if (currentCities) {
            return;
        }
    
        const cacheKey = `geonames_cities_${countryCode}`;
        const cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        // Check localStorage first
        const cached = localStorage.getItem(cacheKey);
        let cachedData = null;
        
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            cachedData = data;
            
            if (Date.now() - timestamp < cacheExpiry) {
                setLocationData(prev => ({
                    ...prev,
                    cities: { ...prev.cities, [countryCode]: data }
                }));
                setLoadingLocations(false);
                return;
            }
        }

        try {
            const GEONAMES_USERNAME = process.env.NEXT_PUBLIC_GEONAMES_USERNAME;
            if (!GEONAMES_USERNAME) {
                throw new Error('GeoNames username not configured');
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(
                `https://secure.geonames.org/searchJSON?country=${countryCode}&featureClass=P&maxRows=1000&orderby=population&username=${GEONAMES_USERNAME}`,
                { signal: controller.signal }
            );
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Cities API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status) {
                throw new Error(data.status.message || 'GeoNames cities API error');
            }

            const cities = data.geonames || [];

            setLocationData(prev => ({
                ...prev,
                cities: { ...prev.cities, [countryCode]: cities }
            }));

            // Cache the fresh data
            localStorage.setItem(cacheKey, JSON.stringify({
                data: cities,
                timestamp: Date.now()
            }));

        } catch (err: unknown) {
            console.error('Error loading cities:', err);
            
            // If we have cached data, use it as fallback
            if (cachedData && cachedData.length > 0) {
                setLocationData(prev => ({
                    ...prev,
                    cities: { ...prev.cities, [countryCode]: cachedData }
                }));
                setLocationError('Using cached city data for this country.');
            } else {
                // No cache available for this country
                setLocationData(prev => ({
                    ...prev,
                    cities: { ...prev.cities, [countryCode]: [] }
                }));
                setLocationError(`Unable to load cities for this country. Please try again later.`);
            }        } finally {
            setLoadingLocations(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationServiceStatus]); // locationData.cities intentionally omitted to prevent infinite loops

    const loadProfile = useCallback(async () => {
        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();
            
            if (!user?.id) {
                throw new Error('User ID is required');
            }

            const { data } = await client
                .from('musician_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                // Helper function to properly parse array fields
                const parseArrayField = (field: unknown): string[] => {
                    if (!field) return [''];
                    
                    // If it's already an array
                    if (Array.isArray(field)) {
                        // Check if first element is a stringified array
                        if (field.length === 1 && typeof field[0] === 'string') {
                            try {
                                const parsed = JSON.parse(field[0]);
                                if (Array.isArray(parsed)) {
                                    return parsed.length > 0 && parsed[0] !== '' ? parsed : [''];
                                }
                            } catch {
                                // If parsing fails, treat as regular string
                                return field[0] ? [field[0]] : [''];
                            }
                        }
                        return field.length > 0 && field[0] !== '' ? field : [''];
                    }
                    
                    // If it's a string, try to parse it
                    if (typeof field === 'string') {
                        try {
                            const parsed = JSON.parse(field);
                            if (Array.isArray(parsed)) {
                                return parsed.length > 0 && parsed[0] !== '' ? parsed : [''];
                            }
                            return field ? [field] : [''];
                        } catch {
                            return field ? [field] : [''];
                        }
                    }
                    
                    return [''];
                };                // Helper function to parse education field
                const parseEducationField = (field: unknown) => {
                    if (!field) return [{ type: '', school: '' }];
                    
                    if (Array.isArray(field)) {
                        // If it's an empty array, return default empty object
                        if (field.length === 0) return [{ type: '', school: '' }];
                        
                        // Check if it's array of objects (new format)
                        if (field.length > 0 && typeof field[0] === 'object' && field[0] !== null && 'type' in field[0]) {
                            return field;
                        }
                        // Handle array of strings (could be old format like "Bachelor's at University" or new simple strings)
                        return field.map(item => {
                            if (typeof item === 'string') {
                                // Check if it's in "type at school" format
                                const atIndex = item.lastIndexOf(' at ');
                                if (atIndex > 0) {
                                    return {
                                        type: item.substring(0, atIndex),
                                        school: item.substring(atIndex + 4)
                                    };
                                }
                                // Otherwise treat as just type
                                return { type: item, school: '' };
                            }
                            return { type: '', school: '' };
                        });
                    }
                    
                    if (typeof field === 'string') {
                        try {
                            const parsed = JSON.parse(field);
                            if (Array.isArray(parsed)) {
                                return parseEducationField(parsed); // Recursively parse the array
                            }
                            // If it's a single string, parse like above
                            const atIndex = parsed.lastIndexOf(' at ');
                            if (atIndex > 0) {
                                return [{
                                    type: parsed.substring(0, atIndex),
                                    school: parsed.substring(atIndex + 4)
                                }];
                            }
                            return [{ type: parsed, school: '' }];
                        } catch {
                            // If JSON parsing fails, treat as plain string
                            const atIndex = field.lastIndexOf(' at ');
                            if (atIndex > 0) {
                                return [{
                                    type: field.substring(0, atIndex),
                                    school: field.substring(atIndex + 4)
                                }];
                            }
                            return [{ type: field, school: '' }];
                        }
                    }
                    
                    return [{ type: '', school: '' }];
                };

                const locationData = typeof data.location === 'object' && data.location !== null && !Array.isArray(data.location)
                    ? data.location as { country?: string; countryCode?: string; city?: string }
                    : { country: '', countryCode: '', city: '' };
                
                const profileData = {
                    forename: data.forename || '',
                    surname: data.surname || '',
                    location: {
                        country: locationData.country || '',
                        countryCode: locationData.countryCode || '',
                        city: locationData.city || ''
                    },
                    phone: data.phone || '',
                    bio: data.bio || '',
                    occupation: parseArrayField(data.occupation),
                    education: parseEducationField(data.education),
                    certificates: Array.isArray(data.certificates) && data.certificates.length ? data.certificates : [''],
                    genre_instrument: Array.isArray(data.genre_instrument) && data.genre_instrument.length 
                        ? data.genre_instrument as Array<{ genre: string; instrument: string; category: string }>
                        : [{ genre: '', instrument: '', category: '' }],
                    video_links: Array.isArray(data.video_links) && data.video_links.length ? data.video_links : [''],
                    social: typeof data.social === 'object' && data.social !== null && !Array.isArray(data.social) 
                        ? data.social as Record<string, string>
                        : {}                };

                setProfile(profileData); // Set initial state for comparison

                // Load cities for the selected country if available
                if (profileData.location.countryCode) {
                    loadCitiesForCountry(profileData.location.countryCode);
                }
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        }    }, [user?.id, loadCitiesForCountry]); // Now safe to include loadCitiesForCountry since it has no dependencies

    // Section-specific save functions
    const savePersonalData = async () => {
        setProfileLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validate phone number if provided
            if (profile.phone.trim() && !profile.phone.trim().startsWith('+')) {
                setError('Phone number must start with + (include country code)');
                setProfileLoading(false);
                return;
            }

            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();

            if (!user?.id || !user?.email) {
                throw new Error('User ID and email are required');
            }

            const { error } = await client
                .from('musician_profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    forename: profile.forename,
                    surname: profile.surname,
                    location: profile.location,
                    phone: profile.phone
                });

            if (error) throw error;
            setPersonalDataSaved(true);
            
            // Reset the saved state after 2 seconds
            setTimeout(() => {
                setPersonalDataSaved(false);
            }, 2000);
        } catch (err: unknown) {
            console.error('Error saving personal data:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to save personal data';
            setError(errorMessage);
        } finally {
            setProfileLoading(false);
        }
    };

    const saveAboutSection = async () => {
        setProfileLoading(true);
        setError('');
        setSuccess('');

        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();

            if (!user?.id || !user?.email) {
                throw new Error('User ID and email are required');
            }

            // Clean up empty entries for about section
            const cleanedOccupation = profile.occupation.filter(item => item && item.trim() && item !== '[]');
            const cleanedEducation = profile.education.filter(item => 
                item.type && item.type.trim() || item.school && item.school.trim()
            );
            const cleanedCertificates = profile.certificates.filter(item => item && item.trim());

            const { error } = await client
                .from('musician_profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    bio: profile.bio,
                    occupation: cleanedOccupation.length === 0 ? [] : cleanedOccupation,
                    education: cleanedEducation.map(edu => {
                        if (edu.type && edu.school) {
                            return `${edu.type} at ${edu.school}`;
                        } else if (edu.type) {
                            return edu.type;
                        } else if (edu.school) {
                            return edu.school;
                        }
                        return '';
                    }).filter(Boolean),
                    certificates: cleanedCertificates.length === 0 ? [] : cleanedCertificates
                });

            if (error) throw error;
            setAboutSaved(true);
            
            // Reset the saved state after 2 seconds
            setTimeout(() => {
                setAboutSaved(false);
            }, 2000);
        } catch (err: unknown) {
            console.error('Error saving about section:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to save about section';
            setError(errorMessage);
        } finally {
            setProfileLoading(false);
        }
    };

    const saveArtisticProfile = async () => {
        setProfileLoading(true);
        setError('');
        setSuccess('');

        try {            // Validate social links before saving
            const invalidSocialLinks = [];
            for (const [platformName, url] of Object.entries(profile.social)) {
                if (url && !validateSocialUrl(platformName, url)) {
                    const platform = SOCIAL_PLATFORMS.find(
                        p => p.name.toLowerCase() === platformName.toLowerCase()
                    );
                    invalidSocialLinks.push(`${platform?.name || platformName}: must start with ${platform?.base_url}`);
                }
            }

            if (invalidSocialLinks.length > 0) {
                setError(`Invalid social links:\n${invalidSocialLinks.join('\n')}`);
                setProfileLoading(false);
                return;
            }

            // Validate video links before saving
            const invalidVideoLinks = [];
            for (const [index, videoUrl] of profile.video_links.entries()) {
                if (videoUrl && videoUrl.trim() && !videoUrl.trim().startsWith('https://')) {
                    invalidVideoLinks.push(`Video link ${index + 1}: must start with https://`);
                }
            }

            if (invalidVideoLinks.length > 0) {
                setError(`Invalid video links:\n${invalidVideoLinks.join('\n')}`);
                setProfileLoading(false);
                return;
            }

            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();

            if (!user?.id || !user?.email) {
                throw new Error('User ID and email are required');
            }

            // Clean up empty entries for artistic profile
            const cleanedGenreInstrument = profile.genre_instrument.filter(item => 
                item.genre || item.instrument || item.category
            );
            const cleanedVideoLinks = profile.video_links.filter(item => item && item.trim());
            const cleanedSocial = Object.fromEntries(
                Object.entries(profile.social).filter(([, value]) => value && value.trim())
            );

            const { error } = await client
                .from('musician_profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    genre_instrument: cleanedGenreInstrument.length === 0 ? [] : cleanedGenreInstrument,
                    video_links: cleanedVideoLinks.length === 0 ? [] : cleanedVideoLinks,
                    social: cleanedSocial
                });

            if (error) throw error;
            setArtisticProfileSaved(true);
            
            // Reset the saved state after 2 seconds
            setTimeout(() => {
                setArtisticProfileSaved(false);
            }, 2000);
        } catch (err: unknown) {
            console.error('Error saving artistic profile:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to save artistic profile';
            setError(errorMessage);
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords don't match");
            setError('');
            setSuccess('');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setPasswordError('');
        setPasswordSaved(false);

        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();

            const { error } = await client.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setPasswordSaved(true);
            setSuccess('Password updated successfully');
            setNewPassword('');
            setConfirmPassword('');
            
            // Reset the saved state after 2 seconds
            setTimeout(() => {
                setPasswordSaved(false);
            }, 2000);        } catch (err: Error | unknown) {
            if (err instanceof Error) {
                console.error('Error updating password:', err);
                  // Handle specific AuthApiError cases with button feedback
                const errorMessage = err.message.toLowerCase();
                if (errorMessage.includes('new password should be different') || 
                    errorMessage.includes('same_password') ||
                    errorMessage.includes('password must be different')) {
                    setPasswordError('Must be different');
                } else if (errorMessage.includes('password is too weak')) {
                    setPasswordError('Password too weak');
                } else if (errorMessage.includes('password too short')) {
                    setPasswordError('Password too short (min 6 characters)');                } else {
                    setPasswordError('Update failed');
                    setError(err.message);
                }
                
                // Clear password error after 2 seconds
                setTimeout(() => {
                    setPasswordError('');
                }, 2000);
            } else {
                console.error('Error updating password:', err);                setPasswordError('Update failed');
                setError('Failed to update password');
                
                // Clear password error after 2 seconds
                setTimeout(() => {
                    setPasswordError('');
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileDelete = async () => {
        if (!user?.email || deleteConfirmText !== user.email) {
            setError('Please type your email address to confirm deletion');
            return;
        }

        setDeleteLoading(true);
        setError('');
        setSuccess('');

        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();

            // Get the current session token
            const { data: { session } } = await client.auth.getSession();
            
            if (!session?.access_token) {
                throw new Error('No valid session found');
            }

            // Call the API endpoint to delete the account
            const response = await fetch('/api/profile/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    confirmEmail: user.email
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete account');
            }

            setSuccess('Account deleted successfully. Redirecting...');
            
            // Close dialog and redirect after a short delay
            setTimeout(() => {
                setShowDeleteDialog(false);
                router.push('/auth/login');
            }, 2000);

        } catch (err: Error | unknown) {
            if (err instanceof Error) {
                console.error('Error deleting account:', err);
                setError(err.message);
            } else {
                console.error('Error deleting account:', err);
                setError('Failed to delete account');
            }
        } finally {
            setDeleteLoading(false);
        }
    };

    // Helper functions for dynamic arrays
    const addArrayItem = (field: string) => {
        setProfile(prev => ({
            ...prev,
            [field]: [...(prev[field as keyof typeof prev] as string[]), '']
        }));
    };    const removeArrayItem = (field: string, index: number) => {
        setProfile(prev => {
            const newArray = (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index);
            // Ensure we always have at least one empty item for user input
            return {
                ...prev,
                [field]: newArray.length === 0 ? [''] : newArray
            };
        });
    };    const updateArrayItem = (field: string, index: number, value: string) => {
        setProfile(prev => ({
            ...prev,
            [field]: (prev[field as keyof typeof prev] as string[]).map((item, i) => 
                i === index ? value : item
            )
        }));
        
        // Set the appropriate save state based on the field
        if (field === 'occupation' || field === 'certificates') {
            setAboutSaved(false);
        } else if (field === 'video_links') {
            setArtisticProfileSaved(false);
        }
    };

    const addGenreInstrument = () => {
        setProfile(prev => ({
            ...prev,
            genre_instrument: [...prev.genre_instrument, { genre: '', instrument: '', category: '' }]
        }));
    };    const removeGenreInstrument = (index: number) => {
        setProfile(prev => {
            const newGenreInstrument = prev.genre_instrument.filter((_, i) => i !== index);
            // Ensure we always have at least one empty genre_instrument item
            return {
                ...prev,
                genre_instrument: newGenreInstrument.length === 0 ? [{ genre: '', instrument: '', category: '' }] : newGenreInstrument
            };
        });
    };    const updateGenreInstrument = (index: number, field: string, value: string) => {
        setProfile(prev => ({
            ...prev,
            genre_instrument: prev.genre_instrument.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
        setArtisticProfileSaved(false);
    };

    // Add these helper functions for education
    const addEducation = () => {
        setProfile(prev => ({
            ...prev,
            education: [...prev.education, { type: '', school: '' }]
        }));
    };    const removeEducation = (index: number) => {
        setProfile(prev => {
            const newEducation = prev.education.filter((_, i) => i !== index);
            // Ensure we always have at least one empty education item
            return {
                ...prev,
                education: newEducation.length === 0 ? [{ type: '', school: '' }] : newEducation
            };
        });
    };    const updateEducation = (index: number, field: 'type' | 'school', value: string) => {
        setProfile(prev => ({
            ...prev,
            education: prev.education.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
        setAboutSaved(false);
    };    const handleCountryChange = useCallback((countryName: string) => {
        const country = locationData.countries.find(c => c.countryName === countryName);
        if (country) {            // Use functional update to ensure we have the latest state
            setProfile(prev => {
                const newProfile = {
                    ...prev,
                    location: { 
                        country: countryName, 
                        countryCode: country.countryCode, 
                        city: '' // Clear city when country changes
                    }
                };
                return newProfile;
            });
            setPersonalDataSaved(false);
            
            // Load cities for the new country
            loadCitiesForCountry(country.countryCode);        }
    }, [locationData.countries, loadCitiesForCountry]);

    const handleCityChange = useCallback((value: string) => {
        setProfile(prev => {
            const newProfile = {
                ...prev,
                location: { ...prev.location, city: value }
            };
            return newProfile;
        });
        setPersonalDataSaved(false);
    }, []);

    // Helper function to get localized name for genres and instruments
    const getLocalizedName = (item: Genre | Instrument, field: 'name' | 'category') => {
        if (locale === 'hu') {
            if ('name_HUN' in item && item.name_HUN) return item.name_HUN;
            if (field === 'category' && 'category_hun' in item && item.category_hun) return item.category_hun;
            if ('name_hun' in item && item.name_hun) return item.name_hun;
        }
        return field === 'category' && 'category' in item ? item.category : item.name;
    };

    // Helper function to get localized category for instruments
    const getLocalizedCategory = (instrument: Instrument): string => {
        if (locale === 'hu' && instrument.category_hun) {
            return instrument.category_hun;
        }
        return instrument.category;
    };

    // Add validation function
    const validateSocialUrl = (platformName: string, url: string): boolean => {
        if (!url.trim()) return true; // Empty URLs are allowed
        
        // Use the imported validateSocialUrlHelper function
        return validateSocialUrlHelper(platformName, url);
    };

    // Add validation function for video links
    const validateVideoUrl = (url: string): boolean => {
        if (!url.trim()) return true; // Empty URLs are allowed
        return url.trim().startsWith('https://');
    };    // Add this helper function to sort social platforms
    const getSortedSocialPlatforms = () => {
        const desiredOrder = [
            'instagram',
            'facebook', 
            'youtube',
            'website',
            'spotify',
            'soundcloud',
            'tiktok',
            'x',
            'linkedin'
        ];
        
        // Use hard-coded SOCIAL_PLATFORMS instead of database
        return [...SOCIAL_PLATFORMS].sort((a, b) => {
            const aIndex = desiredOrder.indexOf(a.name.toLowerCase());
            const bIndex = desiredOrder.indexOf(b.name.toLowerCase());
            
            // If platform not in desired order, put it at the end
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            
            return aIndex - bIndex;
        });
    };

    // Add helper functions for cleaner placeholder text
    const getCountryPlaceholder = () => {
        if (locationServiceStatus === 'loading') return t('profile.loadingCountries');
        if (locationServiceStatus === 'unavailable') return t('profile.serviceUnavailable');
        return t('profile.selectCountry');
    };

    const getCityPlaceholder = () => {
        if (locationServiceStatus === 'unavailable') return t('profile.serviceUnavailable');
        if (!profile.location.countryCode) return t('profile.selectCountryFirst');
        if (loadingLocations) return t('profile.loadingCities');
        return t('profile.selectCity');
    };    // Load data when component mounts or user changes    
    useEffect(() => {
        loadReferenceData();
        loadLocationData();
        if (user?.id) {
            loadProfile();
        }
    }, [user?.id, loadReferenceData, loadLocationData, loadProfile]); // Include all dependencies

    // Show loading cards when user data is being fetched
    if (userLoading) {
        return (
            <div className="space-y-6 p-3 sm:p-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Profile Editor</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and musician profile
                    </p>
                </div>

                <div className="grid gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <LoadingCard 
                            icon={User}
                            title="Personal Data"
                            description="Your personal information"
                            rows={4}
                        />
                        <LoadingCard 
                            icon={Briefcase}
                            title="About"
                            description="Tell us about yourself"
                            rows={5}
                        />
                        <LoadingCard 
                            icon={Music}
                            title="Artistic Profile"
                            description="Your musical skills and presence"
                            rows={3}
                        />
                        <LoadingCard 
                            icon={Key}
                            title="Change Password"
                            description="Update your account password"
                            rows={2}
                        />
                        <LoadingCard 
                            icon={Key}
                            title="Two-Factor Authentication (2FA)"
                            description="Add an additional layer of security to your account"
                            rows={2}
                        />
                        <LoadingCard 
                            icon={AlertTriangle}
                            title="Danger Zone"
                            description="Permanently delete your account and all associated data"
                            rows={1}
                        />
                    </div>
                </div>
            </div>
        );
    }    return (
        <div className="space-y-6 p-3 sm:p-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('profile.title')}</h1>
                <p className="text-muted-foreground">
                    {t('profile.subtitle')}
                </p>
            </div>

            <div className="grid gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Data - keep existing */}
                    <Card>                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {t('profile.personalInfo')}
                            </CardTitle>
                            <CardDescription>{t('profile.personalInfo')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="forename">{t('profile.forename')}</Label>
                                    <Input
                                        id="forename"
                                        value={profile.forename}                                        onChange={(e) => {                            setProfile(prev => ({ 
                                ...prev, forename: e.target.value 
                            }));
                            setPersonalDataSaved(false);
                                        }}
                                        placeholder="Enter your first name"
                                        className={!profile.forename ? "text-muted-foreground placeholder:text-muted-foreground/60" : ""}
                                    />
                                </div>                                <div>
                                    <Label htmlFor="surname">{t('profile.surname')}</Label>
                                    <Input
                                        id="surname"
                                        value={profile.surname}                                        onChange={(e) => {                            setProfile(prev => ({ 
                                ...prev, surname: e.target.value 
                            }));
                            setPersonalDataSaved(false);
                                        }}
                                        placeholder="Enter your last name"
                                        className={!profile.surname ? "text-muted-foreground placeholder:text-muted-foreground/60" : ""}
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>{t('profile.country')}</Label>
                                    <Select
                                        value={profile.location.country}
                                        onValueChange={handleCountryChange}
                                        disabled={locationServiceStatus === 'unavailable'}
                                    >                                        <SelectTrigger className={!profile.location.country ? "text-muted-foreground" : (locationServiceStatus === 'unavailable' ? 'opacity-50' : '')}>
                                            <SelectValue placeholder={getCountryPlaceholder()} />
                                        </SelectTrigger>                                        <SelectContent>
                                            {locationData.countries
                                                .sort((a, b) => a.countryName.localeCompare(b.countryName))
                                                .map(country => (
                                                <SelectItem key={country.geonameId} value={country.countryName}>
                                                    {country.countryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>{t('profile.city')}</Label>
                                    <Select
                                        value={profile.location.city}
                                        onValueChange={handleCityChange}
                                        disabled={
                                            locationServiceStatus === 'unavailable' || 
                                            !profile.location.countryCode || 
                                            loadingLocations
                                        }
                                    >                                        <SelectTrigger className={
                                            !profile.location.city ? "text-muted-foreground" : (locationServiceStatus === 'unavailable' || !profile.location.countryCode 
                                                ? 'opacity-50' : '')
                                        }>
                                            <SelectValue placeholder={getCityPlaceholder()} />
                                        </SelectTrigger>                                        <SelectContent>
                                            {profile.location.countryCode && 
                                             locationData.cities[profile.location.countryCode]
                                                ?.sort((a, b) => a.name.localeCompare(b.name))
                                                .map(city => (
                                                <SelectItem key={city.geonameId} value={city.name}>
                                                    {city.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>                                    <Input
                                        id="phone"
                                        value={profile.phone}                                        onChange={(e) => {                            setProfile(prev => ({ 
                                ...prev, phone: e.target.value 
                            }));
                            setPersonalDataSaved(false);}}placeholder="e.g. +1234567890"
                                        className={!profile.phone ? "text-muted-foreground placeholder:text-muted-foreground/60" : ""}
                                    />
                                </div>                            </div>                            <Button
                                onClick={savePersonalData}
                                disabled={profileLoading}
                                variant={personalDataSaved ? "default" : "teal"}
                                className={`w-full text-white transition-all duration-200 ${
                                    personalDataSaved 
                                        ? "bg-green-400 hover:bg-green-500" 
                                        : ""
                                }`}>
                                {profileLoading ? t('profile.saving') : personalDataSaved ? t('profile.saved') : t('profile.saveProfile')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* About Section */}                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                {t('profile.professionalInfo')}
                            </CardTitle>
                            <CardDescription>{t('profile.musicalBackground')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="bio">{t('common.bio')}</Label><Textarea
                                    id="bio"
                                    rows={4}
                                    value={profile.bio}                                    onChange={(e) => {                        setProfile(prev => ({ 
                            ...prev, bio: e.target.value 
                        }));
                        setAboutSaved(false);
                                    }}
                                    placeholder="Tell us about your musical journey, style, and experience..."
                                    className={`mt-2 ${!profile.bio ? "text-muted-foreground placeholder:text-muted-foreground/60" : ""}`}
                                />
                            </div>                            <div>
                                <Label>{t('profile.occupation')}</Label>{profile.occupation.map((occupation, index) => {
                                    const hasData = occupation && occupation.trim();
                                      return (
                                        <div key={index} className="flex gap-2 mt-2">
                                            <div className="flex-1">                                                <Input
                                                    value={occupation}
                                                    onChange={(e) => updateArrayItem('occupation', index, e.target.value)}
                                                    placeholder="e.g., Music Teacher, Session Musician"
                                                    className={!occupation ? "text-muted-foreground placeholder:text-muted-foreground/60" : ""}
                                                />
                                            </div>
                                            {/* Trash button box */}
                                            {(hasData || profile.occupation.length > 1) && (
                                                <div className="flex items-stretch">
                                                    <Button
                                                        type="button"
                                                        variant="delete"
                                                        size="icon"
                                                        className="h-full"
                                                        onClick={() => {
                                                            if (hasData) {
                                                                // If there's data, clear it first
                                                                updateArrayItem('occupation', index, '');
                                                            } else if (profile.occupation.length > 1) {
                                                                // If no data and multiple rows, remove the row
                                                                removeArrayItem('occupation', index);
                                                            }
                                                        }}
                                                        title={hasData ? "Clear this field" : "Delete this row"}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addArrayItem('occupation')}
                                    className="mt-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('profile.addOccupation')}
                                </Button>
                            </div>                            <div>
                                <Label>{t('profile.education')}</Label>
                                {profile.education.map((education, index) => {
                                    const hasData = education.type || education.school;
                                    return (
                                        <div key={index} className="flex gap-2 mt-2">
                                            <div className="flex-1">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <div>
                                                        <Select
                                                            value={education.type}
                                                            onValueChange={(value) => updateEducation(index, 'type', value)}
                                                        >                                                        <SelectTrigger className={!education.type ? "text-muted-foreground" : ""}>
                                                            <SelectValue placeholder={t('profile.selectEducationLevel')} />
                                                        </SelectTrigger>
                                                            <SelectContent>
                                                                {(() => {
                                                                    // Safety check for education_types availability
                                                                    if (!referenceData.education_types || !Array.isArray(referenceData.education_types)) {
                                                                        return null;
                                                                    }
                                                                    const sortedEducation = referenceData.education_types
                                                                        .sort((a, b) => (a.rank || 999) - (b.rank || 999));
                                                                    return sortedEducation.map(edu => {
                                                                        // Debug logging
                                                                        console.log('🎓 Education Debug:', {
                                                                            locale,
                                                                            eduName: edu.name,
                                                                            eduNameHUN: edu.name_HUN,
                                                                            shouldShowHungarian: locale === 'hu' && edu.name_HUN,
                                                                            localizedName: getLocalizedName(edu, 'name')
                                                                        });
                                                                        
                                                                        return (
                                                                            <SelectItem key={edu.id} value={edu.name}>
                                                                                {getLocalizedName(edu, 'name')}
                                                                            </SelectItem>
                                                                        );
                                                                    });
                                                                })()}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>                                                    <Input
                                                        value={education.school}
                                                        onChange={(e) => updateEducation(index, 'school', e.target.value)}
                                                        placeholder="School/Institution name"
                                                        className={`flex-1 ${!education.school ? "text-muted-foreground placeholder:text-muted-foreground/60" : ""}`}
                                                    />
                                                </div>
                                            </div>
                                            {/* Trash button box */}
                                            {(hasData || profile.education.length > 1) && (
                                                <div className="flex items-stretch">
                                                    <Button
                                                        type="button"
                                                        variant="delete"
                                                        size="icon"
                                                        className="h-full"
                                                        onClick={() => {
                                                            if (hasData) {
                                                                // If there's data, clear it first
                                                                updateEducation(index, 'type', '');
                                                                updateEducation(index, 'school', '');
                                                            } else if (profile.education.length > 1) {
                                                                // If no data and multiple rows, remove the row
                                                                removeEducation(index);
                                                            }
                                                        }}
                                                        title={hasData ? "Clear this row" : "Delete this row"}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addEducation}
                                    className="mt-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('profile.addEducation')}
                                </Button>
                            </div>                            <div>
                                <Label>{t('profile.certificates')}</Label>{profile.certificates.map((certificate, index) => {
                                    const hasData = certificate && certificate.trim();
                                      return (
                                        <div key={index} className="flex gap-2 mt-2">
                                            <div className="flex-1">                                                <Input
                                                    value={certificate}
                                                    onChange={(e) => updateArrayItem('certificates', index, e.target.value)}
                                                    placeholder="e.g. Music Competition, Young Artist Award"
                                                    className={!certificate ? "text-muted-foreground placeholder:text-muted-foreground/60" : ""}
                                                />
                                            </div>
                                            {/* Trash button box */}
                                            {(hasData || profile.certificates.length > 1) && (
                                                <div className="flex items-stretch">
                                                    <Button
                                                        type="button"
                                                        variant="delete"
                                                        size="icon"
                                                        className="h-full"
                                                        onClick={() => {
                                                            if (hasData) {
                                                                // If there's data, clear it first
                                                                updateArrayItem('certificates', index, '');
                                                            } else if (profile.certificates.length > 1) {
                                                                // If no data and multiple rows, remove the row
                                                                removeArrayItem('certificates', index);
                                                            }
                                                        }}
                                                        title={hasData ? "Clear this field" : "Delete this row"}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addArrayItem('certificates')}
                                    className="mt-2"
                                >                                    <Plus className="h-4 w-4 mr-2" />                                    {t('profile.addCertificate')}                                </Button>
                            </div>                            <Button
                                onClick={saveAboutSection}
                                disabled={profileLoading}
                                variant={aboutSaved ? "default" : "teal"}
                                className={`w-full text-white transition-all duration-200 ${
                                    aboutSaved 
                                        ? "bg-green-400 hover:bg-green-500" 
                                        : ""
                                }`}>
                                {profileLoading ? t('profile.saving') : aboutSaved ? t('profile.saved') : t('profile.saveProfile')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Artistic Profile */}                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Music className="h-5 w-5" />
                                {t('profile.musicalBackground')}
                            </CardTitle>
                            <CardDescription>{t('profile.musicalBackground')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">                            <div>
                                <Label>{t('profile.genresInstruments')}</Label>{profile.genre_instrument.map((item, index) => {
                                    const hasData = item.genre || item.instrument || item.category;                                    return (
                                        <div key={index} className="flex gap-2 mt-2">
                                            <div className="flex-1">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">                                                    <Select
                                                        value={item.genre}
                                                        onValueChange={(value) => updateGenreInstrument(index, 'genre', value)}
                                                    >
                                                        <SelectTrigger className={!item.genre ? "text-muted-foreground" : ""}>
                                                            <SelectValue placeholder={t('profile.selectGenre')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {referenceData.genres && Array.isArray(referenceData.genres) 
                                                                ? referenceData.genres.map(genre => {
                                                                    // Debug logging
                                                                    console.log('🎵 Genre Debug:', {
                                                                        locale,
                                                                        genreName: genre.name,
                                                                        genreNameHUN: genre.name_HUN,
                                                                        shouldShowHungarian: locale === 'hu' && genre.name_HUN,
                                                                        localizedName: getLocalizedName(genre, 'name')
                                                                    });
                                                                    
                                                                    return (
                                                                        <SelectItem key={genre.id} value={genre.name}>
                                                                            {getLocalizedName(genre, 'name')}
                                                                        </SelectItem>
                                                                    );
                                                                })
                                                                : null
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                      <Select
                                                        value={item.instrument}
                                                        onValueChange={(value) => updateGenreInstrument(index, 'instrument', value)}
                                                    >
                                                        <SelectTrigger className={!item.instrument ? "text-muted-foreground" : ""}>
                                                            <SelectValue placeholder={t('profile.selectInstrument')} />
                                                        </SelectTrigger><SelectContent>
                                                            {sortedCategories.length > 0 ? (
                                                                sortedCategories.map(category => {
                                                                    // Find the first instrument in this category to get the translated category name
                                                                    const firstInstrument = sortedInstrumentsByCategory[category][0];
                                                                    const translatedCategory = getLocalizedCategory(firstInstrument);
                                                                    
                                                                    return (
                                                                        <SelectGroup key={category} label={translatedCategory}>
                                                                            {sortedInstrumentsByCategory[category].map(instrument => (
                                                                                <SelectItem key={instrument.id} value={instrument.name}>
                                                                                    {getLocalizedName(instrument, 'name')}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectGroup>
                                                                    );
                                                                })
                                                            ) : (
                                                                referenceData.instruments && Array.isArray(referenceData.instruments)
                                                                    ? referenceData.instruments.map(instrument => (
                                                                        <SelectItem key={instrument.id} value={instrument.name}>
                                                                            {getLocalizedName(instrument, 'name')}
                                                                        </SelectItem>
                                                                    ))
                                                                    : null
                                                            )}
                                                        </SelectContent>
                                                    </Select>                                                    <Select
                                                        value={item.category}
                                                        onValueChange={(value) => updateGenreInstrument(index, 'category', value)}
                                                    >
                                                        <SelectTrigger className={!item.category ? "text-muted-foreground" : ""}>
                                                            <SelectValue placeholder={t('profile.selectCategory')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="artist">
                                                                {t('profile.categories.artist')}
                                                            </SelectItem>
                                                            <SelectItem value="teacher">
                                                                {t('profile.categories.teacher')}
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            {/* Trash button box */}
                                            {(hasData || profile.genre_instrument.length > 1) && (
                                                <div className="flex items-stretch">
                                                    <Button
                                                        type="button"
                                                        variant="delete"
                                                        size="icon"
                                                        className="h-full"
                                                        onClick={() => {
                                                            if (hasData) {
                                                                // If there's data, clear it first
                                                                updateGenreInstrument(index, 'genre', '');
                                                                updateGenreInstrument(index, 'instrument', '');
                                                                updateGenreInstrument(index, 'category', '');
                                                            } else if (profile.genre_instrument.length > 1) {
                                                                // If no data and multiple rows, remove the row
                                                                removeGenreInstrument(index);
                                                            }
                                                        }}
                                                        title={hasData ? "Clear this row" : "Delete this row"}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addGenreInstrument}
                                    className="mt-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('profile.addGenreInstrument')}
                                </Button>
                            </div>                            <div>
                                <Label>{t('profile.videoLinks')}</Label>{profile.video_links.map((link, index) => {
                                    const hasData = link && link.trim();
                                    const isValid = validateVideoUrl(link);
                                      return (
                                        <div key={index} className="flex gap-2 mt-2">
                                            <div className="flex-1">                                                <Input
                                                    value={link}
                                                    onChange={(e) => updateArrayItem('video_links', index, e.target.value)}                                                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                                    className={!isValid ? 'border-[#083e4d] focus:border-[#083e4d]' : (!link ? "text-muted-foreground placeholder:text-muted-foreground/60" : "")}
                                                />
                                                {!isValid && link && (
                                                    <p className="text-xs text-[#083e4d] mt-1">
                                                        Video link must start with https://
                                                    </p>
                                                )}
                                            </div>
                                            {/* Trash button box */}
                                            {(hasData || profile.video_links.length > 1) && (
                                                <div className="flex items-stretch">
                                                    <Button
                                                        type="button"
                                                        variant="delete"
                                                        size="icon"
                                                        className="h-full"
                                                        onClick={() => {
                                                            if (hasData) {
                                                                // If there's data, clear it first
                                                                updateArrayItem('video_links', index, '');
                                                            } else if (profile.video_links.length > 1) {
                                                                // If no data and multiple rows, remove the row
                                                                removeArrayItem('video_links', index);
                                                            }
                                                        }}
                                                        title={hasData ? "Clear this field" : "Delete this row"}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addArrayItem('video_links')}
                                    className="mt-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('profile.addVideoLink')}
                                </Button>
                            </div>                            <div>
                                <Label>{t('profile.socialMedia')}</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    {getSortedSocialPlatforms().map(platform => {
                                        const currentValue = profile.social[platform.name.toLowerCase()] || '';
                                        const isValid = validateSocialUrl(platform.name, currentValue);
                                        
                                        return (
                                            <div key={platform.id}>
                                                <Label htmlFor={platform.name.toLowerCase()}>
                                                    {platform.name}
                                                </Label>                                                <Input
                                                    id={platform.name.toLowerCase()}
                                                    value={currentValue}                                                    onChange={(e) => {
                                                        const newValue = e.target.value;                                        setProfile(prev => ({
                                            ...prev,
                                            social: { 
                                                ...prev.social, 
                                                [platform.name.toLowerCase()]: newValue 
                                            }
                                        }));
                                        setArtisticProfileSaved(false);
                                                    }}                                                    placeholder={platform.base_url || `${platform.name} URL`}
                                                    className={!isValid ? 'border-[#083e4d] focus:border-[#083e4d]' : (!currentValue ? "text-muted-foreground placeholder:text-muted-foreground/60" : "")}
                                                />
                                                {!isValid && currentValue && (
                                                    <p className="text-xs text-[#083e4d] mt-1">
                                                        URL must start with {platform.base_url}
                                                    </p>
                                                )}
                                            </div>
                                        );                                })}                                </div>                            </div>                            <Button
                                onClick={saveArtisticProfile}
                                disabled={profileLoading}
                                variant={artisticProfileSaved ? "default" : "teal"}
                                className={`w-full text-white transition-all duration-200 ${
                                    artisticProfileSaved 
                                        ? "bg-green-400 hover:bg-green-500" 
                                        : ""
                                }`}>
                                {profileLoading ? t('profile.saving') : artisticProfileSaved ? t('profile.saved') : t('profile.saveProfile')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Change Password */}                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                {t('profile.changePassword')}
                            </CardTitle>
                            <CardDescription>{t('profile.changePasswordDescription')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">                                <div>
                                    <Label htmlFor="new-password">{t('profile.newPassword')}</Label>
                                    <Input
                                        type="password"
                                        id="new-password"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            if (passwordError) setPasswordError('');
                                        }}
                                        required
                                    />
                                </div>                                <div>
                                    <Label htmlFor="confirm-password">{t('profile.confirmPassword')}</Label>
                                    <Input
                                        type="password"
                                        id="confirm-password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (passwordError) setPasswordError('');
                                        }}
                                        required
                                    />                                </div>                                <Button
                                    type="submit"
                                    disabled={loading}
                                    variant={passwordSaved ? "default" : passwordError ? "destructive" : "delete"}
                                    className={`w-full text-white transition-all duration-200 ${
                                        passwordSaved 
                                            ? "bg-green-400 hover:bg-green-500" 
                                            : passwordError 
                                                ? "bg-[#083e4d] hover:bg-[#062f3b]"
                                                : ""
                                    }`}
                                >                                    {loading 
                                        ? t('profile.updating') 
                                        : passwordSaved 
                                            ? t('profile.updated') 
                                            : passwordError 
                                                ? passwordError
                                                : t('profile.updatePassword')
                                    }
                                </Button>
                            </form>
                        </CardContent>
                    </Card><MFASetup
                        onStatusChange={() => {
                            setSuccess('Two-factor authentication settings updated successfully');
                        }}
                    />

                    {/* Danger Zone */}
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                {t('profile.dangerZone')}
                            </CardTitle>
                            <CardDescription className="text-red-700">
                                {t('profile.dangerZoneDescription')}
                            </CardDescription>
                        </CardHeader>                        <CardContent>                            <Button
                                onClick={() => setShowDeleteDialog(true)}
                                variant="delete"
                                className="w-full"
                            >
                                {t('profile.deleteAccount')}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Account Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            {t('profile.deleteAccount')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('profile.deleteAccountDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>                    <div className="my-4">                        <Label htmlFor="delete-confirm">
                            {t('profile.confirmEmailPrompt', { email: user?.email || '' })}
                        </Label>
                        <Input
                            id="delete-confirm"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder={t('profile.enterEmailPlaceholder')}
                            className="mt-2"
                        />
                    </div>
                    <AlertDialogFooter>                        <AlertDialogCancel 
                            onClick={() => {
                                setDeleteConfirmText('');
                                setError('');
                            }}
                            className="bg-[#083e4d] text-white hover:bg-[#062f3b] border-[#083e4d] transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </AlertDialogCancel>                        <AlertDialogAction
                            onClick={handleProfileDelete}
                            disabled={deleteLoading || deleteConfirmText !== user?.email}
                            className="bg-[#e62745] text-white hover:bg-[#cc2340] transition-colors duration-200"
                        >
                            {deleteLoading ? t('profile.deleting') : t('profile.deleteAccount')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}