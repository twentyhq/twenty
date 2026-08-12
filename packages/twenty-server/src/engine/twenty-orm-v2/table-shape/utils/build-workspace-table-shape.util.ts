import { compositeTypeDefinitions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  type WorkspaceColumnShape,
  type WorkspaceRelationShape,
  type WorkspaceTableShape,
} from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

export const buildWorkspaceTableShape = ({
  workspaceId,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): WorkspaceTableShape => {
  const flatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  const columnShapeByColumnName: Record<string, WorkspaceColumnShape> = {};
  const relationShapeByFieldName: Record<string, WorkspaceRelationShape> = {};

  for (const flatFieldMetadata of flatFieldMetadatas) {
    if (isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
      const relationType = flatFieldMetadata.settings?.relationType;

      if (!isDefined(relationType)) {
        continue;
      }

      const isOwningSide = relationType === RelationType.MANY_TO_ONE;
      const joinColumnName = isOwningSide
        ? computeMorphOrRelationFieldJoinColumnName({
            name: flatFieldMetadata.name,
          })
        : undefined;

      relationShapeByFieldName[flatFieldMetadata.name] = {
        fieldName: flatFieldMetadata.name,
        fieldMetadataId: flatFieldMetadata.id,
        relationType,
        targetObjectMetadataId:
          flatFieldMetadata.relationTargetObjectMetadataId ?? '',
        targetFieldMetadataId:
          flatFieldMetadata.relationTargetFieldMetadataId ?? null,
        joinColumnName,
      };

      if (isDefined(joinColumnName)) {
        columnShapeByColumnName[joinColumnName] = {
          columnName: joinColumnName,
          fieldMetadataId: flatFieldMetadata.id,
          fieldName: flatFieldMetadata.name,
          fieldMetadataType: flatFieldMetadata.type,
        };
      }

      continue;
    }

    if (isCompositeFieldMetadataType(flatFieldMetadata.type)) {
      const compositeType = compositeTypeDefinitions.get(
        flatFieldMetadata.type,
      );

      if (!isDefined(compositeType)) {
        throw new TwentyOrmV2Exception(
          `Composite type "${flatFieldMetadata.type}" has no definition, so the columns for field "${flatFieldMetadata.name}" cannot be derived`,
          TwentyOrmV2ExceptionCode.UNKNOWN_COLUMN,
        );
      }

      for (const compositeProperty of compositeType.properties) {
        const columnName = computeCompositeColumnName(
          flatFieldMetadata.name,
          compositeProperty,
        );

        columnShapeByColumnName[columnName] = {
          columnName,
          fieldMetadataId: flatFieldMetadata.id,
          fieldName: flatFieldMetadata.name,
          fieldMetadataType: compositeProperty.type,
          compositeParentFieldName: flatFieldMetadata.name,
        };
      }

      continue;
    }

    columnShapeByColumnName[flatFieldMetadata.name] = {
      columnName: flatFieldMetadata.name,
      fieldMetadataId: flatFieldMetadata.id,
      fieldName: flatFieldMetadata.name,
      fieldMetadataType: flatFieldMetadata.type,
    };
  }

  return {
    objectMetadataId: flatObjectMetadata.id,
    nameSingular: flatObjectMetadata.nameSingular,
    schemaName: getWorkspaceSchemaName(workspaceId),
    tableName: computeObjectTargetTable(flatObjectMetadata),
    columnShapeByColumnName,
    columnNames: Object.keys(columnShapeByColumnName),
    relationShapeByFieldName,
    hasDeletedAtColumn: isDefined(columnShapeByColumnName['deletedAt']),
  };
};
