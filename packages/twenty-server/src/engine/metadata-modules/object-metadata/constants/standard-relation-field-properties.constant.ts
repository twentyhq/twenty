import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS } from 'twenty-shared/metadata';

export const STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT = {
  noteTarget: {
    label: msg({ message: `Notes`, context: 'fieldMetadata.label' }),
    icon: 'IconNotes',
  },
  taskTarget: {
    label: msg({ message: `Tasks`, context: 'fieldMetadata.label' }),
    icon: 'IconCheckbox',
  },
  attachment: {
    label: msg({ message: `Attachments`, context: 'fieldMetadata.label' }),
    icon: 'IconFileImport',
  },
  timelineActivity: {
    label: msg({
      message: `Timeline Activities`,
      context: 'fieldMetadata.label',
    }),
    icon: 'IconTimelineEvent',
  },
} satisfies Record<
  (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number],
  { label: MessageDescriptor; icon: string }
>;
