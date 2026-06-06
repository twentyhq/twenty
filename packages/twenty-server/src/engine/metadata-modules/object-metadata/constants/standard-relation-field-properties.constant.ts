import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS } from 'twenty-shared/metadata';

export const STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT = {
  noteTarget: { label: msg`Notes`, icon: 'IconNotes' },
  taskTarget: { label: msg`Tasks`, icon: 'IconCheckbox' },
  attachment: { label: msg`Attachments`, icon: 'IconFileImport' },
  timelineActivity: {
    label: msg`Timeline Activities`,
    icon: 'IconTimelineEvent',
  },
} satisfies Record<
  (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number],
  { label: MessageDescriptor; icon: string }
>;
