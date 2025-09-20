import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Truck, UserPlus, Package, MapPin, CheckCircle } from 'lucide-react';
import { SystemEvent } from '../App';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  
  h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  color: white;
`;

const TabBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ $isActive: boolean }>`
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'success' }>`
  background: ${props => {
    switch (props.variant) {
      case 'secondary': return 'rgba(255, 255, 255, 0.2)';
      case 'success': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      default: return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
    }
  }};
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  margin-right: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const DeliveryList = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
`;

const DeliveryItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DeliveryHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const DeliveryInfo = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
  }
  
  p {
    margin: 0 0 4px 0;
    font-size: 12px;
    opacity: 0.8;
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => {
    const normalizedStatus = props.$status.toLowerCase().replace(/_/g, ' ');
    switch (normalizedStatus) {
      case 'on the way': return '#f59e0b';
      case 'delivered': return '#10b981';
      case 'returned': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  color: white;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const WelcomeMessage = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
  }
  
  p {
    margin: 0;
    opacity: 0.8;
    font-size: 14px;
  }
`;

const SuccessMessage = styled.div`
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  color: #10b981;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
`;

interface DriverAppProps {
  onSystemEvent: (event: Omit<SystemEvent, 'id' | 'timestamp'>) => void;
}

interface Driver {
  driver_id: string;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  available: boolean;
}

interface Delivery {
  order_id: string;
  delivery_status: string;
  address: string;
  driver_id: string;
}

interface Order {
  id: number;
  client_id: number;
  status: string;
  weight: number;
  location: string;
}

const DriverApp: React.FC<DriverAppProps> = ({ onSystemEvent }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'deliveries'>('login');
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  const [deliveries, setDeliveries] = useState<(Delivery & Order)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);
  
  // Form states
  const [loginForm, setLoginForm] = useState({ driver_id: '' });
  const [signupForm, setSignupForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    license_number: '' 
  });

  const apiCall = async (endpoint: string, method: string, data?: any) => {
    setIsLoading(true);
    
    onSystemEvent({
      type: 'system',
      message: `${method} request to ${endpoint}`,
      source: 'Driver App',
      service: 'Driver App',
      endpoint,
      method,
      requestData: data,
      status: 'pending'
    });
    
    try {
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      const responseData = await response.json();
      
      onSystemEvent({
        type: response.ok ? 'delivery' : 'error',
        message: response.ok ? `${method} request to ${endpoint} completed successfully` : `${method} request to ${endpoint} failed`,
        source: 'Driver App',
        service: 'Driver App',
        endpoint,
        method,
        requestData: data,
        responseData,
        status: response.ok ? 'success' : 'error'
      });
      
      setIsLoading(false);
      return { ok: response.ok, data: responseData };
    } catch (error) {
      onSystemEvent({
        type: 'error',
        message: `Network error during ${method} request to ${endpoint}`,
        source: 'Driver App',
        service: 'Driver App',
        endpoint,
        method,
        requestData: data,
        responseData: { error: 'Network error' },
        status: 'error'
      });
      setIsLoading(false);
      return { ok: false, data: { error: 'Network error' } };
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiCall(`/api/wms/drivers/${loginForm.driver_id}`, 'GET');
    if (result.ok) {
      setCurrentDriver(result.data);
      setActiveTab('deliveries');
      await loadDeliveries(result.data.driver_id);
    } else {
      // Login failed - show error to user
      onSystemEvent({
        type: 'error',
        message: `Driver login failed: ${result.data.detail || 'Driver not found'}`,
        source: 'Driver App',
        service: 'Driver App',
        endpoint: `/api/wms/drivers/${loginForm.driver_id}`,
        method: 'GET',
        requestData: null,
        responseData: result.data,
        status: 'error'
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiCall('/api/wms/drivers/signup', 'POST', signupForm);
    if (result.ok) {
      setRegistrationSuccess(`Registration successful! Your Driver ID is: ${result.data.driver_id}`);
      setCurrentDriver(result.data);
      setActiveTab('deliveries');
    } else {
      // Signup failed - show error to user
      onSystemEvent({
        type: 'error',
        message: `Driver registration failed: ${result.data.detail || 'Registration failed'}`,
        source: 'Driver App',
        service: 'Driver App',
        endpoint: '/api/wms/drivers/signup',
        method: 'POST',
        requestData: { name: signupForm.name, email: signupForm.email },
        responseData: result.data,
        status: 'error'
      });
    }
  };

  const loadDeliveries = async (driverId: string) => {
    try {
      // Get all orders from WMS
      const ordersResult = await apiCall('/api/wms/orders', 'GET');
      if (!ordersResult.ok) {
        console.error('Failed to load orders:', ordersResult.data);
        return;
      }
      
      // Filter orders assigned to this driver
      const allOrders = ordersResult.data;
      const driverOrders = allOrders.filter((order: any) => 
        order.driver_id === driverId && order.status === 'assigned'
      );
      
      // Convert WMS orders to the format expected by the component
      const deliveriesWithOrders = driverOrders.map((order: any) => ({
        order_id: order.order_id,
        delivery_status: "on the way", // Default status for newly assigned orders
        address: order.delivery_location,
        driver_id: order.driver_id,
        id: order.order_id, // Use order_id as id for consistency
        client_id: order.client_name, // Use client_name as client_id for display
        status: order.status,
        weight: 1, // Default weight
        location: order.delivery_location,
        description: order.package_info
      }));

      setDeliveries(deliveriesWithOrders);
    } catch (error) {
      console.error('Error loading deliveries:', error);
      // Add user-visible error notification
      onSystemEvent({
        type: 'error',
        message: 'Failed to load deliveries',
        source: 'Driver App',
        service: 'Driver App',
        endpoint: '/api/wms/orders',
        method: 'GET',
        requestData: null,
        responseData: { error: error instanceof Error ? error.message : 'Unknown error' },
        status: 'error'
      });
    }
  };

  const updateDeliveryStatus = async (orderId: string, newStatus: string) => {
    if (newStatus.toLowerCase() === 'delivered') {
      // Use WMS endpoint for delivery completion
      const result = await apiCall(`/api/wms/orders/${orderId}/delivered`, 'POST', {});
      if (result.ok) {
        // Show success message
        onSystemEvent({
          type: 'delivery',
          message: `Order #${orderId} marked as delivered`,
          source: 'Driver App',
          service: 'WMS',
          endpoint: `/api/wms/orders/${orderId}/delivered`,
          method: 'POST',
          requestData: {},
          responseData: result.data,
          status: 'success'
        });
        // Reload deliveries to get updated status
        if (currentDriver) {
          await loadDeliveries(currentDriver.driver_id);
        }
      } else {
        // Status update failed
        onSystemEvent({
          type: 'error',
          message: `Failed to mark order #${orderId} as delivered: ${result.data.detail || 'Unknown error'}`,
          source: 'Driver App',
          service: 'WMS',
          endpoint: `/api/wms/orders/${orderId}/delivered`,
          method: 'POST',
          requestData: {},
          responseData: result.data,
          status: 'error'
        });
      }
    } else {
      // For other status updates, use CMS
      const result = await apiCall(`/api/cms/orders/${orderId}/status`, 'PUT', { status: newStatus });
      if (result.ok) {
        onSystemEvent({
          type: 'delivery',
          message: `Order #${orderId} status updated to ${newStatus}`,
          source: 'Driver App',
          service: 'CMS',
          endpoint: `/api/cms/orders/${orderId}/status`,
          method: 'PUT',
          requestData: { status: newStatus },
          responseData: result.data,
          status: 'success'
        });
        if (currentDriver) {
          await loadDeliveries(currentDriver.driver_id);
        }
      } else {
        onSystemEvent({
          type: 'error',
          message: `Failed to update status for order #${orderId}: ${result.data.detail || 'Unknown error'}`,
          source: 'Driver App',
          service: 'CMS',
          endpoint: `/api/cms/orders/${orderId}/status`,
          method: 'PUT',
          requestData: { status: newStatus },
          responseData: result.data,
          status: 'error'
        });
      }
    }
  };

  const handleLogout = () => {
    setCurrentDriver(null);
    setDeliveries([]);
    setRegistrationSuccess(null);
    setActiveTab('login');
  };

  // Simulate location updates
  const updateLocation = async (orderId: string) => {
    const locationData = {
      order_id: orderId,
      latitude: 40.7128 + Math.random() * 0.1,
      longitude: -74.006 + Math.random() * 0.1
    };
    
    const result = await apiCall('/api/ros/location/update', 'POST', locationData);
    if (result.ok) {
      onSystemEvent({
        type: 'delivery',
        message: `Location updated for order #${orderId}`,
        source: 'Driver App',
        service: 'Driver App',
        endpoint: '/api/ros/location/update',
        method: 'POST',
        requestData: locationData,
        responseData: result.data,
        status: 'success'
      });
    } else {
      onSystemEvent({
        type: 'error',
        message: `Failed to update location for order #${orderId}: ${result.data.detail || 'Unknown error'}`,
        source: 'Driver App',
        service: 'Driver App',
        endpoint: '/api/ros/location/update',
        method: 'POST',
        requestData: locationData,
        responseData: result.data,
        status: 'error'
      });
    }
  };

  return (
    <Container>
      <Header>
        <Truck size={20} />
        <h3>Driver App</h3>
        {currentDriver && (
          <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
            Driver: {currentDriver.name}
          </span>
        )}
      </Header>
      
      <Content>
        {!currentDriver ? (
          <>
            <TabBar>
              <Tab 
                $isActive={activeTab === 'login'} 
                onClick={() => {
                  setActiveTab('login');
                  setRegistrationSuccess(null);
                }}
              >
                <Truck size={16} />
                Login
              </Tab>
              <Tab 
                $isActive={activeTab === 'signup'} 
                onClick={() => {
                  setActiveTab('signup');
                  setRegistrationSuccess(null);
                }}
              >
                <UserPlus size={16} />
                Register
              </Tab>
            </TabBar>
            
            {registrationSuccess && (
              <SuccessMessage>
                {registrationSuccess}
              </SuccessMessage>
            )}
            
            {activeTab === 'login' && (
              <FormContainer>
                <form onSubmit={handleLogin}>
                  <FormGroup>
                    <Label>Driver ID</Label>
                    <Input
                      type="text"
                      value={loginForm.driver_id}
                      onChange={(e) => setLoginForm({ driver_id: e.target.value })}
                      placeholder="e.g., DRV12345678"
                      required
                    />
                  </FormGroup>
                  <p style={{ fontSize: '12px', opacity: '0.8', margin: '8px 0' }}>
                    Driver ID is provided after successful registration
                  </p>
                  <Button type="submit" disabled={isLoading}>
                    <Truck size={16} />
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </FormContainer>
            )}
            
            {activeTab === 'signup' && (
              <FormContainer>
                <form onSubmit={handleSignup}>
                  <FormGroup>
                    <Label>Full Name</Label>
                    <Input
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      placeholder="Your full name"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      placeholder="your.email@example.com"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      placeholder="+1234567890"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Driver's License Number</Label>
                    <Input
                      type="text"
                      value={signupForm.license_number}
                      onChange={(e) => setSignupForm({ ...signupForm, license_number: e.target.value })}
                      placeholder="DL123456789"
                      required
                    />
                  </FormGroup>
                  <Button type="submit" disabled={isLoading}>
                    <UserPlus size={16} />
                    {isLoading ? 'Registering...' : 'Register'}
                  </Button>
                </form>
              </FormContainer>
            )}
          </>
        ) : (
          <>
            <TabBar>
              <Tab 
                $isActive={activeTab === 'deliveries'} 
                onClick={() => setActiveTab('deliveries')}
              >
                <Package size={16} />
                My Deliveries
              </Tab>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </TabBar>
            
            {deliveries.length === 0 ? (
              <WelcomeMessage>
                <h4>Welcome, {currentDriver.name}!</h4>
                <p>Driver ID: {currentDriver.driver_id}</p>
                <p>Email: {currentDriver.email}</p>
                <p>You have no active deliveries at the moment. New deliveries will appear here when assigned.</p>
              </WelcomeMessage>
            ) : (
              <DeliveryList>
                <h4 style={{ margin: '0 0 12px 0' }}>Active Deliveries</h4>
                {deliveries.map(delivery => (
                  <DeliveryItem key={delivery.order_id}>
                    <DeliveryHeader>
                      <DeliveryInfo>
                        <h4>Order #{delivery.order_id}</h4>
                        <p><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />{delivery.address}</p>
                        <p>Weight: {delivery.weight}kg</p>
                      </DeliveryInfo>
                      <StatusBadge $status={delivery.status}>
                        {delivery.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </StatusBadge>
                    </DeliveryHeader>
                    <ActionButtons>
                      <Button 
                        onClick={() => updateLocation(delivery.order_id)}
                        disabled={isLoading}
                      >
                        <MapPin size={14} />
                        Update Location
                      </Button>
                      {delivery.status.toLowerCase().replace(/_/g, ' ') === 'on the way' && (
                        <Button 
                          variant="success"
                          onClick={() => updateDeliveryStatus(delivery.order_id, 'Delivered')}
                          disabled={isLoading}
                        >
                          <CheckCircle size={14} />
                          Mark Delivered
                        </Button>
                      )}
                    </ActionButtons>
                  </DeliveryItem>
                ))}
              </DeliveryList>
            )}
          </>
        )}
      </Content>
    </Container>
  );
};

export default DriverApp;