import { Module } from '@nestjs/common';

import { ObjectMetadataCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-metadata-create-side-effect-handler.service';

@Module({
  providers: [ObjectMetadataCreateSideEffectHandlerService],
})
export class MetadataSideEffectHandlersModule {}
