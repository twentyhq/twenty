import { computeTargetReconciliationOperations } from 'src/modules/match-participant/utils/compute-target-reconciliation-operations.util';

const personTarget = {
  parentId: 'parent-1',
  targetPersonId: 'person-1',
  targetCompanyId: null,
  targetOpportunityId: null,
};

describe('computeTargetReconciliationOperations', () => {
  it('creates missing automatic targets', () => {
    expect(
      computeTargetReconciliationOperations({
        desiredTargets: [personTarget],
        existingTargets: [],
      }),
    ).toEqual({
      targetsToCreate: [personTarget],
      targetsToMarkAutomatic: [],
      targetsToMarkNotAutomatic: [],
      targetIdsToDelete: [],
    });
  });

  it('does not recreate an explicitly deleted target', () => {
    expect(
      computeTargetReconciliationOperations({
        desiredTargets: [personTarget],
        existingTargets: [
          {
            ...personTarget,
            id: 'target-1',
            deletedAt: new Date('2026-01-01'),
            isAutomaticallyAssigned: true,
            isManuallyAssigned: false,
          },
        ],
      }),
    ).toEqual({
      targetsToCreate: [],
      targetsToMarkAutomatic: [],
      targetsToMarkNotAutomatic: [],
      targetIdsToDelete: [],
    });
  });

  it('adds automatic provenance to an existing manual target', () => {
    expect(
      computeTargetReconciliationOperations({
        desiredTargets: [personTarget],
        existingTargets: [
          {
            ...personTarget,
            id: 'target-1',
            deletedAt: null,
            isAutomaticallyAssigned: false,
            isManuallyAssigned: true,
          },
        ],
      }).targetsToMarkAutomatic,
    ).toEqual(['target-1']);
  });

  it('keeps a manual target when its automatic reason disappears', () => {
    expect(
      computeTargetReconciliationOperations({
        desiredTargets: [],
        existingTargets: [
          {
            ...personTarget,
            id: 'target-1',
            deletedAt: null,
            isAutomaticallyAssigned: true,
            isManuallyAssigned: true,
          },
        ],
      }).targetsToMarkNotAutomatic,
    ).toEqual(['target-1']);
  });

  it('hard-deletes an obsolete automatic-only target', () => {
    expect(
      computeTargetReconciliationOperations({
        desiredTargets: [],
        existingTargets: [
          {
            ...personTarget,
            id: 'target-1',
            deletedAt: null,
            isAutomaticallyAssigned: true,
            isManuallyAssigned: false,
          },
        ],
      }).targetIdsToDelete,
    ).toEqual(['target-1']);
  });

  it('deduplicates desired targets', () => {
    expect(
      computeTargetReconciliationOperations({
        desiredTargets: [personTarget, personTarget],
        existingTargets: [],
      }).targetsToCreate,
    ).toEqual([personTarget]);
  });
});
