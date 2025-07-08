import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';

const indexFieldMetadataRelationProperties = [
  'indexMetadata',
  'fieldMetadata',
] as const satisfies (keyof IndexFieldMetadataEntity)[];

type IndexFieldMetadataRelationProperties =
  (typeof indexFieldMetadataRelationProperties)[number];

export type FlattenedIndexFieldMetadata = Partial<
  Omit<IndexFieldMetadataEntity, IndexFieldMetadataRelationProperties>
> & {
  uniqueIdentifier: string;
};
