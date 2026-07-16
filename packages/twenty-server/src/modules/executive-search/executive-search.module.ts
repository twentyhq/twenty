import { Module } from '@nestjs/common';

import { IdempotencyKeyService } from 'src/modules/executive-search/sync/services/idempotency-key.service';
import { SyncEventValidationService } from 'src/modules/executive-search/sync/services/sync-event-validation.service';
import { SyncGateService } from 'src/modules/executive-search/sync/services/sync-gate.service';

@Module({
  providers: [
    IdempotencyKeyService,
    SyncEventValidationService,
    SyncGateService,
  ],
  exports: [IdempotencyKeyService, SyncEventValidationService, SyncGateService],
})
export class ExecutiveSearchModule {}
