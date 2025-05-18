export default function VideoLinksSection({
  profile,
  newVideoLink,
  setNewVideoLink,
  handleAddVideoLink,
  handleDeleteItem,
}) {
  return (
    <div className="form-group">
      <h3>Video Links:</h3>
      <div className="input-container">
        <input
          type="text"
          placeholder="YouTube or other video link"
          value={newVideoLink}
          onChange={e => setNewVideoLink(e.target.value)}
        />
        <button type="button" onClick={handleAddVideoLink}>
          Add
        </button>
      </div>
      <ul>
        {(Array.isArray(profile.video_links) ? profile.video_links : []).map((link, index) => (
          <li key={index}>
            <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
            <button
              type="button"
              className="delete-x"
              title="Delete"
              onClick={() => handleDeleteItem('video_links', index)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}