import { useEffect, useState } from 'react';
import supabase from '../lib/supabase'; // Import the singleton Supabase client
import verifyUser from '../lib/getuser'; // Import the verifyUser function
import signOut from '../lib/signOut'; // Import the reusable signOut function
import Header from '../components/Header';

export default function Profile() {
    const [profile, setProfile] = useState({
        forename: '',
        surname: '',
        location: { country: '', city: '' }, // Default value for location
        email: '', // Email will be extracted from the session
        phone: '',
        bio: '',
        occupation: [],
        education: [],
        genre_instrument: [], // Default value: empty array
        social: [],
        certificates: [], // Initialize certificates as an empty array
        video_links: [], // Initialize video_links as an empty array
    });

    const [message, setMessage] = useState('');
    const [newGenre, setNewGenre] = useState(''); // For adding a new genre
    const [newInstrument, setNewInstrument] = useState(''); // For adding a new instrument
    const [deleteConfirmation, setDeleteConfirmation] = useState(''); // For Danger Zone input
    const [loading, setLoading] = useState(true); // Loading state

    // Add new states for social links, occupation, education, and awards
    const [newSocialLink, setNewSocialLink] = useState('');
    const [newOccupation, setNewOccupation] = useState('');
    const [newAward, setNewAward] = useState('');
    const [newEducation, setNewEducation] = useState('');

    // Add new states for dropdowns and detailed inputs
    const [newSocialPlatform, setNewSocialPlatform] = useState('');
    const [newSchool, setNewSchool] = useState('');
    const [newDegree, setNewDegree] = useState('');
    const [newCertificate, setNewCertificate] = useState('');
    const [newOccupationRole, setNewOccupationRole] = useState('');
    const [newOccupationCompany, setNewOccupationCompany] = useState('');

    // Add new states for certificates and video links
    const [newCertificateOrganization, setNewCertificateOrganization] = useState('');
    const [newVideoLink, setNewVideoLink] = useState('');

    // Dropdown options for social platforms
    const socialPlatforms = [
        { name: 'Instagram', prefix: 'https://instagram.com/' },
        { name: 'Facebook', prefix: 'https://facebook.com/' },
        { name: 'TikTok', prefix: 'https://tiktok.com/' },
        { name: 'X', prefix: 'https://twitter.com/' },
        { name: 'LinkedIn', prefix: 'https://linkedin.com/' },
    ];

    // Dropdown options for education
    const educationOptions = ['High School', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Other'];

    // Fetch user data and email from session on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Error fetching session:', sessionError);
                    setLoading(false); // Stop loading if there's an error
                    return;
                }

                if (!session || !session.user) {
                    console.error('No session or user found. Redirecting to login.');
                    window.location.href = '/login';
                    return;
                }

                const userId = session.user.id;
                const userEmail = session.user.email; // Extract email from session

                if (!userId) {
                    console.error('User ID is undefined. Redirecting to login.');
                    window.location.href = '/login';
                    return;
                }

                // Fetch the user from the database
                const { data: user, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('uid', userId)
                    .maybeSingle(); // Use maybeSingle() to handle no rows gracefully

                if (error) {
                    console.error('Error fetching user:', error);
                    setLoading(false); // Stop loading if there's an error
                    return;
                }

                if (!user) {
                    console.warn('No user found in the database. Creating a new profile.');

                    // Create a new profile with default values
                    const { data: newUser, error: insertError } = await supabase
                        .from('users')
                        .insert([{
                            uid: userId,
                            email: userEmail,
                            forename: '',
                            surname: '',
                            location: { country: '', city: '' },
                            phone: '',
                            bio: '',
                            occupation: [],
                            education: [],
                            genre_instrument: [], // Default empty array
                            social: [],
                            certificates: [], // Ensure certificates is an empty array
                            video_links: [],
                        }])
                        .select()
                        .single();

                    if (insertError) {
                        console.error('Error creating new profile:', insertError);
                        setLoading(false); // Stop loading if there's an error
                        return;
                    }

                    setProfile(newUser); // Set the newly created profile
                } else {
                    // Parse the genre_instrument field if it is stored as a JSON string
                    const parsedGenreInstrument = (user.genre_instrument || []).map(item => {
                        try {
                            return typeof item === 'string' ? JSON.parse(item) : item;
                        } catch (err) {
                            console.error('Error parsing genre_instrument item:', item, err);
                            return { genre: '', instrument: '' }; // Fallback to empty values
                        }
                    });

                    const parsedCertificates = (user.certificates || []).map((item) => {
                        try {
                            return typeof item === 'string' ? JSON.parse(item) : item;
                        } catch (err) {
                            console.error('Error parsing certificate item:', item, err);
                            return { certificate: '', organization: '' }; // Fallback to empty values
                        }
                    });

                    const updatedUser = {
                        ...user,
                        email: userEmail, // Set email from session
                        location: user.location || { country: '', city: '' },
                        genre_instrument: parsedGenreInstrument || [], // Ensure genre_instrument is an array
                        certificates: parsedCertificates || [], // Ensure certificates is an array
                        video_links: user.video_links || [], // Ensure video_links is an array
                        social: user.social || [], // Ensure social is an array
                    };
                    setProfile(updatedUser);
                }
            } catch (err) {
                console.error('Unexpected error fetching profile:', err);
            } finally {
                setLoading(false); // Stop loading once the process is complete
            }
        };

        fetchProfile();
    }, []);

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

        const updatedGenreInstrument = [
            ...profile.genre_instrument,
            { genre: newGenre, instrument: newInstrument },
        ];

        setProfile((prev) => ({
            ...prev,
            genre_instrument: updatedGenreInstrument,
        }));

        setNewGenre('');
        setNewInstrument('');

        // Save the updated list immediately
        try {
            const { error } = await supabase
                .from('users')
                .update({ genre_instrument: updatedGenreInstrument })
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
                .update({ genre_instrument: updatedGenreInstrument })
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
                .update({ social: updatedSocialLinks })
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
                .update({ occupation: updatedOccupations })
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

    // Handle adding a new award
    const handleAddAward = async () => {
        if (!newAward) return;

        const updatedAwards = [...profile.awards, newAward];

        setProfile((prev) => ({
            ...prev,
            awards: updatedAwards,
        }));

        setNewAward('');

        try {
            const { error } = await supabase
                .from('users')
                .update({ awards: updatedAwards })
                .eq('uid', profile.uid);

            if (error) {
                console.error('Error saving awards:', error);
                setMessage('Error saving awards.');
            } else {
                setMessage('Awards updated successfully!');
            }
        } catch (err) {
            console.error('Unexpected error saving awards:', err);
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
                .update({ education: updatedEducation })
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
                .update({ certificates: updatedCertificates })
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
                .update({ video_links: updatedVideoLinks })
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
        try {
            const { data, error } = await supabase
                .from('users')
                .update(profile)
                .eq('uid', profile.uid);

            if (error) {
                console.error('Error updating profile:', error);
                setMessage('Error updating profile.');
            } else {
                setMessage('Profile updated successfully!');
                window.location.reload(); // Refresh the page
            }
        } catch (err) {
            console.error('Unexpected error updating profile:', err);
            setMessage('Unexpected error occurred.');
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
    const handleDeleteProfile = async () => {
        if (deleteConfirmation !== 'delete my profile') {
            setMessage('Please type "delete my profile" to confirm.');
            return;
        }

        try {
            // Delete from the `users` table
            const { error: deleteUserError } = await supabase
                .from('users')
                .delete()
                .eq('uid', profile.uid);

            if (deleteUserError) {
                console.error('Error deleting user from users table:', deleteUserError);
                setMessage('Error deleting profile.');
                return;
            }

            // Delete from Supabase Auth
            const { error: authError } = await supabase.auth.admin.deleteUser(profile.uid);

            if (authError) {
                console.error('Error deleting user from auth:', authError);
                setMessage('Error deleting profile from authentication.');
                return;
            }

            setMessage('Profile deleted successfully.');
            window.location.href = '/'; // Redirect to the homepage
        } catch (err) {
            console.error('Unexpected error deleting profile:', err);
            setMessage('Unexpected error occurred while deleting profile.');
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
                .update({ [field]: updatedList })
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
                {message && <p className="profile-message">{message}</p>}
                <form className="profile-form">
                    <div className="form-group">
                        <label htmlFor="forename">Forename:</label>
                        <input
                            id="forename"
                            type="text"
                            value={profile.forename}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="surname">Surname:</label>
                        <input
                            id="surname"
                            type="text"
                            value={profile.surname}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Location:</label>
                        <input
                            id="country"
                            type="text"
                            placeholder="Country"
                            value={profile.location?.country || ''} // Null-safe access
                            onChange={(e) =>
                                setProfile((prev) => ({
                                    ...prev,
                                    location: { ...prev.location, country: e.target.value },
                                }))
                            }
                        />
                        <input
                            id="city"
                            type="text"
                            placeholder="City"
                            value={profile.location?.city || ''} // Null-safe access
                            onChange={(e) =>
                                setProfile((prev) => ({
                                    ...prev,
                                    location: { ...prev.location, city: e.target.value },
                                }))
                            }
                        />
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
                            onChange={handleChange}
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
                    <button type="button" onClick={saveProfile}>
                        Save Profile
                    </button>

                    {/* Genre + Instrument */}
                    <div className="form-group">
                        <h3>Genre + Instrument:</h3>
                        <div className="input-container">
                            <input
                                type="text"
                                placeholder="Genre"
                                value={newGenre}
                                onChange={(e) => setNewGenre(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Instrument"
                                value={newInstrument}
                                onChange={(e) => setNewInstrument(e.target.value)}
                            />
                            <button type="button" onClick={handleAddGenreInstrument}>
                                Add
                            </button>
                        </div>
                        <ul>
                            {profile.genre_instrument?.map((item, index) => (
                                <li key={index}>
                                    {item.genre} - {item.instrument}{' '}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteGenreInstrument(index)}
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
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
                                    setNewSocialLink(selectedPlatform ? selectedPlatform.prefix : ''); // Prefill the input
                                }}
                            >
                                <option value="">Select Platform</option>
                                {socialPlatforms.map((platform, index) => (
                                    <option key={index} value={platform.name}>
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
                                    </a>{' '}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteItem('social', index)}
                                    >
                                        Delete
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
                            <button type="button" onClick={handleAddCertificate}>
                                Add
                            </button>
                        </div>
                        <ul>
                            {profile.certificates?.map((cert, index) => (
                                <li key={index}>
                                    {cert.certificate} from {cert.organization}{' '}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteItem('certificates', index)}
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Video Links */}
                    <div className="form-group">
                        <h3>Video Links:</h3>
                        <div className="input-container">
                            <input
                                type="text"
                                placeholder="Add a video link"
                                value={newVideoLink}
                                onChange={(e) => setNewVideoLink(e.target.value)}
                            />
                            <button type="button" onClick={handleAddVideoLink}>
                                Add
                            </button>
                        </div>
                        <ul>
                            {profile.video_links?.map((link, index) => (
                                <li key={index}>
                                    <a href={link} target="_blank" rel="noopener noreferrer">
                                        {link}
                                    </a>{' '}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteItem('video_links', index)}
                                    >
                                        Delete
                                    </button>
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
                        type="text"
                        placeholder='Type "delete my profile"'
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