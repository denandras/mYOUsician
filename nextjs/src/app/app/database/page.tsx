'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Trash2, Mail, Phone, Video, ExternalLink, User, BookOpen } from "lucide-react";
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

interface MusicianProfile {
    id: string;
    email: string | null;
    forename: string | null;
    surname: string | null;
    location?: any;
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
}

export default function DatabasePage() {
    // State for data
    const [musicians, setMusicians] = useState<MusicianProfile[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [educationTypes, setEducationTypes] = useState<Education[]>([]);
    
    // State for filters
    const [filters, setFilters] = useState<SearchFilters>({
        genre: '',
        instrument: '',
        category: '',
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
    }, []);

    // Log when instruments or genres change
    useEffect(() => {
        console.log('Instruments updated:', instruments);
        console.log('Genres updated:', genres);
        console.log('Instruments by category:', instrumentsByCategory);
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
                    return;
                }
            }

            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();            
            // Load all reference data in parallel
            const [instrumentsRes, genresRes, educationRes] = await Promise.all([
                client.from('instruments').select('*').order('category', { ascending: true }).order('name'),
                client.from('genres').select('*').order('name'),
                client.from('education').select('*').order('rank', { ascending: false })
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

            console.log('Instruments response:', instrumentsRes);
            console.log('Genres response:', genresRes);
            console.log('Education response:', educationRes);
            
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
            }));
        } catch (error) {
            console.error('Error loading reference data:', error);
            // Reset to empty arrays if there's an error
            setGenres([]);
            setInstruments([]);
            setEducationTypes([]);
        }
    };    const searchMusicians = async () => {
        if (!filters.genre || !filters.sortBy) {
            return;
        }

        setLoading(true);
        setHasSearched(true);

        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();

            // Try musician_profiles table first
            let query = client
                .from('musician_profiles')
                .select('*');

            // Filter by genre and instrument (if provided)
            if (filters.genre) {
                // If both genre and instrument are selected
                if (filters.instrument) {
                    let searchString = `${filters.genre} ${filters.instrument}`;
                    if (filters.category) {
                        searchString += ` (${filters.category})`;
                    }
                    query = query.contains('genre_instrument', [searchString]);
                } else {
                    // If only genre is selected, search for genre anywhere in genre_instrument
                    query = query.contains('genre_instrument', [filters.genre]);
                }
            }

            const { data, error } = await query;
            
            if (error) {
                console.error('Error searching musician_profiles:', error);
                setMusicians([]);
                setLoading(false);
                return;
            }

            // Helper function to properly parse array fields - same as user-settings
            const parseArrayField = (field: unknown): string[] => {
                if (!field) return [];
                
                // If it's already an array
                if (Array.isArray(field)) {
                    // Check if first element is a stringified array
                    if (field.length === 1 && typeof field[0] === 'string') {
                        try {
                            const parsed = JSON.parse(field[0]);
                            if (Array.isArray(parsed)) {
                                return parsed.length > 0 ? parsed : [];
                            }
                        } catch {
                            // If parsing fails, treat as regular string
                            return field[0] ? [field[0]] : [];
                        }
                    }
                    return field.length > 0 ? field : [];
                }
                
                // If it's a string, try to parse it
                if (typeof field === 'string') {
                    try {
                        const parsed = JSON.parse(field);
                        if (Array.isArray(parsed)) {
                            return parsed.length > 0 ? parsed : [];
                        }
                        return field ? [field] : [];
                    } catch {
                        return field ? [field] : [];
                    }
                }
                
                return [];
            };

            let filteredMusicians = (data || []).filter(musician => 
                musician.email !== currentUserEmail
            );

            // Apply name search filter
            if (filters.nameSearch.trim()) {
                const searchTerm = filters.nameSearch.toLowerCase().trim();
                filteredMusicians = filteredMusicians.filter(musician => {
                    const fullName = `${musician.forename || ''} ${musician.surname || ''}`.toLowerCase();
                    return fullName.includes(searchTerm);
                });
            }

            // Parse and sort results
            const parsedMusicians = filteredMusicians.map(musician => {
                // Handle social field properly
                const socialData = typeof musician.social === 'object' && musician.social !== null && !Array.isArray(musician.social) 
                    ? musician.social
                    : parseSocialField(musician.social);

                return {
                    ...musician,
                    education: parseEducationField(musician.education),
                    social: socialData,
                    video_links: parseArrayField(musician.video_links),
                    occupation: parseArrayField(musician.occupation),
                    certificates: parseArrayField(musician.certificates),
                    genre_instrument: Array.isArray(musician.genre_instrument) 
                        ? musician.genre_instrument 
                        : []
                };
            }) as MusicianProfile[];

            // Apply sorting
            const sortedMusicians = applySorting(parsedMusicians, filters.sortBy);
            setMusicians(sortedMusicians);

        } catch (error) {
            console.error('Error searching musicians:', error);
            setMusicians([]);
        } finally {
            setLoading(false);
        }
    };// Parse education field with multiple format support
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
    };

    const clearFilters = () => {
        setFilters({
            genre: '',
            instrument: '',
            category: '',
            nameSearch: '',
            sortBy: ''
        });
        setMusicians([]);
        setHasSearched(false);
    };

    const updateFilter = (key: keyof SearchFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (hasSearched) {
            setHasSearched(false); // Reset search state when filters change
        }
    };

    const canSearch = filters.genre && filters.sortBy;  // Only require genre and sorting to be selected    // Memoize instrumentsByCategory
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

    const getSocialIcon = (platform: string) => {
        const platformLower = platform.toLowerCase();
        switch (platformLower) {
            case 'instagram':
            case 'facebook':
            case 'twitter':
            case 'x':
            case 'linkedin':
            case 'tiktok':
                return <ExternalLink className="h-4 w-4" />;
            default:
                return <ExternalLink className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6 p-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Genre */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Genre</label>
                            <Select value={filters.genre} onValueChange={(value) => updateFilter('genre', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select genre" />
                                </SelectTrigger>
                                <SelectContent>
                                    {genres.map((genre) => (
                                        <SelectItem key={genre.id} value={genre.name}>
                                            {genre.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Instrument */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Instrument</label>
                            <Select value={filters.instrument} onValueChange={(value) => updateFilter('instrument', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select instrument" />
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
                                        instruments.map(instrument => (
                                            <SelectItem key={instrument.id} value={instrument.name}>
                                                {instrument.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Type/Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Any</SelectItem>
                                    <SelectItem value="artist">Artist</SelectItem>
                                    <SelectItem value="teacher">Teacher</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort By */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sort By</label>
                            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                                <SelectTrigger>
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
                    </div>

                    {/* Name search row */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Search by Name</label>
                        <Input
                            placeholder="Enter name to search..."
                            value={filters.nameSearch}
                            onChange={(e) => updateFilter('nameSearch', e.target.value)}
                            className="max-w-md"
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <Button 
                            onClick={searchMusicians} 
                            disabled={!canSearch || loading}
                            className="flex items-center gap-2"
                        >
                            <Search className="h-4 w-4" />
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                        <Button 
                            variant="outline" 
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
                                                <div className="flex flex-wrap gap-1">
                                                    {musician.genre_instrument && musician.genre_instrument.length > 0 ? (
                                                        musician.genre_instrument.map((item, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                {typeof item === 'string' ? item : `${item.genre || ''} ${item.instrument || ''}`.trim()}
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
                                                    <h4 className="text-sm font-medium mb-2">Current Roles</h4>
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
                                            <div className="flex items-center gap-2 pt-2 border-t">
                                                {/* Email */}
                                                {musician.email && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        className="h-8 w-8"
                                                    >
                                                        <a href={`mailto:${musician.email}`} title="Send email">
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
                                                        <a href={`tel:${musician.phone}`} title="Call">
                                                            <Phone className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}

                                                {/* Video links */}
                                                {musician.video_links && musician.video_links.length > 0 && (
                                                    musician.video_links.slice(0, 2).map((link, index) => (
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
                                                {musician.social && musician.social.length > 0 && (
                                                    musician.social.slice(0, 3).map((social: any, index: number) => (
                                                        <Button
                                                            key={index}
                                                            variant="ghost"
                                                            size="icon"
                                                            asChild
                                                            className="h-8 w-8"
                                                        >
                                                            <a 
                                                                href={social.link || social.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                title={social.platform || 'Social link'}
                                                            >
                                                                {getSocialIcon(social.platform || '')}
                                                            </a>
                                                        </Button>
                                                    ))
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