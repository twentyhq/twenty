import { Module } from '@nestjs/common';

import { FieldMetadataCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-metadata-create-side-effect-handler.service';
import { FieldMetadataDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-metadata-delete-side-effect-handler.service';
import { FieldMetadataUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-metadata-update-side-effect-handler.service';

@Module({
  providers: [
    FieldMetadataCreateSideEffectHandlerService,
    FieldMetadataUpdateSideEffectHandlerService,
    FieldMetadataDeleteSideEffectHandlerService,
  ],
})
export class MetadataSideEffectHandlersModule {}
