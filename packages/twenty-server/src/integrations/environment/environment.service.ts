/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Request } from 'express';

import { ExceptionHandlerDriver } from 'src/integrations/exception-handler/interfaces';
import { EnvironmentType } from 'src/integrations/environment/envionment.type';
import { EnvironmentDefault } from 'src/integrations/environment/environment.default';

@Injectable()
export class EnvironmentService {
  constructor(private configService: ConfigService) {}

  get<T extends keyof EnvironmentType>(key: T): EnvironmentType[T] {
    return (
      this.configService.get<EnvironmentType[T]>(key) ?? EnvironmentDefault[key]
    );
  }

  getServerUrl(): string {
    const url = this.configService.get<string>('SERVER_URL')!;

    if (url?.endsWith('/')) {
      return url.substring(0, url.length - 1);
    }

    return url;
  }

  getBaseUrl(request: Request): string {
    return (
      this.getServerUrl() || `${request.protocol}://${request.get('host')}`
    );
  }

  getFrontAuthCallbackUrl(): string {
    return (
      this.configService.get<string>('FRONT_AUTH_CALLBACK_URL') ??
      this.get('FRONT_BASE_URL') + '/verify'
    );
  }

  // TODO: check because it isn't called
  getLoggerIsBufferEnabled(): boolean | undefined {
    return this.configService.get<boolean>('LOGGER_IS_BUFFER_ENABLED') ?? true;
  }

  getExceptionHandlerDriverType(): ExceptionHandlerDriver {
    return (
      this.configService.get<ExceptionHandlerDriver>(
        'EXCEPTION_HANDLER_DRIVER',
      ) ?? ExceptionHandlerDriver.Console
    );
  }
}
