import client from './client';

export const analyzeApi = {
  analyzeText: async (text, options = {}) => {
    const response = await client.post('/analyze/text', { text, options });
    return response.data;
  },

  analyzeUrl: async (url, options = {}) => {
    const response = await client.post('/analyze/url', { url, options });
    return response.data;
  },

  analyzeImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await client.post('/analyze/image', formData);
    return response.data;
  },
};
