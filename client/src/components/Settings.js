import React, { useState } from 'react';
import { getApiMode, setApiMode } from '../services/apiService';

const Settings = ({ isOpen, onClose }) => {
  const [useSoap, setUseSoap] = useState(getApiMode());

  const handleModeChange = (e) => {
    const usesoap = e.target.value === 'soap';
    setUseSoap(usesoap);
    setApiMode(usesoap);
    localStorage.setItem('apiMode', usesoap ? 'soap' : 'rest');
    console.log('Settings: API mode changed to', usesoap ? 'SOAP' : 'REST');
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal settings-modal">
        <div className="modal-header">
          <h3>API Settings</h3>
          <button onClick={handleClose} className="close-button">&times;</button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <h4>API Communication Mode</h4>
            <p>Choose how the client communicates with the backend:</p>
            
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="rest"
                  checked={!useSoap}
                  onChange={handleModeChange}
                />
                <span className="radio-text">
                  <strong>REST API</strong> - JSON-based HTTP requests
                </span>
              </label>
              
              <label className="radio-label">
                <input
                  type="radio"
                  value="soap"
                  checked={useSoap}
                  onChange={handleModeChange}
                />
                <span className="radio-text">
                  <strong>SOAP API</strong> - XML-based SOAP requests
                </span>
              </label>
            </div>
          </div>

          <div className="api-info">
            {useSoap ? (
              <div className="soap-info">
                <h5>SOAP Mode Active</h5>
                <p>Using XML-based SOAP requests to:</p>
                <ul>
                  <li><code>POST /soap/clients/login</code> - Authentication</li>
                  <li><code>POST /soap/clients</code> - Registration</li>
                  <li><code>GET /soap/orders</code> - Get orders</li>
                  <li><code>POST /soap/orders</code> - Create orders</li>
                </ul>
              </div>
            ) : (
              <div className="rest-info">
                <h5>REST Mode Active</h5>
                <p>Using JSON-based REST requests to:</p>
                <ul>
                  <li><code>POST /clients/login</code> - Authentication</li>
                  <li><code>POST /clients/</code> - Registration</li>
                  <li><code>GET /orders</code> - Get orders</li>
                  <li><code>POST /orders</code> - Create orders</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="modal-buttons">
          <button onClick={handleClose} className="submit-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;