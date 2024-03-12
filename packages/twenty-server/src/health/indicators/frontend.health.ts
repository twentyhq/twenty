import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class FrontendHealthIndicator extends HealthIndicator {
  constructor(private environmentService: EnvironmentService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const baseUrl = this.environmentService.getFrontBaseUrl();
    const response = await fetch(baseUrl);

    if (response.status === 200) {
      return this.getStatus('frontend', true);
    }

    throw new HealthCheckError('Dogcheck failed', []);
  }
}
