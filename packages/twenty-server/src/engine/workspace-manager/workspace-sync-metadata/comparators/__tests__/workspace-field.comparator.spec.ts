import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';

import { WorkspaceFieldComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field.comparator';

describe('WorkspaceFieldComparator', () => {
  let comparator: WorkspaceFieldComparator;

  beforeEach(() => {
    // Initialize the comparator before each test
    comparator = new WorkspaceFieldComparator();
  });

  function createMockFieldMetadata(values: any) {
    return {
      workspaceId: 'some-workspace-id',
      type: 'TEXT',
      name: 'DefaultFieldName',
      label: 'Default Field Label',
      defaultValue: null,
      description: 'Default description',
      isCustom: false,
      isSystem: false,
      isNullable: true,
      ...values,
    };
  }

  it('should generate CREATE action for new fields', () => {
    const original = { fields: [] } as any;
    const standard = {
      fields: [
        createMockFieldMetadata({
          standardId: 'no-field-1',
          name: 'New Field',
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
        createMockFieldMetadata({
          standardId: '1',
          id: '1',
          isNullable: true,
        }),
      ],
    } as any;
    const standard = {
      fields: [
        createMockFieldMetadata({
          standardId: '1',
          isNullable: false,
        }),
      ],
    } as any;

    const result = comparator.compare('', original.fields, standard.fields);

    expect(result).toEqual([
      {
        action: ComparatorAction.UPDATE,
        object: expect.objectContaining({ id: '1', isNullable: false }),
      },
    ]);
  });

  it('should generate DELETE action for removed fields', () => {
    const original = {
      fields: [
        createMockFieldMetadata({
          standardId: '1',
          id: '1',
          name: 'Removed Field',
          isActive: true,
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
        createMockFieldMetadata({ standardId: '1', id: '1', isActive: true }),
      ],
    } as any;
    const standard = {
      fields: [createMockFieldMetadata({ standardId: '1' })],
    } as any;

    const result = comparator.compare('', original.fields, standard.fields);

    expect(result).toHaveLength(0);
  });
});
