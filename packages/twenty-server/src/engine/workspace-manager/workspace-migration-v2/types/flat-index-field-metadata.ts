import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';

const indexFieldMetadataEntityRelationProperties = [
  'indexMetadata',
  'fieldMetadata',
] as const satisfies (keyof IndexFieldMetadataEntity)[];

type IndexFieldMetadataRelationProperties =
  (typeof indexFieldMetadataEntityRelationProperties)[number];

export type FlatIndexFieldMetadata = Partial<
  Omit<IndexFieldMetadataEntity, IndexFieldMetadataRelationProperties>
> & {
  uniqueIdentifier: string;
};
