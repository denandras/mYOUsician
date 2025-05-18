import React from 'react';

export default function SocialLinksSection({
  socialPlatforms,
  profile,
  newSocialPlatform,
  setNewSocialPlatform,
  newSocialLink,
  setNewSocialLink,
  handleAddSocialLink,
  handleDeleteItem,
}) {
  return (
    <div className="form-group">
      <h3>Social Links:</h3>
      <div className="input-container">
        <select
          value={newSocialPlatform}
          onChange={e => {
            const selectedPlatform = socialPlatforms.find(
              (platform) => platform.name === e.target.value
            );
            setNewSocialPlatform(e.target.value);
            setNewSocialLink(selectedPlatform ? selectedPlatform.prefix : '');
          }}
        >
          <option value="">Select Platform</option>
          {socialPlatforms.map((platform, index) => (
            <option key={index} value={platform.name}>
              {platform.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Add a social link"
          value={newSocialLink}
          onChange={e => setNewSocialLink(e.target.value)}
        />
        <button type="button" onClick={handleAddSocialLink}>
          Add
        </button>
      </div>
      <ul>
        {profile.social?.map((link, index) => (
          <li key={index}>
            <a href={link.link} target="_blank" rel="noopener noreferrer">
              {link.platform}: {link.link}
            </a>
            <button
              type="button"
              className="delete-x"
              title="Delete"
              onClick={() => handleDeleteItem('social', index)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}