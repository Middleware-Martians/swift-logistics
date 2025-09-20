import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ClientPortal from './components/ClientPortal';
import SystemTracker from './components/SystemTracker';
import DriverApp from './components/DriverApp';
import RequestViewer from './components/RequestViewer';
import ResponseViewer from './components/ResponseViewer';
import './App.css';

const AppContainer = styled.div`
  display: grid;
  grid-template-rows: 2fr 1fr;
  height: 100vh;
  gap: 10px;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
`;

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
`;

const GridItem = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const AppHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

export interface SystemEvent {
  id: string;
  timestamp: Date;
  service: string;
  endpoint: string;
  method: string;
  requestData?: any;
  responseData?: any;
  status: 'pending' | 'success' | 'error';
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
      
      <AppContainer style={{ paddingTop: '70px' }}>
        <TopRow>
          <GridItem>
            <ClientPortal onSystemEvent={addSystemEvent} />
          </GridItem>
          <GridItem>
            <SystemTracker events={systemEvents} />
          </GridItem>
        </TopRow>
        
        <BottomRow>
          <GridItem>
            <DriverApp onSystemEvent={addSystemEvent} />
          </GridItem>
          <GridItem>
            <RequestViewer request={currentRequest} />
          </GridItem>
          <GridItem>
            <ResponseViewer response={currentResponse} />
          </GridItem>
        </BottomRow>
      </AppContainer>
    </>
  );
}

export default App;
