import { type MessageDescriptor } from '@lingui/core';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type WorkspaceMigrationActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type FlatEntityValidationError<TCode extends string = string> = {
  code: TCode;
  message: string;
  userFriendlyMessage?: MessageDescriptor;
  value?: unknown;
};

export type FailedFlatEntityValidation<T extends SyncableFlatEntity> = {
  type: WorkspaceMigrationActionTypeV2;
  errors: FlatEntityValidationError[];
  flatEntityMinimalInformation: Partial<T>;
};
