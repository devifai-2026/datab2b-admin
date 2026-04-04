import api from './api';

const login = async (email: string, password: string) => {
  const response = await api.post('/auth/admin-login', { email, password });

  const activeStatus = response.data?.active ?? response.data?.user?.active;
  if (activeStatus === false) {
    throw new Error('Your account is deactivated. Please contact admin.');
  }

  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

const updateProfile = async (profileData: any) => {
  const response = await api.put('/auth/profile', profileData);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const getDashboardStats = async () => {
  const response = await api.get('/auth/stats');
  return response.data;
};

const authService = {
  login,
  logout,
  getCurrentUser,
  getProfile,
  updateProfile,
  getDashboardStats,
};

export default authService;
