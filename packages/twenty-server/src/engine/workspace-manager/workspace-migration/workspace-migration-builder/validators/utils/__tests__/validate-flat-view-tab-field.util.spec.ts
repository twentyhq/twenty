import { FieldMetadataType } from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { validateFlatViewTabField } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-tab-field.util';

const buildFlatFieldMetadataMaps = (
  overrides: Partial<UniversalFlatFieldMetadata> = {},
) => ({
  byUniversalIdentifier: {
    'tab-field': {
      universalIdentifier: 'tab-field',
      objectMetadataUniversalIdentifier: 'object',
      type: FieldMetadataType.SELECT,
      ...overrides,
    } as UniversalFlatFieldMetadata,
  },
});

const buildFlatView = (tabFieldMetadataUniversalIdentifier: string | null) =>
  ({
    objectMetadataUniversalIdentifier: 'object',
    tabFieldMetadataUniversalIdentifier,
  }) as UniversalFlatView;

describe('validateFlatViewTabField', () => {
  it('accepts a view without a tab field', () => {
    expect(
      validateFlatViewTabField({
        flatView: buildFlatView(null),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps(),
      }),
    ).toEqual([]);
  });

  it('accepts a SELECT field of the view object', () => {
    expect(
      validateFlatViewTabField({
        flatView: buildFlatView('tab-field'),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps(),
      }),
    ).toEqual([]);
  });

  it('rejects a tab field that does not exist', () => {
    expect(
      validateFlatViewTabField({
        flatView: buildFlatView('missing-field'),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps(),
      }).map(({ message }) => message),
    ).toEqual(['Tab field metadata not found']);
  });

  it('rejects a field of another object', () => {
    expect(
      validateFlatViewTabField({
        flatView: buildFlatView('tab-field'),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps({
          objectMetadataUniversalIdentifier: 'other-object',
        }),
      }).map(({ message }) => message),
    ).toEqual(['Tab field must belong to the view object']);
  });

  it('rejects a field that is not a SELECT', () => {
    expect(
      validateFlatViewTabField({
        flatView: buildFlatView('tab-field'),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps({
          type: FieldMetadataType.TEXT,
        }),
      }).map(({ message }) => message),
    ).toEqual(['Tab field must be a SELECT field']);
  });
});
