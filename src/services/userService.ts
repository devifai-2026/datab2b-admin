import api from './api';

const API_URL = '/auth/users';

const getAllUsers = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

const updateUserStatus = async (userId: string, active: boolean) => {
  const response = await api.put(`${API_URL}/${userId}`, { active });
  return response.data;
};

const userService = {
  getAllUsers,
  updateUserStatus,
};

export default userService;
