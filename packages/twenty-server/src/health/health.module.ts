import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { HealthController } from 'src/health/health.controller';
import { DBHealthIndicator } from 'src/health/indicators/db.health';
import { EnvVariablesHealthIndicator } from 'src/health/indicators/env-variables.health';
import { FrontendHealthIndicator } from 'src/health/indicators/frontend.health';

@Module({
  imports: [TerminusModule, TypeORMModule],
  controllers: [HealthController],
  providers: [
    FrontendHealthIndicator,
    DBHealthIndicator,
    FrontendHealthIndicator,
    EnvVariablesHealthIndicator,
  ],
})
export class HealthModule {}
