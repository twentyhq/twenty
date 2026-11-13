import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { validateFlatViewFieldSettings } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-settings.util';

const ONE_TO_MANY_RELATION_FIELD = {
  type: FieldMetadataType.RELATION,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
};

const MANY_TO_ONE_RELATION_FIELD = {
  type: FieldMetadataType.RELATION,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'companyId',
  },
};

const TEXT_FIELD = {
  type: FieldMetadataType.TEXT,
  universalSettings: null,
};

describe('validateFlatViewFieldSettings', () => {
  it('accepts null settings', () => {
    expect(
      validateFlatViewFieldSettings({
        settings: null,
        isCanonical: false,
        flatFieldMetadata: TEXT_FIELD,
      }),
    ).toEqual([]);
  });

  it('accepts a label on any field and a record limit on a one-to-many relation', () => {
    expect(
      validateFlatViewFieldSettings({
        settings: { label: 'Next step', recordLimit: 1 },
        isCanonical: false,
        flatFieldMetadata: ONE_TO_MANY_RELATION_FIELD,
      }),
    ).toEqual([]);

    expect(
      validateFlatViewFieldSettings({
        settings: { label: 'Deal name', recordLimit: null },
        isCanonical: false,
        flatFieldMetadata: TEXT_FIELD,
      }),
    ).toEqual([]);
  });

  it.each(['', '   ', 'x'.repeat(64)])('rejects label %j', (label) => {
    expect(
      validateFlatViewFieldSettings({
        settings: { label },
        isCanonical: false,
        flatFieldMetadata: TEXT_FIELD,
      }),
    ).toHaveLength(1);
  });

  it.each([0, 61, 1.5])('rejects record limit %p', (recordLimit) => {
    expect(
      validateFlatViewFieldSettings({
        settings: { recordLimit },
        isCanonical: false,
        flatFieldMetadata: ONE_TO_MANY_RELATION_FIELD,
      }),
    ).toHaveLength(1);
  });

  it.each([MANY_TO_ONE_RELATION_FIELD, TEXT_FIELD])(
    'rejects a record limit on a field that does not list related records',
    (flatFieldMetadata) => {
      expect(
        validateFlatViewFieldSettings({
          settings: { recordLimit: 1 },
          isCanonical: false,
          flatFieldMetadata,
        }),
      ).toHaveLength(1);
    },
  );

  it('accepts null settings on a canonical column', () => {
    expect(
      validateFlatViewFieldSettings({
        settings: null,
        isCanonical: true,
        flatFieldMetadata: TEXT_FIELD,
      }),
    ).toEqual([]);
  });

  it('rejects settings on a canonical column', () => {
    expect(
      validateFlatViewFieldSettings({
        settings: { label: 'Next step' },
        isCanonical: true,
        flatFieldMetadata: ONE_TO_MANY_RELATION_FIELD,
      }),
    ).toHaveLength(1);
  });

  it('rejects unknown keys coming from an application manifest', () => {
    const manifestSettings = JSON.parse('{"label":"Next step","width":3}');

    expect(
      validateFlatViewFieldSettings({
        settings: manifestSettings,
        isCanonical: false,
        flatFieldMetadata: TEXT_FIELD,
      }),
    ).toHaveLength(1);
  });

  it.each(['"Next step"', '["Next step"]', '3'])(
    'rejects manifest settings that are not an object: %s',
    (manifestSettingsJson) => {
      expect(
        validateFlatViewFieldSettings({
          settings: JSON.parse(manifestSettingsJson),
          isCanonical: false,
          flatFieldMetadata: TEXT_FIELD,
        }),
      ).toHaveLength(1);
    },
  );
});
