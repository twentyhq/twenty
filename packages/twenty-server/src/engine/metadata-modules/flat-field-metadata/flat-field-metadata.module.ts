import { Module } from '@nestjs/common';

import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { FlatFieldMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-field-metadata-validator.service';

@Module({
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
