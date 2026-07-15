import { Injectable, Logger } from '@nestjs/common';

export type DirectusConnectionConfig = {
  baseUrl: string;
  email: string;
  password: string;
  hmacSecret: string;
};

@Injectable()
export class DirectusConnectionConfigService {
  private readonly logger = new Logger(DirectusConnectionConfigService.name);

  getConfig(): DirectusConnectionConfig {
    const baseUrl = process.env.DIRECTUS_BASE_URL;
    const email = process.env.DIRECTUS_EMAIL;
    const password = process.env.DIRECTUS_PASSWORD;
    const hmacSecret = process.env.DIRECTUS_OUTBOUND_HMAC_SECRET;

    if (!baseUrl) {
      throw new Error(
        'DirectusConnectionConfigService: DIRECTUS_BASE_URL is not set',
      );
    }
    if (!email) {
      throw new Error(
        'DirectusConnectionConfigService: DIRECTUS_EMAIL is not set',
      );
    }
    if (!password) {
      throw new Error(
        'DirectusConnectionConfigService: DIRECTUS_PASSWORD is not set',
      );
    }
    if (!hmacSecret) {
      throw new Error(
        'DirectusConnectionConfigService: DIRECTUS_OUTBOUND_HMAC_SECRET is not set',
      );
    }

    this.logger.log('Directus config loaded successfully');

    return { baseUrl, email, password, hmacSecret };
  }
}
