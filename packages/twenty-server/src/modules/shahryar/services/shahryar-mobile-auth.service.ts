import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthTokens } from 'src/engine/core-modules/auth/dto/auth-tokens.dto';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { toWorkspaceTableName } from 'src/modules/shahryar/utils/to-workspace-table-name.util';
import { type DataSource } from 'typeorm';

type ShahryarUsernameLookupRow = {
  userEmail?: string | null;
};

@Injectable()
export class ShahryarMobileAuthService {
  constructor(
    private readonly authService: AuthService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async signInWithUsername({
    origin,
    password,
    username,
  }: {
    origin: string;
    password: string;
    username: string;
  }): Promise<AuthTokens> {
    const workspace =
      await this.workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    assertIsDefinedOrThrow(
      workspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    const email = await this.getEmailFromUsername({
      username,
      workspace,
    });
    const user = await this.authService.validateLoginWithPassword(
      {
        email,
        password,
      },
      workspace,
    );

    return await this.authService.verify(
      user.email,
      workspace.id,
      AuthProviderEnum.Password,
    );
  }

  private async getEmailFromUsername({
    username,
    workspace,
  }: {
    username: string;
    workspace: WorkspaceEntity;
  }): Promise<string> {
    const normalizedUsername = username.trim();

    if (!isNonEmptyString(normalizedUsername)) {
      throw new AuthException(
        'Username is required',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const rows = (await this.coreDataSource.query(
      `SELECT "userEmail"
       FROM ${toWorkspaceTableName({
         tableName: 'workspaceMember',
         workspaceId: workspace.id,
       })}
       WHERE LOWER("username") = LOWER($1)
       LIMIT 2`,
      [normalizedUsername],
    )) as ShahryarUsernameLookupRow[];

    if (rows.length === 0) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.USER_NOT_FOUND,
      );
    }

    if (rows.length > 1) {
      throw new AuthException(
        'Username is not unique',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const userEmail = rows[0]?.userEmail;

    if (!isNonEmptyString(userEmail)) {
      throw new AuthException(
        'Workspace member is missing an email',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    return userEmail;
  }
}
