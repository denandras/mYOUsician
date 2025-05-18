import { useEffect, useState } from 'react';
import supabase from '../lib/supabase'; // Import the singleton Supabase client
import verifyUser from '../lib/getuser'; // Import the verifyUser function
import signOut from '../lib/signOut'; // Import the reusable signOut function
import Header from '../components/Header';
import { createuser } from '../lib/createuser';
import { deleteuser } from '../lib/deleteuser'; // Make sure this exists and is exported

// Import extracted section components
import PersonalDataSection from '../components/PersonalDataSection';
import GenreInstrumentSection from '../components/GenreInstrumentSection';
import SocialLinksSection from '../components/SocialLinksSection';
import CertificatesSection from '../components/CertificatesSection';
import VideoLinksSection from '../components/VideoLinksSection';
import OccupationSection from '../components/OccupationSection';
import EducationSection from '../components/EducationSection';

const geonamesUsername = process.env.NEXT_PUBLIC_GEONAMES_USERNAME;

export default function Profile() {
    const [profile, setProfile] = useState({
        forename: '',
        surname: '',
        location: [], // as text[]
        email: '',
        phone: '',
        bio: '',
        occupation: [],
        education: [],
        genre_instrument: [],
        social: [],
        certificates: [], // as array in state, but save as JSON string
        video_links: [],  // as array in state, but save as JSON string
    });

    const [message, setMessage] = useState('');
    const [newGenre, setNewGenre] = useState(''); // For adding a new genre
    const [newInstrument, setNewInstrument] = useState(''); // For adding a new instrument
    const [deleteConfirmation, setDeleteConfirmation] = useState(''); // For Danger Zone input
    const [loading, setLoading] = useState(true); // Loading state

    // Add new states for social links, occupation, education, and awards
    const [newSocialLink, setNewSocialLink] = useState('');
    const [newOccupation, setNewOccupation] = useState('');
    const [newEducation, setNewEducation] = useState('');

    // Add new states for dropdowns and detailed inputs
    const [newSocialPlatform, setNewSocialPlatform] = useState('');
    const [newSchool, setNewSchool] = useState('');
    const [newDegree, setNewDegree] = useState('');
    const [newCertificate, setNewCertificate] = useState('');
    const [newOccupationRole, setNewOccupationRole] = useState('');
    const [newOccupationCompany, setNewOccupationCompany] = useState('');
    const [newOccupationOrg, setNewOccupationOrg] = useState('');

    // Add new states for certificates and video links
    const [newVideoLink, setNewVideoLink] = useState('');
    const [newCertificateOrganization, setNewCertificateOrganization] = useState('');

    // Dropdown options for social platforms
    const socialPlatforms = [
        { name: 'Instagram', prefix: 'https://instagram.com/' },
        { name: 'Facebook', prefix: 'https://facebook.com/' },
        { name: 'TikTok', prefix: 'https://tiktok.com/' },
        { name: 'X', prefix: 'https://twitter.com/' },
        { name: 'LinkedIn', prefix: 'https://linkedin.com/' },
    ];

    // Dropdown options for education

    const [genres, setGenres] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [educationOptions, setEducationOptions] = useState([]);
    const [newLocation, setNewLocation] = useState('');
    const [newCity, setNewCity] = useState('');
    const [newCountry, setNewCountry] = useState('');
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const [educationPlaces, setEducationPlaces] = useState(profile.education_places || []);
    const [newEducationPlace, setNewEducationPlace] = useState('');

    // Fetch user data and email from session on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                // Get the current authenticated user
                const userSession = await verifyUser();
                if (!userSession || !userSession.id) {
                    setMessage('Could not load your profile. Please try refreshing the page or log in again.');
                    setLoading(false);
                    return;
                }
                const userId = userSession.id;
                const userEmail = userSession.email;

                // Try to fetch the user's profile from the users table
                const { data: user, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('uid', userId)
                    .maybeSingle();

                // If error is 400 (no row found) or user is null, create the user row
                if ((error && error.code === 'PGRST116') || !user) {
                    // No profile found, call the function to create a new user row
                    const result = await createuser({ uid: userId, email: userEmail });
                    if (!result || result.error) {
                        console.error('CreateUser error:', result.error); // <-- Add this line
                        setMessage('Error creating your profile. Please contact the developer.');
                        setLoading(false);
                        return;
                    }
                    // Fetch the newly created profile as before
                    const { data: newUser } = await supabase
                        .from('users')
                        .select('*')
                        .eq('uid', userId)
                        .maybeSingle();
                    setProfile({
                        ...newUser,
                        email: userEmail,
                        location: newUser.location || [],
                        genre_instrument: [],
                        certificates: [],
                        video_links: [],
                        social: [],
                    });
                    setLoading(false);
                    setMessage('Welcome! Please complete your profile.');
                    return;
                }

                // If user profile exists, parse and set it
                const parsedGenreInstrument = (user.genre_instrument || []).map(item => {
                    try {
                        return typeof item === 'string' ? JSON.parse(item) : item;
                    } catch (err) {
                        return { genre: '', instrument: '' };
                    }
                });

                setProfile({
                    ...user,
                    email: userEmail,
                    location: user.location || { country: '', city: '' },
                    occupation: user.occupation || [],
                    education: Array.isArray(user.education)
                        ? user.education.map(e =>
                            typeof e === 'string'
                                ? (() => { try { return JSON.parse(e); } catch { return { name: e, place: '' }; } })()
                                : { name: e.name || e.degree || '', place: e.place || e.school || '' }
                        )
                        : [],
                    genre_instrument: user.genre_instrument || [],
                    social: user.social || [],
                    certificates: Array.isArray(user.certificates)
                        ? user.certificates.map(cert =>
                            typeof cert === 'string'
                                ? (() => { try { return JSON.parse(cert); } catch { return cert; } })()
                                : cert
                        )
                        : [],
                    video_links: user.video_links || [],
                });
            } catch (err) {
                console.error('Unexpected error fetching profile:', err);
                setMessage(`Unexpected error occurred: ${err.message || JSON.stringify(err)}`);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        const fetchGenres = async () => {
            const { data } = await supabase.from('genres').select('name');
            setGenres(data || []);
        };
        const fetchInstruments = async () => {
            const { data } = await supabase
                .from('instruments')
                .select('name, category')
                .order('category', { ascending: true })
                .order('name', { ascending: true });
            setInstruments(data || []);
        };
        const fetchEducationOptions = async () => {
            const { data } = await supabase.from('education').select('id, name, HUN');
            setEducationOptions(data || []);
        };
        fetchGenres();
        fetchInstruments();
        fetchEducationOptions();
    }, []);

    useEffect(() => {
        if (!selectedCountry) {
            setCities([]);
            return;
        }
        const fetchCities = async () => {
            const res = await fetch(
                `http://api.geonames.org/searchJSON?formatted=true&country=${selectedCountry}&featureClass=P&maxRows=1000&username=${geonamesUsername}`
            );
            const data = await res.json();
            setCities(data.geonames || []);
        };
        fetchCities();
    }, [selectedCountry]);

    useEffect(() => {
        const fetchCountries = async () => {
            const res = await fetch(`http://api.geonames.org/countryInfoJSON?username=${geonamesUsername}`);
            const data = await res.json();
            setCountries(data.geonames || []);
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        if (profile.location && profile.location[0]) {
            setSelectedCountry(profile.location[0]);
        }
    }, [profile.location]);

    useEffect(() => {
        // When cities or profile.location change, set selectedCity if possible
        if (
            Array.isArray(profile.location) &&
            profile.location.length === 2 &&
            cities.length > 0
        ) {
            const cityCode = String(profile.location[1]);
            const found = cities.find(city => String(city.geonameId) === cityCode);
            if (found) {
                setSelectedCity(cityCode);
            }
        }
    }, [cities, profile.location]);

    if (loading) {
        // Render a loading indicator while data is being fetched
        return (
            <main className="profile-page">
                <section className="profile-container">
                    <h1 className="profile-title"></h1>
                </section>
            </main>
        );
    }

    // Handle input changes
    const handleChange = (e) => {
        const { id, value } = e.target;
        setProfile((prev) => ({ ...prev, [id]: value }));
    };

    // Handle adding a new genre-instrument pair
    const handleAddGenreInstrument = async () => {
        if (!newGenre || !newInstrument) return;
        const newPair = `${newGenre} ${newInstrument}`;
        if (profile.genre_instrument?.includes(newPair)) return;

        const updatedGenreInstrument = [...(profile.genre_instrument || []), newPair];

        setProfile((prev) => ({
            ...prev,
            genre_instrument: updatedGenreInstrument,
        }));

        setNewGenre('');
        setNewInstrument('');

        // Save to DB
        try {
            await supabase
                .from('users')
                .update({ genre_instrument: updatedGenreInstrument, updated_at: new Date().toISOString() })
                .eq('uid', profile.uid);
            setMessage('Genre-instrument list updated!');
        } catch (err) {
            setMessage('Error updating genre-instrument list.');
        }
    };

    // Handle deleting a genre-instrument pair
    const handleDeleteGenreInstrument = async (index) => {
        const updatedGenreInstrument = profile.genre_instrument.filter((_, i) => i !== index);

        setProfile((prev) => ({
            ...prev,
            genre_instrument: updatedGenreInstrument,
        }));

        // Save the updated list immediately
        try {
            const { error } = await supabase
                .from('users')
                .update({ genre_instrument: updatedGenreInstrument, updated_at: new Date().toISOString() })
                .eq('uid', profile.uid);

            if (error) {
                console.error('Error saving genre-instrument list:', error);
                setMessage('Error saving genre-instrument list.');
            } else {
                setMessage('Genre-instrument list updated successfully!');
            }
        } catch (err) {
            console.error('Unexpected error saving genre-instrument list:', err);
            setMessage('Unexpected error occurred.');
        }
    };

    // Handle adding a new social link with validation
    const handleAddSocialLink = async () => {
        if (!newSocialPlatform || !newSocialLink) {
            setMessage('Please select a platform and enter a valid link.');
            return;
        }

        const selectedPlatform = socialPlatforms.find(
            (platform) => platform.name === newSocialPlatform
        );

        if (!newSocialLink.startsWith(selectedPlatform.prefix)) {
            setMessage(`Invalid link. Must start with ${selectedPlatform.prefix}`);
            return;
        }

        const updatedSocialLinks = [
            ...profile.social,
            { platform: newSocialPlatform, link: newSocialLink },
        ];

        setProfile((prev) => ({
            ...prev,
            social: updatedSocialLinks,
        }));

        setNewSocialPlatform('');
        setNewSocialLink('');

        try {
            const { error } = await supabase
                .from('users')
                .update({ social: updatedSocialLinks, updated_at: new Date().toISOString() })
                .eq('uid', profile.uid);

            if (error) {
                console.error('Error saving social links:', error);
                setMessage('Error saving social links.');
            } else {
                setMessage('Social links updated successfully!');
            }
        } catch (err) {
            console.error('Unexpected error saving social links:', err);
            setMessage('Unexpected error occurred.');
        }
    };

    // Handle adding a new occupation
    const handleAddOccupation = async () => {
        if (!newOccupationRole || !newOccupationCompany) return;

        const updatedOccupations = [
            ...profile.occupation,
            { role: newOccupationRole, company: newOccupationCompany },
        ];

        setProfile((prev) => ({
            ...prev,
            occupation: updatedOccupations,
        }));

        setNewOccupationRole('');
        setNewOccupationCompany('');

        try {
            const { error } = await supabase
                .from('users')
                .update({ occupation: updatedOccupations, updated_at: new Date().toISOString() })
                .eq('uid', profile.uid);

            if (error) {
                console.error('Error saving occupations:', error);
                setMessage('Error saving occupations.');
            } else {
                setMessage('Occupations updated successfully!');
            }
        } catch (err) {
            console.error('Unexpected error saving occupations:', err);
            setMessage('Unexpected error occurred.');
        }
    };

    // Handle adding a new education
    const handleAddEducation = async () => {
        if (!newSchool || !newDegree) return;

        const updatedEducation = [
            ...profile.education,
            { school: newSchool, degree: newDegree },
        ];

        setProfile((prev) => ({
            ...prev,
            education: updatedEducation,
        }));

        setNewSchool('');
        setNewDegree('');

        try {
            const { error } = await supabase
                .from('users')
                .update({ education: updatedEducation, updated_at: new Date().toISOString() }) // <-- fixed
                .eq('uid', profile.uid);

            if (error) {
                console.error('Error saving education:', error);
                setMessage('Error saving education.');
            } else {
                setMessage('Education updated successfully!');
            }
        } catch (err) {
            console.error('Unexpected error saving education:', err);
            setMessage('Unexpected error occurred.');
        }
    };

    // Handle adding a new certificate
    const handleAddCertificate = async () => {
        if (!newCertificate || !newCertificateOrganization) {
            setMessage('Please enter both the certificate and the organization.');
            return;
        }

        const updatedCertificates = [
            ...(Array.isArray(profile.certificates) ? profile.certificates : []),
            { certificate: newCertificate, organization: newCertificateOrganization },
        ];

        setProfile((prev) => ({
            ...prev,
            certificates: updatedCertificates,
        }));

        setNewCertificate('');
        setNewCertificateOrganization('');

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    certificates: updatedCertificates,
                    updated_at: new Date().toISOString()
                })
                .eq('uid', profile.uid);

            if (error) {
                console.error('Error saving certificates:', error);
                setMessage('Error saving certificates.');
            } else {
                setMessage('Certificates updated successfully!');
            }
        } catch (err) {
            console.error('Unexpected error saving certificates:', err);
            setMessage('Unexpected error occurred.');
        }
    };

    // Handle adding a new video link
    const handleAddVideoLink = async () => {
        if (!newVideoLink.startsWith('http://') && !newVideoLink.startsWith('https://')) {
            setMessage('Please enter a valid video link.');
            return;
        }

        const updatedVideoLinks = [...profile.video_links, newVideoLink];

        setProfile((prev) => ({
            ...prev,
            video_links: updatedVideoLinks,
        }));

        setNewVideoLink('');

        try {
            const { error } = await supabase
                .from('users')
                .update({ video_links: updatedVideoLinks, updated_at: new Date().toISOString() })
                .eq('uid', profile.uid);

            if (error) {
                console.error('Error saving video links:', error);
                setMessage('Error saving video links.');
            } else {
                setMessage('Video links updated successfully!');
            }
        } catch (err) {
            console.error('Unexpected error saving video links:', err);
            setMessage('Unexpected error occurred.');
        }
    };

    // Save profile data
    const saveProfile = async () => {
        // ...collect form data...
        const payload = { forename: profile.forename };

        console.log('Payload for update:', payload);
        console.log('Profile UID:', profile.uid);

        let result;
        if (profile.uid) {
            result = await supabase.from('users').update(payload).eq('uid', profile.uid);
        } else {
            result = await supabase.from('users').insert([payload]);
        }
        // ...handle result...
    };

    // Only save personal data fields (forename, surname, location, phone, bio, email)
    const savePersonalData = async () => {
        if (!profile.forename.trim() || !profile.surname.trim()) {
            setMessage('Forename and Surname are required.');
            return;
        }
        // Save selected country and city as location
        const payload = {
            forename: profile.forename,
            surname: profile.surname,
            location: [selectedCountry, selectedCity],
            phone: profile.phone,
            bio: profile.bio,
            email: profile.email, // include email if you want to allow updating it
        };

        let result;
        if (profile.uid) {
            result = await supabase.from('users').update({
                ...payload,
                updated_at: new Date().toISOString()
            }).eq('uid', profile.uid);
        } else {
            // For insert, you need uid and email
            result = await supabase.from('users').insert([{ ...payload, uid: profile.uid, email: profile.email }]);
        }

        if (result.error) {
            setMessage('Error saving personal data.');
        } else {
            setMessage('Personal data saved!');
            setProfile(prev => ({
                ...prev,
                location: [selectedCountry, selectedCity],
            }));
        }
    };

    // Logout function using the reusable signOut function
    const handleLogout = async () => {
        const success = await signOut(); // Call the reusable signOut function
        if (success) {
            window.location.href = '/'; // Redirect to the homepage after logout
        } else {
            setMessage('Error logging out. Please try again.');
        }
    };

    // Danger Zone: Delete Profile
    const handleDeleteProfile = async (e) => {
        e.preventDefault(); // Prevent form reload

        if (!deleteConfirmation) {
            setMessage('Please enter your password to confirm.');
            return;
        }

        try {
            setMessage('Deleting profile...');
            const result = await deleteuser({
                uid: profile.uid,
                email: profile.email,
                password: deleteConfirmation
            });

            if (result.error) {
                setMessage(`Error deleting profile: ${result.error}`);
                return;
            }

            setMessage('Profile deleted successfully.');
            window.location.href = '/login';
        } catch (err) {
            setMessage(`Unexpected error occurred: ${err.message || JSON.stringify(err)}`);
        }
    };

    const handleDeleteItem = async (field, index) => {
        const updatedList = profile[field].filter((_, i) => i !== index);

        setProfile((prev) => ({
            ...prev,
            [field]: updatedList,
        }));

        try {
            const { error } = await supabase
                .from('users')
                .update({ [field]: updatedList, updated_at: new Date().toISOString() })
                .eq('uid', profile.uid);

            if (error) {
                console.error(`Error deleting item from ${field}:`, error);
                setMessage(`Error deleting item from ${field}.`);
            } else {
                setMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
            }
        } catch (err) {
            console.error(`Unexpected error deleting item from ${field}:`, err);
            setMessage('Unexpected error occurred.');
        }
    };

    return (
        <main className="profile-page">
            <Header />
            <section className="profile-container">
                <h1 className="profile-title">Profile Editor</h1>
                {message && <p className="profile-message">{message}</p>}
                <form className="profile-form">
                    <PersonalDataSection
                        profile={profile}
                        countries={countries}
                        cities={cities}
                        selectedCountry={selectedCountry}
                        setSelectedCountry={setSelectedCountry}
                        selectedCity={selectedCity}
                        setSelectedCity={setSelectedCity}
                        handleChange={handleChange}
                        savePersonalData={savePersonalData}
                    />
                    <GenreInstrumentSection
                        genres={genres}
                        instruments={instruments}
                        profile={profile}
                        newGenre={newGenre}
                        setNewGenre={setNewGenre}
                        newInstrument={newInstrument}
                        setNewInstrument={setNewInstrument}
                        handleAddGenreInstrument={handleAddGenreInstrument}
                        handleDeleteGenreInstrument={handleDeleteGenreInstrument}
                    />
                    <SocialLinksSection
                        socialPlatforms={socialPlatforms}
                        profile={profile}
                        newSocialPlatform={newSocialPlatform}
                        setNewSocialPlatform={setNewSocialPlatform}
                        newSocialLink={newSocialLink}
                        setNewSocialLink={setNewSocialLink}
                        handleAddSocialLink={handleAddSocialLink}
                        handleDeleteItem={handleDeleteItem}
                    />
                    <CertificatesSection
                        profile={profile}
                        newCertificate={newCertificate}
                        setNewCertificate={setNewCertificate}
                        newCertificateOrganization={newCertificateOrganization}
                        setNewCertificateOrganization={setNewCertificateOrganization}
                        handleAddCertificate={handleAddCertificate}
                        handleDeleteItem={handleDeleteItem}
                    />
                    <VideoLinksSection
                        profile={profile}
                        newVideoLink={newVideoLink}
                        setNewVideoLink={setNewVideoLink}
                        handleAddVideoLink={handleAddVideoLink}
                        handleDeleteItem={handleDeleteItem}
                    />
                    <OccupationSection
                        profile={profile}
                        newOccupationRole={newOccupationRole}
                        setNewOccupationRole={setNewOccupationRole}
                        newOccupationCompany={newOccupationOrg}
                        setNewOccupationCompany={setNewOccupationOrg}
                        handleAddOccupation={handleAddOccupation}
                        handleDeleteItem={handleDeleteItem}
                    />
                    <EducationSection
                        profile={profile}
                        educationOptions={educationOptions}
                        newEducation={newEducation}
                        setNewEducation={setNewEducation}
                        newEducationPlace={newEducationPlace}
                        setNewEducationPlace={setNewEducationPlace}
                        handleAddEducation={handleAddEducation}
                        handleDeleteItem={handleDeleteItem}
                    />
                </form>
                <button type="button" onClick={handleLogout} className="logout-button">
                    Logout
                </button>
                {/* Danger Zone */}
                <section className="danger-zone">
                    <h2 className="danger-title">Danger Zone</h2>
                    <p className="danger-description">
                        Deleting your profile is permanent and cannot be undone.
                    </p>
                    <input
                        type="password"
                        placeholder="Enter your password to confirm"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="danger-input"
                    />
                    <button
                        type="button"
                        onClick={handleDeleteProfile}
                        className="danger-button"
                    >
                        Delete My Profile
                    </button>
                </section>
            </section>
        </main>
    );
}