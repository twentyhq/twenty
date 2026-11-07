import { isDefined } from '@/utils/validation';

import { computeDiffBetweenObjects } from '../compute-diff-between-objects';

const isEntityIncludedByDeletedAt = (entity: {
  deletedAt: string | null;
}): boolean => !isDefined(entity.deletedAt);

const isEntityIncludedByIsActive = (entity: { isActive: boolean }): boolean =>
  entity.isActive;

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
      isEntityIncluded: isEntityIncludedByDeletedAt,
    });

    expect(diff).toEqual({
      toCreate: [{ id: '3', name: 'Object 3' }],
      toUpdate: [],
      toRestoreAndUpdate: [],
      idsToRemove: ['2'],
    });
  });

  it('should return the correct diff when the properties to compare are empty', () => {
    const existingObjects = [{ id: '1', name: 'Object 1', deletedAt: null }];
    const receivedObjects = [{ id: '1', name: 'Object 1' }];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: [],
      isEntityIncluded: isEntityIncludedByDeletedAt,
    });

    expect(diff).toEqual({
      toCreate: [],
      toUpdate: [],
      toRestoreAndUpdate: [],
      idsToRemove: [],
    });
  });

  it('should return the correct diff when the existing objects are empty', () => {
    const existingObjects: { id: string; name: string; deletedAt: null }[] = [];
    const receivedObjects = [{ id: '1', name: 'Object 1' }];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
      isEntityIncluded: isEntityIncludedByDeletedAt,
    });

    expect(diff).toEqual({
      toCreate: [{ id: '1', name: 'Object 1' }],
      toUpdate: [],
      toRestoreAndUpdate: [],
      idsToRemove: [],
    });
  });

  it('should return the correct diff when the received objects are empty', () => {
    const existingObjects = [{ id: '1', name: 'Object 1', deletedAt: null }];
    const receivedObjects: { id: string; name: string }[] = [];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
      isEntityIncluded: isEntityIncludedByDeletedAt,
    });

    expect(diff).toEqual({
      toCreate: [],
      toUpdate: [],
      toRestoreAndUpdate: [],
      idsToRemove: ['1'],
    });
  });

  it('should detect updates when properties change', () => {
    const existingObjects = [{ id: '1', name: 'Object 1', deletedAt: null }];
    const receivedObjects = [{ id: '1', name: 'Updated Object 1' }];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
      isEntityIncluded: isEntityIncludedByDeletedAt,
    });

    expect(diff).toEqual({
      toCreate: [],
      toUpdate: [{ id: '1', name: 'Updated Object 1' }],
      toRestoreAndUpdate: [],
      idsToRemove: [],
    });
  });

  it('should restore and update excluded objects when using deletedAt', () => {
    const existingObjects = [
      { id: '1', name: 'Object 1', deletedAt: '2024-01-01' },
    ];
    const receivedObjects = [{ id: '1', name: 'Restored Object 1' }];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
      isEntityIncluded: isEntityIncludedByDeletedAt,
    });

    expect(diff).toEqual({
      toCreate: [],
      toUpdate: [],
      toRestoreAndUpdate: [{ id: '1', name: 'Restored Object 1' }],
      idsToRemove: [],
    });
  });

  it('should not include excluded objects in idsToRemove', () => {
    const existingObjects = [
      { id: '1', name: 'Object 1', deletedAt: null },
      { id: '2', name: 'Object 2', deletedAt: '2024-01-01' },
    ];
    const receivedObjects: { id: string; name: string }[] = [];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
      isEntityIncluded: isEntityIncludedByDeletedAt,
    });

    expect(diff).toEqual({
      toCreate: [],
      toUpdate: [],
      toRestoreAndUpdate: [],
      idsToRemove: ['1'],
    });
  });

  it('should restore and update inactive objects when using isActive', () => {
    const existingObjects = [{ id: '1', name: 'Object 1', isActive: false }];
    const receivedObjects = [{ id: '1', name: 'Restored Object 1' }];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
      isEntityIncluded: isEntityIncludedByIsActive,
    });

    expect(diff).toEqual({
      toCreate: [],
      toUpdate: [],
      toRestoreAndUpdate: [{ id: '1', name: 'Restored Object 1' }],
      idsToRemove: [],
    });
  });

  it('should not include inactive objects in idsToRemove when using isActive', () => {
    const existingObjects = [
      { id: '1', name: 'Object 1', isActive: true },
      { id: '2', name: 'Object 2', isActive: false },
    ];
    const receivedObjects: { id: string; name: string }[] = [];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
      isEntityIncluded: isEntityIncludedByIsActive,
    });

    expect(diff).toEqual({
      toCreate: [],
      toUpdate: [],
      toRestoreAndUpdate: [],
      idsToRemove: ['1'],
    });
  });

  it('should not detect an update when the received object omits a stored property', () => {
    const existingObjects = [
      { id: '1', name: 'Object 1', icon: null, isActive: true },
    ];
    const receivedObjects: {
      id: string;
      name: string;
      icon?: string | null;
    }[] = [{ id: '1', name: 'Object 1' }];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name', 'icon'],
      isEntityIncluded: isEntityIncludedByIsActive,
    });

    expect(diff.toUpdate).toEqual([]);
  });

  it('should detect an update when the received object sets a stored property to null', () => {
    const existingObjects = [
      { id: '1', name: 'Object 1', icon: 'IconStar', isActive: true },
    ];
    const receivedObjects = [{ id: '1', name: 'Object 1', icon: null }];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name', 'icon'],
      isEntityIncluded: isEntityIncludedByIsActive,
    });

    expect(diff.toUpdate).toEqual([{ id: '1', name: 'Object 1', icon: null }]);
  });

  it('should detect an update when an omitted property is cleared on omission and stored', () => {
    const existingObjects = [
      { id: '1', name: 'Object 1', icon: 'IconStar', isActive: true },
      { id: '2', name: 'Object 2', icon: null, isActive: true },
    ];
    const receivedObjects: {
      id: string;
      name: string;
      icon?: string | null;
    }[] = [
      { id: '1', name: 'Object 1' },
      { id: '2', name: 'Object 2' },
    ];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name', 'icon'],
      propertiesClearedWhenOmitted: ['icon'],
      isEntityIncluded: isEntityIncludedByIsActive,
    });

    expect(diff.toUpdate).toEqual([{ id: '1', name: 'Object 1' }]);
  });
});
