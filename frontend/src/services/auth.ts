import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export const login = async (phone: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    phone,
    password
  });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (phone: string, name: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/register`, {
    phone,
    name,
    password
  });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}; 