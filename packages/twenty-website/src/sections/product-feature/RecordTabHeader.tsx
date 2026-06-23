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
import { type ComponentType } from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

export type RecordTabLabel =
  | 'Calendar'
  | 'Emails'
  | 'Files'
  | 'Notes'
  | 'Tasks'
  | 'Timeline';

type TabGlyph = ComponentType<{ size?: number; stroke?: number }>;

const RECORD_TABS: { icon: TabGlyph; label: RecordTabLabel }[] = [
  { icon: IconTimelineEvent, label: 'Timeline' },
  { icon: IconCheckbox, label: 'Tasks' },
  { icon: IconNotes, label: 'Notes' },
  { icon: IconPaperclip, label: 'Files' },
  { icon: IconMail, label: 'Emails' },
  { icon: IconCalendarEvent, label: 'Calendar' },
];

const Bar = styled.div`
  align-items: stretch;
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  height: 40px;
  padding: 0 12px;
`;

const TabButton = styled.div`
  align-items: center;
  color: ${THEME_LIGHT.font.color.secondary};
  display: flex;
  position: relative;

  &::after {
    background-color: transparent;
    bottom: 0;
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
  }

  &[data-active] {
    color: ${THEME_LIGHT.font.color.primary};
  }

  &[data-active]::after {
    background-color: ${THEME_LIGHT.border.color.inverted};
  }
`;

const TabContent = styled.span`
  align-items: center;
  border-radius: ${THEME_LIGHT.border.radius.sm};
  display: flex;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  gap: ${THEME_LIGHT.spacing(1)};
  padding: ${THEME_LIGHT.spacing(1)} ${THEME_LIGHT.spacing(2)};
  white-space: nowrap;

  &:hover {
    background-color: ${THEME_LIGHT.background.tertiary};
  }
`;

export function RecordTabHeader({ active }: { active: RecordTabLabel }) {
  return (
    <Bar>
      {RECORD_TABS.map(({ icon: Icon, label }) => (
        <TabButton data-active={label === active ? '' : undefined} key={label}>
          <TabContent>
            <Icon size={16} stroke={2} />
            {label}
          </TabContent>
        </TabButton>
      ))}
    </Bar>
  );
}
