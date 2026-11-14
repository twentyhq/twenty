import { FieldMetadataType } from 'twenty-shared/types';

import { validateFlatViewFieldSettings } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-settings.util';

// GraphQL input types already reject these shapes, so only an application manifest can send them.
describe('validateFlatViewFieldSettings', () => {
  it.each([
    '{"label":"Next step","width":3}',
    '"Next step"',
    '["Next step"]',
    '3',
  ])('rejects manifest settings %s', (manifestSettingsJson) => {
    expect(
      validateFlatViewFieldSettings({
        settings: JSON.parse(manifestSettingsJson),
        isCanonical: false,
        flatFieldMetadata: {
          type: FieldMetadataType.TEXT,
          universalSettings: null,
        },
      }),
    ).toMatchObject([
      { message: expect.stringContaining('Invalid view field settings') },
    ]);
  });
});
