import axios from 'axios';

// API client for character scraping (no timeout - scraping can take a while)
export const apiClient = axios.create({
  baseURL: 'https://ratemywarrioroflight-api.onrender.com/api', /*'http://localhost:5001/api,'*/
  timeout: 0, // No timeout for scraping
  headers: {
    'Content-Type': 'application/json',
  }
});

// Log requests and responses
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} - Found ${response.data.length} results`);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);