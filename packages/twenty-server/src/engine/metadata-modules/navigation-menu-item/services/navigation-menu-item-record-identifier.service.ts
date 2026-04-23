import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { getRecordImageIdentifier } from 'src/engine/core-modules/record-crud/utils/get-record-image-identifier.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RecordIdentifierDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/record-identifier.dto';
import { getMinimalSelectForRecordIdentifier } from 'src/engine/metadata-modules/navigation-menu-item/utils/get-minimal-select-for-record-identifier.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { FileFolder } from 'twenty-shared/types';

@Injectable()
export class NavigationMenuItemRecordIdentifierService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async resolveRecordIdentifier({
    targetRecordId,
    targetObjectMetadataId,
    workspaceId,
    authContext,
  }: {
    targetRecordId: string;
    targetObjectMetadataId: string;
    workspaceId: string;
    authContext?: WorkspaceAuthContext;
  }): Promise<RecordIdentifierDTO | null> {
    const resultMap = await this.resolveRecordIdentifiersBatch({
      items: [{ targetRecordId, targetObjectMetadataId }],
      workspaceId,
      authContext,
    });

    return resultMap.get(targetRecordId) ?? null;
  }

  // Batches record identifier resolution by grouping records per object type,
  // issuing one WHERE id IN (...) query per object type instead of N individual queries.
  async resolveRecordIdentifiersBatch({
    items,
    workspaceId,
    authContext,
  }: {
    items: Array<{
      targetRecordId: string;
      targetObjectMetadataId: string;
    }>;
    workspaceId: string;
    authContext?: WorkspaceAuthContext;
  }): Promise<Map<string, RecordIdentifierDTO>> {
    const resultMap = new Map<string, RecordIdentifierDTO>();

    if (items.length === 0) {
      return resultMap;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const itemsByObjectMetadataId = new Map<
      string,
      string[]
    >();

    for (const item of items) {
      const existing = itemsByObjectMetadataId.get(
        item.targetObjectMetadataId,
      );

      if (isDefined(existing)) {
        existing.push(item.targetRecordId);
      } else {
        itemsByObjectMetadataId.set(item.targetObjectMetadataId, [
          item.targetRecordId,
        ]);
      }
    }

    const resolvedAuthContext: WorkspaceAuthContext =
      authContext ??
      ({
        type: 'system',
        workspace: { id: workspaceId },
      } as WorkspaceAuthContext);

    await Promise.all(
      Array.from(itemsByObjectMetadataId.entries()).map(
        async ([objectMetadataId, recordIds]) => {
          const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: objectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          });

          if (!isDefined(objectMetadata)) {
            return;
          }

          const records = await this.fetchRecordsByIds({
            recordIds,
            objectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            workspaceId,
            authContext: resolvedAuthContext,
          });

          for (const record of records) {
            const dto = this.buildRecordIdentifierDto({
              record,
              objectMetadata,
              flatFieldMetadataMaps,
              workspaceId,
            });

            resultMap.set(record.id as string, dto);
          }
        },
      ),
    );

    return resultMap;
  }

  private async fetchRecordsByIds({
    recordIds,
    objectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    workspaceId,
    authContext,
  }: {
    recordIds: string[];
    objectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    workspaceId: string;
    authContext: WorkspaceAuthContext;
  }): Promise<Record<string, unknown>[]> {
    const minimalSelectColumns = getMinimalSelectForRecordIdentifier({
      flatObjectMetadata: objectMetadata,
      flatFieldMetadataMaps,
    });

    const rawResults =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const context = getWorkspaceContext();
          const rolePermissionConfig = resolveRolePermissionConfig({
            authContext: context.authContext,
            userWorkspaceRoleMap: context.userWorkspaceRoleMap,
            apiKeyRoleMap: context.apiKeyRoleMap,
          });

          if (!rolePermissionConfig) {
            return [];
          }

          const repository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              objectMetadata.nameSingular,
              rolePermissionConfig,
            );

          const alias = objectMetadata.nameSingular;
          const queryBuilder = repository.createQueryBuilder(alias);

          queryBuilder.select([]);

          for (const column of minimalSelectColumns) {
            queryBuilder.addSelect(`"${alias}"."${column}"`, column);
          }

          return await queryBuilder
            .where(`${alias}.id IN (:...ids)`, { ids: recordIds })
            .getRawMany();
        },
        authContext,
      );

    if (!isDefined(rawResults) || rawResults.length === 0) {
      return [];
    }

    return rawResults.map((rawResult) =>
      formatResult<Record<string, unknown>>(
        rawResult,
        objectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      ),
    );
  }

  private buildRecordIdentifierDto({
    record,
    objectMetadata,
    flatFieldMetadataMaps,
    workspaceId,
  }: {
    record: Record<string, unknown>;
    objectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    workspaceId: string;
  }): RecordIdentifierDTO {
    const labelIdentifier = getRecordDisplayName(
      record,
      objectMetadata,
      flatFieldMetadataMaps,
    );

    const imageIdentifier = getRecordImageIdentifier({
      record,
      flatObjectMetadata: objectMetadata,
      flatFieldMetadataMaps,
      signUrl: (fileId: string, fileFolder: FileFolder) =>
        this.fileUrlService.signFileByIdUrl({
          fileId,
          workspaceId,
          fileFolder,
        }),
    });

    return {
      id: record.id as string,
      labelIdentifier,
      imageIdentifier,
    };
  }
}
