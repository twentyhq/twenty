import { type QueryRunner } from 'typeorm';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { type PreallocatedIdByUniversalIdentifierByMetadataName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import {
  type AllFlatWorkspaceMigrationAction,
  type AllUniversalWorkspaceMigrationAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';

export type WorkspaceMigrationActionRunnerArgs<
  TUniversalAction extends AllUniversalWorkspaceMigrationAction,
> = {
  queryRunner: QueryRunner;
  action: TUniversalAction;
  allFlatEntityMaps: AllFlatEntityMaps;
  workspaceId: string;
  flatApplication: FlatApplication;
  preallocatedIdByUniversalIdentifierByMetadataName?: PreallocatedIdByUniversalIdentifierByMetadataName;
  getSearchFieldMetadatasByTsVectorFieldId?: (
    tsVectorFieldMetadataId: string,
  ) => FlatSearchFieldMetadata[];
  featureFlagsMap?: FeatureFlagMap;
};

export type WorkspaceMigrationActionRunnerContext<
  TFlatAction extends AllFlatWorkspaceMigrationAction,
  TUniversalAction extends AllUniversalWorkspaceMigrationAction =
    AllUniversalWorkspaceMigrationAction,
> = WorkspaceMigrationActionRunnerArgs<TUniversalAction> & {
  flatAction: TFlatAction;
};
