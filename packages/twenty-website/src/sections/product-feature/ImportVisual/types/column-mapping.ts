import { type ComponentType } from 'react';

type FieldGlyph = ComponentType<{ size?: number; stroke?: number }>;

export type ColumnMapping = {
  Icon: FieldGlyph;
  example: string;
  field: string;
  header: string;
};
