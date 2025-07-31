import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';

import { FlatFieldMetadataTypeValidatorService } from './services/flat-field-metadata-type-validator.service';
import { FlatFieldMetadataValidatorService } from './services/flat-field-metadata-validator.service';

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
