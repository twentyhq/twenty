import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/utils/sanitize-overridable-entity-input.util';

const CALLER = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

const authorArgs = {
  callerApplicationUniversalIdentifier: CALLER,
  workspaceCustomApplicationUniversalIdentifier: CALLER,
};

const baseTab = {
  applicationUniversalIdentifier: OWNER,
  title: 'Base Title',
  position: 0,
  icon: null,
};

describe('sanitizeOverridableEntityInput', () => {
  describe('when shouldOverride is false', () => {
    it('should pass through properties unchanged and preserve existing overrides', () => {
      const existingOverrides = { [CALLER]: { title: 'Previous Override' } };
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: { ...baseTab, overrides: existingOverrides },
        updatedEditableProperties: { title: 'New Title' },
        shouldOverride: false,
        ...authorArgs,
      });

      expect(result.updatedEditableProperties).toEqual({ title: 'New Title' });
      expect(result.overrides).toBe(existingOverrides);
    });
  });

  describe('when shouldOverride is true', () => {
    it('should move overridable property into the caller entry and remove it from editableProperties', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: { ...baseTab, overrides: null },
        updatedEditableProperties: { title: 'Overridden Title' },
        shouldOverride: true,
        ...authorArgs,
      });

      expect(result.overrides).toEqual({
        [CALLER]: { title: 'Overridden Title' },
      });
      expect(result.updatedEditableProperties).not.toHaveProperty('title');
    });

    it('should implicitly restore when new value matches base value by removing the key from the caller entry', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          ...baseTab,
          overrides: { [CALLER]: { title: 'Old Override', position: 5 } },
        },
        updatedEditableProperties: { title: 'Base Title' },
        shouldOverride: true,
        ...authorArgs,
      });

      expect(result.overrides).toEqual({ [CALLER]: { position: 5 } });
      expect(result.updatedEditableProperties).not.toHaveProperty('title');
    });

    it('should restore against the owner entry rather than the base column', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          ...baseTab,
          overrides: {
            [OWNER]: { title: 'Owner Title' },
            [CALLER]: { title: 'Old Override' },
          },
        },
        updatedEditableProperties: { title: 'Owner Title' },
        shouldOverride: true,
        ...authorArgs,
      });

      expect(result.overrides).toEqual({ [OWNER]: { title: 'Owner Title' } });
    });

    it('should return null overrides when removing the last override key', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          ...baseTab,
          overrides: { [CALLER]: { title: 'Old Override' } },
        },
        updatedEditableProperties: { title: 'Base Title' },
        shouldOverride: true,
        ...authorArgs,
      });

      expect(result.overrides).toBeNull();
      expect(result.updatedEditableProperties).not.toHaveProperty('title');
    });

    it('should lift a flat blob under the workspace custom application', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          ...baseTab,
          overrides: { position: 5 } as never,
        },
        updatedEditableProperties: { title: 'Overridden Title' },
        shouldOverride: true,
        ...authorArgs,
      });

      expect(result.overrides).toEqual({
        [CALLER]: { position: 5, title: 'Overridden Title' },
      });
    });

    it('should not move non-overridable properties to overrides', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          ...baseTab,
          pageLayoutId: 'layout-1',
          overrides: null,
        },
        updatedEditableProperties: {
          title: 'Overridden Title',
          pageLayoutId: 'layout-2',
        },
        shouldOverride: true,
        ...authorArgs,
      });

      expect(result.overrides).toEqual({
        [CALLER]: { title: 'Overridden Title' },
      });
      expect(result.updatedEditableProperties).toEqual({
        pageLayoutId: 'layout-2',
      });
    });

    it('should preserve existing override keys when updating a different overridable property', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          ...baseTab,
          overrides: { [CALLER]: { title: 'Overridden Title' } },
        },
        updatedEditableProperties: { position: 5 },
        shouldOverride: true,
        ...authorArgs,
      });

      expect(result.overrides).toEqual({
        [CALLER]: { title: 'Overridden Title', position: 5 },
      });
      expect(result.updatedEditableProperties).not.toHaveProperty('position');
    });

    it('should route isActive into the caller entry and materialize the column', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: { ...baseTab, isActive: true, overrides: null },
        updatedEditableProperties: { isActive: false },
        shouldOverride: true,
        ...authorArgs,
      });

      expect(result.overrides).toEqual({ [CALLER]: { isActive: false } });
      expect(result.updatedEditableProperties).toEqual({ isActive: false });
    });

    it('should drop the isActive attribution and reactivate the column on restore', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          ...baseTab,
          isActive: false,
          overrides: { [CALLER]: { isActive: false } },
        },
        updatedEditableProperties: { isActive: true },
        shouldOverride: true,
        ...authorArgs,
      });

      expect(result.overrides).toBeNull();
      expect(result.updatedEditableProperties).toEqual({ isActive: true });
    });

    it('should keep the column inactive while the owner still deactivates it', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          ...baseTab,
          isActive: false,
          overrides: {
            [OWNER]: { isActive: false },
            [CALLER]: { isActive: false },
          },
        },
        updatedEditableProperties: { isActive: true },
        shouldOverride: true,
        ...authorArgs,
      });

      expect(result.overrides).toEqual({
        [OWNER]: { isActive: false },
        [CALLER]: { isActive: true },
      });
      expect(result.updatedEditableProperties).toEqual({ isActive: true });
    });
  });
});
