import { type AllFlatEntityConfigurationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { type Expect } from 'twenty-shared/testing';

type ExpectedGenericFlatEntityInformation = {
  actions: {
    created: WorkspaceMigrationActionV2 | WorkspaceMigrationActionV2[];
    deleted: WorkspaceMigrationActionV2 | WorkspaceMigrationActionV2[];
    updated: WorkspaceMigrationActionV2 | WorkspaceMigrationActionV2[];
  };
  flatEntity: FlatEntity;
};

type ExpectedGenericAllFlatEntityInformationByMetadataEngine = {
  [P in keyof AllFlatEntityConfigurationByMetadataName]: ExpectedGenericFlatEntityInformation;
};
// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    AllFlatEntityConfigurationByMetadataName extends ExpectedGenericAllFlatEntityInformationByMetadataEngine
      ? true
      : false
  >,
];
