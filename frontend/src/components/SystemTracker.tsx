import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Activity, ArrowRight, Database, Smartphone, Truck, MapPin } from 'lucide-react';
import { SystemEvent } from '../App';

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const flowAnimation = keyframes`
  0% { transform: translateX(-100%) scale(0); opacity: 0; }
  50% { transform: translateX(0) scale(1); opacity: 1; }
  100% { transform: translateX(100%) scale(0); opacity: 0; }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
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
  overflow: hidden;
  position: relative;
`;

const SystemDiagram = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr auto 1fr;
  gap: 20px;
  height: 60%;
  margin-bottom: 20px;
  position: relative;
`;

const SystemComponent = styled.div<{ isActive?: boolean; position: string }>`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid ${props => props.isActive ? '#10b981' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  transition: all 0.3s ease;
  animation: ${props => props.isActive ? pulseAnimation : 'none'} 2s infinite;
  grid-column: ${props => {
    switch (props.position) {
      case 'client': return '1';
      case 'middleware': return '2 / 4';
      case 'cms': return '1';
      case 'ros': return '2';
      case 'wms': return '3';
      default: return 'auto';
    }
  }};
  grid-row: ${props => {
    switch (props.position) {
      case 'client': return '1';
      case 'middleware': return '2';
      case 'cms':
      case 'ros':
      case 'wms': return '3';
      default: return 'auto';
    }
  }};
`;

const ComponentIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ComponentLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const ComponentDescription = styled.div`
  font-size: 10px;
  opacity: 0.8;
`;

const ConnectionLine = styled.div<{ isActive?: boolean; direction: string }>`
  position: absolute;
  background: ${props => props.isActive ? '#10b981' : 'rgba(255, 255, 255, 0.3)'};
  transition: all 0.3s ease;
  
  ${props => {
    if (props.direction === 'client-to-middleware') {
      return `
        top: 25%;
        left: 25%;
        width: 25%;
        height: 2px;
        transform: translateY(-50%);
      `;
    } else if (props.direction === 'middleware-to-services') {
      return `
        top: 50%;
        left: 25%;
        width: 50%;
        height: 2px;
        transform: translateY(-50%);
      `;
    }
    return '';
  }}
`;

const DataFlow = styled.div<{ isActive?: boolean }>`
  position: absolute;
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  opacity: ${props => props.isActive ? 1 : 0};
  animation: ${props => props.isActive ? flowAnimation : 'none'} 2s infinite;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  z-index: 10;
`;

const EventLog = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  height: 40%;
  overflow-y: auto;
  color: white;
`;

const EventItem = styled.div<{ status: string }>`
  background: rgba(255, 255, 255, 0.1);
  border-left: 3px solid ${props => {
    switch (props.status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  font-size: 12px;
  animation: slideIn 0.3s ease-out;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 4px;
`;

const EventTitle = styled.div`
  font-weight: 600;
  font-size: 13px;
`;

const EventTime = styled.div`
  font-size: 11px;
  opacity: 0.7;
  margin-left: auto;
`;

const EventDetails = styled.div`
  font-size: 11px;
  opacity: 0.8;
  line-height: 1.3;
`;

interface SystemTrackerProps {
  events: SystemEvent[];
}

const SystemTracker: React.FC<SystemTrackerProps> = ({ events }) => {
  const [activeComponents, setActiveComponents] = useState<Set<string>>(new Set());
  const [dataFlows, setDataFlows] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[0];
      const componentMap: { [key: string]: string[] } = {
        'Client Portal': ['client', 'middleware'],
        'CMS': ['middleware', 'cms'],
        'ROS': ['middleware', 'ros'],
        'WMS': ['middleware', 'wms']
      };

      const activeSet = new Set<string>();
      const flowSet = new Set<string>();

      if (componentMap[latestEvent.service]) {
        componentMap[latestEvent.service].forEach(comp => {
          activeSet.add(comp);
        });
        
        if (latestEvent.service === 'Client Portal') {
          flowSet.add('client-to-middleware');
        } else {
          flowSet.add('middleware-to-services');
        }
      }

      setActiveComponents(activeSet);
      setDataFlows(flowSet);

      // Clear active state after 3 seconds
      const timeout = setTimeout(() => {
        setActiveComponents(new Set());
        setDataFlows(new Set());
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [events]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Container>
      <Header>
        <Activity size={20} />
        <h3>System Tracker</h3>
      </Header>
      
      <Content>
        <SystemDiagram>
          {/* Client Portal */}
          <SystemComponent 
            isActive={activeComponents.has('client')} 
            position="client"
          >
            <ComponentIcon>
              <Smartphone size={24} />
            </ComponentIcon>
            <ComponentLabel>Client Portal</ComponentLabel>
            <ComponentDescription>User Interface</ComponentDescription>
          </SystemComponent>

          {/* Middleware */}
          <SystemComponent 
            isActive={activeComponents.has('middleware')} 
            position="middleware"
          >
            <ComponentIcon>
              <ArrowRight size={24} />
            </ComponentIcon>
            <ComponentLabel>WSO2 Middleware</ComponentLabel>
            <ComponentDescription>API Gateway & Orchestrator</ComponentDescription>
          </SystemComponent>

          {/* Backend Services */}
          <SystemComponent 
            isActive={activeComponents.has('cms')} 
            position="cms"
          >
            <ComponentIcon>
              <Database size={20} />
            </ComponentIcon>
            <ComponentLabel>CMS</ComponentLabel>
            <ComponentDescription>Content Management</ComponentDescription>
          </SystemComponent>

          <SystemComponent 
            isActive={activeComponents.has('ros')} 
            position="ros"
          >
            <ComponentIcon>
              <MapPin size={20} />
            </ComponentIcon>
            <ComponentLabel>ROS</ComponentLabel>
            <ComponentDescription>Route Optimization</ComponentDescription>
          </SystemComponent>

          <SystemComponent 
            isActive={activeComponents.has('wms')} 
            position="wms"
          >
            <ComponentIcon>
              <Truck size={20} />
            </ComponentIcon>
            <ComponentLabel>WMS</ComponentLabel>
            <ComponentDescription>Warehouse Management</ComponentDescription>
          </SystemComponent>

          {/* Connection Lines */}
          <ConnectionLine 
            isActive={dataFlows.has('client-to-middleware')}
            direction="client-to-middleware"
          />
          <DataFlow isActive={dataFlows.has('client-to-middleware')} />
          
          <ConnectionLine 
            isActive={dataFlows.has('middleware-to-services')}
            direction="middleware-to-services"
          />
          <DataFlow 
            isActive={dataFlows.has('middleware-to-services')}
            style={{ top: '50%', left: '25%' }}
          />
        </SystemDiagram>

        <EventLog>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>System Activity</h4>
          {events.length === 0 ? (
            <div style={{ opacity: 0.6, textAlign: 'center', padding: '20px 0' }}>
              No system activity yet. Start by using the Client Portal or Driver App.
            </div>
          ) : (
            events.slice(0, 10).map(event => (
              <EventItem key={event.id} status={event.status}>
                <EventHeader>
                  <EventTitle>
                    {event.service} → {event.method} {event.endpoint}
                  </EventTitle>
                  <EventTime>{formatTime(event.timestamp)}</EventTime>
                </EventHeader>
                <EventDetails>
                  Status: {event.status.toUpperCase()}
                  {event.requestData && (
                    <div>Request: {JSON.stringify(event.requestData).substring(0, 50)}...</div>
                  )}
                  {event.responseData && (
                    <div>Response: {JSON.stringify(event.responseData).substring(0, 50)}...</div>
                  )}
                </EventDetails>
              </EventItem>
            ))
          )}
        </EventLog>
      </Content>
    </Container>
  );
};

export default SystemTracker;