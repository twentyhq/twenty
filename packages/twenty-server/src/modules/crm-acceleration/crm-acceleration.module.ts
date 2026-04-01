import { Module } from '@nestjs/common';

import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { CrmAccelerationController } from 'src/modules/crm-acceleration/controllers/crm-acceleration.controller';
import { CrmAccelerationPersistenceService } from 'src/modules/crm-acceleration/services/crm-acceleration-persistence.service';
import { CustomerSuccessService } from 'src/modules/crm-acceleration/services/customer-success.service';
import { DataQualityCommandCenterService } from 'src/modules/crm-acceleration/services/data-quality-command-center.service';
import { EngagementAutomationService } from 'src/modules/crm-acceleration/services/engagement-automation.service';
import { ExecutiveScorecardService } from 'src/modules/crm-acceleration/services/executive-scorecard.service';
import { FeatureRegistryService } from 'src/modules/crm-acceleration/services/feature-registry.service';
import { FieldRbacService } from 'src/modules/crm-acceleration/services/field-rbac.service';
import { McpExtensionPointsService } from 'src/modules/crm-acceleration/services/mcp-extension-points.service';
import { PipelineExecutionService } from 'src/modules/crm-acceleration/services/pipeline-execution.service';

@Module({
  imports: [KeyValuePairModule],
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
  ],
  exports: [FeatureRegistryService],
})
export class CrmAccelerationModule {}
