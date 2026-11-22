/* @license Enterprise */

import { Module } from '@nestjs/common';

import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { AccessGroupPropagationGaugeService } from 'src/engine/permissions/internal/metrics/services/access-group-propagation-gauge.service';
import { PermissionsConfigurationGaugeService } from 'src/engine/permissions/internal/metrics/services/permissions-configuration-gauge.service';

@Module({
  imports: [MetricsModule],
  providers: [
    AccessGroupPropagationGaugeService,
    PermissionsConfigurationGaugeService,
  ],
})
export class PermissionsMetricsModule {}
