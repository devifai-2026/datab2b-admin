import api from './api';

const API_URL = '/data/';

const transformDataset = (item: any) => {
  if (!item) return null;
  return {
    ...item,
    id: item._id,
    _id: item._id,
  };
};

const getAllData = async () => {
  const response = await api.get(API_URL);
  return response.data.map(transformDataset).filter(Boolean);
};

const createData = async (data: any) => {
  const response = await api.post(API_URL, data);
  return transformDataset(response.data);
};

const updateData = async (id: string, data: any) => {
  const response = await api.put(API_URL + id, data);
  return transformDataset(response.data);
};

const deleteData = async (id: string) => {
  const response = await api.delete(API_URL + id);
  return response.data;
};

const dataService = {
  getAllData,
  createData,
  updateData,
  deleteData,
};

export default dataService;
