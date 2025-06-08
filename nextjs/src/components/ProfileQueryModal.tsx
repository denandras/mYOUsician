"use client";
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Video, ExternalLink, User, BookOpen, MapPin, Award, Briefcase, Youtube, Instagram, Facebook, Twitter, Linkedin, Music, Globe, AlertCircle, Loader2, Search } from 'lucide-react';

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
    genre_instrument: Record<string, unknown>[] | null;
    video_links: string[] | null;
    social: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

interface ProfileQueryModalProps {
    isOpen: boolean;
    onClose: () => void;
    musician: MusicianProfile | null;
    isLoading?: boolean;
    error?: string | null;
    onGenreSearch?: (genre: string) => void;
    onInstrumentSearch?: (instrument: string) => void;
    onFullTagSearch?: (genre: string, instrument: string, category: string) => void;
}

export function ProfileQueryModal({ isOpen, onClose, musician, isLoading = false, error = null, onGenreSearch, onInstrumentSearch, onFullTagSearch }: ProfileQueryModalProps) {
    // Loading state
    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md w-[96vw] sm:w-[90vw] p-4 sm:p-6">
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <h3 className="text-lg font-semibold">Loading Profile...</h3>                        <p className="text-sm text-muted-foreground text-center">
                            Please wait while we fetch the musician&apos;s information.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Error state
    if (error || !musician) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md w-[96vw] sm:w-[90vw] p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl text-destructive flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Profile Error
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="text-center space-y-4 py-4">
                            <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-destructive" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-destructive">
                                    {error ? 'Failed to Load Profile' : 'Profile Not Found'}
                                </h3>                                <p className="text-sm text-muted-foreground">
                                    {error || "This musician&apos;s profile could not be found or may have been removed."}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Please try again later or contact support if the issue persists.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <Button onClick={onClose} variant="outline" className="flex-1">
                                    Close
                                </Button>
                                <Button 
                                    onClick={() => window.location.reload()} 
                                    variant="default" 
                                    size="sm"
                                    className="flex-1"
                                >
                                    Refresh Page
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Check if this is an incomplete profile (additional data validation)
    const hasMinimalData = musician.forename || musician.surname || musician.bio || 
                          (musician.genre_instrument && musician.genre_instrument.length > 0) ||
                          (musician.occupation && musician.occupation.length > 0);

    if (!hasMinimalData) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md w-[96vw] sm:w-[90vw] p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl text-amber-600 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Incomplete Profile
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="text-center space-y-4 py-4">
                            <div className="h-16 w-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                                <User className="h-8 w-8 text-amber-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-amber-600">Profile Incomplete</h3>                                <p className="text-sm text-muted-foreground">
                                    This musician hasn&apos;t completed their profile yet. Only basic account information is available.
                                </p>
                                {musician.email && (
                                    <div className="bg-muted p-3 rounded-md mt-4">
                                        <p className="text-sm font-medium">Contact Information:</p>
                                        <p className="text-sm text-muted-foreground">{musician.email}</p>
                                        {musician.phone && (
                                            <p className="text-sm text-muted-foreground">{musician.phone}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <Button onClick={onClose} variant="outline" className="w-full">
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const getSocialIcon = (platform: string) => {
        if (!platform) return <ExternalLink className="h-5 w-5" />;
        
        const platformLower = platform.toLowerCase();
        switch (platformLower) {
            case 'youtube':
                return <Youtube className="h-5 w-5" />;
            case 'instagram':
                return <Instagram className="h-5 w-5" />;
            case 'facebook':
                return <Facebook className="h-5 w-5" />;
            case 'twitter':
            case 'x':
                return <Twitter className="h-5 w-5" />;
            case 'linkedin':
                return <Linkedin className="h-5 w-5" />;
            case 'spotify':
            case 'soundcloud':
                return <Music className="h-5 w-5" />;
            case 'website':
            case 'personal website':
                return <Globe className="h-5 w-5" />;
            case 'tiktok':
                return <Video className="h-5 w-5" />;
            default:
                return <ExternalLink className="h-5 w-5" />;
        }
    };    const formatLocation = (location: unknown): string => {
        if (!location) return 'Not specified';
        
        if (typeof location === 'object' && location !== null) {
            const locationObj = location as Record<string, unknown>;
            const city = locationObj.city || '';
            const country = locationObj.country || '';
            if (city && country) {
                return `${String(city)}, ${String(country)}`;
            }
            return String(city || country) || 'Not specified';
        }
        
        return String(location);
    };const fullName = musician.forename || musician.surname 
        ? `${musician.forename || ''} ${musician.surname || ''}`.trim() 
        : 'Anonymous Musician';    return (        <Dialog open={isOpen} onOpenChange={onClose}>            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden w-[98vw] xs:w-[95vw] sm:w-[95vw] md:w-[90vw] lg:w-[85vw] p-0 flex flex-col">
                <DialogHeader className="px-3 py-3 xs:px-4 xs:py-4 sm:px-4 sm:py-4 md:px-6 md:py-4 flex-shrink-0">
                    <DialogTitle className="sr-only">
                        {fullName} - Musician Profile
                    </DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 px-3 pb-3 xs:px-4 xs:pb-4 sm:px-4 sm:pb-4 md:px-6 md:pb-6">
                    <div className="space-y-4 xs:space-y-5 sm:space-y-6 pt-2 md:pt-4">
                    {/* Header Section */}
                    <Card>
                        <CardContent className="pt-4 xs:pt-5 sm:pt-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 xs:gap-4 sm:gap-4 mb-4">
                                <div className="h-10 w-10 xs:h-12 xs:w-12 sm:h-12 sm:w-12 md:h-16 md:w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <User className="h-5 w-5 xs:h-6 xs:w-6 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold break-words">{fullName}</h1>
                                    {musician.bio && (
                                        <p className="text-sm xs:text-base sm:text-base md:text-lg text-muted-foreground mt-1 break-words">{musician.bio}</p>
                                    )}
                                </div>
                            </div>                              {/* Contact Information Row */}
                            <div className="flex flex-col gap-3 pt-4 border-t">
                                {(() => {
                                    const location = formatLocation(musician.location);
                                    return location && location !== 'Not specified' ? (
                                        <div className="flex items-center justify-center sm:justify-start gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            <span className="break-words">{location}</span>
                                        </div>
                                    ) : null;
                                })()}
                                
                                {(musician.email || musician.phone) && (
                                    <div className="flex flex-col sm:flex-row gap-2 w-full justify-center sm:justify-start">
                                        {musician.email && (
                                            <Button size="sm" asChild className="w-full sm:w-auto sm:min-w-[120px] sm:max-w-[160px] lg:max-w-[140px] bg-[#083e4d] hover:bg-[#0a4a59] text-white border-[#083e4d]">
                                                <a href={`mailto:${musician.email}`} className="flex items-center gap-2 justify-center">
                                                    <Mail className="h-4 w-4" />
                                                    <span className="truncate">Email</span>
                                                </a>
                                            </Button>
                                        )}
                                        
                                        {musician.phone && (
                                            <Button size="sm" asChild className="w-full sm:w-auto sm:min-w-[120px] sm:max-w-[160px] lg:max-w-[140px] bg-[#e62745] hover:bg-[#d1233e] text-white border-[#e62745]">
                                                <a href={`tel:${musician.phone}`} className="flex items-center gap-2 justify-center">
                                                    <Phone className="h-4 w-4" />
                                                    <span className="truncate">Call</span>
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                        {/* Left Column */}
                        <div className="space-y-3 sm:space-y-4 md:space-y-6">
                            {/* Skills & Instruments */}
                            <Card>
                                <CardContent className="pt-3 sm:pt-4 md:pt-6">
                                    <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
                                        <Music className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                                        <span className="break-words">Skills & Instruments</span>
                                    </h2>
                                    {musician.genre_instrument && musician.genre_instrument.length > 0 ? (
                                        <div className="flex flex-wrap gap-1 sm:gap-2">
                                            {musician.genre_instrument.map((item, index) => {
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
                                                    }                                                } else if (item && typeof item === 'object') {
                                                    const itemObj = item as Record<string, unknown>;
                                                    genre = String(itemObj.genre || '');
                                                    instrument = String(itemObj.instrument || '');
                                                    const category = itemObj.category ? ` (${String(itemObj.category)})` : '';
                                                    displayText = `${genre} ${instrument}${category}`.trim();
                                                } else {
                                                    displayText = String(item || '');
                                                }
                                                
                                                return (                                                    <Badge 
                                                        key={index} 
                                                        variant="secondary" 
                                                        className="text-xs sm:text-sm break-words cursor-pointer hover:bg-accent transition-colors duration-200"                                                        onClick={() => {
                                                            // Extract category from item object for search
                                                            let category = '';
                                                            if (item && typeof item === 'object') {
                                                                const itemObj = item as Record<string, unknown>;
                                                                category = String(itemObj.category || '');
                                                            }
                                                            
                                                            // Use full tag search if we have both genre and instrument
                                                            if (genre && instrument && onFullTagSearch) {
                                                                onFullTagSearch(genre, instrument, category);
                                                                onClose();
                                                            } else if (genre && onGenreSearch) {
                                                                onGenreSearch(genre);
                                                                onClose();
                                                            } else if (instrument && onInstrumentSearch) {
                                                                onInstrumentSearch(instrument);
                                                                onClose();
                                                            }
                                                        }}
                                                    >
                                                        {displayText}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No skills listed</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Certificates */}
                            {musician.certificates && musician.certificates.length > 0 && (
                                <Card>
                                    <CardContent className="pt-3 sm:pt-4 md:pt-6">
                                        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
                                            <Award className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                                            <span className="break-words">Certificates & Awards</span>
                                        </h2>                        <div className="space-y-2">
                            {musician.certificates.map((cert, index) => (
                                <div key={index} className="text-xs sm:text-sm border border-input bg-background p-2 md:p-3 rounded-md break-words hover:bg-accent/50 transition-colors">
                                    {cert}
                                </div>
                            ))}
                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>                        {/* Right Column */}
                        <div className="space-y-3 sm:space-y-4 md:space-y-6">
                            {/* Education */}
                            {musician.education && musician.education.length > 0 && (
                                <Card>
                                    <CardContent className="pt-3 sm:pt-4 md:pt-6">
                                        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                                            <span className="break-words">Education</span>
                                        </h2>                        <div className="space-y-2 md:space-y-3">
                            {musician.education.map((edu, index) => (
                                <div key={index} className="text-xs sm:text-sm border border-input bg-background p-2 md:p-3 rounded-md break-words hover:bg-accent/50 transition-colors">
                                    {edu}
                                </div>
                            ))}
                        </div>
                                    </CardContent>
                                </Card>
                            )}                            {/* Video Links */}
                            {musician.video_links && musician.video_links.length > 0 && (
                                <Card>
                                    <CardContent className="pt-3 sm:pt-4 md:pt-6">
                                        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
                                            <Video className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                                            <span className="break-words">Video Portfolio</span>
                                        </h2>
                                        <div className="space-y-2">
                                            {musician.video_links.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    className="w-full justify-start text-xs sm:text-sm h-auto py-2"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <a 
                                                        href={link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 min-w-0"
                                                    >
                                                        <Video className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                                        <span className="truncate">Video {index + 1}</span>
                                                        <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
                                                    </a>
                                                </Button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Social Links */}
                            {musician.social && Object.keys(musician.social).length > 0 && (
                                <Card>
                                    <CardContent className="pt-3 sm:pt-4 md:pt-6">
                                        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 flex items-center gap-2">
                                            <Globe className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                                            <span className="break-words">Social Links</span>
                                        </h2>
                                        <div className="space-y-2">
                                            {Object.entries(musician.social).map(([platform, url]) => {
                                                if (!url || url === '') return null;
                                                
                                                return (
                                                    <Button
                                                        key={platform}
                                                        variant="outline"
                                                        className="w-full justify-start text-xs sm:text-sm h-auto py-2"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <a 
                                                            href={url as string} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 sm:gap-3 min-w-0"
                                                        >
                                                            <span className="flex-shrink-0">{getSocialIcon(platform)}</span>
                                                            <span className="capitalize truncate">{platform}</span>
                                                            <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
                                                        </a>
                                                    </Button>
                                                );
                                            }).filter(Boolean)}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>                    {/* Footer with Profile Dates */}
                    <div className="border-t pt-3 sm:pt-4 mt-4 sm:mt-6" />
                    
                    <div className="text-xs text-muted-foreground text-center px-2">
                        <div className="flex flex-col sm:flex-row sm:justify-center sm:gap-2">
                            <span>Profile created: {new Date(musician.created_at).toLocaleDateString()}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Last updated: {new Date(musician.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
