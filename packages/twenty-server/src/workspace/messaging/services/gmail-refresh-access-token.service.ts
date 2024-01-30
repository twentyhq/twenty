import { Injectable } from '@nestjs/common';

import axios from 'axios';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';

@Injectable()
export class GmailRefreshAccessTokenService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async refreshAndSaveAccessToken(
    workspaceId: string,
    connectedAccountId: string,
  ): Promise<void> {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    if (!workspaceDataSource) {
      throw new Error('No workspace data source found');
    }

    const connectedAccounts = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."connectedAccount" WHERE "provider" = 'google' AND "id" = $1`,
      [connectedAccountId],
    );

    if (!connectedAccounts || connectedAccounts.length === 0) {
      throw new Error('No connected account found');
    }

    const refreshToken = connectedAccounts[0]?.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const accessToken = await this.refreshAccessToken(refreshToken);

    await workspaceDataSource?.query(
      `UPDATE ${dataSourceMetadata.schema}."connectedAccount" SET "accessToken" = $1 WHERE "id" = $2`,
      [accessToken, connectedAccounts[0].id],
    );
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: this.environmentService.getAuthGoogleClientId(),
        client_secret: this.environmentService.getAuthGoogleClientSecret(),
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.access_token;
  }
}
