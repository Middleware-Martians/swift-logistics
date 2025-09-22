import React, { useState } from 'react';
import styled from 'styled-components';
import { Send, ArrowLeft, Code, FileText } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
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

const TabBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0 20px;
  padding-top: 16px;
`;

const Tab = styled.button<{ $isActive: boolean }>`
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 0 20px 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const FormatToggle = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const FormatButton = styled.button<{ $isActive: boolean }>`
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const DataContainer = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const DataContent = styled.pre`
  flex: 1;
  margin: 0;
  padding: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: white;
  background: transparent;
  border: none;
  outline: none;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
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
  gap: 8px;
`;

interface RequestResponseViewerProps {
  request: any;
  response: any;
}

const RequestResponseViewer: React.FC<RequestResponseViewerProps> = ({ request, response }) => {
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('request');
  const [requestFormat, setRequestFormat] = useState<'json' | 'raw'>('json');
  const [responseFormat, setResponseFormat] = useState<'json' | 'raw'>('json');

  const formatData = (data: any, format: 'json' | 'raw') => {
    if (!data) return '';
    
    if (format === 'json') {
      try {
        return JSON.stringify(data, null, 2);
      } catch {
        return String(data);
      }
    } else {
      return String(data);
    }
  };

  const currentData = activeTab === 'request' ? request : response;
  const currentFormat = activeTab === 'request' ? requestFormat : responseFormat;
  const setCurrentFormat = activeTab === 'request' ? setRequestFormat : setResponseFormat;

  return (
    <Container>
      <Header>
        <Send size={20} />
        <h3>API Inspector</h3>
      </Header>
      
      <TabBar>
        <Tab 
          $isActive={activeTab === 'request'} 
          onClick={() => setActiveTab('request')}
        >
          <ArrowLeft size={16} />
          Request
        </Tab>
        <Tab 
          $isActive={activeTab === 'response'} 
          onClick={() => setActiveTab('response')}
        >
          <Send size={16} />
          Response
        </Tab>
      </TabBar>
      
      <Content>
        <FormatToggle>
          <FormatButton 
            $isActive={currentFormat === 'json'}
            onClick={() => setCurrentFormat('json')}
          >
            <Code size={12} />
            JSON
          </FormatButton>
          <FormatButton 
            $isActive={currentFormat === 'raw'}
            onClick={() => setCurrentFormat('raw')}
          >
            <FileText size={12} />
            Raw
          </FormatButton>
        </FormatToggle>
        
        <DataContainer>
          {currentData ? (
            <DataContent>
              {formatData(currentData, currentFormat)}
            </DataContent>
          ) : (
            <EmptyState>
              <Send size={32} style={{ opacity: 0.5 }} />
              <div>No {activeTab} data</div>
              <div style={{ fontSize: '12px', opacity: 0.6 }}>
                {activeTab === 'request' 
                  ? 'Request data will appear here when API calls are made'
                  : 'Response data will appear here when API calls complete'
                }
              </div>
            </EmptyState>
          )}
        </DataContainer>
      </Content>
    </Container>
  );
};

export default RequestResponseViewer;