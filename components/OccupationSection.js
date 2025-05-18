export default function OccupationSection({
  profile,
  newOccupationRole,
  setNewOccupationRole,
  newOccupationCompany,
  setNewOccupationCompany,
  handleAddOccupation,
  handleDeleteItem,
}) {
  return (
    <div className="form-group">
      <h3>Occupations:</h3>
      <div className="input-container">
        <input
          type="text"
          placeholder="Role"
          value={newOccupationRole}
          onChange={e => setNewOccupationRole(e.target.value)}
        />
        <input
          type="text"
          placeholder="Company/Organization"
          value={newOccupationCompany}
          onChange={e => setNewOccupationCompany(e.target.value)}
        />
        <button type="button" onClick={handleAddOccupation}>
          Add
        </button>
      </div>
      <ul>
        {(Array.isArray(profile.occupation) ? profile.occupation : []).map((occ, index) => (
          <li key={index}>
            {typeof occ === 'object'
              ? `${occ.role || ''}${occ.company ? ` at ${occ.company}` : ''}`
              : occ}
            <button
              type="button"
              className="delete-x"
              title="Delete"
              onClick={() => handleDeleteItem('occupation', index)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}