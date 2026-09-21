import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { getRecordImageIdentifier } from 'src/engine/core-modules/record-crud/utils/get-record-image-identifier.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CoreWorkflowFavoriteTargetService } from 'src/engine/core-modules/workflow/services/core-workflow-favorite-target.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RecordIdentifierDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/record-identifier.dto';
import { getMinimalSelectForRecordIdentifier } from 'src/engine/metadata-modules/navigation-menu-item/utils/get-minimal-select-for-record-identifier.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { CoreObjectNameSingular, FileFolder } from 'twenty-shared/types';

@Injectable()
export class NavigationMenuItemRecordIdentifierService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly fileUrlService: FileUrlService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly coreWorkflowFavoriteTargetService: CoreWorkflowFavoriteTargetService,
  ) {}

  async resolveRecordIdentifier({
    targetRecordId,
    targetObjectMetadataId,
    workspaceId,
    userWorkspaceId,
    authContext,
  }: {
    targetRecordId: string;
    targetObjectMetadataId: string;
    workspaceId: string;
    userWorkspaceId?: string;
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

    if (objectMetadata.nameSingular === CoreObjectNameSingular.Workflow) {
      return this.resolveCoreWorkflowRecordIdentifier({
        targetRecordId,
        workspaceId,
        userWorkspaceId,
        objectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        authContext,
      });
    }

    return this.resolveWorkspaceRecordIdentifier({
      targetRecordId,
      workspaceId,
      objectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      authContext,
    });
  }

  private async resolveWorkspaceRecordIdentifier({
    targetRecordId,
    workspaceId,
    objectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    authContext,
  }: {
    targetRecordId: string;
    workspaceId: string;
    objectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    authContext?: WorkspaceAuthContext;
  }): Promise<RecordIdentifierDTO | null> {
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

    const record = await this.workspaceOrmManager.executeInWorkspaceContext(
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

        const repository = this.workspaceOrmManager.getRepository(
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
          .where(`"${alias}".id = :id`, { id: targetRecordId })
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

    const imageIdentifier = await getRecordImageIdentifier({
      record,
      flatObjectMetadata: objectMetadata,
      flatFieldMetadataMaps,
      allowRequestsToTwentyIcons: this.twentyConfigService.get(
        'ALLOW_REQUESTS_TO_TWENTY_ICONS',
      ),
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

  private async resolveCoreWorkflowRecordIdentifier({
    targetRecordId,
    workspaceId,
    userWorkspaceId,
    objectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    authContext,
  }: {
    targetRecordId: string;
    workspaceId: string;
    userWorkspaceId?: string;
    objectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    authContext?: WorkspaceAuthContext;
  }): Promise<RecordIdentifierDTO | null> {
    const favoriteTarget =
      await this.coreWorkflowFavoriteTargetService.resolveFavoriteTarget({
        workspaceId,
        userWorkspaceId,
        targetRecordId,
      });

    if (!isDefined(favoriteTarget)) {
      return null;
    }

    if (isDefined(favoriteTarget.workspaceWorkflowId)) {
      const readableMirror = await this.resolveWorkspaceRecordIdentifier({
        targetRecordId: favoriteTarget.workspaceWorkflowId,
        workspaceId,
        objectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        authContext,
      });

      if (!isDefined(readableMirror)) {
        return null;
      }
    }

    return {
      id: favoriteTarget.coreWorkflowId,
      labelIdentifier: favoriteTarget.name ?? '',
      imageIdentifier: null,
    };
  }
}
