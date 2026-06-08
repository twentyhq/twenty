'use client';

import { styled } from '@linaria/react';
import {
  IconCalendarEvent,
  IconCheckbox,
  IconMail,
  IconNotes,
  IconPaperclip,
  IconTimelineEvent,
} from '@tabler/icons-react';

import {
  BORDER_LIGHT,
  CARD_ACCENT,
  CARD_FONT,
  CARD_TEXT,
  CARD_TEXT_SECONDARY,
} from './visual-tokens';

const TabBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${BORDER_LIGHT};
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  padding: 0 12px;
`;

const Tab = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${CARD_TEXT_SECONDARY};
  cursor: pointer;
  display: flex;
  font-family: ${CARD_FONT};
  font-size: 12px;
  font-weight: 500;
  gap: 5px;
  padding: 11px 8px;
  position: relative;
  white-space: nowrap;

  svg {
    height: 15px;
    width: 15px;
  }

  &[data-active='true'] {
    box-shadow: inset 0 -1px 0 ${CARD_TEXT};
    color: ${CARD_TEXT};
  }
`;

const TABS = [
  { label: 'Timeline', icon: IconTimelineEvent },
  { label: 'Tasks', icon: IconCheckbox },
  { label: 'Notes', icon: IconNotes },
  { label: 'Files', icon: IconPaperclip },
  { label: 'Emails', icon: IconMail },
  { label: 'Calendar', icon: IconCalendarEvent },
];

type RecordTabBarProps = {
  active: string;
  switchable?: readonly string[];
  onSelect?: (tab: string) => void;
};

export function RecordTabBar({
  active,
  switchable = [],
  onSelect,
}: RecordTabBarProps) {
  return (
    <TabBar>
      {TABS.map((item) => {
        const TabIcon = item.icon;
        const isSwitchable = switchable.includes(item.label);
        return (
          <Tab
            data-active={active === item.label}
            key={item.label}
            onClick={
              isSwitchable && onSelect ? () => onSelect(item.label) : undefined
            }
            type="button"
          >
            <TabIcon />
            {item.label}
          </Tab>
        );
      })}
    </TabBar>
  );
}
