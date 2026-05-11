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
import { AVATAR_COLORS, CONTACTS } from './contacts-visual.data';
import { WindowChrome } from './WindowChrome';

const Table = styled.div`
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
  grid-template-columns: 1.4fr 1fr 1fr;
  padding: 8px 16px;
`;

const HeaderCell = styled.span`
  color: ${TEXT_MUTED};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const DataRow = styled.div`
  align-items: center;
  cursor: pointer;
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  padding: 10px 16px;
  transition: background-color 0.1s ease;

  &:not(:last-child) {
    border-bottom: 1px solid ${BORDER_COLOR};
  }

  &:hover {
    background-color: ${BG_PANEL};
  }

  &[data-selected='true'] {
    background-color: rgba(14, 165, 233, 0.06);
  }
`;

const NameCell = styled.div`
  align-items: center;
  display: flex;
  gap: 10px;
  min-width: 0;
`;

const Avatar = styled.span`
  align-items: center;
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 700;
  height: 26px;
  justify-content: center;
  letter-spacing: 0.02em;
  width: 26px;
`;

const NameText = styled.span`
  color: ${TEXT_PRIMARY};
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Cell = styled.span`
  color: ${TEXT_SECONDARY};
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type ContactsVisualProps = {
  active: boolean;
};

export function ContactsVisual({ active }: ContactsVisualProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <WindowChrome
      breadcrumb="People"
      breadcrumbBold="All contacts"
      title="Apple"
    >
      <HeaderRow>
        <HeaderCell>Name</HeaderCell>
        <HeaderCell>Company</HeaderCell>
        <HeaderCell>City</HeaderCell>
      </HeaderRow>
      <Table>
        {CONTACTS.map((contact, index) => {
          const avatarColor = AVATAR_COLORS[contact.initials] ?? TEXT_MUTED;

          return (
            <DataRow
              data-selected={selectedIndex === index}
              key={index}
              onClick={() =>
                setSelectedIndex(selectedIndex === index ? null : index)
              }
            >
              <NameCell>
                <Avatar
                  style={{
                    backgroundColor: `${avatarColor}18`,
                    color: avatarColor,
                  }}
                >
                  {contact.initials}
                </Avatar>
                <NameText>{contact.name}</NameText>
              </NameCell>
              <Cell>{contact.company}</Cell>
              <Cell>{contact.city}</Cell>
            </DataRow>
          );
        })}
      </Table>
    </WindowChrome>
  );
}
