import {
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';

import { ObjectRecordPageLabelIdentifierOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-record-page-label-identifier-on-update-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const PREVIOUS_LABEL_FIELD_UNIVERSAL_IDENTIFIER =
  'c1c2c3c4-c5c6-4000-8000-000000000001';
const NEW_LABEL_FIELD_UNIVERSAL_IDENTIFIER =
  'c1c2c3c4-c5c6-4000-8000-000000000002';

const DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER =
  getSystemViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    viewKey: ViewKey.FIELDS_WIDGET,
  });

const NEW_LABEL_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  getSystemViewFieldUniversalIdentifier({
    fieldMetadataApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    viewUniversalIdentifier: DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
    fieldMetadataUniversalIdentifier: NEW_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
  });

const FIELDS_WIDGET = {
  universalIdentifier: 'widget-uid-1',
  isActive: true,
  deletedAt: null,
  universalConfiguration: {
    configurationType: 'FIELDS',
    viewUniversalIdentifier: DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
    newFieldDefaultVisibility: true,
  },
};

const buildArgs = ({
  previousLabelIdentifier = PREVIOUS_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
  newLabelIdentifier = NEW_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
  recordPageView = {
    id: 'view-db-id-1',
    universalIdentifier: DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
    isSystemSideEffect: true,
    deletedAt: null,
  },
  recordPageViewFields = [] as {
    universalIdentifier: string;
    fieldMetadataUniversalIdentifier: string;
    isSystemSideEffect?: boolean;
    position?: number;
    deletedAt?: string | null;
    viewFieldGroupUniversalIdentifier?: string | null;
    isActive?: boolean;
  }[],
  fieldsWidgets = [FIELDS_WIDGET],
  fieldMetadatasDeletedInBatch = [] as string[],
  viewFieldsPendingInBatch = [] as {
    universalIdentifier: string;
    viewUniversalIdentifier: string;
    fieldMetadataUniversalIdentifier: string;
  }[],
} = {}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: {
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      labelIdentifierFieldMetadataUniversalIdentifier: newLabelIdentifier,
    },
    allFlatEntityOperationRecordByMetadataName: {
      fieldMetadata: {
        flatEntityToCreate: {},
        flatEntityToUpdate: {},
        flatEntityToDelete: Object.fromEntries(
          fieldMetadatasDeletedInBatch.map((fieldUniversalIdentifier) => [
            fieldUniversalIdentifier,
            { universalIdentifier: fieldUniversalIdentifier },
          ]),
        ),
      },
      ...(viewFieldsPendingInBatch.length > 0 && {
        viewField: {
          flatEntityToCreate: Object.fromEntries(
            viewFieldsPendingInBatch.map((pendingViewField) => [
              pendingViewField.universalIdentifier,
              pendingViewField,
            ]),
          ),
          flatEntityToUpdate: {},
          flatEntityToDelete: {},
        },
      }),
    },
    relatedFlatEntityMaps: {
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          [OBJECT_UNIVERSAL_IDENTIFIER]: {
            universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
            labelIdentifierFieldMetadataUniversalIdentifier:
              previousLabelIdentifier,
          },
        },
      },
      flatFieldMetadataMaps: {
        byUniversalIdentifier: {
          [PREVIOUS_LABEL_FIELD_UNIVERSAL_IDENTIFIER]: {
            universalIdentifier: PREVIOUS_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
            applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
            objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          },
          [NEW_LABEL_FIELD_UNIVERSAL_IDENTIFIER]: {
            universalIdentifier: NEW_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
            applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
            objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          },
        },
      },
      flatViewMaps: {
        byUniversalIdentifier: {
          [recordPageView.universalIdentifier]: {
            ...recordPageView,
            viewFieldUniversalIdentifiers: recordPageViewFields.map(
              (viewField) => viewField.universalIdentifier,
            ),
            viewFieldGroupUniversalIdentifiers: [],
          },
        },
      },
      flatViewFieldMaps: {
        byUniversalIdentifier: Object.fromEntries(
          recordPageViewFields.map((viewField) => [
            viewField.universalIdentifier,
            {
              isSystemSideEffect: true,
              position: 0,
              deletedAt: null,
              isActive: true,
              viewFieldGroupUniversalIdentifier: null,
              ...viewField,
            },
          ]),
        ),
      },
      flatViewFieldGroupMaps: { byUniversalIdentifier: {} },
      flatPageLayoutWidgetMaps: {
        byUniversalIdentifier: Object.fromEntries(
          fieldsWidgets.map((fieldsWidget) => [
            fieldsWidget.universalIdentifier,
            fieldsWidget,
          ]),
        ),
      },
    },
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

describe('ObjectRecordPageLabelIdentifierOnUpdateSideEffectHandlerService', () => {
  const handler =
    new (ObjectRecordPageLabelIdentifierOnUpdateSideEffectHandlerService as unknown as new () => ObjectRecordPageLabelIdentifierOnUpdateSideEffectHandlerService)();

  it('should delete the new label identifier engine view field and restore the previous one', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        recordPageViewFields: [
          {
            universalIdentifier: NEW_LABEL_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier:
              NEW_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
            position: 3,
          },
        ],
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const deletedViewFields = Object.values(
      result.operations.viewField?.flatEntityToDelete ?? {},
    );

    expect(deletedViewFields).toHaveLength(1);
    expect(deletedViewFields[0].universalIdentifier).toBe(
      NEW_LABEL_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
    );

    const createdViewFields = Object.values(
      result.operations.viewField?.flatEntityToCreate ?? {},
    );

    expect(createdViewFields).toHaveLength(1);
    expect(createdViewFields[0]).toMatchObject({
      universalIdentifier: getSystemViewFieldUniversalIdentifier({
        fieldMetadataApplicationUniversalIdentifier:
          APPLICATION_UNIVERSAL_IDENTIFIER,
        viewUniversalIdentifier: DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
        fieldMetadataUniversalIdentifier:
          PREVIOUS_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
      }),
      fieldMetadataUniversalIdentifier:
        PREVIOUS_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
      isSystemSideEffect: true,
      // Appended after the (deleted) view field at position 3.
      position: 4,
    });
  });

  it('should noop when the label identifier is unchanged', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        previousLabelIdentifier: NEW_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
        newLabelIdentifier: NEW_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should noop when the object has no engine-owned record-page view', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        recordPageView: {
          id: 'view-db-id-1',
          universalIdentifier: 'not-the-derived-identifier',
          isSystemSideEffect: true,
          deletedAt: null,
        },
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should not delete a caller-owned view field displaying the new label identifier', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        recordPageViewFields: [
          {
            universalIdentifier: 'caller-owned-view-field-uid',
            fieldMetadataUniversalIdentifier:
              NEW_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
            isSystemSideEffect: false,
          },
        ],
      }),
    );

    if (result.status === 'success') {
      expect(
        Object.values(result.operations.viewField?.flatEntityToDelete ?? {}),
      ).toHaveLength(0);
    }
  });

  it('should not restore the previous label identifier when it is already displayed', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        recordPageViewFields: [
          {
            universalIdentifier: 'previous-label-view-field-uid',
            fieldMetadataUniversalIdentifier:
              PREVIOUS_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
          },
        ],
      }),
    );

    if (result.status === 'success') {
      expect(
        Object.values(result.operations.viewField?.flatEntityToCreate ?? {}),
      ).toHaveLength(0);
    }
  });

  it('should not restore a previous label identifier deleted in the same batch', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        recordPageViewFields: [
          {
            universalIdentifier: NEW_LABEL_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier:
              NEW_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
          },
        ],
        fieldMetadatasDeletedInBatch: [
          PREVIOUS_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
        ],
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.values(result.operations.viewField?.flatEntityToCreate ?? {}),
    ).toHaveLength(0);
    // The exclusion half still applies.
    expect(
      Object.values(result.operations.viewField?.flatEntityToDelete ?? {}),
    ).toHaveLength(1);
  });

  // The engine always produces its system side effects: a caller-pending view
  // field for the same pair is a conflict the pair-uniqueness validator
  // surfaces to the caller, not something the engine yields to.
  it('should restore the previous label identifier even when the batch declares a view field for the same pair', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        recordPageViewFields: [
          {
            universalIdentifier: NEW_LABEL_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier:
              NEW_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
          },
        ],
        viewFieldsPendingInBatch: [
          {
            universalIdentifier: 'caller-authored-view-field-uid',
            viewUniversalIdentifier:
              DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier:
              PREVIOUS_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
          },
        ],
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const restoredFlatViewFields = Object.values(
      result.operations.viewField?.flatEntityToCreate ?? {},
    );

    expect(restoredFlatViewFields).toHaveLength(1);
    expect(restoredFlatViewFields[0].fieldMetadataUniversalIdentifier).toBe(
      PREVIOUS_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(restoredFlatViewFields[0].isSystemSideEffect).toBe(true);
  });

  it('should not restore the previous label identifier when no active FIELDS widget references the view', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        recordPageViewFields: [
          {
            universalIdentifier: NEW_LABEL_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier:
              NEW_LABEL_FIELD_UNIVERSAL_IDENTIFIER,
          },
        ],
        fieldsWidgets: [],
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.values(result.operations.viewField?.flatEntityToCreate ?? {}),
    ).toHaveLength(0);
    // The exclusion half still applies.
    expect(
      Object.values(result.operations.viewField?.flatEntityToDelete ?? {}),
    ).toHaveLength(1);
  });
});
