import { Injectable } from '@nestjs/common';

import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class CommonMiddlewareOperationsService {
  constructor() {}

  public excludedOperations = [
    'GetClientConfig',
    'GetCurrentUser',
    'GetWorkspaceFromInviteHash',
    'Track',
    'CheckUserExists',
    'Challenge',
    'Verify',
    'GetLoginTokenFromEmailVerificationToken',
    'ResendEmailVerificationToken',
    'SignUp',
    'RenewToken',
    'EmailPasswordResetLink',
    'ValidatePasswordResetToken',
    'UpdatePasswordViaResetToken',
    'IntrospectionQuery',
    'ExchangeAuthorizationCode',
    'GetAuthorizationUrl',
    'GetPublicWorkspaceDataBySubdomain',
  ];

  public isTokenPresent(request: Request): boolean {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    return !!token;
  }

  public writeResponseOnExceptionCaught(
    res: Response,
    source: 'rest' | 'graphql',
    error: any,
    errors: any[],
  ) {
    res.writeHead(
      source === 'graphql'
        ? 200
        : error instanceof Error
          ? 500
          : error.status || 500,
      { 'Content-Type': 'application/json' },
    );
    res.write(
      JSON.stringify({
        errors,
      }),
    );
    res.end();
  }
}
