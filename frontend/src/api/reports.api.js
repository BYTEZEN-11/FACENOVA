import client from './client';

export const reportsApi = {
  list: async (params = {}, options = {}) => {
    const response = await client.get('/reports', { params, ...options });
    return response.data;
  },

  get: async (id, options = {}) => {
    const response = await client.get(`/reports/${id}`, options);
    return response.data;
  },

  delete: async (id, options = {}) => {
    const response = await client.delete(`/reports/${id}`, options);
    return response.data;
  },

  getStats: async (options = {}) => {
    const response = await client.get('/reports/stats', options);
    return response.data;
  },
};
