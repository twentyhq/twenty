import { Resolver, Query } from '@nestjs/graphql';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { ClientConfig } from './client-config.entity';

@Resolver()
export class ClientConfigResolver {
  constructor(private environmentService: EnvironmentService) {}

  @Query(() => ClientConfig)
  async clientConfig(): Promise<ClientConfig> {
    const clientConfig: ClientConfig = {
      authProviders: {
        google: this.environmentService.isAuthGoogleEnabled() ?? false,
        magicLink: false,
        password: true,
      },
      telemetry: {
        enabled: this.environmentService.isTelemetryEnabled() ?? false,
        anonymizationEnabled:
          this.environmentService.isTelemetryAnonymizationEnabled() ?? false,
      },
      demoMode: this.environmentService.isDemoMode() ?? false,
      debugMode: this.environmentService.isDebugMode() ?? false,
    };

    return Promise.resolve(clientConfig);
  }
}
