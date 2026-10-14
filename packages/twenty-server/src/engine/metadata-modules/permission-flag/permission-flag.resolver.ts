import { UseFilters, UseGuards } from '@nestjs/common';
import { Context, Parent, Query, ResolveField } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { type ManifestMessageRequestContext } from 'src/engine/metadata-modules/application-translation-catalog/types/manifest-message-request-context.type';
import { PermissionFlagDTO } from 'src/engine/metadata-modules/permission-flag/dtos/permission-flag.dto';
import { PermissionFlagService } from 'src/engine/metadata-modules/permission-flag/permission-flag.service';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';

@MetadataResolver(() => PermissionFlagDTO)
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.ROLES),
)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class PermissionFlagResolver {
  constructor(
    private readonly permissionFlagService: PermissionFlagService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @ResolveField(() => String)
  async label(
    @Parent() permissionFlag: Pick<
      PermissionFlagDTO,
      'label' | 'applicationId'
    >,
    @Context() context: ManifestMessageRequestContext,
  ): Promise<string> {
    return this.applicationTranslationCatalogService.resolveManifestMessage({
      entity: 'permissionFlag',
      property: 'label',
      sourceValue: permissionFlag.label,
      applicationId: permissionFlag.applicationId,
      context,
    });
  }

  @ResolveField(() => String, { nullable: true })
  async description(
    @Parent() permissionFlag: Pick<
      PermissionFlagDTO,
      'description' | 'applicationId'
    >,
    @Context() context: ManifestMessageRequestContext,
  ): Promise<string | null> {
    return this.applicationTranslationCatalogService.resolveManifestMessage({
      entity: 'permissionFlag',
      property: 'description',
      sourceValue: permissionFlag.description,
      applicationId: permissionFlag.applicationId,
      context,
    });
  }

  @Query(() => [PermissionFlagDTO])
  async getPermissionFlags(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PermissionFlagDTO[]> {
    return this.permissionFlagService.findAll(workspace.id);
  }
}
