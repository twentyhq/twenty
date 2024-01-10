import * as React from 'react';
import { Row } from '@react-email/row';
import { Text } from '@react-email/text';
import { Column } from '@react-email/components';

const rowStyle = {
  display: 'flex',
};

const highlightedStyle = {
  borderRadius: '4px',
  background: '#f1f1f1',
  padding: '4px 8px',
  fontSize: '16px',
  fontWeight: 600,
  color: '#333',
};

export const HighlightedText = ({ value }) => {
  return (
    <Row style={rowStyle}>
      <Column>
        <Text style={highlightedStyle}>{value}</Text>
      </Column>
    </Row>
  );
};
