"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASassClient } from '@/lib/supabase/client';
import { Key, User, CheckCircle, Briefcase, Music, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { MFASetup } from '@/components/MFASetup';
import { Database } from '@/lib/types';

// Use the generated types directly
type Instrument = Database['public']['Tables']['instruments']['Row'];
type Genre = Database['public']['Tables']['genres']['Row'];
type SocialPlatform = Database['public']['Tables']['social']['Row'];
type EducationType = Database['public']['Tables']['education']['Row'];

interface ReferenceData {
    instruments: Instrument[];
    genres: Genre[];
    social_platforms: SocialPlatform[];
    education_types: EducationType[];
}

interface LocationData {
  countries: Array<{ geonameId: number; countryName: string; countryCode: string }>;
  cities: Record<string, Array<{ geonameId: number; name: string; countryCode: string }>>;
}

export default function UserSettingsPage() {
    const { user } = useGlobal();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Location service state
    const [locationServiceStatus, setLocationServiceStatus] = useState<'loading' | 'available' | 'unavailable'>('loading');
    const [locationError, setLocationError] = useState('');

    // Reference data state
    const [referenceData, setReferenceData] = useState<ReferenceData>({
        instruments: [],
        genres: [],
        social_platforms: [],
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
    });

    // Memoize instrumentsByCategory for the categorized dropdown
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
            const client = supabase.getSupabaseClient();

            const [instrumentsRes, genresRes, socialRes, educationRes] = await Promise.all([
                client.from('instruments').select('*').order('name'),
                client.from('genres').select('*').order('name'),
                client.from('social').select('*').order('name'),
                client.from('education').select('*').order('rank', { nullsFirst: false }) // Order by rank, nulls last
            ]);

            const newReferenceData = {
                instruments: instrumentsRes.data || [],
                genres: genresRes.data || [],
                social_platforms: socialRes.data || [],
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
    }, []);

    // Load cities for a specific country with enhanced error handling
    const loadCitiesForCountry = useCallback(async (countryCode: string) => {
        // Check if service is available first
        if (locationServiceStatus === 'unavailable') {
            return; // Don't proceed if service is unavailable
        }
        
        // If cities already loaded, don't load again
        if (locationData.cities[countryCode]) {
            return;
        }
    
        setLoadingLocations(true);
        
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
            }
        } finally {
            setLoadingLocations(false);
        }
    }, [locationData.cities, locationServiceStatus]);

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
                };

                // Helper function to parse education field
                const parseEducationField = (field: unknown) => {
                    if (!field) return [{ type: '', school: '' }];
                    
                    if (Array.isArray(field)) {
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
                        : {}
                };

                setProfile(profileData); // Set initial state for comparison

                // Load cities for the selected country if available
                if (profileData.location.countryCode) {
                    loadCitiesForCountry(profileData.location.countryCode);
                }
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        }
    }, [user?.id, loadCitiesForCountry]); // Now safe to include loadCitiesForCountry since it has no dependencies

    const saveProfile = async () => {
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

            // Validate social links before saving
            const invalidSocialLinks = [];
            for (const [platformName, url] of Object.entries(profile.social)) {
                if (url && !validateSocialUrl(platformName, url)) {
                    const platform = referenceData.social_platforms?.find(
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

            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();

            // Clean up empty entries and ensure proper array format
            const cleanedProfile = {
                ...profile,
                // Filter out empty strings and ensure it's a proper array
                occupation: profile.occupation.filter(item => item && item.trim() && item !== '[]'),
                // Filter education entries where both type and school are empty
                education: profile.education.filter(item => 
                    item.type && item.type.trim() || item.school && item.school.trim()
                ),
                certificates: profile.certificates.filter(item => item && item.trim()),
                genre_instrument: profile.genre_instrument.filter(item => 
                    item.genre || item.instrument || item.category // Keep if any field has value
                ),
                video_links: profile.video_links.filter(item => item && item.trim()),
                social: Object.fromEntries(
                    Object.entries(profile.social).filter(([, value]) => value && value.trim())
                )
            };

            // Ensure arrays have at least empty array instead of null
            if (cleanedProfile.occupation.length === 0) {
                cleanedProfile.occupation = [];
            }
            if (cleanedProfile.education.length === 0) {
                cleanedProfile.education = [];
            }

            if (!user?.id || !user?.email) {
                throw new Error('User ID and email are required');
            }

            const { error } = await client
                .from('musician_profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    forename: cleanedProfile.forename,
                    surname: cleanedProfile.surname,
                    location: cleanedProfile.location,
                    phone: cleanedProfile.phone,
                    bio: cleanedProfile.bio,
                    occupation: cleanedProfile.occupation,
                    // Convert education objects to strings for database storage
                    education: cleanedProfile.education.map(edu => {
                        if (edu.type && edu.school) {
                            return `${edu.type} at ${edu.school}`;
                        } else if (edu.type) {
                            return edu.type;
                        } else if (edu.school) {
                            return edu.school;
                        }
                        return '';
                    }).filter(Boolean),
                    certificates: cleanedProfile.certificates,
                    genre_instrument: cleanedProfile.genre_instrument,
                    video_links: cleanedProfile.video_links,
                    social: cleanedProfile.social
                });

            if (error) throw error;
            
            setSuccess('Profile updated successfully');
        } catch (err: unknown) {
            console.error('Error saving profile:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
            setError(errorMessage);
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("New passwords don't match");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();

            const { error } = await client.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setSuccess('Password updated successfully');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: Error | unknown) {
            if (err instanceof Error) {
                console.error('Error updating password:', err);
                setError(err.message);
            } else {
                console.error('Error updating password:', err);
                setError('Failed to update password');
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper functions for dynamic arrays
    const addArrayItem = (field: string) => {
        setProfile(prev => ({
            ...prev,
            [field]: [...(prev[field as keyof typeof prev] as string[]), '']
        }));
    };

    const removeArrayItem = (field: string, index: number) => {
        setProfile(prev => ({
            ...prev,
            [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
        }));
    };

    const updateArrayItem = (field: string, index: number, value: string) => {
        setProfile(prev => ({
            ...prev,
            [field]: (prev[field as keyof typeof prev] as string[]).map((item, i) => 
                i === index ? value : item
            )
        }));
    };

    const addGenreInstrument = () => {
        setProfile(prev => ({
            ...prev,
            genre_instrument: [...prev.genre_instrument, { genre: '', instrument: '', category: '' }]
        }));
    };

    const removeGenreInstrument = (index: number) => {
        setProfile(prev => ({
            ...prev,
            genre_instrument: prev.genre_instrument.filter((_, i) => i !== index)
        }));
    };

    const updateGenreInstrument = (index: number, field: string, value: string) => {
        setProfile(prev => ({
            ...prev,
            genre_instrument: prev.genre_instrument.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    // Add these helper functions for education
    const addEducation = () => {
        setProfile(prev => ({
            ...prev,
            education: [...prev.education, { type: '', school: '' }]
        }));
    };

    const removeEducation = (index: number) => {
        setProfile(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
        }));
    };

    const updateEducation = (index: number, field: 'type' | 'school', value: string) => {
        setProfile(prev => ({
            ...prev,
            education: prev.education.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleCountryChange = (countryName: string) => {
        const country = locationData.countries.find(c => c.countryName === countryName);
        if (country) {
            setProfile(prev => ({
                ...prev,
                location: { 
                    country: countryName, 
                    countryCode: country.countryCode, 
                    city: '' 
                }
            }));
            loadCitiesForCountry(country.countryCode);
        }
    };

    // Add validation function
    const validateSocialUrl = (platformName: string, url: string): boolean => {
        if (!url.trim()) return true; // Empty URLs are allowed
        
        // Safety check for social_platforms availability
        if (!referenceData.social_platforms || !Array.isArray(referenceData.social_platforms)) {
            return true; // Allow any URL if reference data is not loaded
        }
        
        const platform = referenceData.social_platforms.find(
            p => p.name.toLowerCase() === platformName.toLowerCase()
        );
        
        if (!platform?.base_url) return true; // No base URL restriction
        
        return url.toLowerCase().startsWith(platform.base_url.toLowerCase());
    };

    // Add this helper function to sort social platforms
    const getSortedSocialPlatforms = () => {
        const desiredOrder = [
            'instagram',
            'facebook', 
            'youtube',
            'website',
            'spotify',
            'soundcloud',
            'tiktok',
            'x'
        ];
        
        // Safety check to ensure social_platforms is available and is an array
        if (!referenceData.social_platforms || !Array.isArray(referenceData.social_platforms)) {
            return [];
        }
        
        return [...referenceData.social_platforms].sort((a, b) => {
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
        if (locationServiceStatus === 'loading') return "Loading countries...";
        if (locationServiceStatus === 'unavailable') return "Service unavailable";
        return "Select country";
    };

    const getCityPlaceholder = () => {
        if (locationServiceStatus === 'unavailable') return "Service unavailable";
        if (!profile.location.countryCode) return "Select country first";
        if (loadingLocations) return "Loading cities...";
        return "Select city";
    };

    // Load data when component mounts or user changes
    useEffect(() => {
        loadReferenceData();
        loadLocationData();
        if (user?.id) {
            loadProfile();
        }
    }, [user?.id, loadLocationData, loadProfile, loadReferenceData]); // Add function dependencies

    return (
        <div className="space-y-6 p-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Profile Editor</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and musician profile
                </p>
            </div>

            {/* Rest of your existing alerts */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            {/* Location Service Status Alert */}
            {locationError && (
                <Alert variant={locationServiceStatus === 'unavailable' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{locationError}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Data - keep existing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Data
                            </CardTitle>
                            <CardDescription>Your personal information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="forename">First Name</Label>
                                    <Input
                                        id="forename"
                                        value={profile.forename}
                                        onChange={(e) => setProfile(prev => ({ 
                                            ...prev, forename: e.target.value 
                                        }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="surname">Last Name</Label>
                                    <Input
                                        id="surname"
                                        value={profile.surname}
                                        onChange={(e) => setProfile(prev => ({ 
                                            ...prev, surname: e.target.value 
                                        }))}
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Country</Label>
                                    <Select
                                        value={profile.location.country}
                                        onValueChange={handleCountryChange}
                                        disabled={locationServiceStatus === 'unavailable'}
                                    >
                                        <SelectTrigger className={locationServiceStatus === 'unavailable' ? 'opacity-50' : ''}>
                                            <SelectValue placeholder={getCountryPlaceholder()} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locationData.countries.map(country => (
                                                <SelectItem key={country.geonameId} value={country.countryName}>
                                                    {country.countryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>City</Label>
                                    <Select
                                        value={profile.location.city}
                                        onValueChange={(value) => setProfile(prev => ({
                                            ...prev,
                                            location: { ...prev.location, city: value }
                                        }))}
                                        disabled={
                                            locationServiceStatus === 'unavailable' || 
                                            !profile.location.countryCode || 
                                            loadingLocations
                                        }
                                    >
                                        <SelectTrigger className={
                                            locationServiceStatus === 'unavailable' || !profile.location.countryCode 
                                                ? 'opacity-50' : ''
                                        }>
                                            <SelectValue placeholder={getCityPlaceholder()} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {profile.location.countryCode && 
                                             locationData.cities[profile.location.countryCode]?.map(city => (
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
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={profile.phone}
                                        onChange={(e) => setProfile(prev => ({ 
                                            ...prev, phone: e.target.value 
                                        }))}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={saveProfile}
                                disabled={profileLoading}
                                variant="teal"
                                className="w-full text-white"
                            >
                                {profileLoading ? 'Saving...' : 'Save'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* About Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                About
                            </CardTitle>
                            <CardDescription>Tell us about yourself</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    rows={4}
                                    value={profile.bio}
                                    onChange={(e) => setProfile(prev => ({ 
                                        ...prev, bio: e.target.value 
                                    }))}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label>Occupation</Label>
                                {profile.occupation.map((occupation, index) => {
                                    const hasData = occupation && occupation.trim();
                                    
                                    return (
                                        <div key={index} className="flex gap-2 mt-2">
                                            <Input
                                                value={occupation}
                                                onChange={(e) => updateArrayItem('occupation', index, e.target.value)}
                                                placeholder="e.g., Music Teacher, Session Musician"
                                            />
                                            {/* Single trash can that clears data or removes row */}
                                            {(hasData || profile.occupation.length > 1) && (
                                                <Button
                                                    type="button"
                                                    variant="delete"
                                                    size="icon"
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
                                            )}
                                        </div>
                                    );
                                })}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addArrayItem('occupation')}
                                    className="mt-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Occupation
                                </Button>
                            </div>

                            <div>
                                <Label>Education</Label>
                                {profile.education.map((education, index) => {
                                    const hasData = education.type || education.school;
                                    
                                    return (
                                        <div key={index} className="grid grid-cols-2 gap-2 mt-2">
                                            <div>
                                                <Select
                                                    value={education.type}
                                                    onValueChange={(value) => updateEducation(index, 'type', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select education level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(() => {
                                                            // Safety check for education_types availability
                                                            if (!referenceData.education_types || !Array.isArray(referenceData.education_types)) {
                                                                return null;
                                                            }
                                                            const sortedEducation = referenceData.education_types
                                                                .sort((a, b) => (a.rank || 999) - (b.rank || 999));
                                                            return sortedEducation.map(edu => (
                                                                <SelectItem key={edu.id} value={edu.name}>
                                                                    {edu.name}
                                                                </SelectItem>
                                                            ));
                                                        })()}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={education.school}
                                                    onChange={(e) => updateEducation(index, 'school', e.target.value)}
                                                    placeholder="School/Institution name"
                                                    className="flex-1"
                                                />
                                                {/* Single trash can that clears data or removes row */}
                                                {(hasData || profile.education.length > 1) && (
                                                    <Button
                                                        type="button"
                                                        variant="delete"
                                                        size="icon"
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
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addEducation}
                                    className="mt-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Education
                                </Button>
                            </div>

                            <div>
                                <Label>Certificates</Label>
                                {profile.certificates.map((certificate, index) => {
                                    const hasData = certificate && certificate.trim();
                                    
                                    return (
                                        <div key={index} className="flex gap-2 mt-2">
                                            <Input
                                                value={certificate}
                                                onChange={(e) => updateArrayItem('certificates', index, e.target.value)}
                                                placeholder="e.g. Music Competition, Young Artist Award"
                                            />
                                            {/* Single trash can that clears data or removes row */}
                                            {(hasData || profile.certificates.length > 1) && (
                                                <Button
                                                    type="button"
                                                    variant="delete"
                                                    size="icon"
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
                                            )}
                                        </div>
                                    );
                                })}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addArrayItem('certificates')}
                                    className="mt-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Certificate
                                </Button>
                            </div>

                            <Button
                                onClick={saveProfile}
                                disabled={profileLoading}
                                variant="teal"
                                className="w-full text-white"
                            >
                                {profileLoading ? 'Saving...' : 'Save'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Artistic Profile */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Music className="h-5 w-5" />
                                Artistic Profile
                            </CardTitle>
                            <CardDescription>Your musical skills and presence</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Genres & Instruments</Label>
                                {profile.genre_instrument.map((item, index) => {
                                    const hasData = item.genre || item.instrument || item.category;
                                    
                                    return (
                                        <div key={index} className="mt-2">
                                            <div className="flex gap-2 items-center">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                                                    <Select
                                                        value={item.genre}
                                                        onValueChange={(value) => updateGenreInstrument(index, 'genre', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Genre" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {referenceData.genres && Array.isArray(referenceData.genres) 
                                                                ? referenceData.genres.map(genre => (
                                                                    <SelectItem key={genre.id} value={genre.name}>
                                                                        {genre.name}
                                                                    </SelectItem>
                                                                ))
                                                                : null
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                    
                                                    <Select
                                                        value={item.instrument}
                                                        onValueChange={(value) => updateGenreInstrument(index, 'instrument', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Instrument" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.keys(instrumentsByCategory).length > 0 ? (
                                                                Object.keys(instrumentsByCategory).sort().flatMap(category => [
                                                                    <SelectItem key={category + '-label'} value={category + '-label'} disabled className="font-semibold text-muted-foreground cursor-default opacity-100 select-none pointer-events-none" style={{ pointerEvents: 'none' }}>
                                                                        ---[{category}]---
                                                                    </SelectItem>,
                                                                    ...instrumentsByCategory[category]
                                                                        .sort((a, b) => a.name.localeCompare(b.name))
                                                                        .map(instrument => (
                                                                            <SelectItem key={instrument.id} value={instrument.name}>
                                                                                {instrument.name}
                                                                            </SelectItem>
                                                                        ))
                                                                ])
                                                            ) : (
                                                                referenceData.instruments && Array.isArray(referenceData.instruments)
                                                                    ? referenceData.instruments.map(instrument => (
                                                                        <SelectItem key={instrument.id} value={instrument.name}>
                                                                            {instrument.name}
                                                                        </SelectItem>
                                                                    ))
                                                                    : null
                                                            )}
                                                        </SelectContent>
                                                    </Select>

                                                    <Select
                                                        value={item.category}
                                                        onValueChange={(value) => updateGenreInstrument(index, 'category', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="artist">artist</SelectItem>
                                                            <SelectItem value="teacher">teacher</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                {/* Delete button positioned next to the selects */}
                                                {(hasData || profile.genre_instrument.length > 1) && (
                                                    <Button
                                                        type="button"
                                                        variant="delete"
                                                        size="icon"
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
                                                        className="shrink-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addGenreInstrument}
                                    className="mt-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Genre & Instrument
                                </Button>
                            </div>

                            <div>
                                <Label>Video Links</Label>
                                {profile.video_links.map((link, index) => {
                                    const hasData = link && link.trim();
                                    
                                    return (
                                        <div key={index} className="flex gap-2 mt-2">
                                            <Input
                                                value={link}
                                                onChange={(e) => updateArrayItem('video_links', index, e.target.value)}
                                                placeholder="https://youtube.com/watch?v=..."
                                            />
                                            {/* Single trash can that clears data or removes row */}
                                            {(hasData || profile.video_links.length > 1) && (
                                                <Button
                                                    type="button"
                                                    variant="delete"
                                                    size="icon"
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
                                            )}
                                        </div>
                                    );
                                })}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addArrayItem('video_links')}
                                    className="mt-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Video Link
                                </Button>
                            </div>

                            <div>
                                <Label>Social Links</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    {getSortedSocialPlatforms().map(platform => {
                                        const currentValue = profile.social[platform.name.toLowerCase()] || '';
                                        const isValid = validateSocialUrl(platform.name, currentValue);
                                        
                                        return (
                                            <div key={platform.id}>
                                                <Label htmlFor={platform.name.toLowerCase()}>
                                                    {platform.name}
                                                </Label>
                                                <Input
                                                    id={platform.name.toLowerCase()}
                                                    value={currentValue}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        setProfile(prev => ({
                                                            ...prev,
                                                            social: { 
                                                                ...prev.social, 
                                                                [platform.name.toLowerCase()]: newValue 
                                                            }
                                                        }));
                                                    }}
                                                    placeholder={platform.base_url || `${platform.name} URL`}
                                                    className={!isValid ? 'border-red-500 focus:border-red-500' : ''}
                                                />
                                                {!isValid && currentValue && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        URL must start with {platform.base_url}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <Button
                                onClick={saveProfile}
                                disabled={profileLoading}
                                variant="teal"
                                className="w-full text-white"
                            >
                                {profileLoading ? 'Saving...' : 'Save'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Change Password */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                Change Password
                            </CardTitle>
                            <CardDescription>Update your account password</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        type="password"
                                        id="new-password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input
                                        type="password"
                                        id="confirm-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    variant="delete"
                                    className="w-full text-white"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <MFASetup
                        onStatusChange={() => {
                            setSuccess('Two-factor authentication settings updated successfully');
                        }}
                    />
                </div>
            </div>
        </div>
    );
}