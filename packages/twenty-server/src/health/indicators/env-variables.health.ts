import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class EnvVariablesHealthIndicator extends HealthIndicator {
  constructor(private environmentService: EnvironmentService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      const secret = await this.environmentService.getAccessTokenSecret();

      return this.getStatus('env-variables', secret !== 'random_secret');
    } catch (e) {
      throw new HealthCheckError('Env variable check check failed', e);
    }
  }
}
