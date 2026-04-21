import { Module } from '@nestjs/common';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { SeedCrmObjectsCommand } from 'src/modules/crm-acceleration/commands/seed-crm-objects.command';
import { CrmAccelerationController } from 'src/modules/crm-acceleration/controllers/crm-acceleration.controller';
import { CrmAccelerationPersistenceService } from 'src/modules/crm-acceleration/services/crm-acceleration-persistence.service';
import { CrmObjectsSeederService } from 'src/modules/crm-acceleration/services/crm-objects-seeder.service';
import { CustomerSuccessService } from 'src/modules/crm-acceleration/services/customer-success.service';
import { DataQualityCommandCenterService } from 'src/modules/crm-acceleration/services/data-quality-command-center.service';
import { EngagementAutomationService } from 'src/modules/crm-acceleration/services/engagement-automation.service';
import { ExecutiveScorecardService } from 'src/modules/crm-acceleration/services/executive-scorecard.service';
import { FeatureRegistryService } from 'src/modules/crm-acceleration/services/feature-registry.service';
import { FieldRbacService } from 'src/modules/crm-acceleration/services/field-rbac.service';
import { McpExtensionPointsService } from 'src/modules/crm-acceleration/services/mcp-extension-points.service';
import { PipelineExecutionService } from 'src/modules/crm-acceleration/services/pipeline-execution.service';
import { SalesExecutionService } from 'src/modules/crm-acceleration/services/sales-execution.service';
import { CrmExecutionDataAccessService } from 'src/modules/crm-acceleration/services/crm-execution-data-access.service';
import { GamificationModule } from 'src/modules/gamification/gamification.module';
import { LeadScoringModule } from 'src/modules/lead-scoring/lead-scoring.module';

@Module({
  imports: [
    KeyValuePairModule,
    AuthModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    DataSourceModule,
    WorkspaceCacheStorageModule,
    LeadScoringModule,
    GamificationModule,
  ],
  controllers: [CrmAccelerationController],
  providers: [
    FeatureRegistryService,
    CrmAccelerationPersistenceService,
    PipelineExecutionService,
    ExecutiveScorecardService,
    CustomerSuccessService,
    EngagementAutomationService,
    DataQualityCommandCenterService,
    FieldRbacService,
    McpExtensionPointsService,
    SalesExecutionService,
    CrmExecutionDataAccessService,
    CrmObjectsSeederService,
    SeedCrmObjectsCommand,
  ],
  exports: [FeatureRegistryService, CrmObjectsSeederService],
})
export class CrmAccelerationModule {}
