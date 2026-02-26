import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { IngestionPipelineWebhookController } from 'src/engine/metadata-modules/ingestion-pipeline/controllers/ingestion-pipeline-webhook.controller';
import { IngestionFieldMappingEntity } from 'src/engine/metadata-modules/ingestion-pipeline/entities/ingestion-field-mapping.entity';
import { IngestionLogEntity } from 'src/engine/metadata-modules/ingestion-pipeline/entities/ingestion-log.entity';
import { IngestionPipelineEntity } from 'src/engine/metadata-modules/ingestion-pipeline/entities/ingestion-pipeline.entity';
import { IngestionPipelineGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ingestion-pipeline/interceptors/ingestion-pipeline-graphql-api-exception.interceptor';
import { IngestionFieldMappingResolver } from 'src/engine/metadata-modules/ingestion-pipeline/resolvers/ingestion-field-mapping.resolver';
import { IngestionLogResolver } from 'src/engine/metadata-modules/ingestion-pipeline/resolvers/ingestion-log.resolver';
import { IngestionPipelineResolver } from 'src/engine/metadata-modules/ingestion-pipeline/resolvers/ingestion-pipeline.resolver';
import { IngestionFieldMappingService } from 'src/engine/metadata-modules/ingestion-pipeline/services/ingestion-field-mapping.service';
import { IngestionLogService } from 'src/engine/metadata-modules/ingestion-pipeline/services/ingestion-log.service';
import { IngestionPipelineService } from 'src/engine/metadata-modules/ingestion-pipeline/services/ingestion-pipeline.service';
import { IngestionPullSchedulerService } from 'src/engine/metadata-modules/ingestion-pipeline/services/ingestion-pull-scheduler.service';
import { IngestionRecordProcessorService } from 'src/engine/metadata-modules/ingestion-pipeline/services/ingestion-record-processor.service';
import { IngestionRelationResolverService } from 'src/engine/metadata-modules/ingestion-pipeline/services/ingestion-relation-resolver.service';
import { ConvosoCallPreprocessor } from 'src/engine/metadata-modules/ingestion-pipeline/preprocessors/convoso-call.preprocessor';
import { ConvosoLeadPreprocessor } from 'src/engine/metadata-modules/ingestion-pipeline/preprocessors/convoso-lead.preprocessor';
import { HealthSherpaPolicyPreprocessor } from 'src/engine/metadata-modules/ingestion-pipeline/preprocessors/healthsherpa-policy.preprocessor';
import { IngestionPreprocessorRegistry } from 'src/engine/metadata-modules/ingestion-pipeline/preprocessors/ingestion-preprocessor.registry';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IngestionPipelineEntity,
      IngestionFieldMappingEntity,
      IngestionLogEntity,
    ]),
    AuthModule,
    ThrottlerModule,
    PermissionsModule,
  ],
  controllers: [IngestionPipelineWebhookController],
  providers: [
    IngestionPipelineService,
    IngestionFieldMappingService,
    IngestionLogService,
    IngestionRecordProcessorService,
    IngestionRelationResolverService,
    IngestionPullSchedulerService,
    IngestionPipelineResolver,
    IngestionFieldMappingResolver,
    IngestionLogResolver,
    IngestionPipelineGraphqlApiExceptionInterceptor,
    HealthSherpaPolicyPreprocessor,
    ConvosoCallPreprocessor,
    ConvosoLeadPreprocessor,
    IngestionPreprocessorRegistry,
  ],
  exports: [
    IngestionPipelineService,
    IngestionFieldMappingService,
    IngestionLogService,
    IngestionPullSchedulerService,
  ],
})
export class IngestionPipelineModule {}
