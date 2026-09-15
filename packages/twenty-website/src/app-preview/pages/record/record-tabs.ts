import {
  IconCalendarEvent,
  IconCheckbox,
  IconMail,
  IconNotes,
  IconPaperclip,
  IconTimelineEvent,
} from '@tabler/icons-react';

import { type RecordPageDefinition } from '../../types';

export type RecordTabLabel =
  | 'Timeline'
  | 'Tasks'
  | 'Notes'
  | 'Files'
  | 'Emails'
  | 'Calendar';

type RecordTab = { label: RecordTabLabel; Icon: typeof IconNotes };

const LIST: readonly RecordTab[] = [
  { label: 'Timeline', Icon: IconTimelineEvent },
  { label: 'Tasks', Icon: IconCheckbox },
  { label: 'Notes', Icon: IconNotes },
  { label: 'Files', Icon: IconPaperclip },
  { label: 'Emails', Icon: IconMail },
  { label: 'Calendar', Icon: IconCalendarEvent },
];

const getAvailable = (page: RecordPageDefinition): readonly RecordTab[] => {
  const hasContent: Record<RecordTabLabel, boolean> = {
    Timeline: (page.timeline?.length ?? 0) > 0,
    Tasks: (page.tasks?.length ?? 0) > 0,
    Notes: page.notes.length > 0,
    Files: (page.files?.length ?? 0) > 0,
    Emails: (page.emails?.length ?? 0) > 0,
    Calendar: (page.calendar?.length ?? 0) > 0,
  };
  return LIST.filter((tab) => hasContent[tab.label]);
};

// The tab strip auto-advances through every populated tab once (2400ms
// dwell per tab), then unlocks for the visitor's own clicks.
export const recordTabs = {
  DWELL_MS: 2400,
  LIST,
  getAvailable,
};
