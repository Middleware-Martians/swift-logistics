import React, { useState } from 'react';
import styled from 'styled-components';
import { User, UserPlus, Package, Plus } from 'lucide-react';
import { SystemEvent } from '../App';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

const Tab = styled.button<{ isActive: boolean }>`
  background: ${props => props.isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
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
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'secondary' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
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

const OrderList = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
`;

const OrderItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const OrderInfo = styled.div`
  h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    font-size: 12px;
    opacity: 0.8;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'On_The_Way': return '#f59e0b';
      case 'Delivered': return '#10b981';
      case 'Returned': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  color: white;
`;

interface ClientPortalProps {
  onSystemEvent: (event: Omit<SystemEvent, 'id' | 'timestamp'>) => void;
}

interface Client {
  id: number;
  name: string;
}

interface Order {
  id: number;
  client_id: number;
  status: string;
  weight: number;
  location: string;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ onSystemEvent }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'orders'>('login');
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', password: '' });
  const [orderForm, setOrderForm] = useState({ weight: '', location: '' });

  const apiCall = async (endpoint: string, method: string, data?: any) => {
    setIsLoading(true);
    
    onSystemEvent({
      service: 'Client Portal',
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
        service: 'Client Portal',
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
        service: 'Client Portal',
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
    const result = await apiCall('/api/cms/clients/login', 'POST', loginForm);
    if (result.ok) {
      setCurrentClient(result.data);
      setActiveTab('orders');
      loadOrders(result.data.id);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiCall('/api/cms/clients', 'POST', signupForm);
    if (result.ok) {
      setCurrentClient(result.data);
      setActiveTab('orders');
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient) return;
    
    const orderData = {
      client_id: currentClient.id,
      weight: parseInt(orderForm.weight),
      location: orderForm.location
    };
    
    const result = await apiCall('/api/cms/orders', 'POST', orderData);
    if (result.ok) {
      setOrderForm({ weight: '', location: '' });
      loadOrders(currentClient.id);
    }
  };

  const loadOrders = async (clientId: number) => {
    const result = await apiCall(`/api/cms/orders?client_id=${clientId}`, 'GET');
    if (result.ok) {
      setOrders(result.data);
    }
  };

  const handleLogout = () => {
    setCurrentClient(null);
    setOrders([]);
    setActiveTab('login');
  };

  return (
    <Container>
      <Header>
        <User size={20} />
        <h3>Client Portal</h3>
        {currentClient && (
          <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
            Welcome, {currentClient.name}!
          </span>
        )}
      </Header>
      
      <Content>
        {!currentClient ? (
          <>
            <TabBar>
              <Tab 
                isActive={activeTab === 'login'} 
                onClick={() => setActiveTab('login')}
              >
                <User size={16} />
                Login
              </Tab>
              <Tab 
                isActive={activeTab === 'signup'} 
                onClick={() => setActiveTab('signup')}
              >
                <UserPlus size={16} />
                Sign Up
              </Tab>
            </TabBar>
            
            {activeTab === 'login' && (
              <FormContainer>
                <form onSubmit={handleLogin}>
                  <FormGroup>
                    <Label>Username</Label>
                    <Input
                      type="text"
                      value={loginForm.name}
                      onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <Button type="submit" disabled={isLoading}>
                    <User size={16} />
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </FormContainer>
            )}
            
            {activeTab === 'signup' && (
              <FormContainer>
                <form onSubmit={handleSignup}>
                  <FormGroup>
                    <Label>Username</Label>
                    <Input
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <Button type="submit" disabled={isLoading}>
                    <UserPlus size={16} />
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </form>
              </FormContainer>
            )}
          </>
        ) : (
          <>
            <TabBar>
              <Tab 
                isActive={activeTab === 'orders'} 
                onClick={() => setActiveTab('orders')}
              >
                <Package size={16} />
                My Orders
              </Tab>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </TabBar>
            
            <FormContainer>
              <h4 style={{ margin: '0 0 16px 0' }}>Create New Order</h4>
              <form onSubmit={handleCreateOrder}>
                <FormGroup>
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    value={orderForm.weight}
                    onChange={(e) => setOrderForm({ ...orderForm, weight: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Delivery Location</Label>
                  <Input
                    type="text"
                    value={orderForm.location}
                    onChange={(e) => setOrderForm({ ...orderForm, location: e.target.value })}
                    required
                  />
                </FormGroup>
                <Button type="submit" disabled={isLoading}>
                  <Plus size={16} />
                  {isLoading ? 'Creating Order...' : 'Create Order'}
                </Button>
              </form>
            </FormContainer>
            
            {orders.length > 0 && (
              <OrderList>
                <h4 style={{ margin: '0 0 12px 0' }}>Your Orders</h4>
                {orders.map(order => (
                  <OrderItem key={order.id}>
                    <OrderInfo>
                      <h4>Order #{order.id}</h4>
                      <p>{order.weight}kg • {order.location}</p>
                    </OrderInfo>
                    <StatusBadge status={order.status}>
                      {order.status.replace('_', ' ')}
                    </StatusBadge>
                  </OrderItem>
                ))}
              </OrderList>
            )}
          </>
        )}
      </Content>
    </Container>
  );
};

export default ClientPortal;