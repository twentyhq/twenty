import { ConfigService } from '@nestjs/config';

export function loginProviders(configService: ConfigService): Array<string> {
  const clientId = configService.get<string>('AUTH_GOOGLE_CLIENT_ID');
  const clientSecret = configService.get<string>('AUTH_GOOGLE_CLIENT_SECRET');
  const callbackUrl = configService.get<string>('AUTH_GOOGLE_CALLBACK_URL');

  if (!!(clientId && clientSecret && callbackUrl)) {
    return ['google'];
  }
  return [];
}
