import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Parent, Query, ResolveField } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountPublicDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account-public.dto';
import { ConnectedAccountGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/connected-account/interceptors/connected-account-graphql-api-exception.interceptor';
import { buildPublicConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/build-public-connected-account.util';
import { MessageChannelDTO } from 'src/engine/metadata-modules/message-channel/dtos/message-channel.dto';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@UseInterceptors(ConnectedAccountGraphqlApiExceptionInterceptor)
@MetadataResolver(() => ConnectedAccountPublicDTO)
export class AppConnectedAccountsResolver {
  constructor(
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
  ) {}

  @Query(() => [ConnectedAccountPublicDTO])
  async appConnectedAccounts(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
  ): Promise<ConnectedAccountPublicDTO[]> {
    const accounts =
      await this.connectedAccountMetadataService.findByApplicationId({
        applicationId: application.id,
        workspaceId: workspace.id,
      });

    return accounts.map((account) => buildPublicConnectedAccount(account));
  }

  @ResolveField('messageChannels', () => [MessageChannelDTO])
  async messageChannels(
    @Parent() connectedAccount: ConnectedAccountPublicDTO,
    @AuthWorkspace() workspace: FlatWorkspace,
  ): Promise<MessageChannelDTO[]> {
    return this.messageChannelRepository.find({
      where: {
        connectedAccountId: connectedAccount.id,
        workspaceId: workspace.id,
      },
    });
  }
}
