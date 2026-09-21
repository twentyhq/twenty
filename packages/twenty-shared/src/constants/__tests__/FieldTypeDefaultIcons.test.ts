import { FieldMetadataType } from '@/types';

import { FIELD_TYPE_DEFAULT_ICONS } from '../FieldTypeDefaultIcons';

describe('FIELD_TYPE_DEFAULT_ICONS', () => {
  it('should define a default icon for every field type', () => {
    Object.values(FieldMetadataType).forEach((fieldMetadataType) => {
      expect(FIELD_TYPE_DEFAULT_ICONS[fieldMetadataType]).toEqual(
        expect.any(String),
      );
    });
  });

  it('should only contain canonically shaped icon names', () => {
    Object.values(FIELD_TYPE_DEFAULT_ICONS).forEach((iconName) => {
      expect(iconName).toMatch(/^Icon[A-Za-z0-9]+$/);
    });
  });
});
