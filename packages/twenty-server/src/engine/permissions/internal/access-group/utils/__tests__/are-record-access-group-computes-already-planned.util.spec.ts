import { areRecordAccessGroupComputesAlreadyPlanned } from 'src/engine/permissions/internal/access-group/utils/are-record-access-group-computes-already-planned.util';

describe('areRecordAccessGroupComputesAlreadyPlanned', () => {
  it('should be true when the waiting computes hold the new ones in the same order', () => {
    expect(
      areRecordAccessGroupComputesAlreadyPlanned({
        waitingObjectMetadataIds: ['company', 'note', 'person', 'task'],
        objectMetadataIds: ['company', 'person'],
      }),
    ).toBe(true);
  });

  it('should be false when a new compute is not waiting', () => {
    expect(
      areRecordAccessGroupComputesAlreadyPlanned({
        waitingObjectMetadataIds: ['company'],
        objectMetadataIds: ['company', 'person'],
      }),
    ).toBe(false);
  });

  it('should be false when the waiting computes are in another order', () => {
    expect(
      areRecordAccessGroupComputesAlreadyPlanned({
        waitingObjectMetadataIds: ['person', 'company'],
        objectMetadataIds: ['company', 'person'],
      }),
    ).toBe(false);
  });

  it('should need one waiting compute per new compute of the same object', () => {
    expect(
      areRecordAccessGroupComputesAlreadyPlanned({
        waitingObjectMetadataIds: ['company', 'person'],
        objectMetadataIds: ['company', 'person', 'company'],
      }),
    ).toBe(false);
  });
});
