// Authentication API functions for login and registration
import { API_ENDPOINTS } from './config';

// Authenticate user with email and password
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Store token in sessionStorage
      sessionStorage.setItem('token', data.token);
      return { success: true, role: data.role, token: data.token, user: data.user };
    } else {
      return { success: false, message: data.message || 'Login failed' };
    }
  } catch (error) {
    return { success: false, message: 'Network error. Please check if the server is running.' };
  }
};

// Register new user account
export const registerUser = async (userData) => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message || 'Registration successful!' };
    } else {
      return { success: false, message: data.message || 'Registration failed' };
    }
  } catch (error) {
    return { success: false, message: 'Network error. Please check if the server is running.' };
  }
};
