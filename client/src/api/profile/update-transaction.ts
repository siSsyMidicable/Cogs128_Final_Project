const API_BASE_URL = 'http://<10.34.44.217>:4000';

interface ProfileData {
  name?: string;
  email?: string;
  bio?: string;
  // Add other profile fields as needed
}

export const updateProfile = async (profileData: ProfileDat>
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
  return response.json();
};
