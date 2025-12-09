import { API_ENDPOINTS } from './config';

const getAuthToken = () => {
  return sessionStorage.getItem('token');
};

const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_ENDPOINTS.BASE}${url}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
      return null;
    }

    return response;
  } catch (error) {
    throw new Error('Network error. Please check if the server is running.');
  }
};

export const RequestsAPI = {
  getCurrentUser: async () => {
    try {
      const response = await authenticatedFetch('/me');
      if (!response) return null;
      
      const data = await response.json();
      if (data.success) {
        return data.user;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  getByStatus: async (status) => {
    try {
      const response = await authenticatedFetch(`/service-requests?status=${status}`);
      if (!response) return [];
      
      const data = await response.json();
      if (data.success) {
        return data.requests || [];
      }
      return [];
    } catch (error) {
      return [];
    }
  },

  getAllClients: async () => {
    try {
      const response = await authenticatedFetch('/clients');
      if (!response) return [];
      
      const data = await response.json();
      if (data.success) {
        return data.clients || [];
      }
      return [];
    } catch (error) {
      return [];
    }
  },

  create: async (requestData) => {
    try {
      const response = await authenticatedFetch('/service-requests', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      if (!response) return { success: false, message: 'Network error' };
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Create request with file upload (FormData)
  createWithFiles: async (formData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_ENDPOINTS.BASE}/service-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData, // FormData - don't set Content-Type, browser will set it with boundary
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { success: false, message: 'Unauthorized' };
      }

      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await authenticatedFetch(`/service-requests/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      if (!response) return { success: false };
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  update: async (id, updates) => {
    try {
      const response = await authenticatedFetch(`/service-requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (!response) return { success: false };
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  completeRequest: async (id) => {
    return await RequestsAPI.updateStatus(id, 'completed');
  },

  markAsPaid: async (id) => {
    return await RequestsAPI.update(id, { isPaid: true });
  },

  move: async (id, fromState, toState, updates = {}) => {
    return await RequestsAPI.update(id, { ...updates, state: toState });
  },

  // Add negotiation record (quote or message)
  addRecord: async (requestId, recordData) => {
    try {
      const response = await authenticatedFetch(`/service-requests/${requestId}/records`, {
        method: 'POST',
        body: JSON.stringify(recordData),
      });

      if (!response) return { success: false };
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get negotiation records for a request
  getRecords: async (requestId) => {
    try {
      const response = await authenticatedFetch(`/service-requests/${requestId}/records`);
      if (!response) return [];
      
      const data = await response.json();
      if (data.success) {
        return data.records || [];
      }
      return [];
    } catch (error) {
      return [];
    }
  },

  // Update quote response (client acceptance/rejection)
  updateQuoteResponse: async (requestId, responseData) => {
    try {
      const response = await authenticatedFetch(`/service-requests/${requestId}/quote-response`, {
        method: 'PUT',
        body: JSON.stringify(responseData),
      });

      if (!response) return { success: false };
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};



  

