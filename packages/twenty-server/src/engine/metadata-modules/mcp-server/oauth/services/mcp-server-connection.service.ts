import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { buildConnectedAccountUsableByCallerWhere } from 'src/engine/metadata-modules/connected-account/utils/build-connected-account-usable-by-caller-where.util';
import { type McpServerConnectionDTO } from 'src/engine/metadata-modules/mcp-server/dtos/mcp-server-connection.dto';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { McpServerOAuthClientService } from 'src/engine/metadata-modules/mcp-server/oauth/services/mcp-server-oauth-client.service';

@Injectable()
export class McpServerConnectionService {
  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly appConnectionAccessService: AppConnectionAccessService,
    private readonly mcpServerOAuthClientService: McpServerOAuthClientService,
  ) {}

  async findConnectionsVisibleToCaller({
    mcpServerId,
    workspaceId,
    userWorkspaceId,
  }: {
    mcpServerId: string;
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<McpServerConnectionDTO[]> {
    const connectedAccounts = await this.connectedAccountRepository.find({
      where: buildConnectedAccountUsableByCallerWhere({
        baseWhere: { workspaceId, mcpServerId, archivedAt: IsNull() },
        userWorkspaceId,
      }),
      order: { createdAt: 'ASC' },
    });

    return connectedAccounts.map((connectedAccount) =>
      this.toDto({ connectedAccount, userWorkspaceId }),
    );
  }

  async deleteConnection({
    id,
    workspaceId,
    userWorkspaceId,
  }: {
    id: string;
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<McpServerConnectionDTO> {
    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: buildConnectedAccountUsableByCallerWhere({
        baseWhere: { id, workspaceId, provider: ConnectedAccountProvider.MCP },
        userWorkspaceId,
      }),
    });

    if (!isDefined(connectedAccount)) {
      throw new McpServerException(
        `MCP server connection ${id} not found`,
        McpServerExceptionCode.MCP_SERVER_CONNECTION_NOT_FOUND,
      );
    }

    if (connectedAccount.scope === 'WORKSPACE') {
      await this.appConnectionAccessService.validateCallerCanManageConnection({
        isWorkspaceShared: true,
        workspaceId,
        userWorkspaceId,
      });
    }

    await this.connectedAccountRepository.delete({ id, workspaceId });

    return this.toDto({ connectedAccount, userWorkspaceId });
  }

  // Tokens minted for one resource must never reach another URL.
  async forgetSignIns({
    mcpServerId,
    workspaceId,
  }: {
    mcpServerId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.connectedAccountRepository.delete({ workspaceId, mcpServerId });
    await this.mcpServerOAuthClientService.deleteClient({
      mcpServerId,
      workspaceId,
    });
  }

  private toDto({
    connectedAccount,
    userWorkspaceId,
  }: {
    connectedAccount: ConnectedAccountEntity;
    userWorkspaceId: string;
  }): McpServerConnectionDTO {
    return {
      id: connectedAccount.id,
      handle: connectedAccount.handle,
      scope: connectedAccount.scope,
      isOwnedByCurrentUser:
        connectedAccount.userWorkspaceId === userWorkspaceId,
      authFailedAt: connectedAccount.authFailedAt,
      createdAt: connectedAccount.createdAt,
    };
  }
}
