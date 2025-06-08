// Hard-coded social media platforms to replace database dependency
export interface SocialPlatform {
  id: string;
  name: string;
  base_url: string | null;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: '1',
    name: 'Instagram',
    base_url: 'https://www.instagram.com/'
  },
  {
    id: '2', 
    name: 'Facebook',
    base_url: 'https://www.facebook.com/'
  },
  {
    id: '3',
    name: 'YouTube',
    base_url: 'https://www.youtube.com/'
  },
  {
    id: '4',
    name: 'Website',
    base_url: null // Personal websites can have any URL
  },
  {
    id: '5',
    name: 'Spotify',
    base_url: 'https://open.spotify.com/'
  },
  {
    id: '6',
    name: 'SoundCloud',
    base_url: 'https://soundcloud.com/'
  },
  {
    id: '7',
    name: 'TikTok',
    base_url: 'https://www.tiktok.com/'
  },
  {
    id: '8',
    name: 'X',
    base_url: 'https://x.com/'
  },
  {
    id: '9',
    name: 'LinkedIn',
    base_url: 'https://www.linkedin.com/'
  }
];

// Helper function to get a social platform by name
export const getSocialPlatformByName = (name: string): SocialPlatform | undefined => {
  return SOCIAL_PLATFORMS.find(platform => 
    platform.name.toLowerCase() === name.toLowerCase()
  );
};

// Helper function to validate social URL against platform base URL
export const validateSocialUrl = (platformName: string, url: string): boolean => {
  if (!url.trim()) return true; // Empty URLs are allowed
  
  const platform = getSocialPlatformByName(platformName);
  
  // Special validation for Website - require https prefix
  if (platformName.toLowerCase() === 'website') {
    return url.toLowerCase().startsWith('https://');
  }
  
  if (!platform?.base_url) return true; // No base URL restriction for other platforms without base_url
  
  return url.toLowerCase().startsWith(platform.base_url.toLowerCase());
};
