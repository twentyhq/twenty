import { Inject, UseGuards, UseInterceptors, UseFilters } from '@nestjs/common';
import {
  Args,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import { type GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { type ApplicationCapability } from 'twenty-shared/application';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationTokenPairDTO } from 'src/engine/core-modules/application/application-oauth/dtos/application-token-pair.dto';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { RequireAccessTokenGuard } from 'src/engine/guards/require-access-token.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { fromFlatFrontComponentToFrontComponentDto } from 'src/engine/metadata-modules/flat-front-component/utils/from-flat-front-component-to-front-component-dto.util';
import { CreateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/create-front-component.input';
import { FrontComponentDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component.dto';
import { UpdateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/update-front-component.input';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { FrontComponentGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/front-component/interceptors/front-component-graphql-api-exception.interceptor';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard)
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  FrontComponentGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => FrontComponentDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class FrontComponentResolver {
  constructor(
    @Inject(FrontComponentService)
    private readonly frontComponentService: FrontComponentService,
    @Inject(ApplicationTokenService)
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly applicationVariableService: ApplicationVariableEntityService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @ResolveField(() => String, { nullable: true })
  async frontComponentSharedDependenciesChecksum(
    @Parent() frontComponent: FrontComponentDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string | null> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatApplicationMaps',
      ]);

    return (
      flatApplicationMaps.byId[frontComponent.applicationId]
        ?.frontComponentSharedDependenciesChecksum ?? null
    );
  }

  @ResolveField(() => String, { nullable: true })
  async applicationName(
    @Parent() frontComponent: FrontComponentDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string | undefined> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatApplicationMaps',
      ]);

    return flatApplicationMaps.byId[frontComponent.applicationId]?.name;
  }

  @ResolveField(() => [String], { nullable: true })
  async applicationGrantedCapabilities(
    @Parent() frontComponent: FrontComponentDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationCapability[]> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatApplicationMaps',
      ]);

    return (
      flatApplicationMaps.byId[frontComponent.applicationId]
        ?.grantedCapabilities ?? []
    );
  }

  @Query(() => [FrontComponentDTO])
  @UseGuards(NoPermissionGuard)
  @AllowSuspendedWorkspace()
  async frontComponents(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<FrontComponentDTO[]> {
    return await this.frontComponentService.findAll(workspace.id);
  }

  @Query(() => FrontComponentDTO, { nullable: true })
  @UseGuards(RequireAccessTokenGuard, NoPermissionGuard)
  async frontComponent(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Info() info: GraphQLResolveInfo,
  ): Promise<FrontComponentDTO | null> {
    const dto = await this.frontComponentService.findById(id, workspace.id);

    if (!dto) {
      return null;
    }

    const selectedFields = graphqlFields(info);

    const [applicationTokenPair, applicationVariables] = await Promise.all([
      // Deprecated: only fronts predating
      // generateFrontComponentApplicationTokenPair still select it
      isDefined(selectedFields.applicationTokenPair)
        ? this.applicationTokenService.generateApplicationTokenPair({
            applicationId: dto.applicationId,
            workspaceId: workspace.id,
            userWorkspaceId,
            userId: user.id,
          })
        : undefined,
      isDefined(selectedFields.applicationVariables)
        ? this.applicationVariableService.getPublicEnvVariables({
            workspaceId: workspace.id,
            applicationId: dto.applicationId,
          })
        : undefined,
    ]);

    return {
      ...dto,
      applicationTokenPair,
      applicationVariables,
    };
  }

  @Mutation(() => ApplicationTokenPairDTO)
  @UseGuards(RequireAccessTokenGuard, NoPermissionGuard)
  @UseFilters(ApplicationExceptionFilter)
  async generateFrontComponentApplicationTokenPair(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ApplicationTokenPairDTO> {
    return this.applicationTokenService.generateApplicationTokenPair({
      applicationId,
      workspaceId: workspace.id,
      userWorkspaceId,
      userId: user.id,
    });
  }

  @Mutation(() => FrontComponentDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async createFrontComponent(
    @Args('input') input: CreateFrontComponentInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<FrontComponentDTO> {
    const flatFrontComponent = await this.frontComponentService.createOne({
      input,
      workspaceId: workspace.id,
    });

    return fromFlatFrontComponentToFrontComponentDto(flatFrontComponent);
  }

  @Mutation(() => FrontComponentDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async updateFrontComponent(
    @Args('input') input: UpdateFrontComponentInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<FrontComponentDTO> {
    const flatFrontComponent = await this.frontComponentService.updateOne({
      id: input.id,
      update: input.update,
      workspaceId: workspace.id,
    });

    return fromFlatFrontComponentToFrontComponentDto(flatFrontComponent);
  }

  @Mutation(() => FrontComponentDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async deleteFrontComponent(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<FrontComponentDTO> {
    const flatFrontComponent = await this.frontComponentService.destroyOne({
      id,
      workspaceId: workspace.id,
    });

    return fromFlatFrontComponentToFrontComponentDto(flatFrontComponent);
  }
}
