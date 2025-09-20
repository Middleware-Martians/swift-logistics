// XML/SOAP Utilities for handling SOAP requests and responses

export const createSoapEnvelope = (body) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope">
  <soap:Body>
    ${body}
  </soap:Body>
</soap:Envelope>`;
};

export const parseSoapResponse = (xmlText) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  
  // Check for parsing errors
  const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
  if (parseError) {
    throw new Error('XML parsing error: ' + parseError.textContent);
  }
  
  // Get the SOAP Body
  const body = xmlDoc.getElementsByTagNameNS("http://schemas.xmlsoap.org/soap/envelope", "Body")[0];
  if (!body) {
    throw new Error('SOAP Body not found');
  }
  
  return body;
};

export const extractTextContent = (element, tagName) => {
  const node = element.getElementsByTagName(tagName)[0];
  return node ? node.textContent : null;
};

export const createClientLoginRequest = (name, password) => {
  return `<LoginRequest>
    <name>${escapeXml(name)}</name>
    <password>${escapeXml(password)}</password>
  </LoginRequest>`;
};

export const createClientSignupRequest = (name, password) => {
  return `<CreateClientRequest>
    <name>${escapeXml(name)}</name>
    <password>${escapeXml(password)}</password>
  </CreateClientRequest>`;
};

export const createOrderRequest = (clientId, weight, location = '') => {
  return `<CreateOrderRequest>
    <client_id>${clientId}</client_id>
    <weight>${weight}</weight>
    <location>${escapeXml(location)}</location>
  </CreateOrderRequest>`;
};

export const parseClientResponse = (body) => {
  // Handle both LoginResponse and CreateClientResponse
  const loginResponse = body.getElementsByTagName('LoginResponse')[0];
  const createResponse = body.getElementsByTagName('CreateClientResponse')[0];
  
  const response = loginResponse || createResponse;
  if (!response) {
    throw new Error('Invalid client response');
  }
  
  return {
    id: parseInt(extractTextContent(response, 'id')),
    name: extractTextContent(response, 'name'),
    message: extractTextContent(response, 'message')
  };
};

export const parseOrderResponse = (body) => {
  const orderResponse = body.getElementsByTagName('CreateOrderResponse')[0];
  if (!orderResponse) {
    throw new Error('Invalid order response');
  }
  
  return {
    id: parseInt(extractTextContent(orderResponse, 'id')),
    client_id: parseInt(extractTextContent(orderResponse, 'client_id')),
    weight: parseInt(extractTextContent(orderResponse, 'weight')),
    status: extractTextContent(orderResponse, 'status'),
    location: extractTextContent(orderResponse, 'location')
  };
};

export const parseOrdersListResponse = (body) => {
  const ordersResponse = body.getElementsByTagName('OrdersResponse')[0];
  if (!ordersResponse) {
    throw new Error('Invalid orders list response');
  }
  
  const orders = [];
  const orderElements = ordersResponse.getElementsByTagName('Order');
  
  for (let i = 0; i < orderElements.length; i++) {
    const order = orderElements[i];
    orders.push({
      id: parseInt(extractTextContent(order, 'id')),
      client_id: parseInt(extractTextContent(order, 'client_id')),
      weight: parseInt(extractTextContent(order, 'weight')),
      status: extractTextContent(order, 'status'),
      location: extractTextContent(order, 'location')
    });
  }
  
  return orders;
};

export const parseClientsListResponse = (body) => {
  const clientsResponse = body.getElementsByTagName('ClientsResponse')[0];
  if (!clientsResponse) {
    throw new Error('Invalid clients list response');
  }
  
  const clients = [];
  const clientElements = clientsResponse.getElementsByTagName('Client');
  
  for (let i = 0; i < clientElements.length; i++) {
    const client = clientElements[i];
    clients.push({
      id: parseInt(extractTextContent(client, 'id')),
      name: extractTextContent(client, 'name')
    });
  }
  
  return clients;
};

// Helper function to escape XML special characters
const escapeXml = (text) => {
  if (typeof text !== 'string') return text;
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Helper function to make SOAP requests
export const makeSoapRequest = async (url, soapAction, soapEnvelope) => {
  console.log('Making SOAP request to:', url);
  console.log('SOAP Action:', soapAction);
  console.log('SOAP Envelope:', soapEnvelope);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': soapAction || ''
      },
      body: soapEnvelope
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('SOAP request failed:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseText = await response.text();
    console.log('SOAP Response:', responseText);
    return parseSoapResponse(responseText);
  } catch (error) {
    console.error('SOAP request failed:', error);
    throw error;
  }
};