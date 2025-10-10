import { ALL_FLAT_ENTITY_CONFIGURATION } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-configuration.constant';
import { AllFlatEntitiesByMetadataEngineNameV2 } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { Expect } from 'twenty-shared/testing';

type ExpectedGenericFlatEntityInformation<
  P extends keyof AllFlatEntitiesByMetadataEngineNameV2,
> = {
  actions: {
    created: WorkspaceMigrationActionV2;
    deleted: WorkspaceMigrationActionV2;
    updated: WorkspaceMigrationActionV2;
  };
  flatEntity: FlatEntity;
  configuration: (typeof ALL_FLAT_ENTITY_CONFIGURATION)[P];
};

type ExpectedGenericAllFlatEntityInformationByMetadataEngine = {
  [P in keyof AllFlatEntitiesByMetadataEngineNameV2]: ExpectedGenericFlatEntityInformation<P>;
};
// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    AllFlatEntitiesByMetadataEngineNameV2 extends ExpectedGenericAllFlatEntityInformationByMetadataEngine
      ? true
      : false
  >,
];
