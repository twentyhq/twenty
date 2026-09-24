import { RelationType } from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { computeWorkspaceSchemaForeignKeyName } from 'src/engine/twenty-orm/workspace-schema-manager/utils/compute-workspace-schema-foreign-key-name.util';
import { type WorkspaceSchemaForeignKeyDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-foreign-key-definition.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { convertOnDeleteActionToOnDelete } from 'src/engine/workspace-manager/workspace-migration/utils/convert-on-delete-action-to-on-delete.util';

export type ManyToOneForeignKey = {
  columnName: string;
  referencedTableName: string;
  foreignKeyName: string;
  onDelete: WorkspaceSchemaForeignKeyDefinition['onDelete'];
};

export const getManyToOneForeignKey = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
  queryRunner,
  schemaName,
  tableName,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: MetadataFlatEntityMaps<'objectMetadata'>;
  queryRunner: QueryRunner;
  schemaName: string;
  tableName: string;
}): ManyToOneForeignKey | undefined => {
  if (
    !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) ||
    flatFieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE
  ) {
    return undefined;
  }

  const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityMaps: flatObjectMetadataMaps,
    flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
  });
  const referencedTableName = computeObjectTargetTable(
    targetFlatObjectMetadata,
  );
  const columnName = computeMorphOrRelationFieldJoinColumnName({
    name: flatFieldMetadata.name,
  });

  return {
    columnName,
    referencedTableName,
    onDelete:
      convertOnDeleteActionToOnDelete(flatFieldMetadata.settings?.onDelete) ??
      'CASCADE',
    foreignKeyName: computeWorkspaceSchemaForeignKeyName({
      queryRunner,
      schemaName,
      foreignKey: {
        tableName,
        columnName,
        referencedTableName,
        referencedColumnName: 'id',
      },
    }),
  };
};
