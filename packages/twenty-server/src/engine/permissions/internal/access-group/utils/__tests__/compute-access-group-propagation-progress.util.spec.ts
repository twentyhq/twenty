import { computeAccessGroupPropagationProgress } from 'src/engine/permissions/internal/access-group/utils/compute-access-group-propagation-progress.util';

describe('computeAccessGroupPropagationProgress', () => {
  it('should report nothing when no propagation is tracked', () => {
    expect(computeAccessGroupPropagationProgress({})).toEqual({
      totalRecordCount: 0,
      remainingRecordCount: 0,
      isInProgress: false,
    });
  });

  it('should sum the records of every object being recomputed', () => {
    expect(
      computeAccessGroupPropagationProgress({
        'total:person': '1000',
        'remaining:person': '400',
        'touchedAt:person': '1',
        'total:company:propagated': '50',
        'remaining:company:propagated': '0',
        'touchedAt:company:propagated': '1',
      }),
    ).toEqual({
      totalRecordCount: 1050,
      remainingRecordCount: 400,
      isInProgress: true,
    });
  });

  it('should keep the remaining records between zero and the total', () => {
    expect(
      computeAccessGroupPropagationProgress({
        'total:person': '10',
        'remaining:person': '-5',
        'total:company': '10',
        'remaining:company': '25',
      }),
    ).toEqual({
      totalRecordCount: 20,
      remainingRecordCount: 10,
      isInProgress: true,
    });
  });

  it('should be in progress while a sync is pending, without counting it as records', () => {
    expect(
      computeAccessGroupPropagationProgress({
        'remaining:sync': '2',
        'touchedAt:sync': '1',
      }),
    ).toEqual({
      totalRecordCount: 0,
      remainingRecordCount: 0,
      isInProgress: true,
    });
  });

  it('should not be in progress once pending syncs are settled', () => {
    expect(
      computeAccessGroupPropagationProgress({
        'remaining:sync': '-1',
        'total:person': '10',
        'remaining:person': '0',
      }),
    ).toEqual({
      totalRecordCount: 10,
      remainingRecordCount: 0,
      isInProgress: false,
    });
  });
});
