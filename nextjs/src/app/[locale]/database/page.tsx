// src/app/[locale]/database/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search, UserCheck, MapPin, X, Music, Mail, Phone, Video, ExternalLink, Youtube, Instagram, Facebook, Twitter, Linkedin, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select-new";
import { ProfileQueryModal } from '@/components/ProfileQueryModal';
import { Avatar } from '@/components/ui/avatar';
import { createSPASassClient } from '@/lib/supabase/client';
import { Database } from '@/lib/types';
import DynamicHeader from '@/components/DynamicHeader';
import { SOCIAL_PLATFORMS } from '@/lib/socialPlatforms';

// Local Badge component to avoid import issues
const Badge = ({ children, variant = "default", className = "", onClick }: { 
  children: React.ReactNode; 
  variant?: "default" | "secondary" | "destructive" | "outline"; 
  className?: string;
  onClick?: () => void;
}) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variantClasses = {
    default: "border-transparent bg-red-600 text-white hover:bg-red-700",
    secondary: "border-transparent bg-gray-200 text-gray-800 hover:bg-gray-300",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50"
  };
  const clickableClasses = onClick ? "cursor-pointer hover:bg-accent" : "";
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${clickableClasses} ${className}`.trim();
  return <div className={combinedClasses} onClick={onClick}>{children}</div>;
};

// Use the generated types directly
type Instrument = Database['public']['Tables']['instruments']['Row'];
type Genre = Database['public']['Tables']['genres']['Row'];

interface SearchFilters {
    genre: string;
    instrument: string;
    category: string;
    nameSearch: string;
    sortBy: string;
    country: string;
    city: string;
}

interface MusicianProfile {
    id: string;
    email: string | null;
    forename: string | null;
    surname: string | null;
    location?: unknown;
    phone: string | null;
    bio: string | null;
    occupation: string[] | null;
    education: string[] | null;
    certificates: string[] | null;
    genre_instrument: any[] | null;
    video_links: string[] | null;
    social: any;
    created_at: string;
    updated_at: string;
}

// Location data interface
interface LocationData {
    countries: Array<{
        geonameId: number;
        countryName: string;
        countryCode: string;
    }>;
    cities: Record<string, Array<{
        geonameId: number;
        name: string;
        countryCode: string;
    }>>
}

// Location helper
const formatLocation = (location: unknown): string => {
    if (!location) return '';
    
    if (typeof location === 'object' && location !== null) {
        const loc = location as { city?: string; country?: string };
        const parts = [loc.city, loc.country].filter(Boolean);
        return parts.join(', ');
    }
    
    return '';
};

// Name helper
const formatName = (forename: string | null, surname: string | null, email?: string | null): string => {
    const nameString = [forename, surname].filter(Boolean).join(' ');
    if (nameString) {
        return nameString;
    }
    // If no name is provided, show email address or fallback to 'Anonymous'
    return email || 'Anonymous';
};

export default function DatabasePage() {
    const t = useTranslations();
    const locale = useLocale();
    
    // Navigation state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    // Handle click outside menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                const target = event.target as Element;
                if (!target.closest('[data-menu-trigger]')) {
                    setIsMenuOpen(false);
                }
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);
    
    // State for musicians and search
    const [musicians, setMusicians] = useState<MusicianProfile[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    
    // Location data state
    const [locationData, setLocationData] = useState<LocationData>({
        countries: [],
        cities: {}
    });
    const [locationServiceStatus, setLocationServiceStatus] = useState<'loading' | 'available' | 'unavailable'>('loading');
    const [loadingLocations, setLoadingLocations] = useState(false);

    // State for filters
    const [filters, setFilters] = useState<SearchFilters>({
        genre: 'any',
        instrument: 'any',
        category: 'any',
        nameSearch: '',
        sortBy: 'name_asc',
        country: 'any',
        city: 'any'
    });

    // State for UI
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // State for profile modal
    const [selectedMusician, setSelectedMusician] = useState<MusicianProfile | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    // Ref for scrolling to results
    const resultsRef = useRef<HTMLDivElement>(null);

    // Helper function to scroll to results
    const scrollToResults = () => {
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    };

    // Load reference data
    useEffect(() => {
        const loadReferenceData = async () => {
            try {
                const supabase = await createSPASassClient();
                const client = supabase.getSupabaseClient();
                
                const [genresRes, instrumentsRes] = await Promise.all([
                    client.from('genres').select('*').order('name'),
                    client.from('instruments').select('*').order('name')
                ]);
                
                setGenres(genresRes.data || []);
                setInstruments(instrumentsRes.data || []);
            } catch (error) {
                console.error('Error loading reference data:', error);
            }
        };
        
        loadReferenceData();
    }, []);

    // Load location data
    useEffect(() => {
        const loadLocationData = async () => {
            setLocationServiceStatus('loading');
            const cacheKey = 'geonames_countries';
            const cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days
            
            // Check localStorage first
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
                } else {
                    // No cache available, service is unavailable
                    setLocationServiceStatus('unavailable');
                    setLocationData({ countries: [], cities: {} });
                }
            }
        };
        
        loadLocationData();
    }, []);

    // Auto-select Hungary when locale is Hungarian and location data is available
    useEffect(() => {
        if (locale === 'hu' && locationServiceStatus === 'available' && locationData.countries.length > 0) {
            // Find Hungary in the countries list
            const hungary = locationData.countries.find(
                country => country.countryName === 'Hungary' || country.countryCode === 'HU'
            );
            
            if (hungary && filters.country === 'any') {
                setFilters(prev => ({
                    ...prev,
                    country: hungary.countryName
                }));
            }
        }
    }, [locale, locationServiceStatus, locationData.countries, filters.country]);

    // Load cities for a specific country
    const loadCitiesForCountry = async (countryCode: string) => {
        if (locationServiceStatus === 'unavailable') {
            return;
        }
        
        // Check if cities already loaded
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
            } else {
                // No cache available for this country
                setLocationData(prev => ({
                    ...prev,
                    cities: { ...prev.cities, [countryCode]: [] }
                }));
            }
        } finally {
            setLoadingLocations(false);
        }
    };

    // Helper function to get localized name
    const getLocalizedName = (item: Genre | Instrument): string => {
        if (locale === 'hu') {
            if ('name_hun' in item && item.name_hun) return item.name_hun;
        }
        return item.name;
    };

    // Helper function to get localized genre name
    const getLocalizedGenreName = useCallback((genreName: string): string => {
        if (locale === 'hu') {
            const genre = genres.find(g => g.name === genreName);
            if (genre && genre.name_HUN) {
                return genre.name_HUN;
            }
        }
        return genreName;
    }, [locale, genres]);

    // Helper function to get localized instrument name
    const getLocalizedInstrumentName = useCallback((instrumentName: string): string => {
        if (locale === 'hu') {
            const instrument = instruments.find(i => i.name === instrumentName);
            if (instrument && instrument.name_hun) {
                return instrument.name_hun;
            }
        }
        return instrumentName;
    }, [locale, instruments]);

    // Parse helper functions
    const parseArrayField = (field: unknown): string[] => {
        if (!field) return [];
        if (Array.isArray(field)) return field;
        if (typeof field === 'string') {
            try {
                const parsed = JSON.parse(field);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    };

    const parseEducationField = (field: unknown): string[] => {
        if (!field) return [];
        
        if (Array.isArray(field)) {
            return field.map(item => {
                if (typeof item === 'string') {
                    return item;
                }
                if (typeof item === 'object' && item !== null) {
                    if ('type' in item && 'school' in item) {
                        const type = (item as any).type || '';
                        const school = (item as any).school || '';
                        const connector = locale === 'hu' ? 'itt:' : 'at';
                        return school ? `${type} ${connector} ${school}` : type;
                    }
                }
                return typeof item === 'string' ? item : '';
            }).filter(Boolean);
        }
        
        if (typeof field === 'string') {
            try {
                const parsed = JSON.parse(field);
                if (Array.isArray(parsed)) {
                    return parseEducationField(parsed);
                }
                return [field];
            } catch {
                return [field];
            }
        }
        
        return [];
    };

    const parseGenreInstrumentField = (field: unknown): any[] => {
        if (!field) return [];
        
        if (Array.isArray(field)) {
            if (field.length === 1 && typeof field[0] === 'string') {
                try {
                    const parsed = JSON.parse(field[0]);
                    if (Array.isArray(parsed)) {
                        return parsed.filter(item => item && item !== null && item !== undefined);
                    }
                } catch {
                    return field[0] ? [field[0]] : [];
                }
            }
            return field.filter(item => item && item !== null && item !== undefined);
        }
        
        if (typeof field === 'string') {
            try {
                const parsed = JSON.parse(field);
                if (Array.isArray(parsed)) {
                    return parsed.filter(item => item && item !== null && item !== undefined);
                }
                return field ? [field] : [];
            } catch {
                return field ? [field] : [];
            }
        }
        
        return [];
    };

    const parseSocialField = (social: any): any => {
        if (!social) return {};
        
        if (Array.isArray(social)) {
            const result: any = {};
            social.forEach(item => {
                if (item && typeof item === 'object' && item.platform && item.link) {
                    result[item.platform] = item.link;
                }
            });
            return result;
        }
        
        if (typeof social === 'string') {
            try {
                const parsed = JSON.parse(social);
                if (typeof parsed === 'object' && parsed !== null) {
                    return parsed;
                }
                return {};
            } catch {
                return {};
            }
        }
        
        if (typeof social === 'object' && social !== null) {
            return social;
        }
        
        return {};
    };

    // Sorting function
    const applySorting = (musicians: MusicianProfile[], sortBy: string): MusicianProfile[] => {
        const sorted = [...musicians];
        
        switch (sortBy) {
            case 'name_asc':
                return sorted.sort((a, b) => {
                    const nameA = formatName(a.forename, a.surname);
                    const nameB = formatName(b.forename, b.surname);
                    return nameA.localeCompare(nameB);
                });
            case 'name_desc':
                return sorted.sort((a, b) => {
                    const nameA = formatName(a.forename, a.surname);
                    const nameB = formatName(b.forename, b.surname);
                    return nameB.localeCompare(nameA);
                });
            case 'education_desc':
                return sorted.sort((a, b) => {
                    const educationA = parseEducationField(a.education);
                    const educationB = parseEducationField(b.education);
                    return educationB.length - educationA.length;
                });
            case 'random':
                return sorted.sort(() => Math.random() - 0.5);
            default:
                return sorted;
        }
    };

    // Helper function to get localized category for instruments
    const getLocalizedCategory = useCallback((instrument: Instrument): string => {
        if (locale === 'hu' && instrument.category_hun) {
            return instrument.category_hun;
        }
        return instrument.category;
    }, [locale]);

    // Memoize instrumentsByCategory with ranking
    const instrumentsByCategory = useMemo(() => {
        return instruments.reduce((acc, instrument) => {
            const category = getLocalizedCategory(instrument);
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(instrument);
            return acc;
        }, {} as Record<string, Instrument[]>);
    }, [instruments, getLocalizedCategory]);

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
    }, [instrumentsByCategory]);

    // Memoize instruments sorted by instrument_rank within each category
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

    // Handle country change for location filter
    const handleCountryChange = (countryName: string) => {
        const country = locationData.countries.find(c => c.countryName === countryName);
        if (country) {
            setFilters({...filters, country: countryName, city: 'any'});
            // Load cities for the selected country
            loadCitiesForCountry(country.countryCode);
        }
    };

    // Helper functions for location placeholders
    const getCountryPlaceholder = () => {
        if (locationServiceStatus === 'loading') return t('database.filters.loadingCountries');
        if (locationServiceStatus === 'unavailable') return t('database.filters.serviceUnavailable');
        return t('database.filters.selectCountry');
    };

    const getCityPlaceholder = () => {
        if (locationServiceStatus === 'unavailable') return t('database.filters.serviceUnavailable');
        if (!filters.country || filters.country === 'any') return t('database.filters.selectCountryFirst');
        if (loadingLocations) return t('database.filters.loadingCities');
        return t('database.filters.selectCity');
    };

    // Main search function with proper database filtering
    const searchMusicians = async () => {
        if (!filters.sortBy) {
            return;
        }

        setLoading(true);
        setHasSearched(true);
        
        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();
            
            // Debug: Check client configuration
            console.log('Supabase client URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
            console.log('Supabase client anon key (first 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20));
            
            // Test basic connectivity first
            const { error: testError } = await client
                .from('genres')
                .select('*')
                .limit(1);
            
            if (testError) {
                console.error('Test query failed:', testError);
                setMusicians([]);
                setLoading(false);
                return;
            }
            
            console.log('Test query successful, database connection works');
            
            // Start with basic query
            let query = client.from('musician_profiles').select('*');
            
            // Apply name search filter at database level
            if (filters.nameSearch.trim()) {
                const searchTerm = filters.nameSearch.trim();
                query = query.or(`forename.ilike.%${searchTerm}%,surname.ilike.%${searchTerm}%`);
            }
            
            // Get all matching profiles
            const { data: allProfiles, error: profilesError } = await query;
            
            if (profilesError) {
                console.error('Error querying musician_profiles:', profilesError);
                setMusicians([]);
                setLoading(false);
                return;
            }
            
            console.log(`Found ${allProfiles?.length || 0} total musician profiles in database`);
            
            if (!allProfiles || allProfiles.length === 0) {
                setMusicians([]);
                setLoading(false);
                return;
            }
            
            // First, filter out users without any skills (genre_instrument)
            const profilesWithSkills = allProfiles.filter((profile: any) => {
                let genreInstrumentData = profile.genre_instrument;
                
                // Handle string format
                if (typeof genreInstrumentData === 'string') {
                    try {
                        genreInstrumentData = JSON.parse(genreInstrumentData);
                    } catch {
                        return false; // Invalid JSON, consider as no skills
                    }
                }
                
                // Must be an array with at least one valid entry
                if (!Array.isArray(genreInstrumentData) || genreInstrumentData.length === 0) {
                    return false;
                }
                
                // Check if there's at least one valid skill entry
                const hasValidSkills = genreInstrumentData.some((item: any) => {
                    if (typeof item === 'string' && item.trim()) {
                        return true;
                    }
                    if (typeof item === 'object' && item !== null) {
                        const hasGenre = String(item.genre || '').trim();
                        const hasInstrument = String(item.instrument || '').trim();
                        return hasGenre && hasInstrument;
                    }
                    return false;
                });
                
                return hasValidSkills;
            });
            
            console.log(`Found ${profilesWithSkills.length} musicians with skills (filtered out ${allProfiles.length - profilesWithSkills.length} without skills)`);
            
            // Apply complex filtering for genre, instrument, category, and location
            let filteredProfiles = profilesWithSkills;
            
            if (filters.genre !== 'any' || filters.instrument !== 'any' || filters.category !== 'any' || filters.country !== 'any' || filters.city !== 'any') {
                filteredProfiles = allProfiles.filter((profile: any) => {
                    // Parse genre_instrument data
                    let genreInstrumentData = profile.genre_instrument;
                    if (typeof genreInstrumentData === 'string') {
                        try {
                            genreInstrumentData = JSON.parse(genreInstrumentData);
                        } catch {
                            genreInstrumentData = [];
                        }
                    }
                    
                    if (!Array.isArray(genreInstrumentData)) return false;
                    
                    // Check genre, instrument, and category filters
                    let matchesGenreInstrument = true;
                    if (filters.genre !== 'any' || filters.instrument !== 'any' || filters.category !== 'any') {
                        matchesGenreInstrument = genreInstrumentData.some((item: any) => {
                            if (typeof item !== 'object' || item === null) {
                                return false;
                            }
                            
                            const itemGenre = String(item.genre || '').toLowerCase();
                            const itemInstrument = String(item.instrument || '').toLowerCase();
                            const itemCategory = String(item.category || '').toLowerCase();
                            
                            // Match genre if specified
                            if (filters.genre !== 'any' && itemGenre !== filters.genre.toLowerCase()) {
                                return false;
                            }
                            
                            // Match instrument if specified
                            if (filters.instrument !== 'any' && itemInstrument !== filters.instrument.toLowerCase()) {
                                return false;
                            }
                            
                            // Match category if specified
                            if (filters.category !== 'any' && itemCategory !== filters.category.toLowerCase()) {
                                return false;
                            }
                            
                            return true;
                        });
                    }
                    
                    // Check location filters
                    let matchesLocation = true;
                    if (filters.country !== 'any' || filters.city !== 'any') {
                        const location = profile.location;
                        if (location && typeof location === 'object' && location !== null) {
                            const locationObj = location as Record<string, unknown>;
                            const profileCountry = String(locationObj.country || '').toLowerCase();
                            const profileCity = String(locationObj.city || '').toLowerCase();
                            
                            // Match country if specified
                            if (filters.country !== 'any' && profileCountry !== filters.country.toLowerCase()) {
                                matchesLocation = false;
                            }
                            
                            // Match city if specified
                            if (filters.city !== 'any' && profileCity !== filters.city.toLowerCase()) {
                                matchesLocation = false;
                            }
                        } else {
                            // No location data means no match if location filter is specified
                            matchesLocation = false;
                        }
                    }
                    
                    return matchesGenreInstrument && matchesLocation;
                });
            }
            
            console.log(`Found ${filteredProfiles.length} musicians matching criteria`);
            
            // Parse and normalize the filtered data
            const parsedMusicians = filteredProfiles.map((musician: any) => {
                const normalizedMusician: MusicianProfile = {
                    id: musician.id || '',
                    email: musician.email || null,
                    forename: musician.forename || null,
                    surname: musician.surname || null,
                    location: musician.location || null,
                    phone: musician.phone || null,
                    bio: musician.bio || null,
                    occupation: parseArrayField(musician.occupation),
                    education: parseEducationField(musician.education),
                    certificates: parseArrayField(musician.certificates),
                    genre_instrument: parseGenreInstrumentField(musician.genre_instrument),
                    video_links: parseArrayField(musician.video_links),
                    social: parseSocialField(musician.social),
                    created_at: musician.created_at || new Date().toISOString(),
                    updated_at: musician.updated_at || new Date().toISOString()
                };

                return normalizedMusician;
            });
            
            // Apply sorting
            const sortedMusicians = applySorting(parsedMusicians, filters.sortBy);
            setMusicians(sortedMusicians);
            
            setTimeout(() => {
                scrollToResults();
            }, 100);

        } catch (error) {
            console.error('Error in search:', error);
            setMusicians([]);
        } finally {
            setLoading(false);
        }
    };

    // Profile modal functions
    const openProfileModal = async (musician: MusicianProfile) => {
        setSelectedMusician(musician);
        setIsProfileModalOpen(true);
        setProfileLoading(false);
        setProfileError(null);
    };

    const closeProfileModal = () => {
        setIsProfileModalOpen(false);
        setSelectedMusician(null);
        setProfileLoading(false);
        setProfileError(null);
    };

    // Search callback functions for ProfileQueryModal
    const handleGenreSearch = async (genre: string) => {
        const newFilters = {
            genre: genre,
            instrument: 'any',
            category: 'any',
            nameSearch: '',
            sortBy: 'name_asc',
            country: 'any',
            city: 'any'
        };
        setFilters(newFilters);
        
        // Perform search immediately using direct database query
        setLoading(true);
        setHasSearched(true);
        
        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();
            
            // Get all profiles
            const { data: allProfiles, error: profilesError } = await client
                .from('musician_profiles')
                .select('*');
            
            if (profilesError) {
                console.error('Error querying musician_profiles:', profilesError);
                setMusicians([]);
                setLoading(false);
                return;
            }
            
            if (!allProfiles || allProfiles.length === 0) {
                setMusicians([]);
                setLoading(false);
                return;
            }
            
            // Filter by genre
            const filteredProfiles = allProfiles.filter((profile: any) => {
                let genreInstrumentData = profile.genre_instrument;
                if (typeof genreInstrumentData === 'string') {
                    try {
                        genreInstrumentData = JSON.parse(genreInstrumentData);
                    } catch {
                        genreInstrumentData = [];
                    }
                }
                
                if (!Array.isArray(genreInstrumentData)) return false;
                
                return genreInstrumentData.some((item: any) => {
                    if (typeof item !== 'object' || item === null) return false;
                    const itemGenre = String(item.genre || '').toLowerCase();
                    return itemGenre === genre.toLowerCase();
                });
            });

            const parsedMusicians = filteredProfiles.map((musician: any) => ({
                ...musician,
                occupation: parseArrayField(musician.occupation),
                education: parseEducationField(musician.education),
                certificates: parseArrayField(musician.certificates),
                genre_instrument: parseGenreInstrumentField(musician.genre_instrument),
                video_links: parseArrayField(musician.video_links),
                social: parseSocialField(musician.social)
            }));
            
            setMusicians(parsedMusicians);
            scrollToResults();

        } catch (error) {
            console.error('Error in genre search:', error);
            setMusicians([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInstrumentSearch = async (instrument: string) => {
        const newFilters = {
            genre: 'any',
            instrument: instrument,
            category: 'any',
            nameSearch: '',
            sortBy: 'name_asc',
            country: 'any',
            city: 'any'
        };
        setFilters(newFilters);
        
        // Perform search immediately using direct database query
        setLoading(true);
        setHasSearched(true);
        
        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();
            
            // Get all profiles
            const { data: allProfiles, error: profilesError } = await client
                .from('musician_profiles')
                .select('*');
            
            if (profilesError) {
                console.error('Error querying musician_profiles:', profilesError);
                setMusicians([]);
                setLoading(false);
                return;
            }
            
            if (!allProfiles || allProfiles.length === 0) {
                setMusicians([]);
                setLoading(false);
                return;
            }
            
            // Filter by instrument
            const filteredProfiles = allProfiles.filter((profile: any) => {
                let genreInstrumentData = profile.genre_instrument;
                if (typeof genreInstrumentData === 'string') {
                    try {
                        genreInstrumentData = JSON.parse(genreInstrumentData);
                    } catch {
                        genreInstrumentData = [];
                    }
                }
                
                if (!Array.isArray(genreInstrumentData)) return false;
                
                return genreInstrumentData.some((item: any) => {
                    if (typeof item !== 'object' || item === null) return false;
                    const itemInstrument = String(item.instrument || '').toLowerCase();
                    return itemInstrument === instrument.toLowerCase();
                });
            });

            const parsedMusicians = filteredProfiles.map((musician: any) => ({
                ...musician,
                occupation: parseArrayField(musician.occupation),
                education: parseEducationField(musician.education),
                certificates: parseArrayField(musician.certificates),
                genre_instrument: parseGenreInstrumentField(musician.genre_instrument),
                video_links: parseArrayField(musician.video_links),
                social: parseSocialField(musician.social)
            }));
            
            setMusicians(parsedMusicians);
            scrollToResults();

        } catch (error) {
            console.error('Error in instrument search:', error);
            setMusicians([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFullTagSearch = async (genre?: string, instrument?: string, category?: string) => {
        const newFilters = {
            genre: genre || 'any',
            instrument: instrument || 'any',
            category: category || 'any',
            nameSearch: '',
            sortBy: 'name_asc',
            country: 'any',
            city: 'any'
        };
        setFilters(newFilters);
        
        // Perform search immediately
        setLoading(true);
        setHasSearched(true);
        
        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();
            
            const { data: allProfiles, error: profilesError } = await client
                .from('musician_profiles')
                .select('*');
            
            if (profilesError) {
                console.error('Error querying musician_profiles:', profilesError);
                setMusicians([]);
                return;
            }
            
            const filteredData = (allProfiles || []).filter((profile: any) => {
                let genreInstrumentData = profile.genre_instrument;
                if (typeof genreInstrumentData === 'string') {
                    try {
                        genreInstrumentData = JSON.parse(genreInstrumentData);
                    } catch {
                        genreInstrumentData = [];
                    }
                }
                
                if (!Array.isArray(genreInstrumentData)) return false;
                
                return genreInstrumentData.some((item: any) => {
                    if (typeof item === 'object' && item !== null) {
                        const itemGenre = String(item.genre || '').toLowerCase();
                        const itemInstrument = String(item.instrument || '').toLowerCase();
                        const itemCategory = String(item.category || '').toLowerCase();
                        
                        const genreMatch = !genre || genre === 'any' || itemGenre === genre.toLowerCase();
                        const instrumentMatch = !instrument || instrument === 'any' || itemInstrument === instrument.toLowerCase();
                        const categoryMatch = !category || category === 'any' || itemCategory === category.toLowerCase();
                        
                        return genreMatch && instrumentMatch && categoryMatch;
                    }
                    return false;
                });
            });
            
            const parsedMusicians = filteredData.map((musician: any) => ({
                ...musician,
                occupation: parseArrayField(musician.occupation),
                education: parseEducationField(musician.education),
                certificates: parseArrayField(musician.certificates),
                genre_instrument: parseGenreInstrumentField(musician.genre_instrument),
                video_links: parseArrayField(musician.video_links),
                social: parseSocialField(musician.social)
            }));
            
            const sortedMusicians = applySorting(parsedMusicians, newFilters.sortBy);
            setMusicians(sortedMusicians);
            scrollToResults();

        } catch (error) {
            console.error('Error in full tag search:', error);
            setMusicians([]);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get social icon
    const getSocialIcon = (platform: string) => {
        if (!platform) return <ExternalLink className="h-4 w-4" />;
        
        const dbPlatform = SOCIAL_PLATFORMS.find(p => 
            p.name && p.name.toLowerCase() === platform.toLowerCase()
        );
        
        if (dbPlatform) {
            const platformLower = dbPlatform.name.toLowerCase();
            switch (platformLower) {
                case 'youtube':
                    return <Youtube className="h-4 w-4" />;
                case 'instagram':
                    return <Instagram className="h-4 w-4" />;
                case 'facebook':
                    return <Facebook className="h-4 w-4" />;
                case 'twitter':
                    return <Twitter className="h-4 w-4" />;
                case 'linkedin':
                    return <Linkedin className="h-4 w-4" />;
                default:
                    return <ExternalLink className="h-4 w-4" />;
            }
        }
        
        return <ExternalLink className="h-4 w-4" />;
    };

    // Sort options
    const sortOptions = [
        { value: 'name_asc', label: t('database.sortOptions.nameAsc') },
        { value: 'name_desc', label: t('database.sortOptions.nameDesc') },
        { value: 'education_desc', label: t('database.sortOptions.educationDesc') },
        { value: 'random', label: t('database.sortOptions.random') }
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <DynamicHeader />
            {/* Main Content */}
            <div className="flex-1">
                <div className="container mx-auto p-4 space-y-6 max-w-6xl">
                    {/* Header */}
                    <div className="text-center space-y-4 py-8">
                        <h1 className="text-3xl font-bold">{t('database.title')}</h1>
                        <p className="text-gray-600">{t('database.subtitle')}</p>
                    </div>

                    {/* Search Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                {t('database.searchFilters')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Genre Filter */}
                                <div>
                                    <Label>{t('database.filters.genre')}</Label>
                                    <Select value={filters.genre} onValueChange={(value) => setFilters({...filters, genre: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('database.filters.selectGenre')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">{t('database.filters.any')}</SelectItem>
                                            {genres.map(genre => (
                                                <SelectItem key={genre.id} value={genre.name}>
                                                    {getLocalizedName(genre)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Instrument Filter */}
                                <div>
                                    <Label>{t('database.filters.instrument')}</Label>
                                    <Select value={filters.instrument} onValueChange={(value) => setFilters({...filters, instrument: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('database.filters.selectInstrument')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">{t('database.filters.any')}</SelectItem>
                                            {sortedCategories.length > 0 ? (
                                                sortedCategories.map(category => {
                                                    // Find the first instrument in this category to get the translated category name
                                                    const firstInstrument = sortedInstrumentsByCategory[category][0];
                                                    const translatedCategory = getLocalizedCategory(firstInstrument);
                                                    
                                                    return (
                                                        <SelectGroup key={category} label={translatedCategory}>
                                                            {sortedInstrumentsByCategory[category].map(instrument => (
                                                                <SelectItem key={instrument.id} value={instrument.name}>
                                                                    {getLocalizedName(instrument)}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    );
                                                })
                                            ) : (
                                                instruments.map(instrument => (
                                                    <SelectItem key={instrument.id} value={instrument.name}>
                                                        {getLocalizedName(instrument)}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <Label>{t('database.filters.category')}</Label>
                                    <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('database.filters.selectCategory')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">{t('database.filters.any')}</SelectItem>
                                            <SelectItem value="artist">{t('database.categories.artist')}</SelectItem>
                                            <SelectItem value="teacher">{t('database.categories.teacher')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Name Search */}
                                <div>
                                    <Label>{t('database.filters.nameSearch')}</Label>
                                    <Input
                                        value={filters.nameSearch}
                                        onChange={(e) => setFilters({...filters, nameSearch: e.target.value})}
                                        placeholder={t('database.filters.searchPlaceholder')}
                                    />
                                </div>

                                {/* Sort By */}
                                <div>
                                    <Label>{t('database.filters.sortBy')}</Label>
                                    <Select value={filters.sortBy} onValueChange={(value) => setFilters({...filters, sortBy: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Country Filter */}
                                <div>
                                    <Label>{t('database.filters.country')}</Label>
                                    <Select 
                                        value={filters.country} 
                                        onValueChange={handleCountryChange}
                                        disabled={locationServiceStatus === 'unavailable'}
                                    >
                                        <SelectTrigger className={locationServiceStatus === 'unavailable' ? 'opacity-50' : ''}>
                                            <SelectValue placeholder={getCountryPlaceholder()} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">{t('database.filters.any')}</SelectItem>
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

                                {/* City Filter */}
                                <div>
                                    <Label>{t('database.filters.city')}</Label>
                                    <Select 
                                        value={filters.city} 
                                        onValueChange={(value) => setFilters({...filters, city: value})}
                                        disabled={
                                            locationServiceStatus === 'unavailable' || 
                                            !filters.country || 
                                            filters.country === 'any' ||
                                            loadingLocations
                                        }
                                    >
                                        <SelectTrigger className={
                                            locationServiceStatus === 'unavailable' || 
                                            !filters.country || 
                                            filters.country === 'any' 
                                                ? 'opacity-50' : ''
                                        }>
                                            <SelectValue placeholder={getCityPlaceholder()} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">{t('database.filters.any')}</SelectItem>
                                            {filters.country && filters.country !== 'any' && (() => {
                                                const country = locationData.countries.find(c => c.countryName === filters.country);
                                                if (country && locationData.cities[country.countryCode]) {
                                                    return locationData.cities[country.countryCode]
                                                        .sort((a, b) => a.name.localeCompare(b.name))
                                                        .map(city => (
                                                            <SelectItem key={city.geonameId} value={city.name}>
                                                                {city.name}
                                                            </SelectItem>
                                                        ));
                                                }
                                                return null;
                                            })()}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Button 
                                    onClick={searchMusicians}
                                    disabled={loading || !filters.sortBy}
                                    className="bg-[#083e4d] hover:bg-[#062f3b] text-white"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                                            {t('database.searching')}
                                        </span>
                                    ) : t('database.search')}
                                </Button>
                                
                                {hasSearched && (
                                    <Button 
                                        variant="destructive" 
                                        onClick={() => {
                                            setFilters({
                                                genre: 'any',
                                                instrument: 'any',
                                                category: 'any',
                                                nameSearch: '',
                                                sortBy: 'name_asc',  // Keep default sorting instead of clearing it
                                                country: 'any',
                                                city: 'any'
                                            });
                                            setMusicians([]);
                                            setHasSearched(false);
                                        }}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        {t('database.clearFilters')}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results */}
                    {hasSearched && (
                        <Card ref={resultsRef}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserCheck className="h-5 w-5" />
                                    {t('database.results.title')} ({musicians.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {musicians.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {musicians.map((musician) => (
                                            <div key={musician.id} className="w-full">
                                                <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white border-gray-200 overflow-hidden">
                                                    <CardHeader className="pb-2">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar
                                                                forename={musician.forename}
                                                                surname={musician.surname}
                                                                size="md"
                                                                onClick={() => openProfileModal(musician)}
                                                                title={t('database.profile.viewProfile')}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <button 
                                                                    className="text-left w-full"
                                                                    onClick={() => openProfileModal(musician)}
                                                                    title={t('database.profile.viewProfile')}
                                                                >
                                                                    <CardTitle className="text-lg truncate hover:text-teal-600 transition-colors cursor-pointer font-semibold text-gray-800">
                                                                        {formatName(musician.forename, musician.surname, musician.email)}
                                                                    </CardTitle>
                                                                </button>
                                                                <CardDescription className="truncate text-gray-500 flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {formatLocation(musician.location)}
                                                                </CardDescription>
                                                            </div>
                                                        </div>
                                                    </CardHeader>

                                                    <CardContent className="pt-0 flex flex-col flex-1 space-y-4 p-4 pb-0">
                                                        {/* Skills Section */}
                                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                            <h4 className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                                                <Music className="h-4 w-4 text-teal-600" />
                                                                {t('database.profile.genresInstruments')}
                                                            </h4>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {musician.genre_instrument && musician.genre_instrument.length > 0 ? (
                                                                    musician.genre_instrument.map((item, index) => {
                                                                        let displayText: string;
                                                                        let genre: string = '';
                                                                        let instrument: string = '';
                                                                        
                                                                        if (typeof item === 'string') {
                                                                            displayText = item;
                                                                            const parts = displayText.split(' ');
                                                                            if (parts.length >= 2) {
                                                                                genre = parts[0];
                                                                                instrument = parts.slice(1).join(' ');
                                                                            }
                                                                        } else if (item && typeof item === 'object') {
                                                                            const itemObj = item as Record<string, unknown>;
                                                                            genre = String(itemObj.genre || '');
                                                                            instrument = String(itemObj.instrument || '');
                                                                            
                                                                            const localizedGenre = getLocalizedGenreName(genre);
                                                                            const localizedInstrument = getLocalizedInstrumentName(instrument);
                                                                            
                                                                            let typeText = '';
                                                                            if (itemObj.category) {
                                                                                const type = String(itemObj.category);
                                                                                if (type === 'artist') {
                                                                                    typeText = t('database.categories.artist');
                                                                                } else if (type === 'teacher') {
                                                                                    typeText = t('database.categories.teacher');
                                                                                } else {
                                                                                    typeText = type;
                                                                                }
                                                                            }
                                                                            
                                                                            const type = typeText ? ` (${typeText})` : '';
                                                                            displayText = `${localizedGenre} ${localizedInstrument}${type}`.trim();
                                                                        } else {
                                                                            displayText = String(item || '');
                                                                        }

                                                                        return (
                                                                            <Badge 
                                                                                key={index} 
                                                                                variant="secondary" 
                                                                                className="text-xs cursor-pointer hover:bg-teal-100 hover:text-teal-800 transition-all duration-200 transform hover:scale-105 bg-white border border-gray-200 text-gray-700 font-medium"
                                                                                onClick={() => {
                                                                                    let type = '';
                                                                                    if (item && typeof item === 'object') {
                                                                                        const itemObj = item as Record<string, unknown>;
                                                                                        type = String(itemObj.category || '');
                                                                                    }
                                                                                    
                                                                                    if (genre && instrument) {
                                                                                        handleFullTagSearch(genre, instrument, type);
                                                                                    } else if (genre) {
                                                                                        handleGenreSearch(genre);
                                                                                    } else if (instrument) {
                                                                                        handleInstrumentSearch(instrument);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {displayText}
                                                                            </Badge>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <span className="text-sm text-gray-400 italic bg-gray-100 px-3 py-1 rounded-full">
                                                                        {locale === 'hu' ? 'Nincs képesség megadva' : 'No skills listed'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Spacer to push social icons to bottom when content is short */}
                                                        <div className="flex-grow"></div>

                                                        {/* Contact & Links */}
                                                        <div className="mt-auto flex items-center gap-2 py-3 px-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-transparent rounded-b-lg -mx-4">
                                                            {/* Email */}
                                                            {musician.email && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    asChild
                                                                    className="h-8 w-8 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
                                                                >
                                                                    <a href={`mailto:${musician.email}`} title={`Email: ${musician.email}`}>
                                                                        <Mail className="h-4 w-4" />
                                                                    </a>
                                                                </Button>
                                                            )}

                                                            {/* Phone */}
                                                            {musician.phone && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    asChild
                                                                    className="h-8 w-8 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
                                                                >
                                                                    <a href={`tel:${musician.phone}`} title={`Phone: ${musician.phone}`}>
                                                                        <Phone className="h-4 w-4" />
                                                                    </a>
                                                                </Button>
                                                            )}

                                                            {/* Video links */}
                                                            {musician.video_links && musician.video_links.length > 0 && (
                                                                musician.video_links.slice(0, 5).map((link, index) => {
                                                                    if (!link) return null; // Skip invalid URLs
                                                                    
                                                                    return (
                                                                        <Button
                                                                            key={index}
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            asChild
                                                                            className="h-8 w-8 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
                                                                        >
                                                                            <a 
                                                                                href={link} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer"
                                                                                title="Watch video"
                                                                            >
                                                                                <Video className="h-4 w-4" />
                                                                            </a>
                                                                        </Button>
                                                                    );
                                                                }).filter(Boolean)
                                                            )}

                                                            {/* Social links */}
                                                            {musician.social && typeof musician.social === 'object' && (
                                                                Object.entries(musician.social).map(([platform, url]) => {
                                                                    if (!url || url === '') return null;
                                                                    return (
                                                                        <Button
                                                                            key={platform}
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            asChild
                                                                            className="h-8 w-8 hover:bg-purple-100 hover:text-purple-600 transition-all duration-200"
                                                                        >
                                                                            <a
                                                                                href={url as string}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                title={`${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${url}`}
                                                                            >
                                                                                {getSocialIcon(platform)}
                                                                            </a>
                                                                        </Button>
                                                                    );
                                                                }).filter(Boolean)
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 px-6">
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 shadow-sm">
                                            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500 text-lg font-medium mb-2">{t('database.noResults')}</p>
                                            <p className="text-gray-400 text-sm">{t('database.tryDifferentFilters')}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Profile Query Modal */}
                    <ProfileQueryModal 
                        isOpen={isProfileModalOpen}
                        onClose={closeProfileModal}
                        musician={selectedMusician}
                        isLoading={profileLoading}
                        error={profileError}
                        onGenreSearch={handleGenreSearch}
                        onInstrumentSearch={handleInstrumentSearch}
                        onFullTagSearch={handleFullTagSearch}
                        locale={locale}
                        instruments={instruments}
                        genres={genres}
                    />
                </div>
            </div>
        </div>
    );
}
