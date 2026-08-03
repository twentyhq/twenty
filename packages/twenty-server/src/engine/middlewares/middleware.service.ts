import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type Request, type Response } from 'express';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { getAuthExceptionRestStatus } from 'src/engine/core-modules/auth/utils/get-auth-exception-rest-status.util';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { INTERNAL_SERVER_ERROR } from 'src/engine/middlewares/constants/default-error-message.constant';
import { bindDataToRequestObject } from 'src/engine/utils/bind-data-to-request-object.util';
import {
  handleException,
  handleExceptionAndConvertToGraphQLError,
} from 'src/engine/utils/global-exception-handler.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { type CustomException } from 'src/utils/custom-exception';

// Codes meaning the credential itself is no longer usable: the browser holds
// a cookie it can never authenticate with again.
const DEAD_SESSION_COOKIE_EXCEPTION_CODES = new Set<string>([
  AuthExceptionCode.UNAUTHENTICATED,
  AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
  AuthExceptionCode.FORBIDDEN_EXCEPTION,
  AuthExceptionCode.USER_NOT_FOUND,
  AuthExceptionCode.WORKSPACE_NOT_FOUND,
]);

@Injectable()
export class MiddlewareService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly workspaceStorageCacheService: WorkspaceCacheStorageService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly userSessionCookieService: UserSessionCookieService,
  ) {}

  public isTokenPresent(request: Request): boolean {
    const token = this.jwtWrapperService.extractJwtFromRequest()(request);

    if (token) {
      return true;
    }

    return isDefined(
      this.userSessionCookieService.extractSessionTokenFromRequest(request),
    );
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  public writeRestResponseOnExceptionCaught(res: Response, error: any) {
    const statusCode = this.getStatus(error);

    // capture and handle custom exceptions
    handleException({
      exception: error as CustomException,
      exceptionHandlerService: this.exceptionHandlerService,
      statusCode,
    });

    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.write(
      JSON.stringify({
        statusCode,
        messages: [error?.message || INTERNAL_SERVER_ERROR],
        error: error?.code || ErrorCode.INTERNAL_SERVER_ERROR,
      }),
    );

    res.end();
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  public writeGraphqlResponseOnExceptionCaught(res: Response, error: any) {
    let errors;

    if (error instanceof AuthException) {
      try {
        const authFilter = new AuthGraphqlApiExceptionFilter();

        authFilter.catch(error);
      } catch (transformedError) {
        errors = [transformedError];
      }
    } else {
      errors = [
        handleExceptionAndConvertToGraphQLError(
          error as Error,
          this.exceptionHandlerService,
        ),
      ];
    }

    const statusCode = 200;

    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
    });

    res.write(
      JSON.stringify({
        errors,
      }),
    );

    res.end();
  }

  public async hydrateRestRequest(request: Request) {
    const data = await this.accessTokenService.validateTokenByRequest(request);
    const metadataVersion = data.workspace
      ? await this.getOrSeedMetadataVersion(data.workspace)
      : undefined;

    if (!data.workspace) {
      throw new Error('No data sources found');
    }

    if (!isNonEmptyString(data.workspace.databaseSchema)) {
      throw new Error('No data sources found');
    }

    bindDataToRequestObject(data, request, metadataVersion);
  }

  // The browser cannot drop an httpOnly cookie itself, so failing every request
  // would also block the sign-in that would replace it.
  private clearDeadSessionCookieOrThrow(request: Request, error: unknown) {
    const isCookieAuthenticated = !isNonEmptyString(
      this.jwtWrapperService.extractJwtFromRequest()(request),
    );

    // Any credential the pipeline refuses is dead to the browser: a user
    // removed from the workspace fails with USER_WORKSPACE_NOT_FOUND, not
    // UNAUTHENTICATED, and would be locked out of signing in on that host.
    const isDeadCredential =
      error instanceof AuthException &&
      DEAD_SESSION_COOKIE_EXCEPTION_CODES.has(error.code);

    if (!isCookieAuthenticated || !isDeadCredential) {
      throw error;
    }

    if (isDefined(request.res)) {
      this.userSessionCookieService.clearSessionCookie(request.res);
    }
  }

  public async hydrateGraphqlRequest(request: Request) {
    if (!this.isTokenPresent(request)) {
      request.locale =
        (request.headers['x-locale'] as keyof typeof APP_LOCALES) ??
        SOURCE_LOCALE;

      return;
    }

    let data;

    try {
      data = await this.accessTokenService.validateTokenByRequest(request);
    } catch (error) {
      this.clearDeadSessionCookieOrThrow(request, error);

      request.locale =
        (request.headers['x-locale'] as keyof typeof APP_LOCALES) ??
        SOURCE_LOCALE;

      return;
    }

    const metadataVersion = data.workspace
      ? await this.getOrSeedMetadataVersion(data.workspace)
      : undefined;

    bindDataToRequestObject(data, request, metadataVersion);
  }

  private async getOrSeedMetadataVersion(
    workspace: Pick<FlatWorkspace, 'id' | 'metadataVersion'>,
  ): Promise<number | undefined> {
    const cachedMetadataVersion =
      await this.workspaceStorageCacheService.getMetadataVersion(workspace.id);

    if (isDefined(cachedMetadataVersion)) {
      return cachedMetadataVersion;
    }

    if (isDefined(workspace.metadataVersion)) {
      await this.workspaceStorageCacheService.setMetadataVersion(
        workspace.id,
        workspace.metadataVersion,
      );
    }

    return workspace.metadataVersion;
  }

  private hasErrorStatus(error: unknown): error is { status: number } {
    return isDefined((error as { status: number })?.status);
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  private getStatus(error: any): number {
    if (this.hasErrorStatus(error)) {
      return error.status;
    }

    if (error instanceof AuthException) {
      return getAuthExceptionRestStatus(error);
    }

    return 500;
  }
}
