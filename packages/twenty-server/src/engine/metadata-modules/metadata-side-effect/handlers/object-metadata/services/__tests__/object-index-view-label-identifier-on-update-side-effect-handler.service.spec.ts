import { getSystemViewUniversalIdentifier } from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';

import { ObjectIndexViewLabelIdentifierOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-index-view-label-identifier-on-update-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const NAME_FIELD_UNIVERSAL_IDENTIFIER = 'd1d2d3d4-d5d6-4000-8000-000000000001';
const CODE_FIELD_UNIVERSAL_IDENTIFIER = 'd1d2d3d4-d5d6-4000-8000-000000000002';

const INDEX_VIEW_UNIVERSAL_IDENTIFIER = getSystemViewUniversalIdentifier({
  objectMetadataApplicationUniversalIdentifier:
    APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  viewKey: ViewKey.INDEX,
});

const NAME_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  'e1e2e3e4-e5e6-4000-8000-000000000001';
const CODE_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  'e1e2e3e4-e5e6-4000-8000-000000000002';

const buildArgs = ({
  fromLabelIdentifier,
  toLabelIdentifier,
  viewFieldsInWorkspace = [],
}: {
  fromLabelIdentifier: string | null;
  toLabelIdentifier: string | null;
  viewFieldsInWorkspace?: {
    universalIdentifier: string;
    fieldMetadataUniversalIdentifier: string;
    position: number;
    isVisible: boolean;
  }[];
}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: {
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      labelIdentifierFieldMetadataUniversalIdentifier: toLabelIdentifier,
    },
    allFlatEntityOperationRecordByMetadataName: {},
    relatedFlatEntityMaps: {
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          [OBJECT_UNIVERSAL_IDENTIFIER]: {
            universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            labelIdentifierFieldMetadataUniversalIdentifier:
              fromLabelIdentifier,
          },
        },
      },
      flatViewMaps: {
        byUniversalIdentifier: {
          [INDEX_VIEW_UNIVERSAL_IDENTIFIER]: {
            universalIdentifier: INDEX_VIEW_UNIVERSAL_IDENTIFIER,
            isSystemSideEffect: true,
            isActive: true,
            deletedAt: null,
            viewFieldUniversalIdentifiers: viewFieldsInWorkspace.map(
              (viewField) => viewField.universalIdentifier,
            ),
          },
        },
      },
      flatViewFieldMaps: {
        byUniversalIdentifier: Object.fromEntries(
          viewFieldsInWorkspace.map((viewField) => [
            viewField.universalIdentifier,
            {
              isActive: true,
              deletedAt: null,
              isSystemSideEffect: true,
              ...viewField,
            },
          ]),
        ),
      },
    },
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

const SYNCED_VIEW_FIELDS = [
  {
    universalIdentifier: NAME_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
    fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
    position: 0,
    isVisible: true,
  },
  {
    universalIdentifier: CODE_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
    fieldMetadataUniversalIdentifier: CODE_FIELD_UNIVERSAL_IDENTIFIER,
    position: 5,
    isVisible: false,
  },
];

describe('ObjectIndexViewLabelIdentifierOnUpdateSideEffectHandlerService', () => {
  const handler =
    new (ObjectIndexViewLabelIdentifierOnUpdateSideEffectHandlerService as unknown as new () => ObjectIndexViewLabelIdentifierOnUpdateSideEffectHandlerService)();

  it('should move the new label identifier view field below the lowest and make it visible', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        fromLabelIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        toLabelIdentifier: CODE_FIELD_UNIVERSAL_IDENTIFIER,
        viewFieldsInWorkspace: SYNCED_VIEW_FIELDS,
      }),
    );

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const updatedCodeViewField = (result.operations.viewField
      ?.flatEntityToUpdate ?? {})[CODE_VIEW_FIELD_UNIVERSAL_IDENTIFIER];

    expect(updatedCodeViewField?.position).toBe(-1);
    expect(updatedCodeViewField?.isVisible).toBe(true);
  });

  it('should noop when the label identifier is unchanged', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        fromLabelIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        toLabelIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        viewFieldsInWorkspace: SYNCED_VIEW_FIELDS,
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should noop when the new label identifier view field is already visible and strictly lowest', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        fromLabelIdentifier: CODE_FIELD_UNIVERSAL_IDENTIFIER,
        toLabelIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        viewFieldsInWorkspace: SYNCED_VIEW_FIELDS,
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should noop when the new label identifier has no synced INDEX view field (created in the same sync)', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        fromLabelIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
        toLabelIdentifier: CODE_FIELD_UNIVERSAL_IDENTIFIER,
        viewFieldsInWorkspace: [SYNCED_VIEW_FIELDS[0]],
      }),
    );

    expect(result.status).toBe('noop');
  });
});
