import React, { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import Header from '../components/Header';

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
    if (!selectedGenre && !selectedInstrument) {
      setUsers([]);
      return;
    }
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('forename, surname, email, genre_instrument, social');

      if (selectedGenre && selectedInstrument) {
        query = query.contains('genre_instrument', { genre: selectedGenre, instrument: selectedInstrument });
      } else if (selectedGenre) {
        query = query.contains('genre_instrument', { genre: selectedGenre });
      } else if (selectedInstrument) {
        query = query.contains('genre_instrument', { instrument: selectedInstrument });
      }

      const { data, error } = await query;
      console.log('Fetched users:', data, 'Error:', error);

      if (error) {
        alert('Error fetching users.');
        setUsers([]);
        return;
      }

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
    // Do NOT fetch users on mount
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
  const canSearch = selectedGenre || selectedInstrument;

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

        {/* Only show table if a search has been made */}
        {hasSearched && canSearch && !loading && (
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Instrument(s) & Genre(s)</th>
                <th>Email</th>
                <th>Social Links</th>
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