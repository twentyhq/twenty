import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type RelationType } from '@/types/RelationType';

// Template literal types let both the shared enums and the frontend's
// generated GraphQL enums satisfy these structural types.
export type SpreadsheetImportFieldMetadata = {
  id: string;
  name: string;
  label: string;
  type: `${FieldMetadataType}`;
  isActive?: boolean | null;
  isSystem?: boolean | null;
  settings?: unknown;
  defaultValue?: unknown;
  options?:
    | {
        label: string;
        value: string;
        color?: string | null;
      }[]
    | null;
  relation?: {
    type: `${RelationType}`;
    targetObjectMetadata: { id: string };
  } | null;
};
