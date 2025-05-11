import { useEffect, useState } from 'react';
import supabase from '../lib/supabase'; // Import the singleton Supabase client

export default function Profile() {
    const [profile, setProfile] = useState({
        forename: '',
        surname: '',
        location: { country: '', city: '' }, // Default value for location
        email: '', // Email will be extracted from the session
        phone: '',
        bio: '',
        occupation: [],
        awards: [],
        education: [],
        genre_instrument: [], // Default value: empty array
        social: [],
        password: '',
        video_links: [],
    });

    const [message, setMessage] = useState('');
    const [newGenre, setNewGenre] = useState(''); // For adding a new genre
    const [newInstrument, setNewInstrument] = useState(''); // For adding a new instrument
    const [deleteConfirmation, setDeleteConfirmation] = useState(''); // For Danger Zone input

    // Fetch user data and email from session on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Error fetching session:', sessionError);
                    return;
                }

                if (!session || !session.user) {
                    console.error('No session or user found. Redirecting to login.');
                    window.location.href = '/login';
                    return;
                }

                const userId = session.user.id;
                const userEmail = session.user.email; // Extract email from session

                // Debugging logs
                console.log('Session:', session);
                console.log('User ID:', userId);

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
                            awards: [],
                            education: [],
                            genre_instrument: [], // Default empty array
                            social: [],
                            video_links: [],
                        }])
                        .select()
                        .single();

                    if (insertError) {
                        console.error('Error creating new profile:', insertError);
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

                    const updatedUser = {
                        ...user,
                        email: userEmail, // Set email from session
                        location: user.location || { country: '', city: '' },
                        genre_instrument: parsedGenreInstrument, // Use the parsed array
                    };
                    setProfile(updatedUser);
                }
            } catch (err) {
                console.error('Unexpected error fetching profile:', err);
            }
        };

        fetchProfile();
    }, []);

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

    // Logout function
    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error logging out:', error);
            } else {
                window.location.href = '/'; // Redirect to index page
            }
        } catch (err) {
            console.error('Unexpected error during logout:', err);
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

    return (
        <main className="profile-page">
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
                    <div className="form-group">
                        <label>Genre + Instrument:</label>
                        <ul>
                            {profile.genre_instrument?.map((item, index) => ( // Null-safe access
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
                            Add Genre + Instrument
                        </button>
                    </div>
                    <button type="button" onClick={saveProfile}>
                        Save Profile
                    </button>
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
                        placeholder='Type "delete my profile" to confirm'
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