import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';

import { FlatFieldMetadataValidatorService } from '../../workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-field-metadata-validator.service';
import { FlatFieldMetadataTypeValidatorService } from './services/flat-field-metadata-type-validator.service';

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
