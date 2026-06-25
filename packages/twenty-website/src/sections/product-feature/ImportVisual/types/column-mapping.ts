import { type MessageDescriptor } from '@lingui/core';
import { type ComponentType } from 'react';

type FieldGlyph = ComponentType<{ size?: number; stroke?: number }>;

export type ColumnMapping = {
  Icon: FieldGlyph;
  example: string;
  field: MessageDescriptor;
  header: string;
};
