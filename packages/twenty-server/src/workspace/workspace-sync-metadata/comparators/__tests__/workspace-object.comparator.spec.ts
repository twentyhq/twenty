import { ComparatorAction } from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';

import { WorkspaceObjectComparator } from 'src/workspace/workspace-sync-metadata/comparators/workspace-object.comparator';

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
      id: '1',
      description: 'Original description',
    });
    const standardObjectMetadata = createMockObjectMetadata({
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
      id: '1',
      description: 'Same description',
    });
    const standardObjectMetadata = createMockObjectMetadata({
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
