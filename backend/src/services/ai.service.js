const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const client = axios.create({
  baseURL: config.aiService.url,
  timeout: config.aiService.timeout,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': config.aiService.apiKey,
  },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      logger.error('AI service error response:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.code === 'ECONNABORTED') {
      logger.error('AI service timeout');
    } else {
      logger.error('AI service connection error:', error.message);
    }
    return Promise.reject(error);
  }
);

async function analyzeText(text, options = {}) {
  try {
    const { data } = await client.post('/api/v1/analyze/text', { text, options });

    return data?.data ?? data;
  } catch (err) {
    if (err.response?.data?.error) {
      const e = new Error(err.response.data.error.message || 'AI analysis failed');
      e.code = err.response.data.error.code;
      e.status = err.response.status;
      throw e;
    }
    throw new Error('AI service unavailable');
  }
}

async function analyzeUrl(url, text, domain) {
  try {
    const { data } = await client.post('/api/v1/analyze/url', {
      url,
      text,
      domain,
    });

    return data?.data ?? data;
  } catch (err) {
    if (err.response?.data?.error) {
      const e = new Error(err.response.data.error.message || 'AI analysis failed');
      e.code = err.response.data.error.code;
      throw e;
    }
    throw new Error('AI service unavailable');
  }
}

async function analyzeImage(imageBuffer, filename) {
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('image', imageBuffer, { filename });

    const { data } = await client.post('/api/v1/analyze/image', form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return data?.data ?? data;
  } catch (err) {
    if (err.response?.data?.error) {
      const e = new Error(err.response.data.error.message || 'Image analysis failed');
      e.code = err.response.data.error.code;
      throw e;
    }
    throw new Error('AI service unavailable');
  }
}

async function healthCheck() {
  try {
    const { data } = await client.get('/health', { timeout: 5000 });
    return { healthy: true, data };
  } catch (err) {
    return { healthy: false, error: err.message };
  }
}

module.exports = {
  analyzeText,
  analyzeUrl,
  analyzeImage,
  healthCheck,
};
