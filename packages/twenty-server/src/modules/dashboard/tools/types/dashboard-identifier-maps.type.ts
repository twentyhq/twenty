import { FieldMetadataType } from 'twenty-shared/types';

export type DashboardIdentifierMaps = {
  objectIdByName: Record<string, string>;
  fieldIdByObjectIdAndName: Map<string, string>;
  fieldById: Map<string, { type: FieldMetadataType }>;
};
