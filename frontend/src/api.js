
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
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
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return null;
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw new Error('Network error. Please check if the server is running.');
  }
};

export const RequestsAPI = {
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
      console.error('Failed to fetch requests by status:', error);
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
      console.error('Failed to fetch clients:', error);
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
      console.error('Failed to create request:', error);
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
      console.error('Failed to update request status:', error);
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
      console.error('Failed to update request:', error);
      return { success: false, message: error.message };
    }
  },

  sendQuote: async (id, updates) => {
    return await RequestsAPI.update(id, { ...updates, state: 'pending_response' });
  },

  acceptQuote: async (id) => {
    return await RequestsAPI.updateStatus(id, 'accepted');
  },

  rejectQuote: async (id) => {
    return await RequestsAPI.updateStatus(id, 'rejected');
  },

  completeRequest: async (id) => {
    return await RequestsAPI.updateStatus(id, 'completed');
  },

  markAsPaid: async (id) => {
    return await RequestsAPI.update(id, { isPaid: true });
  },

  disputeBill: async (id, note) => {
    return await RequestsAPI.update(id, { disputed: true, disputeNote: note });
  },

  reviseBill: async (id, updates) => {
    return await RequestsAPI.update(id, { ...updates, pendingRevision: true });
  },

  sendRenegotiation: async (id, adjustments) => {
    return await RequestsAPI.update(id, { 
      isRenegotiation: true,
      clientAdjustment: adjustments,
      state: 'new'
    });
  },

  move: async (id, fromState, toState, updates = {}) => {
    return await RequestsAPI.update(id, { ...updates, state: toState });
  },

  reviseDisputedRequest: async (id, updates) => {
    return await RequestsAPI.update(id, { ...updates, pendingRevision: true, isDisputed: false });
  }
};




  

