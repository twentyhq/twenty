import { FieldSystemViewFieldsOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-system-view-fields-on-delete-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const DELETED_FIELD_UNIVERSAL_IDENTIFIER =
  'd1d2d3d4-d5d6-4000-8000-000000000001';
const SYSTEM_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000001';
const CALLER_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000002';

const buildArgs = ({
  viewFieldUniversalIdentifiers,
  viewFieldsInWorkspace = [],
}: {
  viewFieldUniversalIdentifiers: string[];
  viewFieldsInWorkspace?: {
    universalIdentifier: string;
    isSystemSideEffect: boolean;
  }[];
}): BuildSideEffectsArgs<'fieldMetadata'> =>
  ({
    flatEntity: {
      universalIdentifier: DELETED_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldUniversalIdentifiers,
    },
    allFlatEntityOperationRecordByMetadataName: {},
    relatedFlatEntityMaps: {
      flatViewFieldMaps: {
        byUniversalIdentifier: Object.fromEntries(
          viewFieldsInWorkspace.map((viewField) => [
            viewField.universalIdentifier,
            {
              ...viewField,
              fieldMetadataUniversalIdentifier:
                DELETED_FIELD_UNIVERSAL_IDENTIFIER,
            },
          ]),
        ),
      },
    },
    context: {},
  }) as unknown as BuildSideEffectsArgs<'fieldMetadata'>;

describe('FieldSystemViewFieldsOnDeleteSideEffectHandlerService', () => {
  const handler =
    new (FieldSystemViewFieldsOnDeleteSideEffectHandlerService as unknown as new () => FieldSystemViewFieldsOnDeleteSideEffectHandlerService)();

  it('should cascade-delete every engine-owned view field displaying the deleted field', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        viewFieldUniversalIdentifiers: [
          SYSTEM_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          CALLER_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        ],
        viewFieldsInWorkspace: [
          {
            universalIdentifier: SYSTEM_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
            isSystemSideEffect: true,
          },
          {
            universalIdentifier: CALLER_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
            isSystemSideEffect: false,
          },
        ],
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    expect(
      Object.keys(result.operations.viewField?.flatEntityToDelete ?? {}),
    ).toEqual([SYSTEM_VIEW_FIELD_UNIVERSAL_IDENTIFIER]);
  });

  it('should noop when the field only has caller-owned view fields', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        viewFieldUniversalIdentifiers: [CALLER_VIEW_FIELD_UNIVERSAL_IDENTIFIER],
        viewFieldsInWorkspace: [
          {
            universalIdentifier: CALLER_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
            isSystemSideEffect: false,
          },
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should noop when the field has no view field', () => {
    const result = handler.buildSideEffects(
      buildArgs({ viewFieldUniversalIdentifiers: [] }),
    );

    expect(result.status).toBe('noop');
  });
});
