import { type FieldManifest } from '@/application/fieldManifestType';
import type { FieldMetadataType } from '@/types';

type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

export type ObjectFieldManifest<
  T extends FieldMetadataType = Exclude<
    FieldMetadataType,
    FieldMetadataType.RELATION
  >,
> = DistributiveOmit<FieldManifest<T>, 'objectUniversalIdentifier'>;
