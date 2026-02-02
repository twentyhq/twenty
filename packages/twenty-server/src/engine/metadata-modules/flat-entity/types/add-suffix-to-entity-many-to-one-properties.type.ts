import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';
import { type RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/remove-suffix.type';

export type AddSuffixToEntityManyToOneProperties<
  TEntity,
  TMetadataName extends AllMetadataName,
  TSuffix extends string,
> = {
  [P in Extract<MetadataManyToOneJoinColumn<TMetadataName>, keyof TEntity> &
    string as `${RemoveSuffix<P, 'Id'>}${Capitalize<TSuffix>}`]: TEntity[P];
};
