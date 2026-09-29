import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS } from 'twenty-shared/metadata';

import { type OPTIONAL_DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS } from 'src/engine/metadata-modules/object-metadata/constants/optional-default-relations-object-standard-ids.constant';

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
    icon: 'IconPaperclip',
  },
  timelineActivity: {
    label: msg({
      message: `Timeline Activities`,
      context: 'fieldMetadata.label',
    }),
    icon: 'IconTimelineEvent',
  },
  agentChatThreadTarget: {
    label: msg({ message: `Chats`, context: 'fieldMetadata.label' }),
    icon: 'IconMessage',
  },
} satisfies Record<
  | (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number]
  | (typeof OPTIONAL_DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number],
  { label: MessageDescriptor; icon: string }
>;
