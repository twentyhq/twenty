import { type FormatRecordSerializedRelationProperties } from '../FormatRecordSerializedRelationProperties';
import { type SerializedRelation } from '../SerializedRelation';

export type DashboardFilterBinding = {
  pageLayoutFilterId: string;
  fieldMetadataId: SerializedRelation | null;
};

export type UniversalDashboardFilterBinding =
  FormatRecordSerializedRelationProperties<DashboardFilterBinding>;
