import { CallRecordingRequestStatus } from 'src/modules/call-recording/common/enums/call-recording-request-status.enum';
import { CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';
import { buildCallRecordingCalendarParticipant } from 'src/modules/call-recording/utils/build-call-recording-calendar-participant.util';

const buildCallRecording = (
  overrides: Partial<CallRecordingWorkspaceEntity> = {},
) =>
  ({
    id: '20202020-0000-4000-8000-000000000001',
    calendarEventId: '20202020-0000-4000-8000-000000000002',
    applicationId: '20202020-0000-4000-8000-000000000003',
    externalBotId: 'bot-1',
    status: CallRecordingStatus.SCHEDULED,
    recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
    ...overrides,
  }) as CallRecordingWorkspaceEntity;

describe('buildCallRecordingCalendarParticipant', () => {
  it('represents a scheduled application bot as an accepted calendar participant', () => {
    expect(
      buildCallRecordingCalendarParticipant(
        buildCallRecording(),
        'Call recorder',
      ),
    ).toEqual({
      callRecordingId: '20202020-0000-4000-8000-000000000001',
      calendarEventId: '20202020-0000-4000-8000-000000000002',
      applicationId: '20202020-0000-4000-8000-000000000003',
      handle: 'Call recorder',
      displayName: 'Call recorder',
      isOrganizer: false,
      responseStatus: 'ACCEPTED',
      personId: null,
      workspaceMemberId: null,
      deletedAt: null,
    });
  });

  it.each([
    { calendarEventId: null },
    { applicationId: null },
    { externalBotId: null },
    { externalBotId: '' },
    { externalBotId: ' ' },
    { recordingRequestStatus: CallRecordingRequestStatus.CANCELED },
    { status: CallRecordingStatus.NOT_RECORDED },
  ])(
    'does not create a participant for an unscheduled bot: %j',
    (overrides) => {
      expect(
        buildCallRecordingCalendarParticipant(
          buildCallRecording(overrides),
          'Call recorder',
        ),
      ).toBeUndefined();
    },
  );

  it('keeps a completed recording bot in the meeting participants', () => {
    expect(
      buildCallRecordingCalendarParticipant(
        buildCallRecording({ status: CallRecordingStatus.COMPLETED }),
        'Call recorder',
      ),
    ).toMatchObject({ responseStatus: 'ACCEPTED' });
  });

  it('uses the existing declined response status when the bot fails', () => {
    expect(
      buildCallRecordingCalendarParticipant(
        buildCallRecording({ status: CallRecordingStatus.FAILED }),
        'Call recorder',
      ),
    ).toMatchObject({ responseStatus: 'DECLINED' });
  });
});
