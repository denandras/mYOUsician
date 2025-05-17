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
  const [currentUserEmail, setCurrentUserEmail] = useState(''); // Add this state at the top

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
        .select('forename, surname, email, genre_instrument, social, certificates, education, occupation, video_links');

      if (selectedGenre && selectedInstrument) {
        const searchString = `${selectedGenre} ${selectedInstrument}`;
        query = query.contains('genre_instrument', [searchString]);
      }

      const { data, error } = await query;
      // Parse fields that may be stored as JSON strings
      const parsedUsers = (data || []).map(user => ({
        ...user,
        social: Array.isArray(user.social)
          ? user.social
          : (typeof user.social === 'string' ? (() => { try { return JSON.parse(user.social); } catch { return []; } })() : []),
        certificates: Array.isArray(user.certificates)
          ? user.certificates.map(cert =>
              typeof cert === 'string'
                ? (() => { try { return JSON.parse(cert); } catch { return cert; } })()
                : cert
            )
          : [],
        education: Array.isArray(user.education)
          ? user.education.map(e =>
              typeof e === 'string'
                ? (() => { try { return JSON.parse(e); } catch { return { name: e, place: '' }; } })()
                : { name: e.name || e.degree || '', place: e.place || e.school || '' }
            )
          : [],
        occupation: Array.isArray(user.occupation)
          ? user.occupation
          : (typeof user.occupation === 'string' ? (() => { try { return JSON.parse(user.occupation); } catch { return []; } })() : []),
        video_links: Array.isArray(user.video_links)
          ? user.video_links
          : (typeof user.video_links === 'string' ? (() => { try { return JSON.parse(user.video_links); } catch { return []; } })() : []),
      }));
      const filteredUsers = parsedUsers.filter(user => user.email !== currentUserEmail);
      setUsers(filteredUsers);
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

  // Fetch current user email (example, adjust to your auth logic)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserEmail(user?.email || '');
    };
    fetchCurrentUser();
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
          <>
            <div className="user-list-header" style={{ display: 'flex', fontWeight: 'bold', borderBottom: '2px solid #ccc', padding: '0.5em 0' }}>
              <div style={{ flex: 2 }}>Name</div>
              <div style={{ flex: 2 }}>Instrument(s) & Genre(s)</div>
              <div style={{ flex: 2 }}>Email</div>
              <div style={{ flex: 2 }}>Social Links</div>
              <div style={{ flex: 2 }}>Education</div>
              <div style={{ flex: 2 }}>Occupation</div>
              <div style={{ flex: 2 }}>Certificates</div>
              <div style={{ flex: 2 }}>Video Links</div>
            </div>
            <ul className="user-list" style={{ listStyle: 'none', padding: 0 }}>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <div key={index} className="user-list-row" style={{ display: 'flex', borderBottom: '1px solid #eee', padding: '0.5em 0' }}>
                    <div style={{ flex: 2 }}>{user.forename || user.surname ? `${user.forename || ''} ${user.surname || ''}`.trim() : 'N/A'}</div>
                    <div style={{ flex: 2 }}>{Array.isArray(user.genre_instrument) && user.genre_instrument.length > 0 ? user.genre_instrument.join(', ') : ''}</div>
                    <div style={{ flex: 2 }}>
                      {user.email
                        ? <a href={`mailto:${user.email}`}>Email</a>
                        : ''}
                    </div>
                    <div style={{ flex: 2 }}>
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
                            return socialLinks.map((item, i) => (
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
                            ));
                          }
                          return null;
                        } catch (err) {
                          return null;
                        }
                      })()}
                    </div>
                    <div style={{ flex: 2 }}>
                      {Array.isArray(user.education) && user.education.length > 0
                        ? user.education.map((edu, i) =>
                            typeof edu === 'object'
                              ? `${edu.place}${edu.name ? ` – ${edu.name}` : ''}`
                              : edu
                          ).join(', ')
                        : ''}
                    </div>
                    <div style={{ flex: 2 }}>{Array.isArray(user.occupation) && user.occupation.length > 0 ? user.occupation.join(', ') : ''}</div>
                    <div style={{ flex: 2 }}>
                      {Array.isArray(user.certificates) && user.certificates.length > 0
                        ? user.certificates.map((cert, i) =>
                            typeof cert === 'object'
                              ? `${cert.certificate || ''}${cert.organization ? ` from ${cert.organization}` : ''}`
                              : cert
                          ).join(', ')
                        : ''}
                    </div>
                    <div style={{ flex: 2 }}>
                      {Array.isArray(user.video_links) && user.video_links.length > 0
                        ? user.video_links.map((link, i) => (
                            <a
                              key={i}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ marginRight: 8 }}
                            >
                              {`Video ${i + 1}`}
                            </a>
                          ))
                        : ''}
                    </div>
                  </div>
                ))
              ) : (
                <li>No users found.</li>
              )}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}