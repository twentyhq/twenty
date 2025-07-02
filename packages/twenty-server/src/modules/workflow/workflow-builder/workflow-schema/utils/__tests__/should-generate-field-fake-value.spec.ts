import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/should-generate-field-fake-value';

describe('shouldGenerateFieldFakeValue', () => {
  it('should return true for active non-system fields', () => {
    const field = {
      isSystem: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'testField',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FieldMetadataInterface;

    expect(shouldGenerateFieldFakeValue(field)).toBe(true);
  });

  it('should return true for system id field', () => {
    const field = {
      isSystem: true,
      isActive: true,
      type: FieldMetadataType.UUID,
      name: 'id',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FieldMetadataInterface;

    expect(shouldGenerateFieldFakeValue(field)).toBe(true);
  });

  it('should return false for inactive fields', () => {
    const field = {
      isSystem: false,
      isActive: false,
      type: FieldMetadataType.TEXT,
      name: 'testField',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FieldMetadataInterface;

    expect(shouldGenerateFieldFakeValue(field)).toBe(false);
  });

  it('should return false for system fields (except id)', () => {
    const field = {
      isSystem: true,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'testField',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FieldMetadataInterface;

    expect(shouldGenerateFieldFakeValue(field)).toBe(false);
  });

  it('should return false for relation fields', () => {
    const field = {
      isSystem: false,
      isActive: true,
      type: FieldMetadataType.RELATION,
      name: 'testField',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FieldMetadataInterface;

    expect(shouldGenerateFieldFakeValue(field)).toBe(false);
  });
});
