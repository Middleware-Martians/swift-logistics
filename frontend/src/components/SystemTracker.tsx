import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Activity, ArrowRight, Database, Smartphone, Truck, MapPin, User } from 'lucide-react';
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
  background: #f8fafc;
`;

const Header = styled.div`
  background: white;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
  
  h3 {
    margin: 0;
    color: #374151;
    font-size: 16px;
    font-weight: 600;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 16px;
  overflow: hidden;
  position: relative;
`;

const SystemDiagram = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto auto;
  gap: 16px;
  height: 100%;
  position: relative;
  align-items: center;
  justify-items: center;
`;

const SystemComponent = styled.div<{ $isActive?: boolean; $position: string }>`
  background: ${props => props.$isActive ? '#3b82f6' : '#e5e7eb'};
  border: 2px solid ${props => props.$isActive ? '#1d4ed8' : '#d1d5db'};
  border-radius: 8px;
  padding: 12px;
  min-width: 80px;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.$isActive ? 'white' : '#374151'};
  text-align: center;
  transition: all 0.3s ease;
  animation: ${props => props.$isActive ? pulseAnimation : 'none'} 2s infinite;
  grid-column: ${props => {
    switch (props.$position) {
      case 'client': return '1';
      case 'driver': return '3';
      case 'middleware': return '2';
      case 'cms': return '1';
      case 'ros': return '2';
      case 'wms': return '3';
      default: return 'auto';
    }
  }};
  grid-row: ${props => {
    switch (props.$position) {
      case 'client': return '1';
      case 'driver': return '1';
      case 'middleware': return '2';
      case 'cms':
      case 'ros':
      case 'wms': return '3';
      default: return 'auto';
    }
  }};
`;

const ComponentIcon = styled.div`
  font-size: 20px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ComponentLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  margin-bottom: 2px;
`;

const ComponentDescription = styled.div`
  font-size: 8px;
  opacity: 0.8;
`;

const ConnectionLine = styled.div<{ $isActive?: boolean; $direction: string }>`
  position: absolute;
  background: ${props => props.$isActive ? '#3b82f6' : '#d1d5db'};
  transition: all 0.3s ease;
  z-index: 1;
  
  ${props => {
    if (props.$direction === 'client-to-middleware') {
      return `
        top: 33%;
        left: 33%;
        width: 2px;
        height: 33%;
        transform: translateX(-50%);
      `;
    } else if (props.$direction === 'driver-to-middleware') {
      return `
        top: 33%;
        right: 33%;
        width: 2px;
        height: 33%;
        transform: translateX(50%);
      `;
    } else if (props.$direction === 'middleware-to-services') {
      return `
        top: 66%;
        left: 50%;
        width: 2px;
        height: 33%;
        transform: translateX(-50%);
      `;
    }
    return '';
  }}
`;

const DataFlow = styled.div<{ $isActive?: boolean }>`
  position: absolute;
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
  opacity: ${props => props.$isActive ? 1 : 0};
  animation: ${props => props.$isActive ? flowAnimation : 'none'} 2s infinite;
  z-index: 10;
  transform: translateX(-50%) translateY(-50%);
`;

const ClientDataFlow = styled(DataFlow)`
  top: 50%;
  left: 33%;
`;

const DriverDataFlow = styled(DataFlow)`
  top: 50%;
  right: 33%;
`;

const MiddleDataFlow = styled(DataFlow)`
  top: 83%;
  left: 50%;
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
        'Driver App': ['driver', 'middleware'],
        'CMS': ['middleware', 'cms'],
        'ROS': ['middleware', 'ros'],
        'WMS': ['middleware', 'wms']
      };

      const activeSet = new Set<string>();
      const flowSet = new Set<string>();

      if (latestEvent.service && componentMap[latestEvent.service]) {
        componentMap[latestEvent.service].forEach((comp: string) => {
          activeSet.add(comp);
        });
        
        if (latestEvent.service === 'Client Portal') {
          flowSet.add('client-to-middleware');
        } else if (latestEvent.service === 'Driver App') {
          flowSet.add('driver-to-middleware');
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
            $isActive={activeComponents.has('client')} 
            $position="client"
          >
            <ComponentIcon>
              <Smartphone size={24} />
            </ComponentIcon>
            <ComponentLabel>Client Portal</ComponentLabel>
            <ComponentDescription>Customer Interface</ComponentDescription>
          </SystemComponent>

          {/* Driver App */}
          <SystemComponent 
            $isActive={activeComponents.has('driver')} 
            $position="driver"
          >
            <ComponentIcon>
              <User size={24} />
            </ComponentIcon>
            <ComponentLabel>Driver App</ComponentLabel>
            <ComponentDescription>Driver Interface</ComponentDescription>
          </SystemComponent>

          {/* Middleware */}
          <SystemComponent 
            $isActive={activeComponents.has('middleware')} 
            $position="middleware"
          >
            <ComponentIcon>
              <ArrowRight size={24} />
            </ComponentIcon>
            <ComponentLabel>WSO2 Middleware</ComponentLabel>
            <ComponentDescription>API Gateway & Orchestrator</ComponentDescription>
          </SystemComponent>

          {/* Backend Services */}
          <SystemComponent 
            $isActive={activeComponents.has('cms')} 
            $position="cms"
          >
            <ComponentIcon>
              <Database size={20} />
            </ComponentIcon>
            <ComponentLabel>CMS</ComponentLabel>
            <ComponentDescription>Content Management</ComponentDescription>
          </SystemComponent>

          <SystemComponent 
            $isActive={activeComponents.has('ros')} 
            $position="ros"
          >
            <ComponentIcon>
              <MapPin size={20} />
            </ComponentIcon>
            <ComponentLabel>ROS</ComponentLabel>
            <ComponentDescription>Route Optimization</ComponentDescription>
          </SystemComponent>

          <SystemComponent 
            $isActive={activeComponents.has('wms')} 
            $position="wms"
          >
            <ComponentIcon>
              <Truck size={20} />
            </ComponentIcon>
            <ComponentLabel>WMS</ComponentLabel>
            <ComponentDescription>Warehouse Management</ComponentDescription>
          </SystemComponent>

          {/* Connection Lines */}
          <ConnectionLine 
            $isActive={dataFlows.has('client-to-middleware')}
            $direction="client-to-middleware"
          />
          <ClientDataFlow $isActive={dataFlows.has('client-to-middleware')} />
          
          <ConnectionLine 
            $isActive={dataFlows.has('driver-to-middleware')}
            $direction="driver-to-middleware"
          />
          <DriverDataFlow 
            $isActive={dataFlows.has('driver-to-middleware')}
          />
          
          <ConnectionLine 
            $isActive={dataFlows.has('middleware-to-services')}
            $direction="middleware-to-services"
          />
          <MiddleDataFlow 
            $isActive={dataFlows.has('middleware-to-services')}
          />
        </SystemDiagram>
      </Content>
    </Container>
  );
};

export default SystemTracker;