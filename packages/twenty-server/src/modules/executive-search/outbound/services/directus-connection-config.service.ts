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
    const envMap: Record<keyof DirectusConnectionConfig, string | undefined> = {
      baseUrl: process.env.DIRECTUS_BASE_URL,
      email: process.env.DIRECTUS_EMAIL,
      password: process.env.DIRECTUS_PASSWORD,
      hmacSecret: process.env.DIRECTUS_OUTBOUND_HMAC_SECRET,
    };

    for (const [key, value] of Object.entries(envMap)) {
      if (!value) {
        throw new Error(
          `DirectusConnectionConfigService: ${key} env var is not set`,
        );
      }
    }

    return envMap as DirectusConnectionConfig;
  }
}
