import { Module } from '@nestjs/common';

import { FieldSearchFieldMetadataOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-search-field-metadata-on-delete-side-effect-handler.service';
import { FieldIndexViewFieldOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-index-view-field-on-create-side-effect-handler.service';
import { FieldRecordFormWidgetOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-record-form-widget-on-create-side-effect-handler.service';
import { FieldRecordFormWidgetOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-record-form-widget-on-delete-side-effect-handler.service';
import { FieldRecordFormWidgetOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-record-form-widget-on-update-side-effect-handler.service';
import { FieldRecordPageViewFieldOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-record-page-view-field-on-create-side-effect-handler.service';
import { FieldSystemViewFieldsOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-system-view-fields-on-delete-side-effect-handler.service';
import { FieldUniqueBackingIndexOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-unique-backing-index-on-create-side-effect-handler.service';
import { FieldUniqueBackingIndexOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-unique-backing-index-on-delete-side-effect-handler.service';
import { FieldUniqueBackingIndexOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-unique-backing-index-on-update-side-effect-handler.service';
import { ObjectIndexViewLabelIdentifierOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-index-view-label-identifier-on-update-side-effect-handler.service';
import { ObjectIndexViewOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-index-view-on-create-side-effect-handler.service';
import { ObjectNavigationCommandOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-navigation-command-on-create-side-effect-handler.service';
import { ObjectNavigationCommandOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-navigation-command-on-update-side-effect-handler.service';
import { ObjectRecordPageLabelIdentifierOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-record-page-label-identifier-on-update-side-effect-handler.service';
import { ObjectRecordFormOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-record-form-on-create-side-effect-handler.service';
import { ObjectRecordPageOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-record-page-on-create-side-effect-handler.service';
import { ObjectReadabilityPrivateBackfillOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-readability-private-backfill-on-update-side-effect-handler.service';
import { ObjectSearchVectorOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-search-vector-on-create-side-effect-handler.service';
import { ObjectSearchVectorOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-search-vector-on-update-side-effect-handler.service';
import { ObjectSystemFieldsOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-fields-on-create-side-effect-handler.service';
import { ObjectSystemRelationsOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-relations-on-create-side-effect-handler.service';
import { ObjectSystemRelationsOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-relations-on-update-side-effect-handler.service';
import { ObjectSystemSideEffectsOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-system-side-effects-on-delete-side-effect-handler.service';

@Module({
  providers: [
    FieldUniqueBackingIndexOnCreateSideEffectHandlerService,
    FieldUniqueBackingIndexOnUpdateSideEffectHandlerService,
    FieldUniqueBackingIndexOnDeleteSideEffectHandlerService,
    FieldSearchFieldMetadataOnDeleteSideEffectHandlerService,
    FieldIndexViewFieldOnCreateSideEffectHandlerService,
    FieldRecordPageViewFieldOnCreateSideEffectHandlerService,
    FieldRecordFormWidgetOnCreateSideEffectHandlerService,
    FieldRecordFormWidgetOnDeleteSideEffectHandlerService,
    FieldRecordFormWidgetOnUpdateSideEffectHandlerService,
    FieldSystemViewFieldsOnDeleteSideEffectHandlerService,
    ObjectSystemFieldsOnCreateSideEffectHandlerService,
    ObjectIndexViewOnCreateSideEffectHandlerService,
    ObjectRecordPageOnCreateSideEffectHandlerService,
    ObjectNavigationCommandOnCreateSideEffectHandlerService,
    ObjectNavigationCommandOnUpdateSideEffectHandlerService,
    ObjectRecordFormOnCreateSideEffectHandlerService,
    ObjectSystemRelationsOnCreateSideEffectHandlerService,
    ObjectSystemRelationsOnUpdateSideEffectHandlerService,
    ObjectSearchVectorOnCreateSideEffectHandlerService,
    ObjectSearchVectorOnUpdateSideEffectHandlerService,
    ObjectIndexViewLabelIdentifierOnUpdateSideEffectHandlerService,
    ObjectRecordPageLabelIdentifierOnUpdateSideEffectHandlerService,
    ObjectReadabilityPrivateBackfillOnUpdateSideEffectHandlerService,
    ObjectSystemSideEffectsOnDeleteSideEffectHandlerService,
  ],
})
export class MetadataSideEffectHandlersModule {}
