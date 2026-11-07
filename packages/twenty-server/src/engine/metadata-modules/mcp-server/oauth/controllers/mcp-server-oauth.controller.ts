import { Controller, Get, Logger, Query, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type Response } from 'express';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isSafeInternalPath,
} from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { parseRelativeUrl } from 'src/engine/core-modules/domain/domain-server-config/utils/parse-relative-url.util';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { type ConnectedAccountScope } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { MCP_SERVER_OAUTH_PATH } from 'src/engine/metadata-modules/mcp-server/oauth/constants/mcp-server-oauth-path.constant';
import { McpServerOAuthFlowService } from 'src/engine/metadata-modules/mcp-server/oauth/services/mcp-server-oauth-flow.service';
import { buildMcpServerOAuthClientMetadata } from 'src/engine/metadata-modules/mcp-server/oauth/utils/build-mcp-server-oauth-client-metadata.util';
import { buildMcpServerOAuthClientMetadataUrl } from 'src/engine/metadata-modules/mcp-server/oauth/utils/build-mcp-server-oauth-urls.util';

const CLIENT_METADATA_CACHE_CONTROL = 'public, max-age=3600';

type RedirectTarget = {
  workspaceId: string | null;
  redirectLocation: string | null;
  mcpServerId: string | null;
};

@Controller(MCP_SERVER_OAUTH_PATH)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class McpServerOAuthController {
  private readonly logger = new Logger(McpServerOAuthController.name);

  constructor(
    private readonly mcpServerOAuthFlowService: McpServerOAuthFlowService,
    private readonly transientTokenService: TransientTokenService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly i18nService: I18nService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  // Authorization servers that support Client ID Metadata Documents read Twenty's identity here.
  @Get('client-metadata.json')
  clientMetadata(@Res() res: Response) {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    res.set('Cache-Control', CLIENT_METADATA_CACHE_CONTROL);

    return res.json({
      client_id: buildMcpServerOAuthClientMetadataUrl(serverUrl),
      ...buildMcpServerOAuthClientMetadata(serverUrl),
    });
  }

  // Public: the transient token carries the workspace and the user
  @Get('authorize')
  async authorize(
    @Query('mcpServerId') mcpServerId: string | undefined,
    @Query('transientToken') transientToken: string | undefined,
    @Query('accountScope') accountScope: string | undefined,
    @Query('redirectLocation') redirectLocation: string | undefined,
    @Res() res: Response,
  ) {
    const redirectTarget: RedirectTarget = {
      workspaceId: null,
      redirectLocation: redirectLocation ?? null,
      mcpServerId: mcpServerId ?? null,
    };

    try {
      if (!isNonEmptyString(mcpServerId) || !isNonEmptyString(transientToken)) {
        throw new McpServerException(
          'Missing required query parameters: mcpServerId, transientToken',
          McpServerExceptionCode.INVALID_MCP_SERVER_INPUT,
        );
      }

      const { userId, workspaceId } =
        await this.transientTokenService.verifyTransientToken(transientToken);

      redirectTarget.workspaceId = workspaceId;

      const isMcpServersEnabled =
        await this.featureFlagService.isFeatureEnabled(
          FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
          workspaceId,
        );

      const userWorkspace = await this.userWorkspaceRepository.findOneBy({
        userId,
        workspaceId,
      });

      if (!isMcpServersEnabled || !isDefined(userWorkspace)) {
        throw new McpServerException(
          `MCP server sign-in is not available to user ${userId} in workspace ${workspaceId}`,
          McpServerExceptionCode.MCP_SERVER_SIGN_IN_NOT_AVAILABLE,
        );
      }

      const { authorizationUrl } =
        await this.mcpServerOAuthFlowService.startAuthorization({
          mcpServerId,
          workspaceId,
          userId,
          userWorkspaceId: userWorkspace.id,
          scope: this.parseAccountScope(accountScope),
          redirectLocation: redirectLocation ?? null,
        });

      return res.redirect(authorizationUrl);
    } catch (error) {
      return this.redirectToError({ res, error, redirectTarget });
    }
  }

  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') errorCode: string | undefined,
    @Query('error_description') errorDescription: string | undefined,
    @Res() res: Response,
  ) {
    const session = isNonEmptyString(state)
      ? await this.mcpServerOAuthFlowService.consumeSession(state)
      : null;

    const redirectTarget: RedirectTarget = {
      workspaceId: session?.workspaceId ?? null,
      redirectLocation: session?.redirectLocation ?? null,
      mcpServerId: session?.mcpServerId ?? null,
    };

    try {
      if (isNonEmptyString(errorCode)) {
        throw new McpServerException(
          `MCP server authorization returned ${errorCode}: ${errorDescription ?? ''}`,
          McpServerExceptionCode.MCP_SERVER_SIGN_IN_FAILED,
          errorCode === 'access_denied'
            ? {
                userFriendlyMessage: msg`The sign-in to the MCP server was cancelled.`,
              }
            : {},
        );
      }

      if (!isDefined(session) || !isNonEmptyString(state)) {
        throw new McpServerException(
          'MCP server sign-in session expired or unknown',
          McpServerExceptionCode.MCP_SERVER_SIGN_IN_FAILED,
          { userFriendlyMessage: msg`The sign-in expired. Please try again.` },
        );
      }

      if (!isNonEmptyString(code)) {
        throw new McpServerException(
          'MCP server authorization callback has no code',
          McpServerExceptionCode.MCP_SERVER_SIGN_IN_FAILED,
        );
      }

      await this.mcpServerOAuthFlowService.completeAuthorization({
        session,
        state,
        code,
      });

      const workspace = await this.workspaceRepository.findOneByOrFail({
        id: session.workspaceId,
      });

      return res.redirect(
        this.workspaceDomainsService
          .buildWorkspaceURL({
            workspace,
            ...this.parseRedirectLocation(redirectTarget),
          })
          .toString(),
      );
    } catch (error) {
      return this.redirectToError({ res, error, redirectTarget });
    }
  }

  private async redirectToError({
    res,
    error,
    redirectTarget,
  }: {
    res: Response;
    error: unknown;
    redirectTarget: RedirectTarget;
  }) {
    this.logger.warn(
      `MCP server sign-in failed: ${error instanceof Error ? error.message : String(error)}`,
    );

    const workspace = isDefined(redirectTarget.workspaceId)
      ? await this.workspaceRepository.findOneBy({
          id: redirectTarget.workspaceId,
        })
      : null;

    const errorMessage =
      error instanceof McpServerException
        ? this.i18nService
            .getI18nInstance(SOURCE_LOCALE)
            ._(error.userFriendlyMessage)
        : this.i18nService
            .getI18nInstance(SOURCE_LOCALE)
            ._(msg`Signing in to the MCP server failed. Please try again.`);

    return res.redirect(
      this.workspaceDomainsService.computeWorkspaceRedirectErrorUrl({
        errorMessage,
        workspace: {
          subdomain:
            workspace?.subdomain ??
            this.twentyConfigService.get('DEFAULT_SUBDOMAIN'),
          customDomain: workspace?.customDomain ?? null,
          isCustomDomainEnabled: workspace?.isCustomDomainEnabled ?? false,
        },
        ...this.parseRedirectLocation(redirectTarget),
      }),
    );
  }

  private parseRedirectLocation({
    redirectLocation,
    mcpServerId,
  }: RedirectTarget) {
    if (isDefined(redirectLocation) && isSafeInternalPath(redirectLocation)) {
      return parseRelativeUrl(redirectLocation);
    }

    return parseRelativeUrl(
      isDefined(mcpServerId)
        ? getSettingsPath(SettingsPath.AiMcpServerDetail, { mcpServerId })
        : getSettingsPath(SettingsPath.AI),
    );
  }

  private parseAccountScope(
    accountScope: string | undefined,
  ): ConnectedAccountScope {
    return accountScope === 'WORKSPACE' ? 'WORKSPACE' : 'USER';
  }
}
