import { type ComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-reader.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export type UniversalComputedFieldSchemaReader = ComputedFieldSchemaReader<
  UniversalFlatObjectMetadata,
  UniversalFlatFieldMetadata
>;
