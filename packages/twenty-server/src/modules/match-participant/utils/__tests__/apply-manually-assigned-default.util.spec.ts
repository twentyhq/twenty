import { applyManuallyAssignedDefault } from 'src/modules/match-participant/utils/apply-manually-assigned-default.util';

describe('applyManuallyAssignedDefault', () => {
  it('defaults an attachment without provenance to manually assigned', () => {
    expect(
      applyManuallyAssignedDefault({
        messageThreadId: 'thread-id',
        targetPersonId: 'person-id',
      }),
    ).toEqual({
      messageThreadId: 'thread-id',
      targetPersonId: 'person-id',
      isManuallyAssigned: true,
    });
  });

  it('preserves an explicit caller-provided provenance', () => {
    expect(
      applyManuallyAssignedDefault({
        calendarEventId: 'event-id',
        targetCompanyId: 'company-id',
        isManuallyAssigned: false,
      }),
    ).toEqual({
      calendarEventId: 'event-id',
      targetCompanyId: 'company-id',
      isManuallyAssigned: false,
    });
  });
});
