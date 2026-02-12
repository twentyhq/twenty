import { compositeTypeDefinitions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import {
  type FlatIndexFieldMetadata,
  type FlatIndexMetadata,
} from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

export const computeFlatIndexFieldColumnNames = ({
  flatIndexFieldMetadatas,
  flatFieldMetadataMaps,
}: {
  flatIndexFieldMetadatas: FlatIndexFieldMetadata[];
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): string[] => {
  return flatIndexFieldMetadatas.flatMap(({ fieldMetadataId }) => {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      throw new FlatEntityMapsException(
        'Index field related field metadata not found',
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    if (isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
      if (!isDefined(flatFieldMetadata.settings?.joinColumnName)) {
        throw new FlatEntityMapsException(
          'Join column name is not defined for relation field',
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      return flatFieldMetadata.settings.joinColumnName;
    }

    if (isCompositeFieldMetadataType(flatFieldMetadata.type)) {
      const compositeType = compositeTypeDefinitions.get(
        flatFieldMetadata.type,
      );

      if (!compositeType) {
        throw new FlatEntityMapsException(
          'Composite type not found',
          FlatEntityMapsExceptionCode.INTERNAL_SERVER_ERROR,
        );
      }

      const uniqueCompositeProperties = compositeType.properties.filter(
        (property) => property.isIncludedInUniqueConstraint,
      );

      return uniqueCompositeProperties.map((subField) =>
        computeCompositeColumnName(flatFieldMetadata.name, subField),
      );
    }

    return flatFieldMetadata.name;
  });
};

export const deleteIndexMetadata = async ({
  entityId,
  queryRunner,
  workspaceId,
}: {
  entityId: string;
  queryRunner: QueryRunner;
  workspaceId: string;
}): Promise<void> => {
  const indexMetadataRepository =
    queryRunner.manager.getRepository<IndexMetadataEntity>(IndexMetadataEntity);

  await indexMetadataRepository.delete({
    id: entityId,
    workspaceId,
  });
};

export const createIndexInWorkspaceSchema = async ({
  flatIndexMetadata,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  workspaceSchemaManagerService,
  queryRunner,
  workspaceId,
}: {
  flatIndexMetadata: FlatIndexMetadata;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
  workspaceSchemaManagerService: WorkspaceSchemaManagerService;
  queryRunner: QueryRunner;
  workspaceId: string;
}): Promise<void> => {
  const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
    workspaceId,
    objectMetadata: flatObjectMetadata,
  });

  const columns = computeFlatIndexFieldColumnNames({
    flatIndexFieldMetadatas: flatIndexMetadata.flatIndexFieldMetadatas,
    flatFieldMetadataMaps,
  });

  await workspaceSchemaManagerService.indexManager.createIndex({
    index: {
      columns,
      name: flatIndexMetadata.name,
      isUnique: flatIndexMetadata.isUnique,
      type: flatIndexMetadata.indexType,
      where: flatIndexMetadata.indexWhereClause ?? undefined,
    },
    queryRunner,
    schemaName,
    tableName,
  });
};

export const dropIndexFromWorkspaceSchema = async ({
  indexName,
  workspaceSchemaManagerService,
  queryRunner,
  schemaName,
}: {
  indexName: string;
  workspaceSchemaManagerService: WorkspaceSchemaManagerService;
  queryRunner: QueryRunner;
  schemaName: string;
}): Promise<void> => {
  await workspaceSchemaManagerService.indexManager.dropIndex({
    indexName,
    queryRunner,
    schemaName,
  });
};
