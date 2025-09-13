import { type FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import { type WorkspaceMigrationActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type FailedFlatEntityValidation<T extends FlatEntity> = {
  type: WorkspaceMigrationActionTypeV2;
  errors: any[];
  flatEntityMinimalInformation: Partial<T>;
};
