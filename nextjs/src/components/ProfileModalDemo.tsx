// Demo component to test ProfileQueryModal states
"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileQueryModal } from '@/components/ProfileQueryModal';

interface MusicianProfile {
    id: string;
    email: string | null;
    forename: string | null;
    surname: string | null;
    location?: unknown;
    phone: string | null;
    bio: string | null;    occupation: string[] | null;
    education: string[] | null;
    certificates: string[] | null;
    genre_instrument: Record<string, unknown>[] | null;
    video_links: string[] | null;
    social: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export function ProfileModalDemo() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMusician, setCurrentMusician] = useState<MusicianProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sample complete musician
    const completeMusician: MusicianProfile = {
        id: "1",
        email: "john.doe@example.com",
        forename: "John",
        surname: "Doe",
        location: { city: "New York", country: "USA" },
        phone: "+1-555-123-4567",
        bio: "Professional guitarist and music teacher with 15+ years of experience",
        occupation: ["Music Teacher", "Session Musician", "Guitar Instructor"],
        education: ["Berklee College of Music - Bachelor of Music", "Manhattan School of Music - Master of Arts"],
        certificates: ["Certified Guitar Instructor", "Music Theory Advanced Certificate"],
        genre_instrument: [
            { genre: "Jazz", instrument: "Electric Guitar", category: "String" },
            { genre: "Blues", instrument: "Acoustic Guitar", category: "String" },
            { genre: "Classical", instrument: "Classical Guitar", category: "String" }
        ],
        video_links: [
            "https://youtube.com/watch?v=example1",
            "https://youtube.com/watch?v=example2"
        ],
        social: {
            youtube: "https://youtube.com/@johndoe",
            instagram: "https://instagram.com/johndoe",
            website: "https://johndoemusic.com"
        },
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-06-01T14:20:00Z"
    };

    // Sample incomplete musician
    const incompleteMusician: MusicianProfile = {
        id: "2",
        email: "jane@example.com",
        forename: null,
        surname: null,
        location: null,
        phone: null,
        bio: null,
        occupation: null,
        education: null,
        certificates: null,
        genre_instrument: null,
        video_links: null,
        social: {},
        created_at: "2024-02-20T09:15:00Z",
        updated_at: "2024-02-20T09:15:00Z"
    };

    const showCompleteProfile = () => {
        setCurrentMusician(completeMusician);
        setIsLoading(false);
        setError(null);
        setIsModalOpen(true);
    };

    const showIncompleteProfile = () => {
        setCurrentMusician(incompleteMusician);
        setIsLoading(false);
        setError(null);
        setIsModalOpen(true);
    };

    const showLoadingState = () => {
        setCurrentMusician(null);
        setIsLoading(true);
        setError(null);
        setIsModalOpen(true);
        
        // Simulate loading for 3 seconds, then show complete profile
        setTimeout(() => {
            setCurrentMusician(completeMusician);
            setIsLoading(false);
        }, 3000);
    };

    const showErrorState = () => {
        setCurrentMusician(null);
        setIsLoading(false);
        setError("Failed to load musician profile. The server is currently unavailable.");
        setIsModalOpen(true);
    };

    const showNotFoundState = () => {
        setCurrentMusician(null);
        setIsLoading(false);
        setError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentMusician(null);
        setIsLoading(false);
        setError(null);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>ProfileQueryModal Demo</CardTitle>
                    <p className="text-muted-foreground">Test different states of the ProfileQueryModal component</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Button onClick={showCompleteProfile} className="w-full">
                            Complete Profile
                        </Button>
                        <Button onClick={showIncompleteProfile} variant="outline" className="w-full">
                            Incomplete Profile
                        </Button>
                        <Button onClick={showLoadingState} variant="outline" className="w-full">
                            Loading State
                        </Button>
                        <Button onClick={showErrorState} variant="destructive" className="w-full">
                            Error State
                        </Button>
                        <Button onClick={showNotFoundState} variant="secondary" className="w-full">
                            Not Found State
                        </Button>
                    </div>
                    
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">Test Instructions:</h3>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• <strong>Complete Profile:</strong> Shows a fully populated musician profile</li>
                            <li>• <strong>Incomplete Profile:</strong> Shows minimal data with appropriate messaging</li>
                            <li>• <strong>Loading State:</strong> Shows loading spinner, then complete profile after 3 seconds</li>
                            <li>• <strong>Error State:</strong> Shows error message with retry options</li>
                            <li>• <strong>Not Found State:</strong> Shows when musician data is null</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <ProfileQueryModal
                isOpen={isModalOpen}
                onClose={closeModal}
                musician={currentMusician}
                isLoading={isLoading}
                error={error}
            />
        </div>
    );
}
