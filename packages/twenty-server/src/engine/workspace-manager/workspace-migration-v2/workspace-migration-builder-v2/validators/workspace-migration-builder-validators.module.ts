import { Module } from '@nestjs/common';

import { FlatViewFieldValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-field-validator.service';
import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-validator.service';

@Module({
  providers: [FlatViewValidatorService, FlatViewFieldValidatorService],
  exports: [FlatViewValidatorService, FlatViewFieldValidatorService],
})
export class WorkspaceMigrationBuilderValidatorsModule {}
