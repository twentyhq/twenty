import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataUniversalFlatEntityPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type';

type BaseMetadataEvent<T extends AllMetadataName, TPayload extends object> = {
  metadataName: T;
  properties: TPayload;
};

export type DeleteMetadataEvent<T extends AllMetadataName> = BaseMetadataEvent<
  T,
  { before: MetadataFlatEntity<T> }
> & {
  type: 'delete';
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
    before: MetadataFlatEntity<T>;
    after: MetadataFlatEntity<T>;
  }
> & { type: 'update' };

export type CreateMetadataEvent<T extends AllMetadataName> = BaseMetadataEvent<
  T,
  {
    after: MetadataFlatEntity<T>;
  }
> & { type: 'create' };

export type MetadataEvent<T extends AllMetadataName = AllMetadataName> =
  | DeleteMetadataEvent<T>
  | UpdateMetadataEvent<T>
  | CreateMetadataEvent<T>;
