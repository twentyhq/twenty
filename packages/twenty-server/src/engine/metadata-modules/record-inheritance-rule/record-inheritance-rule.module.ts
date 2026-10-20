/* @license Enterprise */

import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RecordInheritanceRuleResolver } from 'src/engine/metadata-modules/record-inheritance-rule/record-inheritance-rule.resolver';
import { RecordInheritanceRuleService } from 'src/engine/metadata-modules/record-inheritance-rule/record-inheritance-rule.service';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ApplicationModule,
    BillingModule,
    PermissionsModule,
    WorkspaceMigrationModule,
  ],
  providers: [RecordInheritanceRuleService, RecordInheritanceRuleResolver],
})
export class RecordInheritanceRuleModule {}
