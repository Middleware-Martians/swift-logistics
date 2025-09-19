import {
  createSoapEnvelope,
  makeSoapRequest,
  parseSoapResponse,
  createClientLoginRequest,
  createClientSignupRequest,
  createOrderRequest,
  parseClientResponse,
  parseOrderResponse,
  parseOrdersListResponse,
  parseClientsListResponse
} from './soapUtils';

const SOAP_BASE_URL = 'http://localhost:8000/soap';

// SOAP Auth services
export const soapAuthService = {
  login: async (credentials) => {
    const requestBody = createClientLoginRequest(credentials.name, credentials.password);
    const soapEnvelope = createSoapEnvelope(requestBody);
    
    const responseBody = await makeSoapRequest(
      `${SOAP_BASE_URL}/clients/login`,
      'LoginClient',
      soapEnvelope
    );
    
    return parseClientResponse(responseBody);
  },
  
  signup: async (userData) => {
    const requestBody = createClientSignupRequest(userData.name, userData.password);
    const soapEnvelope = createSoapEnvelope(requestBody);
    
    const responseBody = await makeSoapRequest(
      `${SOAP_BASE_URL}/clients`,
      'CreateClient',
      soapEnvelope
    );
    
    return parseClientResponse(responseBody);
  },
};

// SOAP Order services
export const soapOrderService = {
  getOrders: async (clientId = null) => {
    const url = clientId 
      ? `${SOAP_BASE_URL}/orders?client_id=${clientId}`
      : `${SOAP_BASE_URL}/orders`;
    
    console.log('Getting orders from SOAP endpoint:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/xml'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('SOAP Orders Response:', responseText);
      const responseBody = parseSoapResponse(responseText);
      return parseOrdersListResponse(responseBody);
    } catch (error) {
      console.error('SOAP getOrders failed:', error);
      throw error;
    }
  },
  
  createOrder: async (orderData) => {
    const requestBody = createOrderRequest(
      orderData.client_id,
      orderData.weight,
      orderData.location
    );
    const soapEnvelope = createSoapEnvelope(requestBody);
    
    const responseBody = await makeSoapRequest(
      `${SOAP_BASE_URL}/orders`,
      'CreateOrder',
      soapEnvelope
    );
    
    return parseOrderResponse(responseBody);
  },
  
  updateOrderStatus: async (orderId, status) => {
    // Note: This would need to be implemented in the backend SOAP service
    throw new Error('Update order status not implemented in SOAP service');
  },
};

// SOAP Client services
export const soapClientService = {
  getClients: async () => {
    console.log('Getting clients from SOAP endpoint');
    
    try {
      const response = await fetch(`${SOAP_BASE_URL}/clients`, {
        method: 'GET',
        headers: {
          'Accept': 'text/xml'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('SOAP Clients Response:', responseText);
      const responseBody = parseSoapResponse(responseText);
      return parseClientsListResponse(responseBody);
    } catch (error) {
      console.error('SOAP getClients failed:', error);
      throw error;
    }
  },
};

const soapServices = {
  authService: soapAuthService,
  orderService: soapOrderService,
  clientService: soapClientService
};

export default soapServices;