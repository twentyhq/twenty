import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { PrismaModule } from 'src/database/prisma.module';
import { HealthController } from 'src/health/health.controller';
import { PrismaHealthIndicator } from 'src/health/indicators/prisma-health-indicator';

@Module({
  imports: [TerminusModule, PrismaModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {}
