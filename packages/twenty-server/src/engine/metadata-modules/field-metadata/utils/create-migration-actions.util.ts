import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export const createMigrationActions = async ({
  createdFieldMetadataItems,
  objectMetadataMap,
  isRemoteCreation,
  workspaceMigrationFactory,
}: {
  createdFieldMetadataItems: FieldMetadataEntity[];
  objectMetadataMap: ObjectMetadataMaps['byId'];
  isRemoteCreation: boolean;
  workspaceMigrationFactory: WorkspaceMigrationFactory;
}): Promise<WorkspaceMigrationTableAction[]> => {
  if (isRemoteCreation) {
    return [];
  }

  const migrationActions: WorkspaceMigrationTableAction[] = [];

  for (const createdFieldMetadata of createdFieldMetadataItems) {
    if (
      isFieldMetadataEntityOfType(
        createdFieldMetadata,
        FieldMetadataType.RELATION,
      ) ||
      isFieldMetadataEntityOfType(
        createdFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      )
    ) {
      const relationType = createdFieldMetadata.settings?.relationType;

      if (relationType === RelationType.ONE_TO_MANY) {
        continue;
      }
    }

    const objectMetadata =
      objectMetadataMap[createdFieldMetadata.objectMetadataId];

    if (!isDefined(objectMetadata)) {
      throw new FieldMetadataException(
        'Object metadata does not exist',
        FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    migrationActions.push({
      name: computeObjectTargetTable(objectMetadata),
      action: WorkspaceMigrationTableActionType.ALTER,
      columns: workspaceMigrationFactory.createColumnActions(
        WorkspaceMigrationColumnActionType.CREATE,
        createdFieldMetadata,
      ),
    });
  }

  return migrationActions;
};
