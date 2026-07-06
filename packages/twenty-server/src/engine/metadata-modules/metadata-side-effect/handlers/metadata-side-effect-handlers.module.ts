import { Module } from '@nestjs/common';

import { FieldUniqueBackingIndexOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-unique-backing-index-on-create-side-effect-handler.service';
import { FieldUniqueBackingIndexOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-unique-backing-index-on-delete-side-effect-handler.service';
import { FieldUniqueBackingIndexOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-unique-backing-index-on-update-side-effect-handler.service';
import { ObjectSearchFieldMetadataOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-search-field-metadata-on-create-side-effect-handler.service';
import { ObjectSystemFieldsOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-fields-on-create-side-effect-handler.service';
import { ObjectSystemSideEffectsOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-side-effects-on-delete-side-effect-handler.service';
import { ObjectTsVectorGinIndexOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-ts-vector-gin-index-on-create-side-effect-handler.service';

@Module({
  providers: [
    FieldUniqueBackingIndexOnCreateSideEffectHandlerService,
    FieldUniqueBackingIndexOnUpdateSideEffectHandlerService,
    FieldUniqueBackingIndexOnDeleteSideEffectHandlerService,
    ObjectSystemFieldsOnCreateSideEffectHandlerService,
    ObjectTsVectorGinIndexOnCreateSideEffectHandlerService,
    ObjectSearchFieldMetadataOnCreateSideEffectHandlerService,
    ObjectSystemSideEffectsOnDeleteSideEffectHandlerService,
  ],
})
export class MetadataSideEffectHandlersModule {}
