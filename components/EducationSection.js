export default function EducationSection({
  profile,
  newSchool,
  setNewSchool,
  newDegree,
  setNewDegree,
  handleAddEducation,
  handleDeleteItem,
}) {
  return (
    <div className="form-group">
      <h3>Education:</h3>
      <div className="input-container">
        <input
          type="text"
          placeholder="School"
          value={newSchool}
          onChange={e => setNewSchool(e.target.value)}
        />
        <input
          type="text"
          placeholder="Degree"
          value={newDegree}
          onChange={e => setNewDegree(e.target.value)}
        />
        <button type="button" onClick={handleAddEducation}>
          Add
        </button>
      </div>
      <ul>
        {(Array.isArray(profile.education) ? profile.education : []).map((edu, index) => (
          <li key={index}>
            {typeof edu === 'object'
              ? `${edu.degree || ''}${edu.school ? ` from ${edu.school}` : ''}`
              : edu}
            <button
              type="button"
              className="delete-x"
              title="Delete"
              onClick={() => handleDeleteItem('education', index)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}