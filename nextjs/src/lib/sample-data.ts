// Sample musician profiles for development testing
export const sampleProfiles = [
  {
    id: 'sample-1',
    email: 'johndoe@example.com',
    forename: 'John',
    surname: 'Doe',
    location: { city: 'New York', country: 'USA' },
    phone: '+1234567890',
    bio: 'Professional violinist with 10 years of experience in classical music.',
    occupation: ['Violinist', 'Music Teacher'],
    education: [
      { type: 'Master', school: 'Juilliard School' },
      { type: 'Bachelor', school: 'New England Conservatory' }
    ],
    certificates: ['ABRSM Grade 8', 'Trinity College Diploma'],
    genre_instrument: [
      { genre: 'classical', instrument: 'violin', category: 'artist' },
      { genre: 'chamber', instrument: 'violin', category: 'artist' }
    ],
    video_links: ['https://www.youtube.com/watch?v=example1', 'https://www.youtube.com/watch?v=example2'],
    social: {
      youtube: 'https://www.youtube.com/user/johndoe',
      instagram: 'https://www.instagram.com/johndoe'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sample-2',
    email: 'janesmith@example.com',
    forename: 'Jane',
    surname: 'Smith',
    location: { city: 'London', country: 'UK' },
    phone: '+4412345678',
    bio: 'Jazz pianist and composer with a passion for teaching.',
    occupation: ['Pianist', 'Composer', 'Music Teacher'],
    education: [
      { type: 'Bachelor', school: 'Royal Academy of Music' }
    ],
    certificates: ['ABRSM Jazz Piano Grade 8'],
    genre_instrument: [
      { genre: 'jazz', instrument: 'piano', category: 'artist' },
      { genre: 'jazz', instrument: 'piano', category: 'teacher' }
    ],
    video_links: ['https://www.youtube.com/watch?v=example3'],
    social: {
      facebook: 'https://www.facebook.com/janesmith',
      instagram: 'https://www.instagram.com/janesmith'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sample-3',
    email: 'mikebrown@example.com',
    forename: 'Mike',
    surname: 'Brown',
    location: { city: 'Budapest', country: 'Hungary' },
    phone: '+361234567',
    bio: 'Classical guitarist and teacher with expertise in Spanish guitar music.',
    occupation: ['Guitarist', 'Music Teacher'],
    education: [
      { type: 'Master', school: 'Liszt Ferenc Academy of Music' },
      { type: 'Bachelor', school: 'Berklee College of Music' }
    ],
    certificates: ['Guitar Teaching Certification'],
    genre_instrument: [
      { genre: 'classical', instrument: 'guitar', category: 'teacher' },
      { genre: 'flamenco', instrument: 'guitar', category: 'artist' }
    ],
    video_links: ['https://www.youtube.com/watch?v=example4', 'https://www.youtube.com/watch?v=example5'],
    social: {
      youtube: 'https://www.youtube.com/user/mikebrown'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
