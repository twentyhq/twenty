// module/charge/charge.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ChargeEmmitRecurrentBillsCronCommand } from 'src/modules/charges/cron/command/charge-emmit-bills.cron.command';
import { ChargeEmmitMonthlyBillCronJob } from 'src/modules/charges/cron/jobs/charge-emmit-monthly-bill.cron.job';
import { ChargeEmmitYearlyBillCronJob } from 'src/modules/charges/cron/jobs/charge-emmit-yearly-bill.cron.job';
import { ChageEmmitBillJob } from 'src/modules/charges/jobs/charge-emmit-bill.job';
import { ChargeService } from 'src/modules/charges/services/charge.service';

import { ChargeEventListener } from './charge.listener';

import { InterApiService } from './inter/services/inter-api.service';

@Module({
  imports: [
    FileModule,
    FileUploadModule,
    TypeOrmModule.forFeature([InterIntegration, Workspace], 'core'),
  ],
  providers: [
    InterApiService,
    ChargeEventListener,
    ChargeService,
    ChageEmmitBillJob,
    ChargeEmmitMonthlyBillCronJob,
    ChargeEmmitYearlyBillCronJob,
    ChargeEmmitRecurrentBillsCronCommand,
  ],
  exports: [InterApiService, ChargeEmmitRecurrentBillsCronCommand],
})
export class ChargeModule {}
