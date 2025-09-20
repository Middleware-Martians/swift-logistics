import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const EventCounter = styled.span`
  margin-left: auto;
  font-size: 14px;
  opacity: 0.9;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8fafc;
`;

const ActivityItem = styled.div<{ type: string }>`
  background: white;
  border-left: 4px solid ${props => 
    props.type === 'order' ? '#10b981' :
    props.type === 'delivery' ? '#3b82f6' :
    props.type === 'system' ? '#f59e0b' :
    '#ef4444'
  };
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 0 8px 8px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 5px;
`;

const ActivityText = styled.div`
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
`;

const ActivityType = styled.span<{ type: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  color: white;
  background: ${props => 
    props.type === 'order' ? '#10b981' :
    props.type === 'delivery' ? '#3b82f6' :
    props.type === 'system' ? '#f59e0b' :
    '#ef4444'
  };
  margin-left: 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #64748b;
  font-style: italic;
  padding: 40px 20px;
`;

export interface SystemEvent {
  id: string;
  timestamp: Date;
  type: 'order' | 'delivery' | 'system' | 'error';
  message: string;
  source: string;
  requestData?: any;
  responseData?: any;
}

interface SystemActivitiesProps {
  events: SystemEvent[];
}

const SystemActivities: React.FC<SystemActivitiesProps> = ({ events }) => {
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
        📊 System Activities
        <EventCounter>
          {events.length} events
        </EventCounter>
      </Header>
      <Content>
        {events.length === 0 ? (
          <EmptyState>
            No system activities yet. Start using the system to see real-time events.
          </EmptyState>
        ) : (
          events.map((event) => (
            <ActivityItem key={event.id} type={event.type}>
              <ActivityTime>
                {formatTime(event.timestamp)} | {event.source}
                <ActivityType type={event.type}>{event.type}</ActivityType>
              </ActivityTime>
              <ActivityText>{event.message}</ActivityText>
            </ActivityItem>
          ))
        )}
      </Content>
    </Container>
  );
};

export default SystemActivities;