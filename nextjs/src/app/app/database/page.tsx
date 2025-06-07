/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Trash2, Mail, Phone, Video, ExternalLink, User, BookOpen, Youtube, Instagram, Facebook, Twitter, Linkedin, Music, Globe } from "lucide-react";
import { createSPASassClient } from '@/lib/supabase/client';

// Local Badge component to avoid import issues
const Badge = ({ children, variant = "default", className = "" }: { 
  children: React.ReactNode; 
  variant?: "default" | "secondary" | "destructive" | "outline"; 
  className?: string;
}) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variantClasses = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border-transparent bg-gray-200 text-gray-800 hover:bg-gray-300",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50"
  };
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();
  return <div className={combinedClasses}>{children}</div>;
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
    name_HUN: string | null;
    category_HUN: string | null;
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
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [educationTypes, setEducationTypes] = useState<Education[]>([]);
    const [socialPlatforms, setSocialPlatforms] = useState<any[]>([]);

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
    const [currentUserEmail, setCurrentUserEmail] = useState('');

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
    }, []);    // Log when instruments or genres change
    useEffect(() => {
        console.log('Instruments updated:', instruments);
        console.log('Genres updated:', genres);
        // instrumentsByCategory will be logged separately when it changes
    }, [instruments, genres]);

    const loadCurrentUser = async () => {
        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();
            const { data: { user } } = await client.auth.getUser();
            setCurrentUserEmail(user?.email || '');
        } catch (error) {
            console.error('Error loading current user:', error);
        }
    };    
    const loadReferenceData = async () => {
        try {
            // Check localStorage first for cached reference data
            const cacheKey = 'musician_reference_data';
            const cached = localStorage.getItem(cacheKey);
              if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                // Use cached data if less than 24 hours old
                if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                    setGenres(data.genres || []);
                    setInstruments(data.instruments || []);
                    setEducationTypes(data.education_types || []);
                    setSocialPlatforms(data.social_platforms || []);
                    return;
                }
            }

            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();              // Load all reference data in parallel
            const [instrumentsRes, genresRes, educationRes, socialRes] = await Promise.all([
                client.from('instruments').select('*').order('category', { ascending: true }).order('name'),
                client.from('genres').select('*').order('name'),
                client.from('education').select('*').order('rank', { ascending: false }),
                client.from('social').select('*').order('name')
            ]);
              // Add detailed error logging for database responses
            if (instrumentsRes.error) {
                console.error('Instruments DB error:', instrumentsRes.error);
            }
            if (genresRes.error) {
                console.error('Genres DB error:', genresRes.error);
            }
            if (educationRes.error) {
                console.error('Education DB error:', educationRes.error);
            }
            if (socialRes.error) {
                console.error('Social platforms DB error:', socialRes.error);
            }

            console.log('Instruments response:', instrumentsRes);
            console.log('Genres response:', genresRes);
            console.log('Education response:', educationRes);
            console.log('Social platforms response:', socialRes);
            
            // Set state with response data
            setInstruments(instrumentsRes.data || []);
            setGenres(genresRes.data || []);
            setEducationTypes(educationRes.data || []);
            setSocialPlatforms(socialRes.data || []);
              // Cache the reference data
            localStorage.setItem(cacheKey, JSON.stringify({
                data: {
                    instruments: instrumentsRes.data || [],
                    genres: genresRes.data || [],
                    education_types: educationRes.data || [],
                    social_platforms: socialRes.data || []
                },
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Error loading reference data:', error);
            // Reset to empty arrays if there's an error
            setGenres([]);
            setInstruments([]);
            setEducationTypes([]);
            setSocialPlatforms([]);
        }
    };    const searchMusicians = async () => {
        // Only require sortBy to be selected, genre can be "Any"
        if (!filters.sortBy) {
            return;
        }

        setLoading(true);
        setHasSearched(true);
        
        console.log('=== SIMPLIFIED DATABASE SEARCH ===');
        console.log('Starting search with filters:', filters);

        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();
            
            // Only query musician_profiles table (no users table fallback)
            console.log('Querying musician_profiles table...');
            
            const { data: allProfiles, error: profilesError } = await client
                .from('musician_profiles')
                .select('*');
            
            console.log('musician_profiles query result:', {
                dataLength: allProfiles?.length || 0,
                error: profilesError,
                errorDetails: profilesError ? {
                    message: (profilesError as any)?.message,
                    details: (profilesError as any)?.details,
                    hint: (profilesError as any)?.hint,
                    code: (profilesError as any)?.code
                } : null,
                sampleData: allProfiles?.slice(0, 2) // First 2 records for debugging
            });
            
            if (profilesError) {
                console.error('Error querying musician_profiles:', profilesError);
                setMusicians([]);
                setLoading(false);
                return;
            }
              console.log('Successfully retrieved all profiles, now filtering...');            // Filter in JavaScript to avoid complex SQL queries
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
                    
                    return true;
                });
            });
              console.log(`Filtered ${filteredData.length} profiles matching genre criteria`);
              // Debug the filtering steps
            console.log('Current user email:', currentUserEmail);
            console.log('Profile emails:', filteredData.map(m => m.email));
              // Filter out current user (but only if we have a current user email and includeCurrentUser is false)
            let finalFilteredMusicians = filteredData.filter((musician: any) => {
                // If includeCurrentUser is true, don't filter out any profiles
                if (filters.includeCurrentUser) {
                    console.log(`Including current user due to debug flag`);
                    return true;
                }
                
                // If no current user email, don't filter out any profiles
                if (!currentUserEmail) {
                    console.log(`No current user email set, keeping all profiles`);
                    return true;
                }
                
                const isCurrentUser = musician.email === currentUserEmail;
                console.log(`Profile ${musician.email} is current user: ${isCurrentUser}`);
                return !isCurrentUser;
            });

            console.log(`After removing current user: ${finalFilteredMusicians.length} musicians`);

            // Apply name search filter
            if (filters.nameSearch.trim()) {
                const searchTerm = filters.nameSearch.toLowerCase().trim();
                finalFilteredMusicians = finalFilteredMusicians.filter((musician: any) => {
                    const fullName = `${musician.forename || ''} ${musician.surname || ''}`.toLowerCase();
                    return fullName.includes(searchTerm);
                });
                console.log(`After name search filter: ${finalFilteredMusicians.length} musicians`);
            }

            console.log(`Final result: ${finalFilteredMusicians.length} musicians`);

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
            });

            // Apply sorting
            const sortedMusicians = applySorting(parsedMusicians, filters.sortBy);
            setMusicians(sortedMusicians);

        } catch (error) {
            console.error('Error searching musicians:', error);
            setMusicians([]);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to parse array fields properly
    const parseArrayField = (field: unknown): string[] => {
        if (!field) return [];
        
        // If it's already an array
        if (Array.isArray(field)) {
            // Check if first element is a stringified array
            if (field.length === 1 && typeof field[0] === 'string') {
                try {
                    const parsed = JSON.parse(field[0]);
                    if (Array.isArray(parsed)) {
                        return parsed.length > 0 ? parsed.filter(Boolean) : [];
                    }
                } catch {
                    // If parsing fails, treat as regular string
                    return field[0] ? [field[0]] : [];
                }
            }
            return field.filter(Boolean);
        }
        
        // If it's a string, try to parse it
        if (typeof field === 'string') {
            try {
                const parsed = JSON.parse(field);
                if (Array.isArray(parsed)) {
                    return parsed.filter(Boolean);
                }
                return field ? [field] : [];
            } catch {
                return field ? [field] : [];
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

    const canSearch = filters.sortBy;  // Only require sorting to be selected, genre can be "Any"    // Memoize instrumentsByCategory
    const instrumentsByCategory = useMemo(() => {
        return instruments.reduce((acc, instrument) => {
            const category = instrument.category || 'Other'; // Default to 'Other' if category is missing
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(instrument);
            return acc;
        }, {} as Record<string, Instrument[]>);
    }, [instruments]);    const getSocialIcon = (platform: string) => {
        if (!platform) return <ExternalLink className="h-4 w-4" />;
        
        // First, try to match against platforms from the database
        const dbPlatform = socialPlatforms.find(p => 
            p.name && p.name.toLowerCase() === platform.toLowerCase()
        );
        
        // If found in database, use appropriate icon based on name
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
                return <Video className="h-4 w-4" />;
            default:
                return <ExternalLink className="h-4 w-4" />;
        }
    };    return (
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
                                </SelectTrigger><SelectContent>
                                    <SelectItem value="any">Any</SelectItem>
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
                            <label className="text-sm font-medium flex items-center gap-1">
                                Sort By
                                <span className="text-red-500">*</span>
                                <span className="text-xs text-red-500">(required)</span>
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
            </Card>

            {/* Results */}
            {hasSearched && (
                <Card>
                    <CardHeader>
                        <CardTitle>Search Results</CardTitle>
                        <CardDescription>
                            {musicians.length} musician{musicians.length !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {musicians.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {musicians.map((musician) => (
                                    <Card key={musician.id} className="h-fit">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-lg truncate">
                                                        {musician.forename || musician.surname 
                                                            ? `${musician.forename || ''} ${musician.surname || ''}`.trim() 
                                                            : 'Anonymous'}
                                                    </CardTitle>
                                                    <CardDescription className="truncate">
                                                        {musician.bio || 'No bio available'}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0 space-y-4">
                                            {/* Skills Section */}
                                            <div>
                                                <h4 className="text-sm font-medium mb-2">Skills & Instruments</h4>
                                                <div className="flex flex-wrap gap-1">                                                    {musician.genre_instrument && musician.genre_instrument.length > 0 ? (
                                                        musician.genre_instrument.map((item, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                {typeof item === 'string' 
                                                                    ? item 
                                                                    : `${item.genre || ''} ${item.instrument || ''}${item.category ? ` (${item.category})` : ''}`.trim()
                                                                }
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No skills listed</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Occupation */}
                                            {musician.occupation && musician.occupation.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2">Current Occupation</h4>
                                                    <div className="text-sm text-muted-foreground">
                                                        {musician.occupation.join(', ')}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Education */}
                                            {musician.education && musician.education.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                                                        <BookOpen className="h-4 w-4" />
                                                        Education
                                                    </h4>
                                                    <div className="text-sm text-muted-foreground">
                                                        {musician.education.slice(0, 2).map((edu, index) => (
                                                            <div key={index}>{edu}</div>
                                                        ))}
                                                        {musician.education.length > 2 && (
                                                            <div className="text-xs">+{musician.education.length - 2} more</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Contact & Links */}
                                            <div className="flex items-center gap-2 pt-2 border-t">                                                {/* Email */}
                                                {musician.email && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        className="h-8 w-8"
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
                                                        className="h-8 w-8"
                                                    >
                                                        <a href={`tel:${musician.phone}`} title={`Phone: ${musician.phone}`}>
                                                            <Phone className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}                                                {/* Video links */}
                                                {musician.video_links && musician.video_links.length > 0 && (
                                                    musician.video_links.slice(0, 5).map((link, index) => (
                                                        <Button
                                                            key={index}
                                                            variant="ghost"
                                                            size="icon"
                                                            asChild
                                                            className="h-8 w-8"
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
                                                {musician.social && typeof musician.social === 'object' && (
                                                    Object.entries(musician.social).map(([platform, url]) => {
                                                        // Skip empty values
                                                        if (!url || url === '') return null;
                                                        
                                                        return (
                                                            <Button
                                                                key={platform}
                                                                variant="ghost"
                                                                size="icon"
                                                                asChild
                                                                className="h-8 w-8"
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
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No musicians found matching your criteria.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}