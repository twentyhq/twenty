import { computeDiffBetweenObjects } from '../compute-diff-between-objects';

describe('computeDiffBetweenObjects', () => {
  it('should return the correct diff', () => {
    const existingObjects = [
      { id: '1', name: 'Object 1', deletedAt: null },
      { id: '2', name: 'Object 2', deletedAt: null },
    ];
    const receivedObjects = [
      { id: '1', name: 'Object 1' },
      { id: '3', name: 'Object 3' },
    ];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
    });

    expect(diff).toEqual({
      toCreate: [{ id: '3', name: 'Object 3' }],
      toUpdate: [],
      toRestoreAndUpdate: [],
      idsToDelete: ['2'],
    });
  });

  it('should return the correct diff when the properties to compare are empty', () => {
    const existingObjects = [{ id: '1', name: 'Object 1', deletedAt: null }];
    const receivedObjects = [{ id: '1', name: 'Object 1' }];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: [],
    });

    expect(diff).toEqual({
      toCreate: [],
      toUpdate: [],
      toRestoreAndUpdate: [],
      idsToDelete: [],
    });
  });

  it('should return the correct diff when the existing objects are empty', () => {
    const existingObjects: { id: string; name: string; deletedAt: null }[] = [];
    const receivedObjects = [{ id: '1', name: 'Object 1' }];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
    });

    expect(diff).toEqual({
      toCreate: [{ id: '1', name: 'Object 1' }],
      toUpdate: [],
      toRestoreAndUpdate: [],
      idsToDelete: [],
    });
  });

  it('should return the correct diff when the received objects are empty', () => {
    const existingObjects = [{ id: '1', name: 'Object 1', deletedAt: null }];
    const receivedObjects: { id: string; name: string }[] = [];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
    });

    expect(diff).toEqual({
      toCreate: [],
      toUpdate: [],
      toRestoreAndUpdate: [],
      idsToDelete: ['1'],
    });
  });

  it('should detect updates when properties change', () => {
    const existingObjects = [{ id: '1', name: 'Object 1', deletedAt: null }];
    const receivedObjects = [{ id: '1', name: 'Updated Object 1' }];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
    });

    expect(diff).toEqual({
      toCreate: [],
      toUpdate: [{ id: '1', name: 'Updated Object 1' }],
      toRestoreAndUpdate: [],
      idsToDelete: [],
    });
  });

  it('should restore and update deleted objects', () => {
    const existingObjects = [
      { id: '1', name: 'Object 1', deletedAt: '2024-01-01' },
    ];
    const receivedObjects = [{ id: '1', name: 'Restored Object 1' }];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
    });

    expect(diff).toEqual({
      toCreate: [],
      toUpdate: [],
      toRestoreAndUpdate: [{ id: '1', name: 'Restored Object 1' }],
      idsToDelete: [],
    });
  });

  it('should not include deleted objects in idsToDelete', () => {
    const existingObjects = [
      { id: '1', name: 'Object 1', deletedAt: null },
      { id: '2', name: 'Object 2', deletedAt: '2024-01-01' },
    ];
    const receivedObjects: { id: string; name: string }[] = [];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
    });

    expect(diff).toEqual({
      toCreate: [],
      toUpdate: [],
      toRestoreAndUpdate: [],
      idsToDelete: ['1'],
    });
  });
});
