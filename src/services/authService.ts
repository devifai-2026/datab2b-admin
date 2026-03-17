
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

const login = async (email: string, password: string) => {
  const response = await axios.post(API_URL + 'admin-login', { email, password });
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
