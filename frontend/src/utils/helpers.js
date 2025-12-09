// Shared utility functions

/**
 * Format date/time for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get auth token from localStorage
 * @returns {string} JWT token
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Fetch negotiation records for a service request
 * DEPRECATED: Use RequestsAPI.getRecords() instead
 * @param {number} requestId - Service request ID
 * @returns {Promise<Array>} Array of records
 */
export const fetchNegotiationRecords = async (requestId) => {
  const { RequestsAPI } = await import('../api');
  return await RequestsAPI.getRecords(requestId);
};
