import { type MessageDescriptor } from '@lingui/core';
import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type WorkspaceMigrationActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type FlatEntityValidationError<TCode extends string = string> = {
  code: TCode;
  message: string;
  userFriendlyMessage?: MessageDescriptor;
  value?: unknown;
};

export type FailedFlatEntityValidation<
  TMetadataName extends AllMetadataName,
  TAcionType extends WorkspaceMigrationActionTypeV2,
> = {
  type: TAcionType;
  metadataName: TMetadataName;
  errors: FlatEntityValidationError[];
  flatEntityMinimalInformation: Pick<MetadataFlatEntity<TMetadataName>, 'id'> &
    Partial<Omit<MetadataFlatEntity<TMetadataName>, 'id'>>;
};
