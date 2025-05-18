import React from 'react';

export default function CertificatesSection({
  profile,
  newCertificate,
  setNewCertificate,
  newCertificateOrganization,
  setNewCertificateOrganization,
  handleAddCertificate,
  handleDeleteItem,
}) {
  return (
    <div className="form-group">
      <h3>Certificates:</h3>
      <div className="input-container">
        <input
          type="text"
          placeholder="Certificate"
          value={newCertificate}
          onChange={e => setNewCertificate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Organization"
          value={newCertificateOrganization}
          onChange={e => setNewCertificateOrganization(e.target.value)}
        />
        <button type="button" onClick={handleAddCertificate}>
          Add
        </button>
      </div>
      <ul>
        {(Array.isArray(profile.certificates) ? profile.certificates : []).map((cert, index) => (
          <li key={index}>
            {typeof cert === 'object'
              ? `${cert.certificate || ''}${cert.organization ? ` from ${cert.organization}` : ''}`
              : cert}
            <button
              type="button"
              className="delete-x"
              title="Delete"
              onClick={() => handleDeleteItem('certificates', index)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}