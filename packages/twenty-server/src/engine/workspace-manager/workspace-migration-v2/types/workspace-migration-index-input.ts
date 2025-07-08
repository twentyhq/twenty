import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

export const indexMetadataEntityEditableProperties =
  [] as const satisfies (keyof IndexMetadataEntity)[];
export type IndexMetadataEntityEditableProperties =
  (typeof indexMetadataEntityEditableProperties)[number];

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

export type FlattenedIndexMetadata = Partial<
  Omit<IndexMetadataEntity, 'indexFieldMetadatas' | 'objectMetadata'> // Might have an issue as ObjectMetadataId != uniqueIdentifier
> & {
  flattenedIndexFieldMetadatas: FlattenedIndexFieldMetadata[];
  uniqueIdentifier: string;
};
