import React, { useState } from 'react';
import { orderService } from '../services/apiService';

const AddOrderModal = ({ isOpen, onClose, onOrderCreated, clientId }) => {
  const [formData, setFormData] = useState({
    weight: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        client_id: clientId,
        weight: parseInt(formData.weight),
        location: formData.location
      };

      const newOrder = await orderService.createOrder(orderData);
      onOrderCreated(newOrder);
      setFormData({ weight: '', location: '' });
      onClose();
    } catch (error) {
      setError('Failed to create order. Please try again.');
      console.error('Failed to create order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ weight: '', location: '' });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create New Order</h3>
          <button onClick={handleClose} className="close-button">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              placeholder="Enter package weight"
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Delivery Address</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter delivery address"
            />
          </div>

          <div className="modal-buttons">
            <button 
              type="button" 
              onClick={handleClose}
              className="cancel-button"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal;