export default function PersonalDataSection({
  profile,
  countries,
  cities,
  selectedCountry,
  setSelectedCountry,
  selectedCity,
  setSelectedCity,
  handleChange,
  savePersonalData,
}) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="forename">Forename:</label>
        <input id="forename" type="text" value={profile.forename} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="surname">Surname:</label>
        <input id="surname" type="text" value={profile.surname} onChange={handleChange} required />
      </div>
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
            <option key={c.geonameId} value={c.countryCode}>{c.countryName}</option>
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
            <option key={city.geonameId} value={city.geonameId}>{city.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input id="email" type="email" value={profile.email} onChange={handleChange} disabled />
      </div>
      <div className="form-group">
        <label htmlFor="phone">Phone:</label>
        <input
          id="phone"
          type="text"
          value={profile.phone}
          onChange={e => {
            const noSpaces = e.target.value.replace(/\s+/g, '');
            handleChange({ target: { id: 'phone', value: noSpaces } });
          }}
        />
      </div>
      <div className="form-group">
        <label htmlFor="bio">Bio:</label>
        <textarea id="bio" value={profile.bio} onChange={handleChange} />
      </div>
      <button type="button" onClick={savePersonalData}>Save Personal Data</button>
    </>
  );
}