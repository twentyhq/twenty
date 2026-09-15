import {
  IconCalendarEvent,
  IconCheckbox,
  IconMail,
  IconNotes,
  IconPaperclip,
  IconTimelineEvent,
} from '@tabler/icons-react';
import { type ComponentType } from 'react';

import { type RecordTabLabel } from '../types/record-tab-label';

type TabGlyph = ComponentType<{ size?: number; stroke?: number }>;

export const RECORD_TABS: { icon: TabGlyph; label: RecordTabLabel }[] = [
  { icon: IconTimelineEvent, label: 'Timeline' },
  { icon: IconCheckbox, label: 'Tasks' },
  { icon: IconNotes, label: 'Notes' },
  { icon: IconPaperclip, label: 'Files' },
  { icon: IconMail, label: 'Emails' },
  { icon: IconCalendarEvent, label: 'Calendar' },
];
