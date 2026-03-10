import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/utils/sanitize-overridable-entity-input.util';

describe('sanitizeOverridableEntityInput', () => {
  describe('when shouldOverride is false', () => {
    it('should pass through properties unchanged and preserve existing overrides', () => {
      const existingOverrides = { title: 'Previous Override' };
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          title: 'Base Title',
          position: 0,
          icon: null,
          overrides: existingOverrides,
        },
        updatedEditableProperties: { title: 'New Title' },
        shouldOverride: false,
      });

      expect(result.updatedEditableProperties).toEqual({ title: 'New Title' });
      expect(result.overrides).toBe(existingOverrides);
    });
  });

  describe('when shouldOverride is true', () => {
    it('should move overridable property to overrides and remove it from editableProperties', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          title: 'Base Title',
          position: 0,
          icon: null,
          overrides: null,
        },
        updatedEditableProperties: { title: 'Overridden Title' },
        shouldOverride: true,
      });

      expect(result.overrides).toEqual({ title: 'Overridden Title' });
      expect(result.updatedEditableProperties).not.toHaveProperty('title');
    });

    it('should implicitly restore when new value matches base value by removing the key from overrides', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          title: 'Base Title',
          position: 0,
          icon: null,
          overrides: { title: 'Old Override', position: 5 },
        },
        updatedEditableProperties: { title: 'Base Title' },
        shouldOverride: true,
      });

      expect(result.overrides).toEqual({ position: 5 });
      expect(result.updatedEditableProperties).not.toHaveProperty('title');
    });

    it('should return null overrides when removing the last override key', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          title: 'Base Title',
          position: 0,
          icon: null,
          overrides: { title: 'Old Override' },
        },
        updatedEditableProperties: { title: 'Base Title' },
        shouldOverride: true,
      });

      expect(result.overrides).toBeNull();
      expect(result.updatedEditableProperties).not.toHaveProperty('title');
    });

    it('should not move non-overridable properties to overrides', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          title: 'Base Title',
          position: 0,
          icon: null,
          pageLayoutId: 'layout-1',
          overrides: null,
        },
        updatedEditableProperties: {
          title: 'Overridden Title',
          pageLayoutId: 'layout-2',
        },
        shouldOverride: true,
      });

      expect(result.overrides).toEqual({ title: 'Overridden Title' });
      expect(result.updatedEditableProperties).toEqual({
        pageLayoutId: 'layout-2',
      });
    });

    it('should preserve existing override keys when updating a different overridable property', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          title: 'Base Title',
          position: 0,
          icon: null,
          overrides: { title: 'Overridden Title' },
        },
        updatedEditableProperties: { position: 5 },
        shouldOverride: true,
      });

      expect(result.overrides).toEqual({
        title: 'Overridden Title',
        position: 5,
      });
      expect(result.updatedEditableProperties).not.toHaveProperty('position');
    });

    it('should create new overrides object when no existing overrides', () => {
      const result = sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutTab',
        existingFlatEntity: {
          title: 'Base Title',
          position: 0,
          icon: null,
          overrides: null,
        },
        updatedEditableProperties: { icon: 'IconStar' },
        shouldOverride: true,
      });

      expect(result.overrides).toEqual({ icon: 'IconStar' });
      expect(result.updatedEditableProperties).not.toHaveProperty('icon');
    });
  });
});
