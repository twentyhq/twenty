import { type QueryRunner } from 'typeorm';
import { compositeTypeDefinitions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import {
  type FlatIndexFieldMetadata,
  type FlatIndexMetadata,
} from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';

export const computeFlatIndexFieldColumnNames = ({
  flatIndexFieldMetadatas,
  flatFieldMetadataMaps,
}: {
  flatIndexFieldMetadatas: FlatIndexFieldMetadata[];
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
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

export const insertIndexMetadata = async ({
  flatIndexMetadata,
  queryRunner,
}: {
  flatIndexMetadata: FlatIndexMetadata;
  queryRunner: QueryRunner;
}): Promise<void> => {
  const indexMetadataRepository =
    queryRunner.manager.getRepository<IndexMetadataEntity>(IndexMetadataEntity);
  const indexFieldMetadataRepository =
    queryRunner.manager.getRepository<IndexFieldMetadataEntity>(
      IndexFieldMetadataEntity,
    );

  const { flatIndexFieldMetadatas, ...indexMetadataToInsert } =
    flatIndexMetadata;

  const indexInsertResult = await indexMetadataRepository.insert(
    indexMetadataToInsert,
  );

  if (indexInsertResult.identifiers.length !== 1) {
    throw new WorkspaceQueryRunnerException(
      'Failed to create index metadata',
      WorkspaceQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
    );
  }
  const indexMetadataId = indexInsertResult.identifiers[0].id;

  const indexFieldMetadataToInsert = flatIndexFieldMetadatas.map(
    (flatIndexFieldMetadata) => ({
      ...flatIndexFieldMetadata,
      indexMetadataId,
    }),
  );

  await indexFieldMetadataRepository.insert(indexFieldMetadataToInsert);
};

export const deleteIndexMetadata = async ({
  entityId,
  queryRunner,
}: {
  entityId: string;
  queryRunner: QueryRunner;
}): Promise<void> => {
  const indexMetadataRepository =
    queryRunner.manager.getRepository<IndexMetadataEntity>(IndexMetadataEntity);

  await indexMetadataRepository.delete({
    id: entityId,
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
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  workspaceSchemaManagerService: WorkspaceSchemaManagerService;
  queryRunner: QueryRunner;
  workspaceId: string;
}): Promise<void> => {
  const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
    workspaceId,
    flatObjectMetadata,
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
