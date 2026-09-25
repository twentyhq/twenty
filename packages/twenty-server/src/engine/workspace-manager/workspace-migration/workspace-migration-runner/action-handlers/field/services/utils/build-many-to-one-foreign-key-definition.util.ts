import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type WorkspaceSchemaForeignKeyDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-foreign-key-definition.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { convertOnDeleteActionToOnDelete } from 'src/engine/workspace-manager/workspace-migration/utils/convert-on-delete-action-to-on-delete.util';

export const buildManyToOneForeignKeyDefinition = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
  tableName,
}: {
  flatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>;
  flatObjectMetadataMaps: MetadataFlatEntityMaps<'objectMetadata'>;
  tableName: string;
}): WorkspaceSchemaForeignKeyDefinition => ({
  tableName,
  columnName: computeMorphOrRelationFieldJoinColumnName({
    name: flatFieldMetadata.name,
  }),
  referencedTableName: computeObjectTargetTable(
    findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
    }),
  ),
  referencedColumnName: 'id',
  onDelete:
    convertOnDeleteActionToOnDelete(flatFieldMetadata.settings?.onDelete) ??
    'CASCADE',
});
