import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { getRecordImageIdentifier } from 'src/engine/core-modules/record-crud/utils/get-record-image-identifier.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { RecordIdentifierDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/record-identifier.dto';
import { getMinimalSelectForRecordIdentifier } from 'src/engine/metadata-modules/navigation-menu-item/utils/get-minimal-select-for-record-identifier.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';

@Injectable()
export class NavigationMenuItemRecordIdentifierService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly fileService: FileService,
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
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: targetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(objectMetadata)) {
      return null;
    }

    const minimalSelectColumns = getMinimalSelectForRecordIdentifier({
      flatObjectMetadata: objectMetadata,
      flatFieldMetadataMaps,
    });

    const resolvedAuthContext: WorkspaceAuthContext =
      authContext ??
      ({
        type: 'system',
        workspace: { id: workspaceId },
      } as WorkspaceAuthContext);

    const record =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const context = getWorkspaceContext();
          const rolePermissionConfig = resolveRolePermissionConfig({
            authContext: context.authContext,
            userWorkspaceRoleMap: context.userWorkspaceRoleMap,
            apiKeyRoleMap: context.apiKeyRoleMap,
          });

          if (!rolePermissionConfig) {
            return null;
          }

          const repository = await this.globalWorkspaceOrmManager.getRepository(
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

          const rawResult = await queryBuilder
            .where(`${alias}.id = :id`, { id: targetRecordId })
            .getRawOne();

          if (!isDefined(rawResult)) {
            return null;
          }

          return formatResult<Record<string, unknown>>(
            rawResult,
            objectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          );
        },
        resolvedAuthContext,
      );

    if (!isDefined(record)) {
      return null;
    }

    const labelIdentifier = getRecordDisplayName(
      record,
      objectMetadata,
      flatFieldMetadataMaps,
    );

    const imageIdentifier = getRecordImageIdentifier({
      record,
      flatObjectMetadata: objectMetadata,
      flatFieldMetadataMaps,
      signUrl: (url: string) =>
        this.fileService.signFileUrl({
          url,
          workspaceId,
        }),
    });

    return {
      id: record.id as string,
      labelIdentifier,
      imageIdentifier,
    };
  }
}
