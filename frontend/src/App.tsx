import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ClientPortal from './components/ClientPortal';
import SystemTracker from './components/SystemTracker';
import DriverApp from './components/DriverApp';
import RequestViewer from './components/RequestViewer';
import ResponseViewer from './components/ResponseViewer';
import SystemActivities from './components/SystemActivities';
import './App.css';

const AppContainer = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr;
  height: 100vh;
  gap: 8px;
  padding: 8px;
  padding-top: 60px; /* Account for fixed header */
  background: #f0f2f5;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  height: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  height: 100%;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GridItem = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const AppHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 8px 16px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 60px;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #374151;
`;

const StatusIndicator = styled.div<{ isConnected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${props => props.isConnected ? '#10b981' : '#ef4444'};
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.isConnected ? '#10b981' : '#ef4444'};
    animation: ${props => props.isConnected ? 'pulse 2s infinite' : 'none'};
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const ScrollHint = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  z-index: 999;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 1;
  }
  
  @media (max-height: 800px) {
    display: flex;
  }
  
  @media (min-height: 801px) {
    display: none;
  }
`;

export interface SystemEvent {
  id: string;
  timestamp: Date;
  type: 'order' | 'delivery' | 'system' | 'error';
  message: string;
  source: string;
  service?: string;
  endpoint?: string;
  method?: string;
  requestData?: any;
  responseData?: any;
  status?: 'pending' | 'success' | 'error';
}

function App() {
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const [currentResponse, setCurrentResponse] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check middleware connection
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        if (response.ok) {
          setIsConnected(true);
        }
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const addSystemEvent = (event: Omit<SystemEvent, 'id' | 'timestamp'>) => {
    const newEvent: SystemEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setSystemEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events
    setCurrentRequest(event.requestData);
    setCurrentResponse(event.responseData);
  };

  return (
    <>
      <AppHeader>
        <Logo>🚚 Swift Logistics Dashboard</Logo>
        <StatusIndicator isConnected={isConnected}>
          {isConnected ? 'Connected to Middleware' : 'Middleware Offline'}
        </StatusIndicator>
      </AppHeader>
      
      <AppContainer>
        <TopRow>
          <GridItem>
            <ClientPortal onSystemEvent={addSystemEvent} />
          </GridItem>
          <GridItem>
            <DriverApp onSystemEvent={addSystemEvent} />
          </GridItem>
          <GridItem>
            <SystemTracker events={systemEvents} />
          </GridItem>
        </TopRow>
        
        <BottomRow>
          <GridItem>
            <RequestViewer request={currentRequest} />
          </GridItem>
          <GridItem>
            <ResponseViewer response={currentResponse} />
          </GridItem>
          <GridItem>
            <SystemActivities events={systemEvents} />
          </GridItem>
        </BottomRow>
      </AppContainer>
      
      <ScrollHint>
        Scroll to see more ↕️
      </ScrollHint>
    </>
  );
}

export default App;
