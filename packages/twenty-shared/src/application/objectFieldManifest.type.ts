import { type FieldManifest } from '@/application/fieldManifestType';
import type { FieldMetadataType } from '@/types';

export type ObjectFieldManifest<
  T extends FieldMetadataType = Exclude<
    FieldMetadataType,
    FieldMetadataType.RELATION
  >,
> = Omit<FieldManifest<T>, 'objectUniversalIdentifier'>;
