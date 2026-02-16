import { Inject, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Subscription } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { fromFlatFrontComponentToFrontComponentDto } from 'src/engine/metadata-modules/flat-front-component/utils/from-flat-front-component-to-front-component-dto.util';
import { CreateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/create-front-component.input';
import { FrontComponentDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component.dto';
import { OnFrontComponentUpdatedDTO } from 'src/engine/metadata-modules/front-component/dtos/on-front-component-updated.dto';
import { OnFrontComponentUpdatedInput } from 'src/engine/metadata-modules/front-component/dtos/on-front-component-updated.input';
import { UpdateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/update-front-component.input';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { FrontComponentGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/front-component/interceptors/front-component-graphql-api-exception.interceptor';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard)
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  FrontComponentGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => FrontComponentDTO)
export class FrontComponentResolver {
  constructor(
    @Inject(FrontComponentService)
    private readonly frontComponentService: FrontComponentService,
    @Inject(ApplicationTokenService)
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Query(() => [FrontComponentDTO])
  @UseGuards(NoPermissionGuard)
  async frontComponents(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<FrontComponentDTO[]> {
    return await this.frontComponentService.findAll(workspace.id);
  }

  @Query(() => FrontComponentDTO, { nullable: true })
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async frontComponent(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<FrontComponentDTO | null> {
    const dto = await this.frontComponentService.findById(id, workspace.id);

    if (!dto) {
      return null;
    }

    const tokenPair =
      await this.applicationTokenService.generateApplicationTokenPair({
        applicationId: dto.applicationId,
        workspaceId: workspace.id,
        userWorkspaceId,
        userId: user.id,
      });

    return {
      ...dto,
      applicationTokenPair: tokenPair,
    };
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

  @Subscription(() => OnFrontComponentUpdatedDTO, {
    filter: (
      payload: {
        onFrontComponentUpdated: OnFrontComponentUpdatedDTO;
      },
      variables: { input: OnFrontComponentUpdatedInput },
    ) => {
      return (
        !isDefined(variables.input.id) ||
        payload.onFrontComponentUpdated.id === variables.input.id
      );
    },
  })
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  onFrontComponentUpdated(
    @Args('input') _: OnFrontComponentUpdatedInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.subscriptionService.subscribe({
      channel: SubscriptionChannel.FRONT_COMPONENT_UPDATED_CHANNEL,
      workspaceId: workspace.id,
    });
  }
}
