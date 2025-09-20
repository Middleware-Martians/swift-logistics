import React, { useState } from 'react';
import styled from 'styled-components';
import { Download, Code, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
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
  display: flex;
  flex-direction: column;
`;

const FormatToggle = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const FormatButton = styled.button<{ isActive: boolean }>`
  background: ${props => props.isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ViewerContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ViewerHeader = styled.div<{ status?: string }>`
  background: ${props => {
    switch (props.status) {
      case 'success': return 'rgba(16, 185, 129, 0.2)';
      case 'error': return 'rgba(239, 68, 68, 0.2)';
      case 'pending': return 'rgba(245, 158, 11, 0.2)';
      default: return 'rgba(0, 0, 0, 0.1)';
    }
  }};
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusIcon = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  color: ${props => {
    switch (props.status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
`;

const CodeViewer = styled.pre`
  flex: 1;
  margin: 0;
  padding: 16px;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow: auto;
  border-radius: 0 0 12px 12px;
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #2d2d2d;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #777;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 40px 20px;
  
  svg {
    margin-bottom: 12px;
    opacity: 0.4;
  }
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 500;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
  }
`;

interface ResponseViewerProps {
  response: any;
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({ response }) => {
  const [format, setFormat] = useState<'json' | 'xml'>('json');

  const getResponseStatus = (data: any): 'success' | 'error' | 'pending' => {
    if (!data) return 'pending';
    if (data.error || data.detail) return 'error';
    return 'success';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} />;
      case 'error': return <AlertCircle size={16} />;
      case 'pending': return <Download size={16} />;
      default: return <Code size={16} />;
    }
  };

  const formatResponse = (data: any, targetFormat: 'json' | 'xml') => {
    if (!data) return null;

    if (targetFormat === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Convert JSON to XML format (simplified)
      const jsonToXml = (obj: any, rootName = 'Response'): string => {
        const xmlify = (obj: any, indent = 0): string => {
          const spaces = '  '.repeat(indent);
          let result = '';
          
          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              result += `${spaces}<${key}>\n${xmlify(value, indent + 1)}${spaces}</${key}>\n`;
            } else if (Array.isArray(value)) {
              for (const item of value) {
                result += `${spaces}<${key}>${typeof item === 'object' ? '\n' + xmlify(item, indent + 1) + spaces : item}</${key}>\n`;
              }
            } else {
              result += `${spaces}<${key}>${value}</${key}>\n`;
            }
          }
          
          return result;
        };

        return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope">
  <soap:Body>
    <${rootName}>
${xmlify(obj, 3)}    </${rootName}>
  </soap:Body>
</soap:Envelope>`;
      };

      return jsonToXml(data);
    }
  };

  const responseStatus = getResponseStatus(response);
  const formattedResponse = formatResponse(response, format);
  const statusText = responseStatus.charAt(0).toUpperCase() + responseStatus.slice(1);

  return (
    <Container>
      <Header>
        <Download size={20} />
        <h3>Response</h3>
      </Header>
      
      <Content>
        <FormatToggle>
          <FormatButton 
            isActive={format === 'json'} 
            onClick={() => setFormat('json')}
          >
            <Code size={14} />
            JSON
          </FormatButton>
          <FormatButton 
            isActive={format === 'xml'} 
            onClick={() => setFormat('xml')}
          >
            <FileText size={14} />
            SOAP XML
          </FormatButton>
        </FormatToggle>
        
        <ViewerContainer>
          <ViewerHeader status={responseStatus}>
            <StatusIcon status={responseStatus}>
              {getStatusIcon(responseStatus)}
            </StatusIcon>
            Response Body ({format.toUpperCase()}) - {statusText}
          </ViewerHeader>
          {formattedResponse ? (
            <CodeViewer>{formattedResponse}</CodeViewer>
          ) : (
            <EmptyState>
              <Download size={48} />
              <h4>No Response Data</h4>
              <p>Response data will appear here when requests are completed</p>
            </EmptyState>
          )}
        </ViewerContainer>
      </Content>
    </Container>
  );
};

export default ResponseViewer;