import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Package, User, Clock, CheckCircle, XCircle, UserCheck, Search, RefreshCw } from 'lucide-react';
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
  justify-content: space-between;
  
  h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const RefreshButton = styled.button`
  background: #059669;
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #047857;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SearchBar = styled.div`
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const FilterButton = styled.button<{ $isActive: boolean }>`
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const OrdersList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const OrderCard = styled.div<{ $status: string }>`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid ${props => {
    switch (props.$status) {
      case 'pending': return '#f59e0b';
      case 'borrowed': return '#3b82f6';
      case 'assigned': return '#10b981';
      case 'delivered': return '#059669';
      default: return '#6b7280';
    }
  }};
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 12px;
`;

const OrderId = styled.h4`
  margin: 0;
  color: white;
  font-size: 16px;
  font-weight: 600;
  flex: 1;
`;

const StatusBadge = styled.span<{ $status: string }>`
  background: ${props => {
    switch (props.$status) {
      case 'pending': return '#f59e0b';
      case 'borrowed': return '#3b82f6';
      case 'assigned': return '#10b981';
      case 'delivered': return '#059669';
      default: return '#6b7280';
    }
  }};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`;

const OrderDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`;

const DetailItem = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  
  .label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    margin-bottom: 2px;
  }
  
  .value {
    font-weight: 500;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' }>`
  background: ${props => {
    switch (props.$variant) {
      case 'primary': return '#10b981';
      case 'secondary': return '#3b82f6';
      case 'danger': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const DriverSelect = styled.select`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  margin-right: 8px;
  min-width: 120px;
  
  option {
    background: #047857;
    color: white;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  text-align: center;
  gap: 12px;
`;

interface Order {
  id: number;
  order_id: string;
  client_name: string;
  pickup_location: string;
  delivery_location: string;
  status: string;
  driver_id?: string;
  driver_name?: string;
  created_at: string;
  package_info?: string;
  borrowed_at?: string;
  assigned_at?: string;
}

interface Driver {
  driver_id: string;
  name: string;
  status: string;
  available: boolean;
}

interface WarehouseManagementProps {
  onSystemEvent: (event: Omit<SystemEvent, 'id' | 'timestamp'>) => void;
}

const WarehouseManagement: React.FC<WarehouseManagementProps> = ({ onSystemEvent }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/wms/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/wms/drivers');
      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const borrowOrder = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/wms/orders/${orderId}/borrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Order borrowed successfully:', result);
        fetchOrders(); // Refresh orders
        
        // Show success notification
        onSystemEvent({
          type: 'delivery',
          message: `Order ${orderId} borrowed successfully`,
          source: 'Warehouse Management',
          service: 'WMS',
          endpoint: `/api/wms/orders/${orderId}/borrow`,
          method: 'POST',
          requestData: {},
          responseData: result,
          status: 'success'
        });
      } else {
        const error = await response.json();
        console.error('Failed to borrow order:', error);
        onSystemEvent({
          type: 'error',
          message: `Failed to borrow order ${orderId}: ${error.detail || 'Unknown error'}`,
          source: 'Warehouse Management',
          service: 'WMS',
          endpoint: `/api/wms/orders/${orderId}/borrow`,
          method: 'POST',
          requestData: {},
          responseData: error,
          status: 'error'
        });
      }
    } catch (error) {
      console.error('Error borrowing order:', error);
      onSystemEvent({
        type: 'error',
        message: `Error borrowing order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'Warehouse Management',
        service: 'WMS',
        endpoint: `/api/wms/orders/${orderId}/borrow`,
        method: 'POST',
        requestData: {},
        responseData: { error: error instanceof Error ? error.message : 'Unknown error' },
        status: 'error'
      });
    }
  };

  const assignDriver = async (orderId: string, driverId: string) => {
    try {
      const requestData = { driver_id: driverId };
      const response = await fetch(`http://localhost:3001/api/wms/orders/${orderId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Driver assigned successfully:', result);
        fetchOrders(); // Refresh orders
        
        // Show success notification
        onSystemEvent({
          type: 'delivery',
          message: `Driver assigned to order ${orderId}`,
          source: 'Warehouse Management',
          service: 'WMS',
          endpoint: `/api/wms/orders/${orderId}/assign`,
          method: 'POST',
          requestData,
          responseData: result,
          status: 'success'
        });
      } else {
        const error = await response.json();
        console.error('Failed to assign driver:', error);
        onSystemEvent({
          type: 'error',
          message: `Failed to assign driver to order ${orderId}: ${error.detail || 'Unknown error'}`,
          source: 'Warehouse Management',
          service: 'WMS',
          endpoint: `/api/wms/orders/${orderId}/assign`,
          method: 'POST',
          requestData,
          responseData: error,
          status: 'error'
        });
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      onSystemEvent({
        type: 'error',
        message: `Error assigning driver to order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'Warehouse Management',
        service: 'WMS',
        endpoint: `/api/wms/orders/${orderId}/assign`,
        method: 'POST',
        requestData: { driver_id: driverId },
        responseData: { error: error instanceof Error ? error.message : 'Unknown error' },
        status: 'error'
      });
    }
  };

  const returnOrder = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/wms/orders/${orderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Error returning order:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrders();
      fetchDrivers();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.pickup_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.delivery_location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const availableDrivers = drivers.filter(driver => driver.available === true);

  return (
    <Container>
      <Header>
        <h3>
          <Package size={20} />
          Warehouse Management
        </h3>
        <RefreshButton onClick={fetchOrders} disabled={loading}>
          <RefreshCw size={14} />
          Refresh
        </RefreshButton>
      </Header>
      
      <SearchBar>
        <Search size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
        <SearchInput
          placeholder="Search orders by ID, client, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterButton 
          $isActive={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All
        </FilterButton>
        <FilterButton 
          $isActive={filter === 'pending'}
          onClick={() => setFilter('pending')}
        >
          Pending
        </FilterButton>
        <FilterButton 
          $isActive={filter === 'borrowed'}
          onClick={() => setFilter('borrowed')}
        >
          Borrowed
        </FilterButton>
        <FilterButton 
          $isActive={filter === 'assigned'}
          onClick={() => setFilter('assigned')}
        >
          Assigned
        </FilterButton>
      </SearchBar>
      
      <OrdersList>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard key={order.order_id} $status={order.status}>
              <OrderHeader>
                <OrderId>Order #{order.order_id}</OrderId>
                <StatusBadge $status={order.status}>{order.status}</StatusBadge>
              </OrderHeader>
              
              <OrderDetails>
                <DetailItem>
                  <div className="label">Client</div>
                  <div className="value">{order.client_name}</div>
                </DetailItem>
                <DetailItem>
                  <div className="label">Package</div>
                  <div className="value">{order.package_info || 'Standard Package'}</div>
                </DetailItem>
                <DetailItem>
                  <div className="label">Pickup</div>
                  <div className="value">{order.pickup_location}</div>
                </DetailItem>
                <DetailItem>
                  <div className="label">Delivery</div>
                  <div className="value">{order.delivery_location}</div>
                </DetailItem>
              </OrderDetails>
              
              {order.driver_name && (
                <DetailItem>
                  <div className="label">Assigned Driver</div>
                  <div className="value">
                    <UserCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {order.driver_name}
                  </div>
                </DetailItem>
              )}
              
              <ActionButtons>
                {order.status === 'pending' && (
                  <ActionButton 
                    $variant="secondary" 
                    onClick={() => borrowOrder(order.order_id)}
                  >
                    <Clock size={12} />
                    Borrow
                  </ActionButton>
                )}
                
                {order.status === 'borrowed' && (
                  <>
                    <DriverSelect 
                      onChange={(e) => {
                        if (e.target.value) {
                          assignDriver(order.order_id, e.target.value);
                          e.target.value = ''; // Reset selection
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">Select Driver</option>
                      {availableDrivers.map(driver => (
                        <option key={driver.driver_id} value={driver.driver_id}>
                          {driver.name}
                        </option>
                      ))}
                    </DriverSelect>
                    <ActionButton 
                      $variant="danger" 
                      onClick={() => returnOrder(order.order_id)}
                    >
                      <XCircle size={12} />
                      Return
                    </ActionButton>
                  </>
                )}
                
                {order.status === 'assigned' && (
                  <ActionButton 
                    $variant="danger" 
                    onClick={() => returnOrder(order.order_id)}
                  >
                    <XCircle size={12} />
                    Unassign
                  </ActionButton>
                )}
                
                {order.status === 'delivered' && (
                  <ActionButton $variant="primary" disabled>
                    <CheckCircle size={12} />
                    Completed
                  </ActionButton>
                )}
              </ActionButtons>
            </OrderCard>
          ))
        ) : (
          <EmptyState>
            <Package size={48} style={{ opacity: 0.5 }} />
            <div>No orders found</div>
            <div style={{ fontSize: '12px', opacity: 0.6 }}>
              {filter === 'all' 
                ? 'Orders will appear here when clients place them'
                : `No ${filter} orders found`
              }
            </div>
          </EmptyState>
        )}
      </OrdersList>
    </Container>
  );
};

export default WarehouseManagement;