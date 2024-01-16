/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EmailDriver } from 'src/integrations/email/interfaces/email.interface';

import { LoggerDriverType } from 'src/integrations/logger/interfaces';
import { ExceptionHandlerDriver } from 'src/integrations/exception-handler/interfaces';
import { StorageDriverType } from 'src/integrations/file-storage/interfaces';
import { MessageQueueDriverType } from 'src/integrations/message-queue/interfaces';

import { AwsRegion } from './interfaces/aws-region.interface';
import { SupportDriver } from './interfaces/support.interface';

@Injectable()
export class EnvironmentService {
  constructor(private configService: ConfigService) {}

  isDebugMode(): boolean {
    return this.configService.get<boolean>('DEBUG_MODE') ?? false;
  }

  isSignInPrefilled(): boolean {
    return this.configService.get<boolean>('SIGN_IN_PREFILLED') ?? false;
  }

  isBillingEnabled() {
    return this.configService.get<boolean>('IS_BILLING_ENABLED') ?? false;
  }

  getBillingUrl() {
    return this.configService.get<string>('BILLING_PLAN_REQUIRED_LINK') ?? '';
  }

  isTelemetryEnabled(): boolean {
    return this.configService.get<boolean>('TELEMETRY_ENABLED') ?? true;
  }

  isTelemetryAnonymizationEnabled(): boolean {
    return (
      this.configService.get<boolean>('TELEMETRY_ANONYMIZATION_ENABLED') ?? true
    );
  }

  getPort(): number {
    return this.configService.get<number>('PORT') ?? 3000;
  }

  getPGDatabaseUrl(): string {
    return this.configService.get<string>('PG_DATABASE_URL')!;
  }

  getRedisHost(): string {
    return this.configService.get<string>('REDIS_HOST') ?? '127.0.0.1';
  }

  getRedisPort(): number {
    return +(this.configService.get<string>('REDIS_PORT') ?? 6379);
  }

  getFrontBaseUrl(): string {
    return this.configService.get<string>('FRONT_BASE_URL')!;
  }

  getServerUrl(): string {
    return this.configService.get<string>('SERVER_URL')!;
  }

  getAccessTokenSecret(): string {
    return this.configService.get<string>('ACCESS_TOKEN_SECRET')!;
  }

  getAccessTokenExpiresIn(): string {
    return this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN') ?? '30m';
  }

  getRefreshTokenSecret(): string {
    return this.configService.get<string>('REFRESH_TOKEN_SECRET')!;
  }

  getRefreshTokenExpiresIn(): string {
    return this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') ?? '90d';
  }

  getRefreshTokenCoolDown(): string {
    return this.configService.get<string>('REFRESH_TOKEN_COOL_DOWN') ?? '1m';
  }

  getLoginTokenSecret(): string {
    return this.configService.get<string>('LOGIN_TOKEN_SECRET')!;
  }

  getLoginTokenExpiresIn(): string {
    return this.configService.get<string>('LOGIN_TOKEN_EXPIRES_IN') ?? '15m';
  }

  getTransientTokenExpiresIn(): string {
    return (
      this.configService.get<string>('SHORT_TERM_TOKEN_EXPIRES_IN') ?? '5m'
    );
  }

  getApiTokenExpiresIn(): string {
    return this.configService.get<string>('API_TOKEN_EXPIRES_IN') ?? '1000y';
  }

  getFrontAuthCallbackUrl(): string {
    return (
      this.configService.get<string>('FRONT_AUTH_CALLBACK_URL') ??
      this.getFrontBaseUrl() + '/verify'
    );
  }

  isMessagingProviderGmailEnabled(): boolean {
    return (
      this.configService.get<boolean>('MESSAGING_PROVIDER_GMAIL_ENABLED') ??
      false
    );
  }

  getMessagingProviderGmailCallbackUrl(): string | undefined {
    return this.configService.get<string>(
      'MESSAGING_PROVIDER_GMAIL_CALLBACK_URL',
    );
  }

  isAuthGoogleEnabled(): boolean {
    return this.configService.get<boolean>('AUTH_GOOGLE_ENABLED') ?? false;
  }

  getAuthGoogleClientId(): string | undefined {
    return this.configService.get<string>('AUTH_GOOGLE_CLIENT_ID');
  }

  getAuthGoogleClientSecret(): string | undefined {
    return this.configService.get<string>('AUTH_GOOGLE_CLIENT_SECRET');
  }

  getAuthGoogleCallbackUrl(): string | undefined {
    return this.configService.get<string>('AUTH_GOOGLE_CALLBACK_URL');
  }

  getStorageDriverType(): StorageDriverType {
    return (
      this.configService.get<StorageDriverType>('STORAGE_TYPE') ??
      StorageDriverType.Local
    );
  }

  getMessageQueueDriverType(): MessageQueueDriverType {
    return (
      this.configService.get<MessageQueueDriverType>('MESSAGE_QUEUE_TYPE') ??
      MessageQueueDriverType.Sync
    );
  }

  getStorageS3Region(): AwsRegion | undefined {
    return this.configService.get<AwsRegion>('STORAGE_S3_REGION');
  }

  getStorageS3Name(): string | undefined {
    return this.configService.get<string>('STORAGE_S3_NAME');
  }

  getStorageS3Endpoint(): string | undefined {
    return this.configService.get<string>('STORAGE_S3_ENDPOINT');
  }

  getStorageLocalPath(): string {
    return (
      this.configService.get<string>('STORAGE_LOCAL_PATH') ?? '.local-storage'
    );
  }

  getEmailFromAddress(): string {
    return (
      this.configService.get<string>('EMAIL_FROM_ADDRESS') ??
      'noreply@yourdomain.com'
    );
  }

  getEmailSystemAddress(): string {
    return (
      this.configService.get<string>('EMAIL_SYSTEM_ADDRESS') ??
      'system@yourdomain.com'
    );
  }

  getEmailFromName(): string {
    return (
      this.configService.get<string>('EMAIL_FROM_NAME') ??
      'John from YourDomain'
    );
  }

  getEmailDriver(): EmailDriver {
    return (
      this.configService.get<EmailDriver>('EMAIL_DRIVER') ?? EmailDriver.Logger
    );
  }

  getEmailHost(): string | undefined {
    return this.configService.get<string>('EMAIL_SMTP_HOST');
  }

  getEmailPort(): number | undefined {
    return this.configService.get<number>('EMAIL_SMTP_PORT');
  }

  getEmailUser(): string | undefined {
    return this.configService.get<string>('EMAIL_SMTP_USER');
  }

  getEmailPassword(): string | undefined {
    return this.configService.get<string>('EMAIL_SMTP_PASSWORD');
  }

  getSupportDriver(): string {
    return (
      this.configService.get<string>('SUPPORT_DRIVER') ?? SupportDriver.None
    );
  }

  getSupportFrontChatId(): string | undefined {
    return this.configService.get<string>('SUPPORT_FRONT_CHAT_ID');
  }

  getSupportFrontHMACKey(): string | undefined {
    return this.configService.get<string>('SUPPORT_FRONT_HMAC_KEY');
  }

  getLoggerDriverType(): LoggerDriverType {
    return (
      this.configService.get<LoggerDriverType>('LOGGER_DRIVER') ??
      LoggerDriverType.Console
    );
  }

  getExceptionHandlerDriverType(): ExceptionHandlerDriver {
    return (
      this.configService.get<ExceptionHandlerDriver>(
        'EXCEPTION_HANDLER_DRIVER',
      ) ?? ExceptionHandlerDriver.Console
    );
  }

  getLogLevels(): LogLevel[] {
    return (
      this.configService.get<LogLevel[]>('LOG_LEVELS') ?? [
        'log',
        'error',
        'warn',
      ]
    );
  }

  getSentryDSN(): string | undefined {
    return this.configService.get<string | undefined>('SENTRY_DSN');
  }

  getDemoWorkspaceIds(): string[] {
    return this.configService.get<string[]>('DEMO_WORKSPACE_IDS') ?? [];
  }

  getOpenRouterApiKey(): string | undefined {
    return this.configService.get<string | undefined>('OPENROUTER_API_KEY');
  }

  getPasswordResetTokenExpiresIn(): string {
    return (
      this.configService.get<string>('PASSWORD_RESET_TOKEN_EXPIRES_IN') ?? '5m'
    );
  }

  getInactiveDaysBeforeEmail(): number | undefined {
    return this.configService.get<number | undefined>(
      'WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION',
    );
  }

  getInactiveDaysBeforeDelete(): number | undefined {
    return this.configService.get<number | undefined>(
      'WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION',
    );
  }

  isSignUpDisabled(): boolean {
    return this.configService.get<boolean>('IS_SIGN_UP_DISABLED') ?? false;
  }
}
