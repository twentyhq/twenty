import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'class-validator';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WorkspaceMemberPreQueryHookService } from 'src/modules/workspace-member/query-hooks/workspace-member-pre-query-hook.service';

@WorkspaceQueryHook(`workspaceMember.updateOne`)
export class WorkspaceMemberUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  private static readonly PERMISSION_BYPASS_IGNORED_DATA_KEYS = ['updatedBy'];

  constructor(
    private readonly workspaceMemberPreQueryHookService: WorkspaceMemberPreQueryHookService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs,
  ): Promise<UpdateOneResolverArgs> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const canBypassPermissionCheckForCustomFieldUpdate =
      await this.getCanBypassPermissionCheckForCustomFieldUpdate({
        workspaceId: workspace.id,
        payload,
      });

    if (!canBypassPermissionCheckForCustomFieldUpdate) {
      await this.workspaceMemberPreQueryHookService.validateWorkspaceMemberUpdatePermissionOrThrow(
        {
          userWorkspaceId: isUserAuthContext(authContext)
            ? authContext.userWorkspaceId
            : undefined,
          targettedWorkspaceMemberId: payload.id,
          workspaceId: workspace.id,
          apiKey: isApiKeyAuthContext(authContext)
            ? authContext.apiKey
            : undefined,
          workspaceMemberId: isUserAuthContext(authContext)
            ? authContext.workspaceMemberId
            : undefined,
        },
      );
    }

    // TODO: remove this code once we have migrated locale update to userWorkspace update
    if (payload.data.locale && isUserAuthContext(authContext)) {
      const userWorkspace = await this.userWorkspaceRepository.findOne({
        where: {
          id: authContext.userWorkspaceId,
        },
      });

      if (!isDefined(userWorkspace)) {
        throw new AuthException(
          'User workspace not found',
          AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
        );
      }

      await this.userWorkspaceRepository.save({
        ...userWorkspace,
        locale: payload.data.locale,
      });

      await this.coreEntityCacheService.invalidate(
        'userWorkspaceEntity',
        authContext.userWorkspaceId,
      );
    }

    await this.workspaceMemberPreQueryHookService.completeOnboardingProfileStepIfNameProvided(
      {
        userId: isUserAuthContext(authContext)
          ? authContext.user.id
          : undefined,
        workspaceId: workspace.id,
        firstName: payload.data.name?.firstName,
        lastName: payload.data.name?.lastName,
      },
    );

    return payload;
  }

  private async getCanBypassPermissionCheckForCustomFieldUpdate({
    workspaceId,
    payload,
  }: {
    workspaceId: string;
    payload: UpdateOneResolverArgs;
  }): Promise<boolean> {
    const payloadDataPropertyNames = Object.keys(payload.data ?? {}).filter(
      (payloadDataPropertyName) =>
        !WorkspaceMemberUpdateOnePreQueryHook.PERMISSION_BYPASS_IGNORED_DATA_KEYS.includes(
          payloadDataPropertyName,
        ),
    );

    if (payloadDataPropertyNames.length === 0) {
      return false;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const workspaceMemberObjectMetadata = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).find(
      (flatObjectMetadata) =>
        flatObjectMetadata?.nameSingular === 'workspaceMember',
    );

    if (!workspaceMemberObjectMetadata) {
      return false;
    }

    const workspaceMemberFieldMetadatas = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(
      (flatFieldMetadata) =>
        flatFieldMetadata?.objectMetadataId ===
        workspaceMemberObjectMetadata.id,
    );

    return payloadDataPropertyNames.every((payloadDataPropertyName) =>
      workspaceMemberFieldMetadatas.some((flatFieldMetadata) => {
        if (!flatFieldMetadata) {
          return false;
        }

        if (flatFieldMetadata?.name === payloadDataPropertyName) {
          return flatFieldMetadata.isCustom;
        }

        const relationJoinColumnNameFromSettings =
          flatFieldMetadata.settings &&
          'joinColumnName' in flatFieldMetadata.settings
            ? flatFieldMetadata.settings.joinColumnName
            : undefined;
        const relationJoinColumnNameFromUniversalSettings =
          flatFieldMetadata.universalSettings &&
          'joinColumnName' in flatFieldMetadata.universalSettings
            ? flatFieldMetadata.universalSettings.joinColumnName
            : undefined;
        const relationJoinColumnName =
          relationJoinColumnNameFromSettings ??
          relationJoinColumnNameFromUniversalSettings;

        if (!isDefined(relationJoinColumnName)) {
          return false;
        }

        if (relationJoinColumnName === payloadDataPropertyName) {
          return flatFieldMetadata.isCustom;
        }

        return false;
      }),
    );
  }
}
