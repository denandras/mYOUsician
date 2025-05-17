import React, { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import Header from '../components/Header';
import verifyUser from '../lib/getuser'; // Add this import if you want to check auth

export default function Database() {
  const [users, setUsers] = useState([]);
  const [genres, setGenres] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Track if search button was pressed

  // Fetch genres for the dropdown
  const fetchGenres = async () => {
    try {
      const { data, error } = await supabase
        .from('genres')
        .select('name');
      if (error) {
        console.error('Error fetching genres:', error);
        return;
      }
      setGenres(data || []);
    } catch (err) {
      console.error('Unexpected error fetching genres:', err);
    }
  };

  // Fetch instruments for the dropdown
  const fetchInstruments = async () => {
    try {
      const { data, error } = await supabase
        .from('instruments')
        .select('name')
        .order('name', { ascending: true });
      if (error) {
        console.error('Error fetching instruments:', error);
        return;
      }
      setInstruments(data || []);
    } catch (err) {
      console.error('Unexpected error fetching instruments:', err);
    }
  };

  // Fetch users from the database
  const fetchUsers = async () => {
    setHasSearched(true);
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('forename, surname, email, genre_instrument, social');

      if (selectedGenre && selectedInstrument) {
        const searchString = `${selectedGenre} ${selectedInstrument}`;
        query = query.contains('genre_instrument', [searchString]);
      }

      const { data, error } = await query;
      setUsers(data || []);
    } catch (err) {
      alert('Unexpected error fetching users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
    fetchInstruments();
    // Optionally, check auth here:
    // const checkUser = async () => {
    //   const user = await verifyUser();
    //   // You can use user info if needed
    // };
    // checkUser();
  }, []);

  // Handle genre selection
  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setHasSearched(false); // Reset search state on change
  };

  // Handle instrument selection
  const handleInstrumentChange = (e) => {
    setSelectedInstrument(e.target.value);
    setHasSearched(false); // Reset search state on change
  };

  // Determine if search is enabled
  const canSearch = selectedGenre && selectedInstrument;

  return (
    <main className="database-page">
      <Header />
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
            <option value="">Select Genre</option>
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
            <option value="">Select Instrument</option>
            {instruments.map((instrument, index) => (
              <option key={index} value={instrument.name}>
                {instrument.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <div className="filter-container">
          <button
            className="search-button"
            onClick={fetchUsers}
            disabled={!canSearch || loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Only show list if a search has been made */}
        {hasSearched && canSearch && !loading && (
          <ul className="user-list">
            {users.length > 0 ? (
              users.map((user, index) => (
                <li key={index} className="user-list-item" style={{ marginBottom: '1.5em', borderBottom: '1px solid #eee', paddingBottom: '1em' }}>
                  <div>
                    <strong>Name:</strong> {user.forename || user.surname ? `${user.forename || ''} ${user.surname || ''}`.trim() : 'N/A'}
                  </div>
                  {Array.isArray(user.genre_instrument) && user.genre_instrument.length > 0 && (
                    <div>
                      <strong>Instrument(s) & Genre(s):</strong> {user.genre_instrument.join(', ')}
                    </div>
                  )}
                  {user.email && (
                    <div>
                      <strong>Email:</strong> <a href={`mailto:${user.email}`}>{user.email}</a>
                    </div>
                  )}
                  {user.social && (() => {
                    try {
                      const socialLinks = typeof user.social === 'string' ? JSON.parse(user.social) : user.social;
                      if (Array.isArray(socialLinks) && socialLinks.length > 0) {
                        const icons = {
                          Instagram: <span role="img" aria-label="Instagram">📸</span>,
                          Facebook: <span role="img" aria-label="Facebook">📘</span>,
                          TikTok: <span role="img" aria-label="TikTok">🎵</span>,
                          X: <span role="img" aria-label="X">🐦</span>,
                          LinkedIn: <span role="img" aria-label="LinkedIn">💼</span>,
                        };
                        return (
                          <div>
                            <strong>Social Links:</strong>{' '}
                            {socialLinks.map((item, i) => (
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
                            ))}
                          </div>
                        );
                      }
                      return null;
                    } catch (err) {
                      return null;
                    }
                  })()}
                </li>
              ))
            ) : (
              <li>No users found.</li>
            )}
          </ul>
        )}
      </section>
    </main>
  );
}