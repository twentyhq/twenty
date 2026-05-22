import { isObjectMetadataManuallyCreatable } from '@/metadata/utils/is-object-metadata-manually-creatable.util';

describe('isObjectMetadataManuallyCreatable', () => {
  it('returns true for active non-system objects', () => {
    expect(
      isObjectMetadataManuallyCreatable({
        nameSingular: 'company',
        isActive: true,
        isSystem: false,
      }),
    ).toBe(true);
  });

  it('returns false for inactive objects', () => {
    expect(
      isObjectMetadataManuallyCreatable({
        nameSingular: 'company',
        isActive: false,
        isSystem: false,
      }),
    ).toBe(false);
  });

  it('returns false for system objects', () => {
    expect(
      isObjectMetadataManuallyCreatable({
        nameSingular: 'company',
        isActive: true,
        isSystem: true,
      }),
    ).toBe(false);
  });

  it.each(['workflow', 'workflowVersion', 'workflowRun', 'dashboard'])(
    'returns false for manually-disabled %s objects',
    (nameSingular) => {
      expect(
        isObjectMetadataManuallyCreatable({
          nameSingular,
          isActive: true,
          isSystem: false,
        }),
      ).toBe(false);
    },
  );
});
