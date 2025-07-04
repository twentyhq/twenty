import { Injectable } from '@nestjs/common';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-v2';

import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-v2';
import { buildWorkspaceMigrationV2FieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-field-actions-builder';
import { buildWorkspaceMigrationV2ObjectActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-object-actions-builder';

type WorkspaceMigrationBuilderV2ServiceArgs = {
  from: WorkspaceMigrationObjectInput[];
  to: WorkspaceMigrationObjectInput[];
};

type ObjectMetadataUniqueIdentifier = string;
export type UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher = {
  // Note no need for a map tbh
  deletedObjectMetadata: WorkspaceMigrationObjectInput[];
  createdObjectMetadata: WorkspaceMigrationObjectInput[];
  updatedObjectMetadata: FromTo<WorkspaceMigrationObjectInput>[];
};

const objectMetadataMatriceMapDispatcher = ({
  from,
  to,
}: WorkspaceMigrationBuilderV2ServiceArgs) => {
  const initialDispatcher: UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher =
    {
      createdObjectMetadata: [],
      updatedObjectMetadata: [],
      deletedObjectMetadata: [],
    };
  // Create maps for faster lookups
  const fromMap = new Map(from.map((obj) => [obj.uniqueIdentifier, obj]));
  const toMap = new Map(to.map((obj) => [obj.uniqueIdentifier, obj]));

  // Find deleted objects (exist in 'from' but not in 'to')
  for (const [identifier, fromObj] of fromMap) {
    if (!toMap.has(identifier)) {
      initialDispatcher.deletedObjectMetadata.push(fromObj);
    }
  }

  // Find created objects (exist in 'to' but not in 'from')
  for (const [identifier, toObj] of toMap) {
    if (!fromMap.has(identifier)) {
      initialDispatcher.createdObjectMetadata.push(toObj);
    }
  }

  // Find updated objects (exist in both, need to compare)
  for (const [identifier, fromObj] of fromMap) {
    const toObj = toMap.get(identifier);
    if (toObj) {
      initialDispatcher.updatedObjectMetadata.push({
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

    const objectWorkspaceMigrationActions =
      buildWorkspaceMigrationV2ObjectActions(
        objectMetadataCreatedUpdatedDeletedMatrice,
      );

    const fieldWorkspaceMigrationActions =
      buildWorkspaceMigrationV2FieldActions(
        objectMetadataCreatedUpdatedDeletedMatrice.updatedObjectMetadata,
      );

    return {
      actions: [
        ...objectWorkspaceMigrationActions,
        ...fieldWorkspaceMigrationActions,
      ],
    };
  }
}
