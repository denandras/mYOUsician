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
  const [sortMethod, setSortMethod] = useState('name'); // default to 'name'
  const [selectedRole, setSelectedRole] = useState('');

  // Sorting options
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'education', label: 'Education' }
  ];

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
        .select('name, category') // <-- include category
        .order('category', { ascending: true })
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
        let searchString = `${selectedGenre} ${selectedInstrument}`;
        if (selectedRole) {
          searchString += ` (${selectedRole})`;
        }
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
                : { name: e.name || e.degree || '', place: e.place || e.school || '', id: e.id }
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

      // Sort users based on sortMethod
      let sortedUsers = [...filteredUsers];
      if (sortMethod === 'name') {
        sortedUsers.sort((a, b) =>
          ((a.forename || '') + (a.surname || '')).localeCompare((b.forename || '') + (b.surname || ''))
        );
      } else if (sortMethod === 'education') {
        // Sort from highest education to lowest (highest id first)
        sortedUsers.sort((a, b) => {
          const getHighest = arr =>
            Array.isArray(arr) && arr.length > 0
              ? arr.reduce((acc, curr) => (curr && curr.id && (!acc || curr.id > acc.id) ? curr : acc), null)
              : null;
          const aEdu = getHighest(a.education);
          const bEdu = getHighest(b.education);
          return ((bEdu?.id || 0) - (aEdu?.id || 0)); // highest first
        });
      }

      setUsers(sortedUsers);
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
        <p className="database-description">Search musicians.</p>

        <div
          className="search-form"
          style={{
            display: 'flex',
            flexDirection: 'row', // <-- make it a row
            alignItems: 'center',
            gap: 16,
            margin: '32px 0'
          }}
        >
          {/* Genre dropdown */}
          <div className="filter-container">
            <label htmlFor="genre-filter" className="filter-label">Genre:</label>
            <select
              id="genre-filter"
              className="filter-dropdown"
              value={selectedGenre}
              onChange={handleGenreChange}
            >
              <option value="">select</option>
              {genres.map((genre, index) => (
                <option key={index} value={genre.name}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Instrument dropdown */}
          <div className="filter-container">
            <label htmlFor="instrument-filter" className="filter-label">Instrument:</label>
            <select
              id="instrument-filter"
              className="filter-dropdown"
              value={selectedInstrument}
              onChange={handleInstrumentChange}
            >
              <option value="">select</option>
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
          </div>

          {/* Role dropdown */}
          <div className="filter-container">
            <label htmlFor="role-filter" className="filter-label">Role:</label>
            <select
              id="role-filter"
              className="filter-dropdown"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
            >
              <option value="">select</option>
              <option value="artist">artist</option>
              <option value="teacher">teacher</option>
            </select>
          </div>

          {/* Sort dropdown */}
          <div className="filter-container">
            <label htmlFor="sort-method" className="filter-label">Sort by:</label>
            <select
              id="sort-method"
              className="filter-dropdown"
              value={sortMethod}
              onChange={e => setSortMethod(e.target.value)}
              required
            >
              <option value="" disabled>Select sorting method</option>
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Search button */}
          <div className="filter-container">
            <button
              className="search-button"
              onClick={fetchUsers}
              disabled={!canSearch || loading || !sortMethod}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <section className="user-results">
          {users.length > 0 ? (
            <div className="user-card-list">
              {users.map((user, index) => (
                <div key={index} className="user-card">
                  {/* Name */}
                  <div className="user-card-name" style={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: 8 }}>
                    {user.forename || user.surname ? `${user.forename || ''} ${user.surname || ''}`.trim() : 'N/A'}
                  </div>
                  {/* Two columns */}
                  <div className="user-card-columns" style={{ display: 'flex', gap: 24 }}>
                    {/* Left column */}
                    <div className="user-card-col-left" style={{ flex: 1 }}>
                      {Array.isArray(user.genre_instrument) && user.genre_instrument.length > 0 && (
                        <div>{user.genre_instrument.join(', ')}</div>
                      )}
                      {Array.isArray(user.occupation) && user.occupation.length > 0 && (
                        <div style={{ marginTop: 8 }}>{user.occupation.join(', ')}</div>
                      )}
                      {Array.isArray(user.education) && user.education.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {user.education.map((edu, i) =>
                            typeof edu === 'object'
                              ? `${edu.place}${edu.name ? ` – ${edu.name}` : ''}`
                              : edu
                          ).join(', ')}
                        </div>
                      )}
                    </div>
                    {/* Right column */}
                    <div className="user-card-col-right" style={{ flex: 1 }}>
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
                                {socialLinks.map((item, i) => (
                                  <a
                                    key={i}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={item.platform}
                                    style={{ marginRight: 8, fontSize: '1.2em' }}
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
                      {user.email && (
                        <div style={{ marginTop: 8 }}>
                          <a href={`mailto:${user.email}`}>Email</a>
                        </div>
                      )}
                      {user.phone && (
                        <div style={{ marginTop: 8 }}>
                          {user.phone}
                        </div>
                      )}
                      {Array.isArray(user.video_links) && user.video_links.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {user.video_links.map((link, i) => (
                            <a
                              key={i}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ marginRight: 8 }}
                            >
                              {`Video ${i + 1}`}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            hasSearched && <div>No users found.</div>
          )}
        </section>
      </section>
    </main>
  );
}