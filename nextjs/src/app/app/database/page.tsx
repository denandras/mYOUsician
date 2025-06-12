/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select-new";
import { Search, Trash2, Mail, Phone, Video, ExternalLink, User, BookOpen, Youtube, Instagram, Facebook, Twitter, Linkedin, Music, Globe, Briefcase, MapPin } from "lucide-react";
import { createSPASassClient } from '@/lib/supabase/client';
import { ProfileQueryModal } from '@/components/ProfileQueryModal';
import { Avatar } from '@/components/ui/avatar';
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

interface Genre {
    id: string;
    name: string;
    name_HUN: string | null;
}

interface Instrument {
    id: string;
    name: string;
    category: string;
    name_hun: string | null;
    category_hun: string | null;
    category_rank: number | null;
    instrument_rank: number | null;
}

interface Education {
    id: string;
    name: string;
    name_HUN: string | null;
    rank: number | null;
}

interface DatabaseRow {
    id?: string;
    uid?: string;
    email?: string | null;
    forename?: string | null;
    surname?: string | null;
    location?: unknown;
    phone?: string | null;
    bio?: string | null;
    occupation?: string[] | null;
    education?: string[] | null;
    certificates?: string[] | null;
    genre_instrument?: unknown[] | null;
    video_links?: string[] | null;
    social?: unknown;
    created_at?: string;
    updated_at?: string;
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

interface SearchFilters {
    genre: string;
    instrument: string;
    category: string;
    nameSearch: string;
    sortBy: string;
    includeCurrentUser?: boolean;
}

export default function DatabasePage() {
    // State for data
    const [musicians, setMusicians] = useState<MusicianProfile[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [instruments, setInstruments] = useState<Instrument[]>([]);    const [educationTypes, setEducationTypes] = useState<Education[]>([]);
    // Note: socialPlatforms state removed - now using hard-coded SOCIAL_PLATFORMS

    // State for filters
    const [filters, setFilters] = useState<SearchFilters>({
        genre: 'any',
        instrument: 'any',
        category: 'any', // Default to "Any"
        nameSearch: '',
        sortBy: ''
    });
      // State for UI
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState('');    // State for profile modal
    const [selectedMusician, setSelectedMusician] = useState<MusicianProfile | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);    // Ref for scrolling to results
    const resultsRef = useRef<HTMLDivElement>(null);

    // Helper function to scroll to results
    const scrollToResults = () => {
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100); // Small delay to ensure results are rendered
    };

    const openProfileModal = async (musician: MusicianProfile) => {
        setSelectedMusician(musician);
        setIsProfileModalOpen(true);
        setProfileLoading(false);
        setProfileError(null);
        
        // Simulate any additional data loading if needed
        // This is where you could fetch additional profile data if required
        try {
            // For now, we just use the existing musician data
            // But this could be expanded to fetch more detailed profile information
            setSelectedMusician(musician);
        } catch (error) {
            console.error('Error loading profile:', error);
            setProfileError('Failed to load profile details. Please try again.');
        } finally {
            setProfileLoading(false);
        }
    };

    const closeProfileModal = () => {
        setIsProfileModalOpen(false);
        setSelectedMusician(null);
        setProfileLoading(false);
        setProfileError(null);
    };

    // Sort options
    const sortOptions = [
        { value: 'name_asc', label: 'Name A-Z' },
        { value: 'name_desc', label: 'Name Z-A' },
        { value: 'education_desc', label: 'Education high to low' },
        { value: 'random', label: 'Random' }
    ];    // Load reference data on component mount
    useEffect(() => {
        loadReferenceData();
        loadCurrentUser();
    }, []);    // Track when instruments or genres change for UI updates
    useEffect(() => {
        // Data loaded, trigger any necessary UI updates
    }, [instruments, genres]);

    const loadCurrentUser = async () => {
        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();
            const { data } = await client.auth.getUser();
            setCurrentUserEmail(data?.user?.email || '');
        } catch (error) {
            console.error('Error loading current user:', error);
        }
    };    
    const loadReferenceData = async () => {
        try {
            // Check localStorage first for cached reference data
            const cacheKey = 'musician_reference_data';
            const cached = localStorage.getItem(cacheKey);              if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                // Use cached data if less than 24 hours old
                if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                    setGenres(data.genres || []);
                    setInstruments(data.instruments || []);
                    setEducationTypes(data.education_types || []);
                    // Note: social platforms now use hard-coded SOCIAL_PLATFORMS
                    return;
                }
            }

            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();            // Load all reference data in parallel (removed social query)
            const [instrumentsRes, genresRes, educationRes] = await Promise.all([
                client.from('instruments').select('*').order('category_rank', { ascending: true }).order('instrument_rank', { ascending: true }),
                client.from('genres').select('*').order('name'),
                client.from('education').select('*').order('rank', { ascending: false })
            ]);            // Add detailed error logging for database responses (removed social)
            if (instrumentsRes.error) {
                console.error('Instruments DB error:', instrumentsRes.error);
            }
            if (genresRes.error) {
                console.error('Genres DB error:', genresRes.error);
            }
            if (educationRes.error) {
                console.error('Education DB error:', educationRes.error);            }

            // Set state with response data
            setInstruments(instrumentsRes.data || []);
            setGenres(genresRes.data || []);
            setEducationTypes(educationRes.data || []);
              // Cache the reference data
            localStorage.setItem(cacheKey, JSON.stringify({
                data: {
                    instruments: instrumentsRes.data || [],
                    genres: genresRes.data || [],
                    education_types: educationRes.data || []
                },
                timestamp: Date.now()
            }));        } catch (error) {
            console.error('Error loading reference data:', error);
            // Reset to empty arrays if there's an error
            setGenres([]);
            setInstruments([]);
            setEducationTypes([]);
        }
    };    const searchMusicians = async () => {
        // Only require sortBy to be selected, genre can be "Any"
        if (!filters.sortBy) {
            return;
        }        setLoading(true);
        setHasSearched(true);
        
        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();
            
            // Only query musician_profiles table (no users table fallback)
            const { data: allProfiles, error: profilesError } = await client
                .from('musician_profiles')
                .select('*');
            
            if (profilesError) {
                console.error('Error querying musician_profiles:', profilesError);
                setMusicians([]);
                setLoading(false);
                return;            }
              
            // Filter in JavaScript to avoid complex SQL queries
            const filteredData = (allProfiles || []).filter((profile: any) => {
                // If no genre filter is specified (Any), return all profiles
                if (!filters.genre || filters.genre === 'any') return true;
                
                // Handle genre_instrument field which might be an array or JSON string
                let genreInstrumentData = profile.genre_instrument;
                if (typeof genreInstrumentData === 'string') {
                    try {
                        genreInstrumentData = JSON.parse(genreInstrumentData);
                    } catch {
                        // If parsing fails, treat as array with single string
                        genreInstrumentData = [genreInstrumentData];
                    }
                }
                
                if (!Array.isArray(genreInstrumentData)) {
                    return false;
                }
                
                // Check each genre-instrument combination in the array
                return genreInstrumentData.some((item: any) => {
                    const itemGenre = typeof item === 'object' ? item.genre : '';
                    const itemInstrument = typeof item === 'object' ? item.instrument : '';
                    const itemCategory = typeof item === 'object' ? item.category : '';
                    
                    // Genre must match (we already checked filters.genre is not empty above)
                    if (!itemGenre || itemGenre.toLowerCase() !== filters.genre.toLowerCase()) {
                        return false;
                    }
                      // If instrument filter is specified (not "Any"), it must match
                    if (filters.instrument && filters.instrument !== 'any' && (!itemInstrument || itemInstrument.toLowerCase() !== filters.instrument.toLowerCase())) {
                        return false;
                    }
                    
                    // If category filter is specified (not "Any"), it must match
                    if (filters.category && filters.category !== 'any' && (!itemCategory || itemCategory.toLowerCase() !== filters.category.toLowerCase())) {
                        return false;
                    }
                    
                    return true;                });
            });
              
            // Filter out current user (but only if we have a current user email and includeCurrentUser is false)
            let finalFilteredMusicians = filteredData.filter((musician: any) => {
                // If includeCurrentUser is true, don't filter out any profiles
                if (filters.includeCurrentUser) {
                    return true;
                }
                
                // If no current user email, don't filter out any profiles
                if (!currentUserEmail) {
                    return true;
                }
                
                const isCurrentUser = musician.email === currentUserEmail;
                return !isCurrentUser;
            });            // Apply name search filter
            if (filters.nameSearch.trim()) {
                const searchTerm = filters.nameSearch.toLowerCase().trim();
                finalFilteredMusicians = finalFilteredMusicians.filter((musician: any) => {
                    const fullName = `${musician.forename || ''} ${musician.surname || ''}`.toLowerCase();
                    return fullName.includes(searchTerm);
                });
            }

            // Parse and normalize data to MusicianProfile format
            const parsedMusicians = finalFilteredMusicians.map((musician: any) => {
                // Handle social field properly
                const socialData = typeof musician.social === 'object' && musician.social !== null && !Array.isArray(musician.social) 
                    ? musician.social
                    : parseSocialField(musician.social);

                // Normalize the musician object to match MusicianProfile interface
                const normalizedMusician: MusicianProfile = {
                    id: musician.id || musician.uid || '',
                    email: musician.email || null,
                    forename: musician.forename || null,
                    surname: musician.surname || null,
                    location: musician.location || null,
                    phone: musician.phone || null,
                    bio: musician.bio || null,
                    occupation: parseArrayField(musician.occupation),
                    education: parseEducationField(musician.education),
                    certificates: parseArrayField(musician.certificates),
                    genre_instrument: Array.isArray(musician.genre_instrument) 
                        ? musician.genre_instrument 
                        : [],
                    video_links: parseArrayField(musician.video_links),
                    social: socialData,
                    created_at: musician.created_at || new Date().toISOString(),
                    updated_at: musician.updated_at || new Date().toISOString()
                };

                return normalizedMusician;
            });            // Apply sorting
            const sortedMusicians = applySorting(parsedMusicians, filters.sortBy);
            setMusicians(sortedMusicians);

            // Scroll to results after search completes
            scrollToResults();

        } catch (error) {
            console.error('Error searching musicians:', error);
            setMusicians([]);
        } finally {
            setLoading(false);
        }
    };    // Helper function to parse array fields properly
    const parseArrayField = (field: unknown): string[] => {
        if (!field) return [];
        
        // If it's already an array
        if (Array.isArray(field)) {
            // Check if first element is a stringified array
            if (field.length === 1 && typeof field[0] === 'string') {
                try {
                    const parsed = JSON.parse(field[0]);
                    if (Array.isArray(parsed)) {
                        return parsed.length > 0 ? parsed.filter(item => item && item.trim() && item !== 'Student' && item !== '[]') : [];
                    }
                } catch {
                    // If parsing fails, treat as regular string
                    return field[0] && field[0].trim() && field[0] !== 'Student' && field[0] !== '[]' ? [field[0]] : [];
                }
            }
            return field.filter(item => item && item.trim() && item !== 'Student' && item !== '[]');
        }
        
        // If it's a string, try to parse it
        if (typeof field === 'string') {
            try {
                const parsed = JSON.parse(field);
                if (Array.isArray(parsed)) {
                    return parsed.filter(item => item && item.trim() && item !== 'Student' && item !== '[]');
                }
                return field && field.trim() && field !== 'Student' && field !== '[]' ? [field] : [];
            } catch {
                return field && field.trim() && field !== 'Student' && field !== '[]' ? [field] : [];
            }
        }
        
        return [];
    };

    // Parse education field with multiple format support
    const parseEducationField = (field: unknown): string[] => {
        if (!field) return [];
        
        // If it's already an array
        if (Array.isArray(field)) {
            return field.map(item => {
                if (typeof item === 'string') {
                    return item; // Already formatted string
                }
                if (typeof item === 'object' && item !== null) {
                    // If it's in the { type, school } format
                    if ('type' in item && 'school' in item) {
                        const type = (item as any).type || '';
                        const school = (item as any).school || '';
                        return school ? `${type} at ${school}` : type;
                    }
                }
                return String(item);
            }).filter(Boolean);
        }
        
        // If it's a string, try to parse it
        if (typeof field === 'string') {
            try {
                const parsed = JSON.parse(field);
                if (Array.isArray(parsed)) {
                    return parseEducationField(parsed); // Recursively parse
                }
                return [field]; // Keep as string
            } catch {
                return [field]; // Keep as string if parsing fails
            }
        }
        
        return [];
    };

    const parseSocialField = (social: any): any[] => {
        if (!social) return [];
        
        // If it's already an array
        if (Array.isArray(social)) return social;
        
        // If it's a string, try to parse it
        if (typeof social === 'string') {
            try {
                const parsed = JSON.parse(social);
                if (Array.isArray(parsed)) return parsed;
                return [];
            } catch {
                return [];
            }
        }
        
        // If it's an object, convert to array format
        if (typeof social === 'object' && social !== null) {
            return Object.entries(social).map(([platform, link]) => ({
                platform,
                link
            }));
        }
        
        return [];
    };

    const applySorting = (musicians: MusicianProfile[], sortBy: string): MusicianProfile[] => {
        const sorted = [...musicians];
        
        switch (sortBy) {
            case 'name_asc':
                return sorted.sort((a, b) => {
                    const nameA = `${a.forename || ''} ${a.surname || ''}`.trim();
                    const nameB = `${b.forename || ''} ${b.surname || ''}`.trim();
                    return nameA.localeCompare(nameB);
                });
            case 'name_desc':
                return sorted.sort((a, b) => {
                    const nameA = `${a.forename || ''} ${a.surname || ''}`.trim();
                    const nameB = `${b.forename || ''} ${b.surname || ''}`.trim();
                    return nameB.localeCompare(nameA);
                });
            case 'education_desc':
                return sorted.sort((a, b) => {
                    const getHighestEducationRank = (education: string[]) => {
                        if (!education || education.length === 0) return 0;
                        
                        let highestRank = 0;
                        education.forEach(eduItem => {
                            const eduName = eduItem.includes(' at ') 
                                ? eduItem.split(' at ')[0].trim() 
                                : eduItem;
                            
                            const foundEdu = educationTypes.find(et => 
                                et.name.toLowerCase() === eduName.toLowerCase()
                            );
                            if (foundEdu && foundEdu.rank && foundEdu.rank > highestRank) {
                                highestRank = foundEdu.rank;
                            }
                        });
                        return highestRank;
                    };
                    
                    const rankA = getHighestEducationRank(a.education || []);
                    const rankB = getHighestEducationRank(b.education || []);
                    return rankB - rankA; // Higher rank first
                });
            case 'random':
                return sorted.sort(() => Math.random() - 0.5);
            default:
                return sorted;
        }
    };    const clearFilters = () => {
        setFilters({
            genre: 'any',
            instrument: 'any',
            category: 'any', // Default to "Any"
            nameSearch: '',
            sortBy: ''
        });
        // Don't clear musicians data or hasSearched state
        // Let users see previous results until they search again
    };const updateFilter = (key: keyof SearchFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        // Don't reset hasSearched when filters change
        // Let users keep seeing previous results until they search again
    };

    const canSearch = filters.sortBy;  // Only require sorting to be selected, genre can be "Any"    // New search function for complete tag data (genre + instrument + category)
    const handleFullTagSearch = async (genre: string, instrument: string, category: string) => {
        const newFilters = {
            genre: genre || 'any',
            instrument: instrument || 'any', 
            category: category || 'any',
            nameSearch: '',
            sortBy: 'name_asc' // Set a default sorting
        };
        setFilters(newFilters);
        
        // Perform search immediately with the new filters
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
            
            // Apply filters for complete tag search
            let filteredData = allProfiles || [];
            
            // Apply genre, instrument, and category filters if specified
            if (genre && genre !== 'any') {
                filteredData = filteredData.filter((profile: any) => {
                    let genreInstrumentData = profile.genre_instrument;
                    if (typeof genreInstrumentData === 'string') {
                        try {
                            genreInstrumentData = JSON.parse(genreInstrumentData);
                        } catch {
                            genreInstrumentData = [genreInstrumentData];
                        }
                    }
                    
                    if (!Array.isArray(genreInstrumentData)) return false;
                    
                    return genreInstrumentData.some((item: any) => {
                        if (typeof item === 'string') {
                            return item.toLowerCase().includes(genre.toLowerCase());
                        }
                        if (item && typeof item === 'object') {
                            const itemGenre = String(item.genre || '').toLowerCase();
                            return itemGenre === genre.toLowerCase();
                        }
                        return false;
                    });
                });
            }
            
            if (instrument && instrument !== 'any') {
                filteredData = filteredData.filter((profile: any) => {
                    let genreInstrumentData = profile.genre_instrument;
                    if (typeof genreInstrumentData === 'string') {
                        try {
                            genreInstrumentData = JSON.parse(genreInstrumentData);
                        } catch {
                            genreInstrumentData = [genreInstrumentData];
                        }
                    }
                    
                    if (!Array.isArray(genreInstrumentData)) return false;
                    
                    return genreInstrumentData.some((item: any) => {
                        if (typeof item === 'string') {
                            return item.toLowerCase().includes(instrument.toLowerCase());
                        }
                        if (item && typeof item === 'object') {
                            const itemInstrument = String(item.instrument || '').toLowerCase();
                            return itemInstrument === instrument.toLowerCase();
                        }
                        return false;
                    });
                });
            }
            
            if (category && category !== 'any') {
                filteredData = filteredData.filter((profile: any) => {
                    let genreInstrumentData = profile.genre_instrument;
                    if (typeof genreInstrumentData === 'string') {
                        try {
                            genreInstrumentData = JSON.parse(genreInstrumentData);
                        } catch {
                            genreInstrumentData = [genreInstrumentData];
                        }
                    }
                    
                    if (!Array.isArray(genreInstrumentData)) return false;
                    
                    return genreInstrumentData.some((item: any) => {
                        if (item && typeof item === 'object') {
                            const itemCategory = String(item.category || '').toLowerCase();
                            return itemCategory === category.toLowerCase();
                        }
                        return false;
                    });
                });
            }
            
            // Filter out current user if needed
            const finalFilteredMusicians = filteredData.filter((musician: any) => {
                return !currentUserEmail || musician.email !== currentUserEmail;
            });
            
            // Parse and normalize data
            const parsedMusicians = finalFilteredMusicians.map((musician: any) => ({
                ...musician,
                occupation: parseArrayField(musician.occupation),
                education: parseEducationField(musician.education),
                certificates: parseArrayField(musician.certificates),
                genre_instrument: parseArrayField(musician.genre_instrument),
                video_links: parseArrayField(musician.video_links),
                social: parseSocialField(musician.social)
            }));
              // Apply sorting
            const sortedMusicians = applySorting(parsedMusicians, newFilters.sortBy);
            setMusicians(sortedMusicians);

            // Scroll to results after search completes
            scrollToResults();

        } catch (error) {
            console.error('Error in full tag search:', error);
            setMusicians([]);
        } finally {
            setLoading(false);
        }
    };

    // Search callback functions for ProfileQueryModal
    const handleGenreSearch = async (genre: string) => {        const newFilters = {
            genre: genre,
            instrument: 'any',
            category: 'any',
            nameSearch: '',
            sortBy: 'name_asc' // Set a default sorting
        };
        setFilters(newFilters);
        
        // Perform search immediately with the new filters
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
            
            // Apply genre filter
            const filteredData = (allProfiles || []).filter((profile: any) => {
                let genreInstrumentData = profile.genre_instrument;
                if (typeof genreInstrumentData === 'string') {
                    try {
                        genreInstrumentData = JSON.parse(genreInstrumentData);
                    } catch {
                        genreInstrumentData = [genreInstrumentData];
                    }
                }
                
                if (!Array.isArray(genreInstrumentData)) return false;
                
                return genreInstrumentData.some((item: any) => {
                    if (typeof item === 'string') {
                        return item.toLowerCase().includes(genre.toLowerCase());
                    }
                    if (item && typeof item === 'object') {
                        const itemGenre = String(item.genre || '').toLowerCase();
                        return itemGenre === genre.toLowerCase();
                    }
                    return false;
                });
            });
            
            // Filter out current user if needed
            const finalFilteredMusicians = filteredData.filter((musician: any) => {
                return !currentUserEmail || musician.email !== currentUserEmail;
            });
            
            // Parse and normalize data
            const parsedMusicians = finalFilteredMusicians.map((musician: any) => ({
                ...musician,
                occupation: parseArrayField(musician.occupation),
                education: parseEducationField(musician.education),
                certificates: parseArrayField(musician.certificates),
                genre_instrument: parseArrayField(musician.genre_instrument),
                video_links: parseArrayField(musician.video_links),
                social: parseSocialField(musician.social)
            }));
              // Apply sorting
            const sortedMusicians = applySorting(parsedMusicians, newFilters.sortBy);
            setMusicians(sortedMusicians);

            // Scroll to results after search completes
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
            sortBy: 'name_asc'
        };
        setFilters(newFilters);
        
        // Perform search immediately with the new filters
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
            
            // Apply instrument filter
            const filteredData = (allProfiles || []).filter((profile: any) => {
                let genreInstrumentData = profile.genre_instrument;
                if (typeof genreInstrumentData === 'string') {
                    try {
                        genreInstrumentData = JSON.parse(genreInstrumentData);
                    } catch {
                        genreInstrumentData = [genreInstrumentData];
                    }
                }
                
                if (!Array.isArray(genreInstrumentData)) return false;
                
                return genreInstrumentData.some((item: any) => {
                    if (typeof item === 'string') {
                        return item.toLowerCase().includes(instrument.toLowerCase());
                    }
                    if (item && typeof item === 'object') {
                        const itemInstrument = String(item.instrument || '').toLowerCase();
                        return itemInstrument === instrument.toLowerCase();
                    }
                    return false;                });
            });
            
            // Filter out current user if needed
            const finalFilteredMusicians = filteredData.filter((musician: any) => {
                return !currentUserEmail || musician.email !== currentUserEmail;
            });
            
            // Parse and normalize data
            const parsedMusicians = finalFilteredMusicians.map((musician: any) => ({
                ...musician,
                occupation: parseArrayField(musician.occupation),
                education: parseEducationField(musician.education),
                certificates: parseArrayField(musician.certificates),
                genre_instrument: parseArrayField(musician.genre_instrument),
                video_links: parseArrayField(musician.video_links),
                social: parseSocialField(musician.social)
            }));
              // Apply sorting
            const sortedMusicians = applySorting(parsedMusicians, newFilters.sortBy);
            setMusicians(sortedMusicians);

            // Scroll to results after search completes
            scrollToResults();

        } catch (error) {
            console.error('Error in instrument search:', error);
            setMusicians([]);
        } finally {
            setLoading(false);
        }};

    // Memoize instrumentsByCategory with ranking
    const instrumentsByCategory = useMemo(() => {
        return instruments.reduce((acc, instrument) => {
            const category = instrument.category || 'Other'; // Default to 'Other' if category is missing
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(instrument);
            return acc;
        }, {} as Record<string, Instrument[]>);
    }, [instruments]);

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
    }, [instrumentsByCategory, sortedCategories]);const getSocialIcon = (platform: string) => {
        if (!platform) return <ExternalLink className="h-4 w-4" />;
        
        // Use hard-coded SOCIAL_PLATFORMS instead of database socialPlatforms
        const dbPlatform = SOCIAL_PLATFORMS.find(p => 
            p.name && p.name.toLowerCase() === platform.toLowerCase()
        );
        
        // If found in platform list, use appropriate icon based on name
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
                case 'x':
                    return <Twitter className="h-4 w-4" />;
                case 'linkedin':
                    return <Linkedin className="h-4 w-4" />;
                case 'spotify':
                case 'soundcloud':
                    return <Music className="h-4 w-4" />;
                case 'website':
                case 'personal website':
                    return <Globe className="h-4 w-4" />;
                case 'tiktok':
                    return <Video className="h-4 w-4" />;
                default:
                    return <ExternalLink className="h-4 w-4" />;
            }
        }
        
        // Fallback: match against common platform names (case-insensitive)
        const platformLower = platform.toLowerCase();
        switch (platformLower) {
            case 'youtube':
                return <Youtube className="h-4 w-4" />;
            case 'instagram':
                return <Instagram className="h-4 w-4" />;
            case 'facebook':
                return <Facebook className="h-4 w-4" />;
            case 'twitter':
            case 'x':
                return <Twitter className="h-4 w-4" />;
            case 'linkedin':
                return <Linkedin className="h-4 w-4" />;
            case 'spotify':
            case 'soundcloud':
                return <Music className="h-4 w-4" />;
            case 'website':
            case 'personal website':
                return <Globe className="h-4 w-4" />;
            case 'tiktok':
                return <Video className="h-4 w-4" />;            default:
                return <ExternalLink className="h-4 w-4" />;
        }
    };

    const formatLocation = (location: unknown): string => {
        if (!location) return 'Location not specified';
        
        if (typeof location === 'object' && location !== null) {
            const locationObj = location as Record<string, unknown>;
            const city = locationObj.city || '';
            const country = locationObj.country || '';
            if (city && country) {
                return `${String(city)}, ${String(country)}`;
            }
            return String(city || country) || 'Location not specified';
        }
        
        return String(location);
    };

    return (
        <div className="space-y-6 p-3 sm:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Musician Database</h1>
                    <p className="text-muted-foreground">
                        Search and discover musicians by genre, instrument, and expertise.
                    </p>
                </div>
            </div>            {/* Search Filters */}
            <Card>
                <CardHeader>                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Filters
                    </CardTitle>
                    <CardDescription>
                        Find musicians by their skills and background
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Main filter row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">                        {/* Genre */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Genre</label>
                            <Select value={filters.genre} onValueChange={(value) => updateFilter('genre', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger><SelectContent>
                                    <SelectItem value="any">Any</SelectItem>
                                    {genres.map((genre) => (
                                        <SelectItem key={genre.id} value={genre.name}>
                                            {genre.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>                        {/* Instrument */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Instrument</label>
                            <Select value={filters.instrument} onValueChange={(value) => updateFilter('instrument', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>                                <SelectContent>
                                    <SelectItem value="any">Any</SelectItem>
                                    {sortedCategories.length > 0 ? (
                                        sortedCategories.map(category => (
                                            <SelectGroup key={category} label={category}>
                                                {sortedInstrumentsByCategory[category].map(instrument => (
                                                    <SelectItem key={instrument.id} value={instrument.name}>
                                                        {instrument.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        ))
                                    ) : (
                                        instruments.map(instrument => (
                                            <SelectItem key={instrument.id} value={instrument.name}>
                                                {instrument.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>                        {/* Type/Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger><SelectContent>
                                    <SelectItem value="any">Any</SelectItem>
                                    <SelectItem value="artist">Artist</SelectItem>
                                    <SelectItem value="teacher">Teacher</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>                        {/* Sort By */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Sort By <span className="text-red-500">*</span> <span className="text-xs text-red-500">(required)</span>
                            </label>
                            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                                <SelectTrigger className={!filters.sortBy ? "bg-red-50 border-red-200" : ""}>
                                    <SelectValue placeholder="Select sorting" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>                    {/* Name search row */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Search by Name</label>
                        <Input
                            placeholder="Enter name to search..."
                            value={filters.nameSearch}
                            onChange={(e) => updateFilter('nameSearch', e.target.value)}
                            className="max-w-md"
                        />
                    </div>                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <Button 
                            onClick={searchMusicians} 
                            disabled={!canSearch || loading}
                            variant="teal"
                            className="flex items-center gap-2 text-white"
                        >
                            <Search className="h-4 w-4" />
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                        <Button 
                            variant="delete"
                            onClick={clearFilters}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>            {/* Results */}
            {hasSearched && (
                <Card ref={resultsRef}>
                    <CardHeader>
                        <CardTitle>Search Results</CardTitle>
                        <CardDescription>
                            {musicians.length} musician{musicians.length !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>                    <CardContent>
                        {musicians.length > 0 ? (                            <div className="dynamic-masonry">
                                {musicians.map((musician) => (
                                    <div key={musician.id} className="masonry-item">
                                        <Card className="musician-card break-inside-avoid shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-gray-50 border-0 ring-1 ring-gray-200 hover:ring-teal-300 overflow-hidden"><CardHeader className="pb-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-t-lg">                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    forename={musician.forename}
                                                    surname={musician.surname}
                                                    size="md"
                                                    onClick={() => openProfileModal(musician)}
                                                    title="View full profile"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <button 
                                                        className="text-left w-full"
                                                        onClick={() => openProfileModal(musician)}
                                                        title="View full profile"
                                                    >                                                        <CardTitle className="text-lg truncate hover:text-teal-600 transition-colors cursor-pointer font-semibold text-gray-800">
                                                            {musician.forename || musician.surname 
                                                                ? `${musician.forename || ''} ${musician.surname || ''}`.trim() 
                                                                : 'Anonymous'}
                                                        </CardTitle>                                                    </button>                                                    <CardDescription className="truncate text-gray-500 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {formatLocation(musician.location)}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>                                        <CardContent className="pt-0 space-y-4 p-4">                                            {/* Skills Section */}
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                <h4 className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                                    <Music className="h-4 w-4 text-teal-600" />
                                                    Skills & Instruments
                                                </h4>                                                <div className="flex flex-wrap gap-1.5">                                                    {musician.genre_instrument && musician.genre_instrument.length > 0 ? (
                                                        musician.genre_instrument.map((item, index) => {
                                                            let displayText: string;
                                                            let genre: string = '';
                                                            let instrument: string = '';
                                                            
                                                            if (typeof item === 'string') {
                                                                displayText = item;
                                                                // Try to parse genre/instrument from string format
                                                                const parts = displayText.split(' ');
                                                                if (parts.length >= 2) {
                                                                    genre = parts[0];
                                                                    instrument = parts.slice(1).join(' ');
                                                                }
                                                            } else if (item && typeof item === 'object') {
                                                                const itemObj = item as Record<string, unknown>;
                                                                genre = String(itemObj.genre || '');
                                                                instrument = String(itemObj.instrument || '');
                                                                const category = itemObj.category ? ` (${String(itemObj.category)})` : '';
                                                                displayText = `${genre} ${instrument}${category}`.trim();
                                                            } else {
                                                                displayText = String(item || '');
                                                            }                                                            return (
                                                                <Badge 
                                                                    key={index} 
                                                                    variant="secondary" 
                                                                    className="text-xs cursor-pointer hover:bg-teal-100 hover:text-teal-800 transition-all duration-200 transform hover:scale-105 bg-white border border-gray-200 text-gray-700 font-medium"
                                                                    onClick={() => {
                                                                        // Extract category from displayText if it's in parentheses
                                                                        let category = '';
                                                                        if (item && typeof item === 'object') {
                                                                            const itemObj = item as Record<string, unknown>;
                                                                            category = String(itemObj.category || '');
                                                                        }
                                                                        
                                                                        // Use full tag search for complete data
                                                                        if (genre && instrument) {
                                                                            handleFullTagSearch(genre, instrument, category);
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
                                                        })                                                    ) : (
                                                        <span className="text-sm text-gray-400 italic bg-gray-100 px-3 py-1 rounded-full">No skills listed</span>
                                                    )}
                                                </div>
                                            </div>                                            {/* Occupation */}
                                            {musician.occupation && musician.occupation.length > 0 && musician.occupation.filter(occ => occ && occ.trim()).length > 0 && (
                                                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                                                    <h4 className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                                        <Briefcase className="h-4 w-4 text-red-600" />
                                                        Current Occupation
                                                    </h4>
                                                    <div className="text-sm text-gray-600 font-medium">
                                                        {musician.occupation.filter(occ => occ && occ.trim()).join(', ')}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Education */}
                                            {musician.education && musician.education.length > 0 && (
                                                <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                                                    <h4 className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                                        <BookOpen className="h-4 w-4 text-purple-600" />
                                                        Education
                                                    </h4>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        {musician.education.slice(0, 2).map((edu, index) => (
                                                            <div key={index}>{edu}</div>
                                                        ))}
                                                        {musician.education.length > 2 && (
                                                            <div className="text-xs">+{musician.education.length - 2} more</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}                                            {/* Contact & Links */}
                                            <div className="flex items-center gap-2 pt-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-transparent p-3 rounded-b-lg -mx-4 -mb-4 mt-4">                                                {/* Email */}
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
                                                )}{/* Video links */}
                                                {musician.video_links && musician.video_links.length > 0 && (
                                                    musician.video_links.slice(0, 5).map((link, index) => (
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
                                                    ))
                                                )}                                                {/* Social links */}
                                                {musician.social && (
                                                    Array.isArray(musician.social)
                                                        ? musician.social.map((item, idx) => {
                                                            if (!item || typeof item !== 'object') return null;
                                                            const platform = item.platform || item.name || '';
                                                            const url = item.link || item.url || '';
                                                            if (!platform || !url) return null;
                                                            return (                                                                    <Button
                                                                        key={platform + idx}
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        asChild
                                                                        className="h-8 w-8 hover:bg-purple-100 hover:text-purple-600 transition-all duration-200"
                                                                    >
                                                                    <a
                                                                        href={url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        title={`${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${url}`}
                                                                    >
                                                                        {getSocialIcon(platform)}
                                                                    </a>
                                                                </Button>
                                                            );
                                                        })
                                                        : typeof musician.social === 'object'
                                                            ? Object.entries(musician.social).map(([platform, url]) => {
                                                                if (!url || url === '') return null;
                                                                return (                                                                    <Button
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
                                                            : null
                                                )}
                                            </div>                                                        </CardContent>
                                                    </Card>
                                                </div>
                                ))}
                            </div>) : (
                            <div className="text-center py-12 px-6">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 shadow-sm">
                                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg font-medium mb-2">No musicians found</p>
                                    <p className="text-gray-400 text-sm">Try adjusting your search criteria or clear filters to see more results.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>            )}              {/* Profile Query Modal */}            <ProfileQueryModal 
                isOpen={isProfileModalOpen}
                onClose={closeProfileModal}
                musician={selectedMusician}
                isLoading={profileLoading}
                error={profileError}
                onGenreSearch={handleGenreSearch}
                onInstrumentSearch={handleInstrumentSearch}
                onFullTagSearch={handleFullTagSearch}
            />
        </div>
    );
}