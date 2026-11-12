import { UseGuards, UseInterceptors, UseFilters } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ApplicationConnectedAccountDTO } from 'src/engine/metadata-modules/connected-account/dtos/application-connected-account.dto';
import { ConnectedAccountPublicDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account-public.dto';
import { ConnectedAccountDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account.dto';
import { ConnectedAccountGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/connected-account/interceptors/connected-account-graphql-api-exception.interceptor';
import { buildPublicConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/build-public-connected-account.util';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const CONNECTED_ACCOUNT_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  },
  requiredPermissionFlags: [],
};

@UseInterceptors(ConnectedAccountGraphqlApiExceptionInterceptor)
@MetadataResolver(() => ConnectedAccountDTO)
@UseFilters(ApplicationExceptionFilter, AuthGraphqlApiExceptionFilter)
export class ConnectedAccountResolver {
  constructor(
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  @Query(() => [ConnectedAccountPublicDTO])
  @UseGuards(AccessPolicyGuard(CONNECTED_ACCOUNT_ACCESS_POLICY))
  @AllowSuspendedWorkspace()
  async myConnectedAccounts(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ConnectedAccountPublicDTO[]> {
    const accounts =
      await this.connectedAccountMetadataService.findUsableByCaller({
        userWorkspaceId,
        workspaceId: workspace.id,
      });

    return accounts.map((account) => buildPublicConnectedAccount(account));
  }

  @Query(() => [ApplicationConnectedAccountDTO])
  @UseGuards(
    AccessPolicyGuard({
      authPrincipals: {
        userSession: {
          standard: true,
          impersonated: true,
          playground: true,
          workspaceAgnostic: false,
        },
        apiKey: true,
        oauthClient: true,
        application: true,
      },
      requiredPermissionFlags: [PermissionFlagType.APPLICATIONS],
    }),
    ApplicationTargetGuard,
  )
  async applicationConnectedAccounts(
    @ApplicationTargetArg(
      'applicationId',
      { kind: 'applicationId', requireApplicationRegistrationOwnership: false },
      { type: () => UUIDScalarType },
    )
    applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ApplicationConnectedAccountDTO[]> {
    const accounts =
      await this.connectedAccountMetadataService.findApplicationConnectedAccountsUsableByCaller(
        {
          applicationId,
          workspaceId: workspace.id,
          userWorkspaceId,
        },
      );

    return accounts.map((account) => ({
      ...buildPublicConnectedAccount(account),
      isOwnedByCurrentUser: account.userWorkspaceId === userWorkspaceId,
    }));
  }

  @Mutation(() => ConnectedAccountPublicDTO)
  @UseGuards(
    AccessPolicyGuard(CONNECTED_ACCOUNT_ACCESS_POLICY),
    CustomPermissionGuard,
  )
  async deleteConnectedAccount(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ConnectedAccountPublicDTO> {
    await this.connectedAccountMetadataService.verifyAdministrableByCaller({
      id,
      userWorkspaceId,
      workspaceId: workspace.id,
    });

    const deleted = await this.connectedAccountMetadataService.delete({
      id,
      workspaceId: workspace.id,
    });

    return buildPublicConnectedAccount(deleted);
  }

  @Mutation(() => ConnectedAccountPublicDTO)
  @UseGuards(
    AccessPolicyGuard(CONNECTED_ACCOUNT_ACCESS_POLICY),
    CustomPermissionGuard,
  )
  async disconnectConnectedAccount(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ConnectedAccountPublicDTO> {
    await this.connectedAccountMetadataService.verifyAdministrableByCaller({
      id,
      userWorkspaceId,
      workspaceId: workspace.id,
    });

    const disconnected = await this.connectedAccountMetadataService.disconnect({
      id,
      workspaceId: workspace.id,
    });

    return buildPublicConnectedAccount(disconnected);
  }
}
