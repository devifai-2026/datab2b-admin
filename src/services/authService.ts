
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

const login = async (email: string, password: string) => {
  const response = await axios.post(API_URL + 'admin-login', { email, password });

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
  return user ? JSON.parse(user) : null;
};

const authService = {
  login,
  logout,
  getCurrentUser,
};

export default authService;
