import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type ResolvableChartRelationAxis = {
  dimensionIndex: number;
  targetFlatObjectMetadata: FlatObjectMetadata;
  labelIdentifierColumnNames: string[];
  recordIds: string[];
};
