import api from './api';

const API_URL = '/categories/';

const transformCategory = (item: any) => ({
  ...item,
  id: item._id,
  _id: item._id,
});

const getCategories = async () => {
  const response = await api.get(API_URL);
  return response.data.map(transformCategory);
};

const createCategory = async (categoryData: { name: string }) => {
  const response = await api.post(API_URL, categoryData);
  return transformCategory(response.data);
};

const updateCategory = async (id: string, categoryData: { name?: string }) => {
  const response = await api.put(API_URL + id, categoryData);
  return transformCategory(response.data);
};

const deleteCategory = async (id: string) => {
  const response = await api.delete(API_URL + id);
  return response.data;
};

const categoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;
