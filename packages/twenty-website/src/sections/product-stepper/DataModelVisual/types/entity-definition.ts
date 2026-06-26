import { type MessageDescriptor } from '@lingui/core';

import { type DataModelFieldIcon } from './data-model-field-icon';
import { type DataModelHeaderIcon } from './data-model-header-icon';
import { type EntityTone } from './entity-tone';

export type EntityDefinition = {
  expandCount: number;
  fields: { icon: DataModelFieldIcon; label: MessageDescriptor }[];
  headerIcon: DataModelHeaderIcon;
  id: string;
  isCustom: boolean;
  label: MessageDescriptor;
  meta: string;
  tone: EntityTone;
  x: number;
  y: number;
};
