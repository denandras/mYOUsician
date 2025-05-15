import React, { useEffect, useState } from 'react';
import supabase from '../lib/supabase'; // Import the Supabase client
import Header from '../components/Header';

export default function Database() {
  const [users, setUsers] = useState([]); // State to store queried users
  const [genres, setGenres] = useState([]); // State to store genre options
  const [instruments, setInstruments] = useState([]); // State to store instrument options
  const [selectedGenre, setSelectedGenre] = useState(''); // State for the selected genre
  const [selectedInstrument, setSelectedInstrument] = useState(''); // State for the selected instrument
  const [loading, setLoading] = useState(true); // State to track loading

  // Fetch users from the database
  const fetchUsers = async (genreFilter = '', instrumentFilter = '') => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('forename, surname, email, genre_instrument, social');

      // Filter by genre using PostgREST jsonb contains operator
      if (genreFilter) {
        query = query.contains('genre_instrument', [{ genre: genreFilter }]);
      }
      // Filter by instrument using PostgREST jsonb contains operator
      if (instrumentFilter) {
        query = query.contains('genre_instrument', [{ instrument: instrumentFilter }]);
      }

      const { data, error } = await query;

      if (error) {
        alert('Error fetching users.');
        return;
      }

      setUsers(data || []);
    } catch (err) {
      alert('Unexpected error fetching users.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch genres for the dropdown
  const fetchGenres = async () => {
    try {
      const { data, error } = await supabase
        .from('genres') // Assuming a `genres` table exists
        .select('name'); // Fetch genre names

      if (error) {
        console.error('Error fetching genres:', error);
        return;
      }

      setGenres(data || []); // Set the fetched genres
    } catch (err) {
      console.error('Unexpected error fetching genres:', err);
    }
  };

  // Fetch instruments for the dropdown
  const fetchInstruments = async () => {
    try {
      const { data, error } = await supabase
        .from('instruments') // Assuming an `instruments` table exists
        .select('name'); // Fetch instrument names

      if (error) {
        console.error('Error fetching instruments:', error);
        return;
      }

      setInstruments(data || []); // Set the fetched instruments
    } catch (err) {
      console.error('Unexpected error fetching instruments:', err);
    }
  };

  // Fetch users, genres, and instruments on component mount
  useEffect(() => {
    fetchUsers(); // Fetch all users initially
    fetchGenres(); // Fetch genres for the dropdown
    fetchInstruments(); // Fetch instruments for the dropdown
  }, []);

  // Handle genre selection
  const handleGenreChange = (e) => {
    const genre = e.target.value;
    setSelectedGenre(genre);
    fetchUsers(genre, selectedInstrument); // Fetch users filtered by genre and instrument
  };

  // Handle instrument selection
  const handleInstrumentChange = (e) => {
    const instrument = e.target.value;
    setSelectedInstrument(instrument);
    fetchUsers(selectedGenre, instrument); // Fetch users filtered by genre and instrument
  };

  return (
    <main className="database-page">
      <Header /> {/* Add the Header component */}
      <section className="database-container">
        <h1 className="database-title">User Database</h1>
        <p className="database-description">Search and explore user data.</p>

        {/* Dropdown for filtering by genre */}
        <div className="filter-container">
          <label htmlFor="genre-filter" className="filter-label">Filter by Genre:</label>
          <select
            id="genre-filter"
            className="filter-dropdown"
            value={selectedGenre}
            onChange={handleGenreChange}
          >
            <option value="">All Genres</option>
            {genres.map((genre, index) => (
              <option key={index} value={genre.name}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown for filtering by instrument */}
        <div className="filter-container">
          <label htmlFor="instrument-filter" className="filter-label">Filter by Instrument:</label>
          <select
            id="instrument-filter"
            className="filter-dropdown"
            value={selectedInstrument}
            onChange={handleInstrumentChange}
          >
            <option value="">All Instruments</option>
            {instruments.map((instrument, index) => (
              <option key={index} value={instrument.name}>
                {instrument.name}
              </option>
            ))}
          </select>
        </div>

        {/* Display loading state */}
        {loading ? (
          <p className="loading-message">Loading users...</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Instrument(s) & Genre(s)</th>
                <th>Email</th>
                <th>Social Links</th>
                {/* Certificates column is hidden */}
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={index}>
                    {/* Name field */}
                    <td>
                      {user.forename || user.surname
                        ? `${user.forename || ''} ${user.surname || ''}`.trim()
                        : 'N/A'}
                    </td>
                    {/* Instrument(s) & Genre(s) as comma-separated */}
                    <td>
                      {Array.isArray(user.genre_instrument) && user.genre_instrument.length > 0 ? (
                        user.genre_instrument
                          .map((item) => {
                            let genreObj = item;
                            if (typeof item === 'string') {
                              try {
                                genreObj = JSON.parse(item);
                              } catch {
                                return null;
                              }
                            }
                            if (genreObj && genreObj.genre && genreObj.instrument) {
                              return `${genreObj.instrument} (${genreObj.genre})`;
                            }
                            return null;
                          })
                          .filter(Boolean)
                          .join(', ')
                      ) : (
                        'N/A'
                      )}
                    </td>
                    {/* Email */}
                    <td>{user.email || 'N/A'}</td>
                    {/* Social Links as icons */}
                    <td>
                      {user.social ? (() => {
                        try {
                          const socialLinks = typeof user.social === 'string' ? JSON.parse(user.social) : user.social;
                          return Array.isArray(socialLinks) ? (
                            socialLinks.map((item, i) => {
                              // Map platform to icon (FontAwesome or emoji fallback)
                              const icons = {
                                Instagram: <span role="img" aria-label="Instagram">📸</span>,
                                Facebook: <span role="img" aria-label="Facebook">📘</span>,
                                TikTok: <span role="img" aria-label="TikTok">🎵</span>,
                                X: <span role="img" aria-label="X">🐦</span>,
                                LinkedIn: <span role="img" aria-label="LinkedIn">💼</span>,
                              };
                              return (
                                <a
                                  key={i}
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ marginRight: 8, fontSize: '1.2em' }}
                                  title={item.platform}
                                >
                                  {icons[item.platform] || <span>{item.platform}</span>}
                                </a>
                              );
                            })
                          ) : (
                            <div>Invalid format</div>
                          );
                        } catch (err) {
                          return <div>Invalid JSON</div>;
                        }
                      })() : 'N/A'}
                    </td>
                    {/* Certificates column is hidden */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}