import { Injectable } from '@nestjs/common';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-v2';

import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-v2';
import { buildWorkspaceMigrationV2ObjectActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-object-actions-builder';

type WorkspaceMigrationBuilderV2ServiceArgs = {
  from: WorkspaceMigrationObjectInput[];
  to: WorkspaceMigrationObjectInput[];
};

type ObjectMetadataUniqueIdentifier = string;
export type UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher = {
  deleted: Map<ObjectMetadataUniqueIdentifier, WorkspaceMigrationObjectInput>;
  created: Map<ObjectMetadataUniqueIdentifier, WorkspaceMigrationObjectInput>;
  updated: Map<
    ObjectMetadataUniqueIdentifier,
    FromTo<WorkspaceMigrationObjectInput>
  >;
};

const objectMetadataMatriceMapDispatcher = ({
  from,
  to,
}: WorkspaceMigrationBuilderV2ServiceArgs) => {
  const initialDispatcher: UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher =
    {
      created: new Map(),
      updated: new Map(),
      deleted: new Map(),
    };
  // Create maps for faster lookups
  const fromMap = new Map(from.map((obj) => [obj.uniqueIdentifier, obj]));
  const toMap = new Map(to.map((obj) => [obj.uniqueIdentifier, obj]));

  // Find deleted objects (exist in 'from' but not in 'to')
  for (const [identifier, fromObj] of fromMap) {
    if (!toMap.has(identifier)) {
      initialDispatcher.deleted.set(identifier, fromObj);
    }
  }

  // Find created objects (exist in 'to' but not in 'from')
  for (const [identifier, toObj] of toMap) {
    if (!fromMap.has(identifier)) {
      initialDispatcher.created.set(identifier, toObj);
    }
  }

  // Find updated objects (exist in both, need to compare)
  for (const [identifier, fromObj] of fromMap) {
    const toObj = toMap.get(identifier);
    if (toObj) {
      initialDispatcher.updated.set(identifier, {
        from: fromObj,
        to: toObj,
      });
    }
  }

  return initialDispatcher;
};
@Injectable()
export class WorkspaceMigrationBuilderV2Service {
  constructor() {}

  build(
    objectMetadataFromToInputs: WorkspaceMigrationBuilderV2ServiceArgs,
  ): WorkspaceMigrationV2 {
    // This method should instantiate only migration and push actions accordingly in it.
    const objectMetadataCreatedUpdatedDeletedMatrice =
      objectMetadataMatriceMapDispatcher(objectMetadataFromToInputs);

    const objectWorkspaceMigration = buildWorkspaceMigrationV2ObjectActions(
      objectMetadataCreatedUpdatedDeletedMatrice,
    );

    return {
      actions: [...objectWorkspaceMigration],
    };
  }
}
