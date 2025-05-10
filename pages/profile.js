import { useEffect, useState } from 'react';
import supabase from '../lib/supabase'; // Import the singleton Supabase client

export default function Profile() {
    const [profile, setProfile] = useState({
        forename: '',
        surname: '',
        location: { country: '', city: '' }, // Default value for location
        email: '',
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

    // Fetch user data on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    window.location.href = '/login';
                    return;
                }

                const userId = session.user.id;

                const { data: user, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('uid', userId)
                    .single();

                if (error) {
                    console.error('Error fetching user:', error);
                } else {
                    // Ensure genre_instrument and other fields have default values if null
                    const updatedUser = {
                        ...user,
                        location: user.location || { country: '', city: '' },
                        genre_instrument: user.genre_instrument || [], // Default to empty array
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
    const handleAddGenreInstrument = () => {
        if (!newGenre || !newInstrument) return;
        setProfile((prev) => ({
            ...prev,
            genre_instrument: [...prev.genre_instrument, { genre: newGenre, instrument: newInstrument }],
        }));
        setNewGenre('');
        setNewInstrument('');
    };

    // Handle deleting a genre-instrument pair
    const handleDeleteGenreInstrument = (index) => {
        setProfile((prev) => ({
            ...prev,
            genre_instrument: prev.genre_instrument.filter((_, i) => i !== index),
        }));
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
            </section>
        </main>
    );
}