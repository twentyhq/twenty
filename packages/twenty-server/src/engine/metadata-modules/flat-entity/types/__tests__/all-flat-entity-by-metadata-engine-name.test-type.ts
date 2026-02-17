import { type AllMetadataName } from 'twenty-shared/metadata';
import { type Expect } from 'twenty-shared/testing';

import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

type ExpectedGenericFlatEntityInformation = {
  universalActions: {
    [P in WorkspaceMigrationActionType]: unknown;
  };
  flatActions: {
    [P in WorkspaceMigrationActionType]: unknown;
  };
  flatEntity: SyncableFlatEntity;
  // TODO remove SyncableFlatEntity once every metadata has been universal migrated
  universalFlatEntity: UniversalSyncableFlatEntity | SyncableFlatEntity;
  entity: unknown;
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
