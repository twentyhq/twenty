import { type MessageDescriptor } from '@lingui/core';
import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type WorkspaceMigrationActionType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export type FlatEntityValidationError<TCode extends string = string> = {
  code: TCode;
  message: string;
  userFriendlyMessage?: MessageDescriptor;
  value?: unknown;
};

export type FailedFlatEntityValidation<
  TMetadataName extends AllMetadataName,
  TAcionType extends WorkspaceMigrationActionType,
> = {
  type: TAcionType;
  metadataName: TMetadataName;
  errors: FlatEntityValidationError[];
  flatEntityMinimalInformation: Partial<MetadataFlatEntity<TMetadataName>>;
};
