// Centralized API configuration
export const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  BASE: `${API_BASE_URL}/api`,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  SERVICE_REQUESTS: `${API_BASE_URL}/api/service-requests`,
  CLIENTS: `${API_BASE_URL}/api/clients`,
};
