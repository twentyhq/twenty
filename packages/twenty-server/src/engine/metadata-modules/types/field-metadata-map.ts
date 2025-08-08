import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export type FieldMetadataMap = Record<string, FieldMetadataEntity>; // TODO refactor Should be CachedFieldMetadataEntity or best FlatFieldMetadata
