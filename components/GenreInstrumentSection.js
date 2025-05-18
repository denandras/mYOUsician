export default function GenreInstrumentSection({
  genres,
  instruments,
  profile,
  newGenre,
  setNewGenre,
  newInstrument,
  setNewInstrument,
  handleAddGenreInstrument,
  handleDeleteGenreInstrument,
}) {
  return (
    <div className="form-group">
      <h3>Genre + Instrument:</h3>
      <div className="input-container">
        <select value={newGenre} onChange={e => setNewGenre(e.target.value)}>
          <option value="">Select Genre</option>
          {genres.map((g, idx) => (
            <option key={idx} value={g.name}>{g.name}</option>
          ))}
        </select>
        <select value={newInstrument} onChange={e => setNewInstrument(e.target.value)}>
          <option value="">Select Instrument</option>
          {(() => {
            const grouped = instruments.reduce((acc, inst) => {
              if (!acc[inst.category]) acc[inst.category] = [];
              acc[inst.category].push(inst);
              return acc;
            }, {});
            return Object.keys(grouped).sort().map(category => (
              <optgroup key={category} label={category}>
                {grouped[category].sort((a, b) => a.name.localeCompare(b.name)).map(inst => (
                  <option key={inst.name} value={inst.name}>{inst.name}</option>
                ))}
              </optgroup>
            ));
          })()}
        </select>
        <button type="button" onClick={handleAddGenreInstrument}>Add</button>
      </div>
      <ul>
        {Array.isArray(profile.genre_instrument) && profile.genre_instrument.length > 0 ? (
          profile.genre_instrument.map((item, index) => (
            <li key={index}>
              {item}
              <button type="button" onClick={() => handleDeleteGenreInstrument(index)}>×</button>
            </li>
          ))
        ) : (
          <li>No genre-instrument pairs</li>
        )}
      </ul>
    </div>
  );
}