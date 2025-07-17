import { FieldMetadataType } from 'twenty-shared/types';

import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/should-generate-field-fake-value';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';

describe('shouldGenerateFieldFakeValue', () => {
  it('should return true for active non-system fields', () => {
    const field = getMockFieldMetadataEntity({
      workspaceId: '20202020-0000-0000-0000-000000000000',
      objectMetadataId: '20202020-0000-0000-0000-000000000001',
      id: '20202020-0000-0000-0000-000000000002',
      isSystem: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'testField',
      label: 'Test Field',
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(shouldGenerateFieldFakeValue(field)).toBe(true);
  });

  it('should return true for system id field', () => {
    const field = getMockFieldMetadataEntity({
      workspaceId: '20202020-0000-0000-0000-000000000000',
      objectMetadataId: '20202020-0000-0000-0000-000000000001',
      id: '20202020-0000-0000-0000-000000000003',
      isSystem: true,
      isActive: true,
      type: FieldMetadataType.UUID,
      name: 'id',
      label: 'ID',
      isNullable: false,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(shouldGenerateFieldFakeValue(field)).toBe(true);
  });

  it('should return false for inactive fields', () => {
    const field = getMockFieldMetadataEntity({
      workspaceId: '20202020-0000-0000-0000-000000000000',
      objectMetadataId: '20202020-0000-0000-0000-000000000001',
      id: '20202020-0000-0000-0000-000000000004',
      isSystem: false,
      isActive: false,
      type: FieldMetadataType.TEXT,
      name: 'testField',
      label: 'Test Field',
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(shouldGenerateFieldFakeValue(field)).toBe(false);
  });

  it('should return false for system fields (except id)', () => {
    const field = getMockFieldMetadataEntity({
      workspaceId: '20202020-0000-0000-0000-000000000000',
      objectMetadataId: '20202020-0000-0000-0000-000000000001',
      id: '20202020-0000-0000-0000-000000000005',
      isSystem: true,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'testField',
      label: 'Test Field',
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(shouldGenerateFieldFakeValue(field)).toBe(false);
  });

  it('should return false for relation fields', () => {
    const field = getMockFieldMetadataEntity({
      workspaceId: '20202020-0000-0000-0000-000000000000',
      objectMetadataId: '20202020-0000-0000-0000-000000000001',
      id: '20202020-0000-0000-0000-000000000006',
      isSystem: false,
      isActive: true,
      type: FieldMetadataType.RELATION,
      name: 'testField',
      label: 'Test Field',
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(shouldGenerateFieldFakeValue(field)).toBe(false);
  });
});
