const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Service URLs
const CMS_BASE_URL = 'http://localhost:8000';
const ROS_BASE_URL = 'http://localhost:8002';
const WMS_BASE_URL = 'http://localhost:8001';

// Helper function to log requests and responses
const logActivity = (service, method, endpoint, requestData, responseData) => {
  console.log(`[${new Date().toISOString()}] ${service}: ${method} ${endpoint}`);
  if (requestData) console.log('Request:', JSON.stringify(requestData, null, 2));
  if (responseData) console.log('Response:', JSON.stringify(responseData, null, 2));
};

// CMS Endpoints
app.post('/api/cms/clients', async (req, res) => {
  try {
    logActivity('CMS', 'POST', '/clients/', req.body, null);
    const response = await axios.post(`${CMS_BASE_URL}/clients/`, req.body);
    logActivity('CMS', 'POST', '/clients/', null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Unknown error'
    });
  }
});

app.post('/api/cms/clients/login', async (req, res) => {
  try {
    logActivity('CMS', 'POST', '/clients/login', req.body, null);
    const response = await axios.post(`${CMS_BASE_URL}/clients/login`, req.body);
    logActivity('CMS', 'POST', '/clients/login', null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Invalid credentials'
    });
  }
});

app.get('/api/cms/clients', async (req, res) => {
  try {
    logActivity('CMS', 'GET', '/clients/', null, null);
    const response = await axios.get(`${CMS_BASE_URL}/clients/`);
    logActivity('CMS', 'GET', '/clients/', null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Unknown error'
    });
  }
});

app.post('/api/cms/orders', async (req, res) => {
  try {
    logActivity('CMS', 'POST', '/orders/', req.body, null);
    const response = await axios.post(`${CMS_BASE_URL}/orders/`, req.body);
    logActivity('CMS', 'POST', '/orders/', null, response.data);
    
    // Automatically create order in WMS for warehouse management
    try {
      const orderData = {
        order_id: response.data.id.toString(),
        client_name: response.data.client_name || `Client-${response.data.client_id}`,
        pickup_location: response.data.pickup_location || "Pickup Location", 
        delivery_location: response.data.location,
        package_info: response.data.description || "Standard Package"
      };
      logActivity('WMS', 'POST', '/orders', orderData, null);
      const wmsOrderResponse = await axios.post(`${WMS_BASE_URL}/orders`, orderData);
      logActivity('WMS', 'POST', '/orders', null, wmsOrderResponse.data);
    } catch (wmsError) {
      console.error('Failed to create order in WMS:', wmsError.message);
    }
    
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Unknown error'
    });
  }
});

app.get('/api/cms/orders', async (req, res) => {
  try {
    const clientId = req.query.client_id;
    const url = clientId ? `${CMS_BASE_URL}/orders/?client_id=${clientId}` : `${CMS_BASE_URL}/orders/`;
    logActivity('CMS', 'GET', '/orders/', { client_id: clientId }, null);
    const response = await axios.get(url);
    logActivity('CMS', 'GET', '/orders/', null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Unknown error'
    });
  }
});

app.get('/api/cms/orders/:id', async (req, res) => {
  try {
    logActivity('CMS', 'GET', `/orders/${req.params.id}`, null, null);
    const response = await axios.get(`${CMS_BASE_URL}/orders/${req.params.id}`);
    logActivity('CMS', 'GET', `/orders/${req.params.id}`, null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Order not found'
    });
  }
});

app.put('/api/cms/orders/:id/status', async (req, res) => {
  try {
    logActivity('CMS', 'PUT', `/orders/${req.params.id}/status`, req.body, null);
    const response = await axios.put(`${CMS_BASE_URL}/orders/${req.params.id}/status`, req.body);
    logActivity('CMS', 'PUT', `/orders/${req.params.id}/status`, null, response.data);
    
    // If order is marked as delivered, make the assigned driver available again
    if (req.body.status === 'Delivered') {
      try {
        // Get delivery info to find the assigned driver
        const deliveryResponse = await axios.get(`${WMS_BASE_URL}/deliveries/${req.params.id}`);
        if (deliveryResponse.data && deliveryResponse.data.driver_id) {
          // Make driver available again
          const driverUpdateResponse = await axios.put(`${WMS_BASE_URL}/drivers/${deliveryResponse.data.driver_id}/availability`, { available: true });
          logActivity('WMS', 'PUT', `/drivers/${deliveryResponse.data.driver_id}/availability`, { available: true }, driverUpdateResponse.data);
        }
      } catch (wmsError) {
        console.error('Failed to update driver availability:', wmsError.message);
        // Don't fail the order status update if driver availability update fails
      }
    }
    
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Unknown error'
    });
  }
});

// ROS Endpoints
app.post('/api/ros/location/update', async (req, res) => {
  try {
    logActivity('ROS', 'POST', '/location/update/', req.body, null);
    const response = await axios.post(`${ROS_BASE_URL}/location/update/`, req.body);
    logActivity('ROS', 'POST', '/location/update/', null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Unknown error'
    });
  }
});

app.get('/api/ros/location/:orderId', async (req, res) => {
  try {
    logActivity('ROS', 'GET', `/location/${req.params.orderId}`, null, null);
    const response = await axios.get(`${ROS_BASE_URL}/location/${req.params.orderId}`);
    logActivity('ROS', 'GET', `/location/${req.params.orderId}`, null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Location not found'
    });
  }
});

// WMS Endpoints
app.post('/api/wms/drivers', async (req, res) => {
  try {
    logActivity('WMS', 'POST', '/drivers/', req.body, null);
    const response = await axios.post(`${WMS_BASE_URL}/drivers/`, req.body);
    logActivity('WMS', 'POST', '/drivers/', null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Unknown error'
    });
  }
});

app.get('/api/wms/drivers', async (req, res) => {
  try {
    logActivity('WMS', 'GET', '/drivers/', null, null);
    const response = await axios.get(`${WMS_BASE_URL}/drivers/`);
    logActivity('WMS', 'GET', '/drivers/', null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Unknown error'
    });
  }
});

app.get('/api/wms/drivers/:id', async (req, res) => {
  try {
    logActivity('WMS', 'GET', `/drivers/${req.params.id}`, null, null);
    const response = await axios.get(`${WMS_BASE_URL}/drivers/${req.params.id}`);
    logActivity('WMS', 'GET', `/drivers/${req.params.id}`, null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Driver not found'
    });
  }
});

app.get('/api/wms/drivers/available', async (req, res) => {
  try {
    logActivity('WMS', 'GET', '/drivers/available', null, null);
    const response = await axios.get(`${WMS_BASE_URL}/drivers/available`);
    logActivity('WMS', 'GET', '/drivers/available', null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'No available drivers'
    });
  }
});

app.get('/api/wms/deliveries/:orderId', async (req, res) => {
  try {
    logActivity('WMS', 'GET', `/deliveries/${req.params.orderId}`, null, null);
    const response = await axios.get(`${WMS_BASE_URL}/deliveries/${req.params.orderId}`);
    logActivity('WMS', 'GET', `/deliveries/${req.params.orderId}`, null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Delivery not found'
    });
  }
});

// Driver signup endpoint
app.post('/api/wms/drivers/signup', async (req, res) => {
  try {
    logActivity('WMS', 'POST', '/drivers/signup', req.body, null);
    const response = await axios.post(`${WMS_BASE_URL}/drivers/signup`, req.body);
    logActivity('WMS', 'POST', '/drivers/signup', null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Driver signup failed'
    });
  }
});

// Health check endpoint
// Warehouse Management Endpoints
app.get('/api/wms/orders', async (req, res) => {
  try {
    logActivity('WMS', 'GET', '/orders', null, null);
    const response = await axios.get(`${WMS_BASE_URL}/orders`);
    logActivity('WMS', 'GET', '/orders', null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Error fetching orders'
    });
  }
});

app.post('/api/wms/orders/:orderId/borrow', async (req, res) => {
  try {
    const { orderId } = req.params;
    logActivity('WMS', 'POST', `/orders/${orderId}/borrow`, req.body, null);
    const response = await axios.post(`${WMS_BASE_URL}/orders/${orderId}/borrow`, req.body);
    logActivity('WMS', 'POST', `/orders/${orderId}/borrow`, null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Error borrowing order'
    });
  }
});

app.post('/api/wms/orders/:orderId/assign', async (req, res) => {
  try {
    const { orderId } = req.params;
    logActivity('WMS', 'POST', `/orders/${orderId}/assign`, req.body, null);
    const response = await axios.post(`${WMS_BASE_URL}/orders/${orderId}/assign`, req.body);
    logActivity('WMS', 'POST', `/orders/${orderId}/assign`, null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Error assigning driver'
    });
  }
});

app.post('/api/wms/orders/:orderId/return', async (req, res) => {
  try {
    const { orderId } = req.params;
    logActivity('WMS', 'POST', `/orders/${orderId}/return`, req.body, null);
    const response = await axios.post(`${WMS_BASE_URL}/orders/${orderId}/return`, req.body);
    logActivity('WMS', 'POST', `/orders/${orderId}/return`, null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Error returning order'
    });
  }
});

app.post('/api/wms/orders/:orderId/delivered', async (req, res) => {
  try {
    const { orderId } = req.params;
    logActivity('WMS', 'POST', `/orders/${orderId}/delivered`, req.body, null);
    const response = await axios.post(`${WMS_BASE_URL}/orders/${orderId}/delivered`, req.body);
    logActivity('WMS', 'POST', `/orders/${orderId}/delivered`, null, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      detail: error.response?.data?.detail || 'Error marking order as delivered'
    });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      cms: CMS_BASE_URL,
      ros: ROS_BASE_URL,
      wms: WMS_BASE_URL
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Swift Logistics Middleware API running on port ${PORT}`);
  console.log(`📡 Connecting to:`);
  console.log(`  - CMS: ${CMS_BASE_URL}`);
  console.log(`  - ROS: ${ROS_BASE_URL}`);
  console.log(`  - WMS: ${WMS_BASE_URL}`);
});

module.exports = app;