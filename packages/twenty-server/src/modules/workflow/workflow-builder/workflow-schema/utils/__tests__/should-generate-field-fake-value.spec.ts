import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/should-generate-field-fake-value';

describe('shouldGenerateFieldFakeValue', () => {
  it('should return true for active non-system fields', () => {
    const field = getFlatFieldMetadataMock({
      objectMetadataId: '20202020-0000-0000-0000-000000000001',
      isSystem: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'testField',
      universalIdentifier: 'test-field-universal-id',
    });

    expect(shouldGenerateFieldFakeValue(field)).toBe(true);
  });

  it('should return true for system id field', () => {
    const field = getFlatFieldMetadataMock({
      objectMetadataId: '20202020-0000-0000-0000-000000000001',
      isSystem: true,
      isActive: true,
      type: FieldMetadataType.UUID,
      name: 'id',
      universalIdentifier: 'id-field-universal-id',
    });

    expect(shouldGenerateFieldFakeValue(field)).toBe(true);
  });

  it('should return false for inactive fields', () => {
    const field = getFlatFieldMetadataMock({
      objectMetadataId: '20202020-0000-0000-0000-000000000001',
      isSystem: false,
      isActive: false,
      type: FieldMetadataType.TEXT,
      name: 'testField',
      universalIdentifier: 'inactive-field-universal-id',
    });

    expect(shouldGenerateFieldFakeValue(field)).toBe(false);
  });

  it('should return true for system fields', () => {
    const field = getFlatFieldMetadataMock({
      objectMetadataId: '20202020-0000-0000-0000-000000000001',
      isSystem: true,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'testField',
      universalIdentifier: 'system-field-universal-id',
    });

    expect(shouldGenerateFieldFakeValue(field)).toBe(true);
  });

  it('should return true for many-to-one relation fields', () => {
    const field = getFlatFieldMetadataMock({
      objectMetadataId: '20202020-0000-0000-0000-000000000001',
      isSystem: false,
      isActive: true,
      type: FieldMetadataType.RELATION,
      name: 'testField',
      universalIdentifier: 'relation-field-universal-id',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
      },
    });

    expect(shouldGenerateFieldFakeValue(field)).toBe(true);
  });
});
