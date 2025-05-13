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

      // Apply filters if selected
      if (genreFilter) {
        query = query.ilike('genre_instrument', `%${genreFilter}%`);
      }
      if (instrumentFilter) {
        query = query.ilike('genre_instrument', `%${instrumentFilter}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data || []); // Set the fetched users
    } catch (err) {
      console.error('Unexpected error fetching users:', err);
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
                <th>Forename</th>
                <th>Surname</th>
                <th>Email</th>
                <th>Instrument-Genre</th>
                <th>Social Links</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={index}>
                    <td>{user.forename || 'N/A'}</td>
                    <td>{user.surname || 'N/A'}</td>
                    <td>{user.email || 'N/A'}</td>
                    <td>
                      {user.genre_instrument ? (
                        (() => {
                          try {
                            const parsedGenres = JSON.parse(user.genre_instrument); // Attempt to parse JSON
                            return Array.isArray(parsedGenres)
                          ? parsedGenres.map((item, i) => {
                              try {
                                const parsedItem = typeof item === 'string' ? JSON.parse(item) : item;
                                return (
                                  <div key={i}>
                                    {parsedItem.genre} - {parsedItem.instrument}
                                  </div>
                                );
                              } catch (err) {
                                return <div key={i}>Invalid item format</div>;
                              }
                            })
                            : <div>Invalid format</div>;

                          } catch (err) {
                            return <div>Invalid JSON</div>; // Handle parsing errors
                          }
                        })()
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      {user.social ? (
                        (() => {
                          try {
                            // Check if social is a JSON string and parse it
                            const socialLinks = typeof user.social === 'string' ? JSON.parse(user.social) : user.social;

                            // Check if it's an array and render each link
                            return Array.isArray(socialLinks) ? (
                              socialLinks.map((item, i) => (
                                <div key={i}>
                                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                                    {item.platform}
                                  </a>
                                </div>
                              ))
                            ) : (
                              <div>Invalid format</div> // Handle non-array data
                            );
                          } catch (err) {
                            return <div>Invalid JSON</div>; // Handle parsing errors
                          }
                        })()
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}