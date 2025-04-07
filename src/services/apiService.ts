import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const apiService = {
  importContainers: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/import/containers', formData);
    return response.data;
  },
  importItems: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/import/items', formData);
    return response.data;
  },
  getPlacementRecommendations: async (data: any) => {
    const response = await apiClient.post('/placement', data);
    return response.data;
  },
  searchItem: async (params: any) => {
    const response = await apiClient.get('/search', { params });
    return response.data;
  },
  retrieveItem: async (data: any) => {
    const response = await apiClient.post('/retrieve', data);
    return response.data;
  },
  placeItem: async (data: any) => {
    const response = await apiClient.post('/place', data);
    return response.data;
  },
  identifyWasteItems: async () => {
    const response = await apiClient.get('/waste/identify');
    return response.data;
  },
  createReturnPlan: async (data: any) => {
    const response = await apiClient.post('/waste/return-plan', data);
    return response.data;
  },
  completeUndocking: async (data: any) => {
    const response = await apiClient.post('/waste/complete-undocking', data);
    return response.data;
  },
  simulateDay: async (data: any) => {
    const response = await apiClient.post('/simulate/day', data);
    return response.data;
  },
  getLogs: async (params: any) => {
    const response = await apiClient.get('/logs', { params });
    return response.data;
  }
};