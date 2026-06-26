import { type MessageDescriptor } from '@lingui/core';

import { type LayoutFieldIconType } from './layout-field-icon-type';

export type LayoutFieldDefinition = {
  icon: LayoutFieldIconType;
  id: string;
  label: MessageDescriptor;
  section: string;
  type: MessageDescriptor;
  visible: boolean;
};
