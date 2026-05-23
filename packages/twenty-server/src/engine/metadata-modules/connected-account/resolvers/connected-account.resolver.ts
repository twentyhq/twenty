import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountPublicDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account-public.dto';
import { ConnectedAccountDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account.dto';
import { UpdateConnectedAccountSignatureInput } from 'src/engine/metadata-modules/connected-account/dtos/update-connected-account-signature.input';
import { ConnectedAccountGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/connected-account/interceptors/connected-account-graphql-api-exception.interceptor';
import { buildPublicConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/build-public-connected-account.util';

@UseGuards(WorkspaceAuthGuard)
@UseInterceptors(ConnectedAccountGraphqlApiExceptionInterceptor)
@MetadataResolver(() => ConnectedAccountDTO)
export class ConnectedAccountResolver {
  constructor(
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  @Query(() => [ConnectedAccountPublicDTO])
  @UseGuards(NoPermissionGuard)
  async myConnectedAccounts(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ConnectedAccountPublicDTO[]> {
    const accounts =
      await this.connectedAccountMetadataService.findByUserWorkspaceId({
        userWorkspaceId,
        workspaceId: workspace.id,
      });

    return accounts.map((account) => buildPublicConnectedAccount(account));
  }

  @Mutation(() => ConnectedAccountPublicDTO)
  @UseGuards(NoPermissionGuard)
  async updateConnectedAccountSignature(
    @Args('input') input: UpdateConnectedAccountSignatureInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ConnectedAccountPublicDTO> {
    await this.connectedAccountMetadataService.verifyOwnership({
      id: input.id,
      userWorkspaceId,
      workspaceId: workspace.id,
    });

    const updated =
      await this.connectedAccountMetadataService.updateEmailSignature({
        id: input.id,
        workspaceId: workspace.id,
        emailSignature: input.emailSignature,
      });

    return buildPublicConnectedAccount(updated);
  }

  @Mutation(() => ConnectedAccountPublicDTO)
  @UseGuards(NoPermissionGuard)
  async deleteConnectedAccount(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ConnectedAccountPublicDTO> {
    await this.connectedAccountMetadataService.verifyOwnership({
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
}
