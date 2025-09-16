import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { ProcessVirtualFieldsJob } from './jobs/process-virtual-fields.job';
import { VirtualFieldComputationService } from './services/virtual-field-computation.service';
import { VirtualFieldDiscoveryService } from './services/virtual-field-discovery.service';
import { VirtualFieldEntityResolver } from './services/virtual-field-entity-resolver.service';
import { VirtualFieldPathEvaluator } from './services/virtual-field-path-evaluator.service';
import { VirtualFieldProcessor } from './services/virtual-field-processor.service';
import { VirtualFieldsBatchUpdateService } from './services/virtual-fields-batch-update.service';

@Module({
  imports: [TwentyORMModule, WorkspaceCacheStorageModule],
  providers: [
    VirtualFieldProcessor,
    VirtualFieldDiscoveryService,
    VirtualFieldsBatchUpdateService,
    VirtualFieldPathEvaluator,
    VirtualFieldEntityResolver,
    VirtualFieldComputationService,
    ProcessVirtualFieldsJob,
  ],
  exports: [
    VirtualFieldProcessor,
    VirtualFieldDiscoveryService,
    VirtualFieldsBatchUpdateService,
    VirtualFieldPathEvaluator,
    VirtualFieldEntityResolver,
    VirtualFieldComputationService,
  ],
})
export class VirtualFieldsModule {}
