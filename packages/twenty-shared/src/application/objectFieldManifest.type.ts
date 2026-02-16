import { type FieldManifest } from '@/application/fieldManifestType';
import type {
  FieldMetadataType,
  RelationAndMorphRelationFieldMetadataType,
} from '@/types';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type ObjectFieldManifest<
  T extends FieldMetadataType = Exclude<
    FieldMetadataType,
    RelationAndMorphRelationFieldMetadataType
  >,
> = DistributiveOmit<FieldManifest<T>, 'objectUniversalIdentifier'>;
