import { type AllMetadataName } from 'twenty-shared/metadata';
import { type Expect } from 'twenty-shared/testing';

import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { type WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

type ExpectedGenericFlatEntityInformation = {
  actions: {
    [P in WorkspaceMigrationActionType]:
      | WorkspaceMigrationAction
      | WorkspaceMigrationAction[];
  };
  flatEntity: SyncableFlatEntity;
};

type ExpectedGenericAllFlatEntityInformationByMetadataEngine = {
  [P in keyof AllFlatEntityTypesByMetadataName]: ExpectedGenericFlatEntityInformation;
};

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    keyof AllFlatEntityTypesByMetadataName extends AllMetadataName
      ? true
      : false
  >,
  Expect<
    AllMetadataName extends keyof AllFlatEntityTypesByMetadataName
      ? true
      : false
  >,
  Expect<
    AllFlatEntityTypesByMetadataName extends ExpectedGenericAllFlatEntityInformationByMetadataEngine
      ? true
      : false
  >,
];
