import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { PermissionFlagType } from 'twenty-shared/constants';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ENSO_HIDDEN_NAVIGATION_OBJECT_NAME_SINGULARS } from 'src/modules/enso/record-visibility/constants/enso-hidden-navigation-objects.constant';
import {
  EnsoDefaultViewDTO,
  EnsoDefaultViewInput,
  EnsoViewerScopeDTO,
} from 'src/modules/enso/record-visibility/dtos/enso-viewer-scope.dto';
import { EnsoDefaultViewsService } from 'src/modules/enso/default-views/services/enso-default-views.service';
import { EnsoViewerScopeService } from 'src/modules/enso/record-visibility/services/enso-viewer-scope.service';

// Lets the client know whether it is rendering for someone limited to their own
// records, and what to leave out of their sidebar. Reveals nothing about anyone
// else, so being signed in is enough.
//
// API keys have no user context, so `allowUndefined` keeps this from throwing
// for them; they simply come back unscoped.
@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
export class EnsoViewerScopeResolver {
  constructor(
    private readonly ensoViewerScopeService: EnsoViewerScopeService,
    private readonly ensoDefaultViewsService: EnsoDefaultViewsService,
  ) {}

  @Query(() => EnsoViewerScopeDTO)
  async ensoViewerScope(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<EnsoViewerScopeDTO> {
    const isRecordScoped = await this.ensoViewerScopeService.isViewerScoped({
      workspaceId: workspace.id,
      userWorkspaceId,
    });

    // Default views are keyed on the ROLE, not on being scoped: an admin role
    // may want its own list layouts too.
    const roleId = await this.ensoViewerScopeService.getViewerRoleId({
      workspaceId: workspace.id,
      userWorkspaceId,
    });

    const roleDefaultViews = roleId
      ? await this.ensoDefaultViewsService.getRoleDefaultViews({
          workspaceId: workspace.id,
          roleId,
        })
      : {};

    return {
      isRecordScoped,
      hiddenNavigationObjectNameSingulars: isRecordScoped
        ? ENSO_HIDDEN_NAVIGATION_OBJECT_NAME_SINGULARS
        : [],
      defaultViews: Object.entries(roleDefaultViews).map(
        ([objectMetadataId, viewId]) => ({ objectMetadataId, viewId }),
      ),
    };
  }

  // Configuring what a whole ROLE lands on is an administrative act, so unlike
  // the read above this is gated on settings permissions rather than merely
  // being signed in.
  @Mutation(() => [EnsoDefaultViewDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.ROLES))
  async ensoSetRoleDefaultViews(
    @Args('roleId', { type: () => String }) roleId: string,
    @Args('defaultViews', { type: () => [EnsoDefaultViewInput] })
    defaultViews: EnsoDefaultViewInput[],
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<EnsoDefaultViewDTO[]> {
    await this.ensoDefaultViewsService.setRoleDefaultViews({
      workspaceId: workspace.id,
      roleId,
      defaultViewIdByObjectMetadataId: Object.fromEntries(
        defaultViews.map((defaultView) => [
          defaultView.objectMetadataId,
          defaultView.viewId,
        ]),
      ),
    });

    return defaultViews;
  }
}
