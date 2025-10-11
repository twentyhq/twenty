import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type WorkspaceMigrationV2<
  TActions extends WorkspaceMigrationActionV2 = WorkspaceMigrationActionV2,
> = {
  actions: TActions[];
  workspaceId: string;
  relatedFlatEntityMapsKeys?: (keyof AllFlatEntityMaps)[];
};
