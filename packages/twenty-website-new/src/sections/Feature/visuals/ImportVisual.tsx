'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import {
  BG_PANEL,
  BORDER_COLOR,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from './visual-tokens';
import { FIELD_MAPPINGS } from './import-visual.data';
import { WindowChrome } from './WindowChrome';

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
`;

const HeaderRow = styled.div`
  border-bottom: 1px solid ${BORDER_COLOR};
  display: grid;
  flex-shrink: 0;
  grid-template-columns: 1fr 40px 1fr 60px;
  padding: 10px 16px;
`;

const HeaderCell = styled.span`
  color: ${TEXT_MUTED};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const MappingRow = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr 40px 1fr 60px;
  padding: 10px 16px;
  transition: background-color 0.1s ease;

  &:not(:last-child) {
    border-bottom: 1px solid ${BORDER_COLOR};
  }

  &:hover {
    background-color: ${BG_PANEL};
  }
`;

const FieldTag = styled.span`
  background-color: ${BG_PANEL};
  border: 1px solid ${BORDER_COLOR};
  border-radius: 4px;
  color: ${TEXT_PRIMARY};
  display: inline-block;
  font-family: monospace;
  font-size: 11px;
  max-width: 100%;
  overflow: hidden;
  padding: 4px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Arrow = styled.span`
  color: ${TEXT_MUTED};
  font-size: 14px;
  text-align: center;
`;

const CrmField = styled.span`
  color: ${TEXT_SECONDARY};
  font-size: 11px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusBadge = styled.button`
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
  justify-self: end;
  letter-spacing: 0.02em;
  padding: 3px 8px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &[data-mapped='true'] {
    background-color: rgba(22, 163, 74, 0.15);
    color: #16a34a;
  }

  &[data-mapped='false'] {
    background-color: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }
`;

type ImportVisualProps = {
  active: boolean;
};

export function ImportVisual({ active }: ImportVisualProps) {
  const [mappings, setMappings] = useState(FIELD_MAPPINGS);

  const toggleMapping = (index: number) => {
    setMappings((prev) =>
      prev.map((mapping, mapIndex) =>
        mapIndex === index ? { ...mapping, mapped: !mapping.mapped } : mapping,
      ),
    );
  };

  return (
    <WindowChrome
      breadcrumb="Import"
      breadcrumbBold="Field mapping"
      title="Apple"
    >
      <HeaderRow>
        <HeaderCell>CSV Column</HeaderCell>
        <HeaderCell />
        <HeaderCell>CRM Field</HeaderCell>
        <HeaderCell style={{ textAlign: 'right' }}>Status</HeaderCell>
      </HeaderRow>
      <Content>
        {mappings.map((mapping, index) => (
          <MappingRow key={index}>
            <FieldTag>{mapping.csvColumn}</FieldTag>
            <Arrow>→</Arrow>
            <CrmField>{mapping.crmField}</CrmField>
            <StatusBadge
              data-mapped={mapping.mapped}
              onClick={() => toggleMapping(index)}
            >
              {mapping.mapped ? 'Mapped' : 'Skip'}
            </StatusBadge>
          </MappingRow>
        ))}
      </Content>
    </WindowChrome>
  );
}
