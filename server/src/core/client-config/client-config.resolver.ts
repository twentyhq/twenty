import { Resolver, Query, Args } from '@nestjs/graphql';

import crypto from 'crypto';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

import { ClientConfig, ClientConfigInput } from './client-config.entity';

function getHMACKey(email?: string, key?: string | null) {
  if (!email || !key) return null;

  const hmac = crypto.createHmac('sha256', key);
  return hmac.update(email).digest('hex');
}

@Resolver()
export class ClientConfigResolver {
  constructor(private environmentService: EnvironmentService) {}

  @Query(() => ClientConfig)
  async clientConfig(
    @Args() { email }: ClientConfigInput,
  ): Promise<ClientConfig> {
    const key = this.environmentService.getSupportHMACKey();

    const clientConfig: ClientConfig = {
      authProviders: {
        google: this.environmentService.isAuthGoogleEnabled(),
        magicLink: false,
        password: true,
      },
      telemetry: {
        enabled: this.environmentService.isTelemetryEnabled(),
        anonymizationEnabled:
          this.environmentService.isTelemetryAnonymizationEnabled(),
      },
      signInPrefilled: this.environmentService.isSignInPrefilled(),
      debugMode: this.environmentService.isDebugMode(),
      supportChat: {
        supportDriver: this.environmentService.getSupportDriver(),
        supportFrontendKey: this.environmentService.getSupportFrontendKey(),
        supportHMACKey: getHMACKey(email, key),
      },
    };

    return Promise.resolve(clientConfig);
  }
}
