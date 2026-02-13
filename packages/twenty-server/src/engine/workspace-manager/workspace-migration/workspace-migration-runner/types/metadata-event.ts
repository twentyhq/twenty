import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type ScalarFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/scalar-flat-entity.type';
import { type MetadataUniversalFlatEntityPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type';

type BaseMetadataEvent<T extends AllMetadataName, TPayload extends object> = {
  metadataName: T;
  recordId: string;
  properties: TPayload;
};

export type DeleteMetadataEvent<T extends AllMetadataName> = BaseMetadataEvent<
  T,
  { before: ScalarFlatEntity<MetadataEntity<T>> }
> & {
  type: 'deleted';
};

export type UpdateMetadataEventDiff<
  T extends AllMetadataName,
  TProperties extends MetadataUniversalFlatEntityPropertiesToCompare<T>,
> = {
  [P in TProperties]: {
    before: MetadataFlatEntity<T>[P];
    after: MetadataFlatEntity<T>[P];
  };
};

export type UpdateMetadataEvent<
  T extends AllMetadataName,
  TProperties extends
    MetadataUniversalFlatEntityPropertiesToCompare<T> = MetadataUniversalFlatEntityPropertiesToCompare<T>,
> = BaseMetadataEvent<
  T,
  {
    updatedFields: TProperties[];
    diff: UpdateMetadataEventDiff<T, TProperties>;
    before: ScalarFlatEntity<MetadataEntity<T>>;
    after: ScalarFlatEntity<MetadataEntity<T>>;
  }
> & { type: 'updated' };

export type CreateMetadataEvent<T extends AllMetadataName> = BaseMetadataEvent<
  T,
  {
    after: ScalarFlatEntity<MetadataEntity<T>>;
  }
> & { type: 'created' };

export type MetadataEvent<T extends AllMetadataName = AllMetadataName> =
  | DeleteMetadataEvent<T>
  | UpdateMetadataEvent<T>
  | CreateMetadataEvent<T>;

export type AllMetadataEventType = MetadataEvent['type'];

export type AllMetadataEventName =
  `metadata.${AllMetadataName}.${MetadataEvent['type']}`;
