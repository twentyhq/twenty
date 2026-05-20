import { type FieldManifest } from '@/application/fieldManifestType';
import type { FieldMetadataType } from '@/types';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type ObjectFieldManifest<
  T extends FieldMetadataType = FieldMetadataType,
> = DistributiveOmit<FieldManifest<T>, 'objectUniversalIdentifier'>;
