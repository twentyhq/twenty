import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export type FlatFieldMetadata = Partial<
  Omit<FieldMetadataEntity, 'object' | 'indexFieldMetadatas'>
> & {
  uniqueIdentifier: string;
};
