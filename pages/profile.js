import { useEffect, useState } from 'react';
import supabase from '../lib/supabase'; // Import the singleton Supabase client
import verifyUser from '../lib/getuser'; // Import the verifyUser function
import signOut from '../lib/signOut'; // Import the reusable signOut function
import Header from '../components/Header';
import { createuser } from '../lib/createuser';
import { deleteuser } from '../lib/deleteuser'; // Make sure this exists and is exported
import uploadPicture from '../lib/uploadPicture'; // Add this import
import { uploadProfileImage, getProfileImageUrl } from '../lib/uploadPicture';

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

    // Add new state for genre-instrument role
    const [newGenreInstrumentRole, setNewGenreInstrumentRole] = useState('');

    // Dropdown options for social platforms
    const [socialPlatforms, setSocialPlatforms] = useState([]);

    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchSocialPlatforms = async () => {
            const { data, error } = await supabase
                .from('social')
                .select('id, name, link_prefix');
            if (error) {
                console.error('Error fetching social platforms:', error);
                setSocialPlatforms([]);
            } else {
                setSocialPlatforms(data || []);
            }
        };
        fetchSocialPlatforms();
    }, []);

    // Fetch profile image if exists (optional, if you store the URL in profile)
    useEffect(() => {
        if (profile.profile_image_url) {
            setProfileImageUrl(profile.profile_image_url);
        }
    }, [profile.profile_image_url]);

    useEffect(() => {
        if (profile.profile_link) {
            setProfileImageUrl(profile.profile_link);
        }
    }, [profile.profile_link]);

    // Handle image upload
    const handleProfileImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);

        try {
            const path = await uploadProfileImage(file, profile.uid);
            const url = getProfileImageUrl(path);
            console.log("Profile image URL being saved:", url); // <-- Add this line
            setProfileImageUrl(url);
            await supabase
                .from('users')
                .update({ profile_link: url, updated_at: new Date().toISOString() })
                .eq('uid', profile.uid);
            setProfile(prev => ({ ...prev, profile_link: url }));
            setMessage('Profile image updated!');
        } catch (err) {
            console.error('Upload error:', err);
            setMessage('Unexpected error uploading image: ' + (err.message || JSON.stringify(err)));
        } finally {
            setUploading(false);
        }
    };

    // Dropdown options for education

    const [genres, setGenres] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [educationOptions, setEducationOptions] = useState([]);
    const [newLocation, setNewLocation] = useState('');
    const [newCity, setNewCity] = useState('');
    const [newCountry, setNewCountry] = useState([]);
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
                `https://api.geonames.org/searchJSON?formatted=true&country=${selectedCountry}&featureClass=P&maxRows=1000&username=${geonamesUsername}`
            );
            const data = await res.json();
            setCities(data.geonames || []);
        };
        fetchCities();
    }, [selectedCountry]);

    useEffect(() => {
        const fetchCountries = async () => {
            const res = await fetch(`https://api.geonames.org/countryInfoJSON?username=${geonamesUsername}`);
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
            <Header /> {/* Add the Header component */}
            <section className="profile-container">
                <h1 className="profile-title">Profile Editor</h1>
                {/* Profile Image Circle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                    <label
                        htmlFor="profile-image-upload"
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            border: '2px dashed #bbb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            background: '#fafafa',
                            position: 'relative',
                        }}
                        title="Click to upload profile picture"
                    >
                        {profileImageUrl ? (
                            <img
                                src={profileImageUrl}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <span style={{ color: '#bbb', fontSize: 32 }}>+</span>
                        )}
                        <input
                            id="profile-image-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleProfileImageUpload}
                            disabled={uploading}
                        />
                        {uploading && (
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, width: '100%', height: '100%',
                                background: 'rgba(255,255,255,0.7)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 18, color: '#888'
                            }}>
                                Uploading...
                            </div>
                        )}
                    </label>
                </div>
                {message && <p className="profile-message">{message}</p>}
                <form className="profile-form">
                    <div className="form-group">
                        <label htmlFor="forename">Forename:</label>
                        <input
                            id="forename"
                            type="text"
                            value={profile.forename}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="surname">Surname:</label>
                        <input
                            id="surname"
                            type="text"
                            value={profile.surname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* Location Dropdowns */}
                    <div className="form-group">
                        <label htmlFor="country">Country:</label>
                        <select
                            id="country"
                            value={selectedCountry}
                            onChange={e => {
                                setSelectedCountry(e.target.value);
                                setSelectedCity('');
                            }}
                        >
                            <option value="">Select Country</option>
                            {countries.map(c => (
                                <option key={c.geonameId} value={c.countryCode}>
                                    {c.countryName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="city">City:</label>
                        <select
                            id="city"
                            value={selectedCity}
                            onChange={e => setSelectedCity(e.target.value)}
                            disabled={!selectedCountry}
                        >
                            <option value="">Select City</option>
                            {cities.map(city => (
                                <option key={city.geonameId} value={city.geonameId}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={handleChange}
                            disabled // Disable editing of the email field
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Phone:</label>
                        <input
                            id="phone"
                            type="text"
                            value={profile.phone}
                            onChange={e => {
                                // Remove all spaces from the input
                                const noSpaces = e.target.value.replace(/\s+/g, '');
                                setProfile(prev => ({ ...prev, phone: noSpaces }));
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="bio">Bio:</label>
                        <textarea
                            id="bio"
                            value={profile.bio}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Save Profile Button */}
                    <button type="button" onClick={savePersonalData}>
                        Save Personal Data
                    </button>

                    {/* Genre + Instrument */}
                    <div className="form-group">
                        <h3>Genre + Instrument:</h3>
                        <div className="input-container">
                            <select
                                value={newGenre}
                                onChange={(e) => setNewGenre(e.target.value)}
                            >
                                <option value="">Select Genre</option>
                                {genres.map((g, idx) => (
                                    <option key={idx} value={g.name}>{g.name}</option>
                                ))}
                            </select>
                            <select
                                value={newInstrument}
                                onChange={(e) => setNewInstrument(e.target.value)}
                            >
                                <option value="">Select Instrument</option>
                                {(() => {
                                    const grouped = instruments.reduce((acc, inst) => {
                                        if (!acc[inst.category]) acc[inst.category] = [];
                                        acc[inst.category].push(inst);
                                        return acc;
                                    }, {});
                                    return Object.keys(grouped).sort().map(category => (
                                        <optgroup key={category} label={category}>
                                            {grouped[category]
                                                .sort((a, b) => a.name.localeCompare(b.name))
                                                .map(inst => (
                                                    <option key={inst.name} value={inst.name}>
                                                        {inst.name}
                                                    </option>
                                                ))}
                                        </optgroup>
                                    ));
                                })()}
                            </select>
                            {/* Add this Role dropdown */}
                            <select
                                value={newGenreInstrumentRole}
                                onChange={e => setNewGenreInstrumentRole(e.target.value)}
                            >
                                <option value="">Select Role</option>
                                <option value="artist">Artist</option>
                                <option value="teacher">Teacher</option>
                            </select>
                            <button type="button" onClick={async () => {
                                if (!newGenre || !newInstrument || !newGenreInstrumentRole) return;
                                const newPair = `${newGenre} ${newInstrument} (${newGenreInstrumentRole})`;
                                if (profile.genre_instrument?.includes(newPair)) return;
                                const updatedGenreInstrument = [...(profile.genre_instrument || []), newPair];
                                setProfile(prev => ({
                                    ...prev,
                                    genre_instrument: updatedGenreInstrument,
                                }));
                                setNewGenre('');
                                setNewInstrument('');
                                setNewGenreInstrumentRole('');
                                if (profile.uid) {
                                    await supabase.from('users').update({ genre_instrument: updatedGenreInstrument, updated_at: new Date().toISOString() }).eq('uid', profile.uid);
                                }
                            }}>
                                Add
                            </button>
                        </div>
                        <ul>
                            {Array.isArray(profile.genre_instrument) && profile.genre_instrument.length > 0 ? (
                                profile.genre_instrument.map((item, index) => (
                                    <li key={index}>
                                        {item}
                                        <button type="button" onClick={() => handleDeleteGenreInstrument(index)}>
                                            ×
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li>Add your first instrtument!</li>
                            )}
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div className="form-group">
                        <h3>Social Links:</h3>
                        <div className="input-container">
                            <select
                                value={newSocialPlatform}
                                onChange={(e) => {
                                    const selectedPlatform = socialPlatforms.find(
                                        (platform) => platform.name === e.target.value
                                    );
                                    setNewSocialPlatform(e.target.value);
                                    setNewSocialLink(selectedPlatform ? selectedPlatform.link_prefix : '');
                                }}
                            >
                                <option value="">Select Platform</option>
                                {socialPlatforms.map((platform) => (
                                    <option key={platform.id} value={platform.name}>
                                        {platform.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Add a social link"
                                value={newSocialLink}
                                onChange={(e) => setNewSocialLink(e.target.value)}
                            />
                            <button type="button" onClick={handleAddSocialLink}>
                                Add
                            </button>
                        </div>
                        <ul>
                            {profile.social?.map((link, index) => (
                                <li key={index}>
                                    <a href={link.link} target="_blank" rel="noopener noreferrer">
                                        {link.platform}: {link.link}
                                    </a>
                                    <button
                                        type="button"
                                        className="delete-x"
                                        title="Delete"
                                        onClick={() => handleDeleteItem('social', index)}
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Certificates */}
                    <div className="form-group">
                        <h3>Certificates:</h3>
                        <div className="input-container">
                            <input
                                type="text"
                                placeholder="Certificate"
                                value={newCertificate}
                                onChange={(e) => setNewCertificate(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Organization"
                                value={newCertificateOrganization}
                                onChange={(e) => setNewCertificateOrganization(e.target.value)}
                            />
                            <button type="button" onClick={async () => {
                                if (!newCertificate || !newCertificateOrganization) return;
                                const updatedCertificates = [
                                    ...(Array.isArray(profile.certificates) ? profile.certificates : []),
                                    { certificate: newCertificate, organization: newCertificateOrganization },
                                ];
                                setProfile(prev => ({
                                    ...prev,
                                    certificates: updatedCertificates,
                                }));
                                setNewCertificate('');
                                setNewCertificateOrganization('');
                                if (profile.uid) {
                                    await supabase.from('users').update({ certificates: updatedCertificates, updated_at: new Date().toISOString() }).eq('uid', profile.uid);
                                }
                            }}>
                                Add
                            </button>
                        </div>
                        <ul>
                            {(Array.isArray(profile.certificates) ? profile.certificates : []).map((cert, index) => (
                                <li key={index}>
                                    {typeof cert === 'object'
                                        ? `${cert.certificate || ''}${cert.organization ? ` from ${cert.organization}` : ''}`
                                        : cert}
                                    <button
                                        type="button"
                                        className="delete-x"
                                        title="Delete"
                                        onClick={() => handleDeleteItem('certificates', index)}
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Video Links */}
                    <div className="form-group"></div>
                        <h3>Video Links:</h3>
                        <div className="input-container">
                            <input
                                type="text"
                                placeholder="Add a video link"
                                value={newVideoLink}
                                onChange={(e) => setNewVideoLink(e.target.value)}
                            />
                            <button type="button" onClick={async () => {
                                if (!newVideoLink.startsWith('http://') && !newVideoLink.startsWith('https://')) return;
                                const updatedVideoLinks = [...profile.video_links, newVideoLink];
                                setProfile(prev => ({
                                    ...prev,
                                    video_links: updatedVideoLinks,
                                }));
                                setNewVideoLink('');
                                if (profile.uid) {
                                    await supabase.from('users').update({ video_links: updatedVideoLinks, updated_at: new Date().toISOString() }).eq('uid', profile.uid);
                                }
                            }}>
                                Add
                            </button>
                        </div>
                        <ul>
                            {(Array.isArray(profile.video_links) ? profile.video_links : []).map((link, index) => (
                                <li key={index}>
                                    <a href={link} target="_blank" rel="noopener noreferrer">
                                        {link}
                                    </a>
                                    <button
                                        type="button"
                                        className="delete-x"
                                        title="Delete"
                                        onClick={() => handleDeleteItem('video_links', index)}
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>

                    

                    {/* Occupation */}
                    <div className="form-group">
                        <h3>Occupation:</h3>
                        <div className="input-container">
                            <input
                                type="text"
                                placeholder="Role (e.g. Trombonist)"
                                value={newOccupationRole}
                                onChange={(e) => setNewOccupationRole(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Organization (e.g. Philharmonic)"
                                value={newOccupationOrg}
                                onChange={(e) => setNewOccupationOrg(e.target.value)}
                            />
                            <button type="button" onClick={async () => {
                                if (!newOccupationRole || !newOccupationOrg) return;
                                const newEntry = `${newOccupationRole} at ${newOccupationOrg}`;
                                const updated = [...(profile.occupation || []), newEntry];
                                setProfile(prev => ({ ...prev, occupation: updated }));
                                setNewOccupationRole('');
                                setNewOccupationOrg('');
                                if (profile.uid) {
                                    await supabase.from('users').update({ occupation: updated, updated_at: new Date().toISOString() }).eq('uid', profile.uid);
                                }
                            }}>
                                Add
                            </button>
                        </div>
                        <ul>
                            {(Array.isArray(profile.occupation) ? profile.occupation : []).map((occ, idx) => (
                                <li key={idx}>
                                    {occ}
                                    <button type="button" onClick={async () => {
                                        const updated = profile.occupation.filter((_, i) => i !== idx);
                                        setProfile(prev => ({ ...prev, occupation: updated }));
                                        await supabase.from('users').update({
                                            occupation: updated,
                                            updated_at: new Date().toISOString()
                                        }).eq('uid', profile.uid);
                                    }}>×</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Education */}
                    <div className="form-group">
                        <h3>Education:</h3>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input
                                id="education-place"
                                name="education-place"
                                type="text"
                                value={newEducationPlace}
                                onChange={e => setNewEducationPlace(e.target.value)}
                                placeholder="e.g. Liszt Academy"
                            />
                            <select
                                id="education-level"
                                name="education-level"
                                value={newEducation}
                                onChange={e => setNewEducation(e.target.value)}
                            >
                                <option value="">Select Education</option>
                                {educationOptions.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!newEducation || !newEducationPlace.trim()) return;
                                    const selected = educationOptions.find(opt => opt.id === parseInt(newEducation));
                                    if (!selected) return;
                                    const newEntry = {
                                        name: selected.name,
                                        place: newEducationPlace.trim()
                                    };
                                    const updated = [...(profile.education || []), newEntry];
                                    setProfile(prev => ({ ...prev, education: updated }));
                                    setNewEducation('');
                                    setNewEducationPlace('');
                                    if (profile.uid) {
                                        await supabase.from('users').update({
                                            education: updated,
                                            updated_at: new Date().toISOString()
                                        }).eq('uid', profile.uid);
                                    }
                                }}
                            >
                                Add
                            </button>
                        </div>
                        <ul>
                            {(Array.isArray(profile.education) ? profile.education : []).map((edu, idx) => (
                                <li key={idx}>
                                    {edu.place}{edu.name ? ` – ${edu.name}` : ''}
                                    <button type="button" onClick={async () => {
                                        const updated = profile.education.filter((_, i) => i !== idx);
                                        setProfile(prev => ({ ...prev, education: updated }));
                                        if (profile.uid) {
                                            await supabase.from('users').update({
                                                education: updated,
                                                updated_at: new Date().toISOString()
                                            }).eq('uid', profile.uid);
                                        }
                                    }}>×</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    
                    
                    
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
                        onClick={(e) => handleDeleteProfile(e)}
                        className="danger-button"
                    >
                        Delete My Profile
                    </button>
                </section>
            </section>
        </main>
    );
}