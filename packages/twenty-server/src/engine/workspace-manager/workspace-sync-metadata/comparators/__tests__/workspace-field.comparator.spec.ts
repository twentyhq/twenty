import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceFieldComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field.comparator';
import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';

describe('WorkspaceFieldComparator', () => {
  let comparator: WorkspaceFieldComparator;

  beforeEach(() => {
    // Initialize the comparator before each test
    comparator = new WorkspaceFieldComparator();
  });

  it('should generate CREATE action for new fields', () => {
    const original = { fields: [] } as any;
    const standard = {
      fields: [
        getMockFieldMetadataEntity({
          workspaceId: '20202020-0000-0000-0000-000000000000',
          objectMetadataId: '20202020-0000-0000-0000-000000000001',
          standardId: 'no-field-1',
          name: 'New Field',
          type: FieldMetadataType.TEXT,
          label: 'New Field',
          isNullable: true,
          isLabelSyncedWithName: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ],
    } as any;

    const result = comparator.compare('', original.fields, standard.fields);

    expect(result).toEqual([
      {
        action: ComparatorAction.CREATE,
        object: expect.objectContaining(standard.fields[0]),
      },
    ]);
  });

  it('should generate UPDATE action for modified fields', () => {
    const original = {
      fields: [
        getMockFieldMetadataEntity({
          workspaceId: '20202020-0000-0000-0000-000000000000',
          objectMetadataId: '20202020-0000-0000-0000-000000000001',
          standardId: 'field-1',
          id: 'field-1',
          name: 'Test Field',
          type: FieldMetadataType.TEXT,
          label: 'Test Field',
          isNullable: true,
          isLabelSyncedWithName: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ],
    } as any;
    const standard = {
      fields: [
        getMockFieldMetadataEntity({
          workspaceId: '20202020-0000-0000-0000-000000000000',
          objectMetadataId: '20202020-0000-0000-0000-000000000001',
          standardId: 'field-1',
          name: 'Test Field',
          type: FieldMetadataType.TEXT,
          label: 'Test Field',
          isNullable: false,
          isLabelSyncedWithName: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ],
    } as any;

    const result = comparator.compare('', original.fields, standard.fields);

    expect(result).toEqual([
      {
        action: ComparatorAction.UPDATE,
        object: expect.objectContaining({ id: 'field-1', isNullable: false }),
      },
    ]);
  });

  it('should generate DELETE action for removed fields', () => {
    const original = {
      fields: [
        getMockFieldMetadataEntity({
          workspaceId: '20202020-0000-0000-0000-000000000000',
          objectMetadataId: '20202020-0000-0000-0000-000000000001',
          standardId: 'field-1',
          id: 'field-1',
          name: 'Removed Field',
          type: FieldMetadataType.TEXT,
          label: 'Removed Field',
          isNullable: true,
          isLabelSyncedWithName: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ],
    } as any;
    const standard = { fields: [] } as any;

    const result = comparator.compare('', original.fields, standard.fields);

    expect(result).toEqual([
      {
        action: ComparatorAction.DELETE,
        object: expect.objectContaining({ name: 'Removed Field' }),
      },
    ]);
  });

  it('should not generate any action for identical fields', () => {
    const original = {
      fields: [
        getMockFieldMetadataEntity({
          workspaceId: '20202020-0000-0000-0000-000000000000',
          objectMetadataId: '20202020-0000-0000-0000-000000000001',
          standardId: 'field-1',
          id: 'field-1',
          name: 'Test Field',
          type: FieldMetadataType.TEXT,
          label: 'Test Field',
          isNullable: true,
          isLabelSyncedWithName: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ],
    } as any;
    const standard = {
      fields: [
        getMockFieldMetadataEntity({
          workspaceId: '20202020-0000-0000-0000-000000000000',
          objectMetadataId: '20202020-0000-0000-0000-000000000001',
          standardId: 'field-1',
          name: 'Test Field',
          type: FieldMetadataType.TEXT,
          label: 'Test Field',
          isNullable: true,
          isLabelSyncedWithName: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ],
    } as any;

    const result = comparator.compare('', original.fields, standard.fields);

    expect(result).toHaveLength(0);
  });
});
