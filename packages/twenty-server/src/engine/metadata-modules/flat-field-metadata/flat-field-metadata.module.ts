import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { FlatFieldMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-field-metadata-validator.service';

@Module({
  imports: [FeatureFlagModule],
  providers: [
    FlatFieldMetadataValidatorService,
    FlatFieldMetadataTypeValidatorService,
  ],
  exports: [
    FlatFieldMetadataValidatorService,
    FlatFieldMetadataTypeValidatorService,
  ],
})
export class FlatFieldMetadataModule {}
