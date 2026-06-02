import { msg } from '@lingui/core/macro';

export const DEFAULT_RELATION_FIELD_APPEARANCE_BY_RELATION_OBJECT = {
  noteTarget: { label: msg`Notes`, icon: 'IconNotes' },
  taskTarget: { label: msg`Tasks`, icon: 'IconCheckbox' },
  attachment: { label: msg`Attachments`, icon: 'IconFileImport' },
  timelineActivity: {
    label: msg`Timeline Activities`,
    icon: 'IconTimelineEvent',
  },
};
