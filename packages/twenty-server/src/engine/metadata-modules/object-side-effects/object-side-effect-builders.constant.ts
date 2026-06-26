import { buildDefaultActivityRelationsSideEffect } from 'src/engine/metadata-modules/object-side-effects/builders/build-default-activity-relations.side-effect';
import { buildIndexViewSideEffect } from 'src/engine/metadata-modules/object-side-effects/builders/build-index-view.side-effect';
import { buildRecordPageSideEffect } from 'src/engine/metadata-modules/object-side-effects/builders/build-record-page.side-effect';
import { buildSearchFieldSideEffect } from 'src/engine/metadata-modules/object-side-effects/builders/build-search-field.side-effect';
import { buildSearchGinIndexSideEffect } from 'src/engine/metadata-modules/object-side-effects/builders/build-search-gin-index.side-effect';
import { type ObjectSideEffectBuilder } from 'src/engine/metadata-modules/object-side-effects/types/object-side-effect-builder.type';

export const OBJECT_SIDE_EFFECT_BUILDERS_IN_EXECUTION_ORDER: ObjectSideEffectBuilder[] =
  [
    buildIndexViewSideEffect,
    buildRecordPageSideEffect,
    buildSearchFieldSideEffect,
    buildSearchGinIndexSideEffect,
    buildDefaultActivityRelationsSideEffect,
  ];
