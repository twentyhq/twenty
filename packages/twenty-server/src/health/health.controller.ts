import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { DBHealthIndicator } from 'src/health/indicators/db.health';
import { EnvVariablesHealthIndicator } from 'src/health/indicators/env-variables.health';
import { FrontendHealthIndicator } from 'src/health/indicators/frontend.health';

@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: DBHealthIndicator,
    private frontend: FrontendHealthIndicator,
    private envVariables: EnvVariablesHealthIndicator,
  ) {}

  @Get('healthz')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.isHealthy(),
      () => this.envVariables.isHealthy(),
      () => this.frontend.isHealthy(),
    ]);
  }
}
