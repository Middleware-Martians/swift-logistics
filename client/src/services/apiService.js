import axios from 'axios';
import soapService from './soapService';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configuration for API mode (REST or SOAP)
let USE_SOAP = true; // Default to SOAP mode

export const setApiMode = (useSoap) => {
  USE_SOAP = useSoap;
  console.log('API mode changed to:', useSoap ? 'SOAP' : 'REST');
};

export const getApiMode = () => USE_SOAP;

// REST Auth services
const restAuthService = {
  login: async (credentials) => {
    const response = await api.post('/clients/login', credentials);
    return response.data;
  },
  
  signup: async (userData) => {
    const response = await api.post('/clients/', userData);
    return response.data;
  },
};

// REST Order services
const restOrderService = {
  getOrders: async (clientId = null) => {
    const params = clientId ? { client_id: clientId } : {};
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};

// REST Client services
const restClientService = {
  getClients: async () => {
    const response = await api.get('/clients/');
    return response.data;
  },
};

// Dynamic service selectors
export const authService = {
  login: async (credentials) => {
    console.log('Auth service login - Using SOAP:', USE_SOAP);
    return USE_SOAP 
      ? soapService.authService.login(credentials)
      : restAuthService.login(credentials);
  },
  
  signup: async (userData) => {
    console.log('Auth service signup - Using SOAP:', USE_SOAP);
    return USE_SOAP 
      ? soapService.authService.signup(userData)
      : restAuthService.signup(userData);
  },
};

export const orderService = {
  getOrders: async (clientId = null) => {
    return USE_SOAP 
      ? soapService.orderService.getOrders(clientId)
      : restOrderService.getOrders(clientId);
  },
  
  createOrder: async (orderData) => {
    return USE_SOAP 
      ? soapService.orderService.createOrder(orderData)
      : restOrderService.createOrder(orderData);
  },
  
  updateOrderStatus: async (orderId, status) => {
    return USE_SOAP 
      ? soapService.orderService.updateOrderStatus(orderId, status)
      : restOrderService.updateOrderStatus(orderId, status);
  },
};

export const clientService = {
  getClients: async () => {
    return USE_SOAP 
      ? soapService.clientService.getClients()
      : restClientService.getClients();
  },
};

export default api;