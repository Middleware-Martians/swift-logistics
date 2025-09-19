import React, { useState, useEffect } from 'react';
import { orderService, getApiMode, setApiMode } from '../services/apiService';
import AddOrderModal from './AddOrderModal';
import Settings from './Settings';

const Dashboard = ({ user, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Load API mode from localStorage on component mount
    const savedApiMode = localStorage.getItem('apiMode');
    if (savedApiMode) {
      setApiMode(savedApiMode === 'soap');
    }
    fetchOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const ordersData = await orderService.getOrders(user.id);
      setOrders(ordersData);
    } catch (error) {
      setError('Failed to load orders');
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderCreated = (newOrder) => {
    setOrders(prevOrders => [newOrder, ...prevOrders]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'On_The_Way':
        return '#3498db';
      case 'Delivered':
        return '#27ae60';
      case 'Returned':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ');
  };

  const getCurrentApiMode = () => {
    return getApiMode() ? 'SOAP' : 'REST';
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Swift Logistics Dashboard</h1>
          <div className="header-info">
            <div className="api-mode-indicator">
              API Mode: <span className="mode-badge">{getCurrentApiMode()}</span>
            </div>
            <div className="user-info">
              <span>Welcome, {user.name}!</span>
              <button onClick={() => setIsSettingsOpen(true)} className="settings-button">
                ⚙️ Settings
              </button>
              <button onClick={onLogout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="orders-section">
            <div className="section-header">
              <h2>Your Orders</h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="add-order-button"
              >
                + Add New Order
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <div className="loading">Loading orders...</div>
            ) : (
              <div className="orders-grid">
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <h3>No orders yet</h3>
                    <p>Create your first order to get started!</p>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="create-first-order-button"
                    >
                      Create First Order
                    </button>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <h3>Order #{order.id}</h3>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <div className="order-details">
                        <div className="order-detail">
                          <label>Weight:</label>
                          <span>{order.weight} kg</span>
                        </div>
                        <div className="order-detail">
                          <label>Client ID:</label>
                          <span>{order.client_id}</span>
                        </div>
                        {order.location && (
                          <div className="order-detail">
                            <label>Delivery Address:</label>
                            <span>{order.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <AddOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOrderCreated={handleOrderCreated}
        clientId={user.id}
      />

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default Dashboard;