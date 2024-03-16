import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';

import { WorkspaceObjectComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-object.comparator';

describe('WorkspaceObjectComparator', () => {
  let comparator: WorkspaceObjectComparator;

  beforeEach(() => {
    // Initialize the comparator before each test
    comparator = new WorkspaceObjectComparator();
  });

  function createMockObjectMetadata(values: any) {
    return {
      nameSingular: 'TestObject',
      namePlural: 'TestObjects',
      labelSingular: 'Test Object',
      labelPlural: 'Test Objects',
      ...values,
    };
  }

  it('should generate CREATE action for new objects', () => {
    const standardObjectMetadata = createMockObjectMetadata({
      standardId: 'no-object-1',
      description: 'A standard object',
    });

    const result = comparator.compare(undefined, standardObjectMetadata);

    expect(result).toEqual({
      action: ComparatorAction.CREATE,
      object: standardObjectMetadata,
    });
  });

  it('should generate UPDATE action for objects with differences', () => {
    const originalObjectMetadata = createMockObjectMetadata({
      standardId: '1',
      id: '1',
      description: 'Original description',
    });
    const standardObjectMetadata = createMockObjectMetadata({
      standardId: '1',
      description: 'Updated description',
    });

    const result = comparator.compare(
      originalObjectMetadata,
      standardObjectMetadata,
    );

    expect(result).toEqual({
      action: ComparatorAction.UPDATE,
      object: expect.objectContaining({
        id: '1',
        description: 'Updated description',
      }),
    });
  });

  it('should generate SKIP action for identical objects', () => {
    const originalObjectMetadata = createMockObjectMetadata({
      standardId: '1',
      id: '1',
      description: 'Same description',
    });
    const standardObjectMetadata = createMockObjectMetadata({
      standardId: '1',
      description: 'Same description',
    });

    const result = comparator.compare(
      originalObjectMetadata,
      standardObjectMetadata,
    );

    expect(result).toEqual({
      action: ComparatorAction.SKIP,
    });
  });
});
