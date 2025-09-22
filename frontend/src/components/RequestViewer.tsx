import React, { useState } from 'react';
import styled from 'styled-components';
import { Send, Code, FileText } from 'lucide-react';

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

const ViewerHeader = styled.div`
  background: rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 12px;
  font-weight: 500;
  opacity: 0.8;
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

interface RequestViewerProps {
  request: any;
}

const RequestViewer: React.FC<RequestViewerProps> = ({ request }) => {
  const [format, setFormat] = useState<'json' | 'xml'>('json');

  const formatRequest = (data: any, targetFormat: 'json' | 'xml') => {
    if (!data) return null;

    if (targetFormat === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Convert JSON to XML format (simplified)
      const jsonToXml = (obj: any, rootName = 'Request'): string => {
        const xmlify = (obj: any, indent = 0): string => {
          const spaces = '  '.repeat(indent);
          let result = '';
          
          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              result += `${spaces}<${key}>\n${xmlify(value, indent + 1)}${spaces}</${key}>\n`;
            } else if (Array.isArray(value)) {
              value.forEach((item) => {
                result += `${spaces}<${key}>${typeof item === 'object' ? '\n' + xmlify(item, indent + 1) + spaces : item}</${key}>\n`;
              });
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

  const formattedRequest = formatRequest(request, format);

  return (
    <Container>
      <Header>
        <Send size={20} />
        <h3>Request</h3>
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
          <ViewerHeader>
            Request Body ({format.toUpperCase()})
          </ViewerHeader>
          {formattedRequest ? (
            <CodeViewer>{formattedRequest}</CodeViewer>
          ) : (
            <EmptyState>
              <Send size={48} />
              <h4>No Request Data</h4>
              <p>Request data will appear here when you interact with the Client Portal or Driver App</p>
            </EmptyState>
          )}
        </ViewerContainer>
      </Content>
    </Container>
  );
};

export default RequestViewer;