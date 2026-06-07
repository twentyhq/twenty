import { type CalendarEventRecordingPolicyInput } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-input.type';
import { resolveCalendarEventRecordingPolicyResult } from 'src/modules/calendar/calendar-event-recording-manager/utils/resolve-calendar-event-recording-policy-result.util';

const NOW = new Date('2026-06-05T10:00:00.000Z');
const FUTURE = '2026-06-05T11:00:00.000Z';
const PAST = '2026-06-05T09:00:00.000Z';

const buildPolicyInput = (
  overrides: Partial<CalendarEventRecordingPolicyInput> = {},
): CalendarEventRecordingPolicyInput => ({
  recordingPreference: 'AUTO',
  isCanceled: false,
  startsAt: FUTURE,
  endsAt: FUTURE,
  conferenceLinkUrl: 'https://meet.google.com/abc-defg-hij',
  hasExternalParticipant: true,
  ...overrides,
});

const resolvePolicyResult = (
  input: CalendarEventRecordingPolicyInput,
  isRecordingEnabledForWorkspace = true,
) =>
  resolveCalendarEventRecordingPolicyResult({
    input,
    now: NOW,
    isRecordingEnabledForWorkspace,
  });

describe('resolveCalendarEventRecordingPolicyResult', () => {
  describe('AUTO preference', () => {
    it('should request recording when AUTO matches every policy condition', () => {
      expect(resolvePolicyResult(buildPolicyInput())).toEqual({
        shouldRecord: true,
        reason: 'AUTO_POLICY_MATCHED',
      });
    });

    it('should not request recording when AUTO has no conference link', () => {
      expect(
        resolvePolicyResult(buildPolicyInput({ conferenceLinkUrl: null })),
      ).toEqual({
        shouldRecord: false,
        reason: 'AUTO_MISSING_CONFERENCE_LINK',
      });
    });

    it('should not request recording when AUTO event already ended', () => {
      expect(
        resolvePolicyResult(buildPolicyInput({ startsAt: PAST, endsAt: PAST })),
      ).toEqual({
        shouldRecord: false,
        reason: 'AUTO_EVENT_NOT_UPCOMING',
      });
    });

    it('should not request recording when AUTO event has no external participant', () => {
      expect(
        resolvePolicyResult(
          buildPolicyInput({ hasExternalParticipant: false }),
        ),
      ).toEqual({
        shouldRecord: false,
        reason: 'AUTO_NO_EXTERNAL_PARTICIPANT',
      });
    });

    it('should keep an in-progress meeting eligible via its end time', () => {
      expect(
        resolvePolicyResult(
          buildPolicyInput({ startsAt: PAST, endsAt: FUTURE }),
        ),
      ).toEqual({
        shouldRecord: true,
        reason: 'AUTO_POLICY_MATCHED',
      });
    });
  });

  describe('ON preference', () => {
    it('should request recording even when the AUTO policy would not match', () => {
      expect(
        resolvePolicyResult(
          buildPolicyInput({
            recordingPreference: 'ON',
            conferenceLinkUrl: null,
            hasExternalParticipant: false,
          }),
        ),
      ).toEqual({ shouldRecord: true, reason: 'PREFERENCE_ON' });
    });

    it('should not request recording when the event already ended', () => {
      expect(
        resolvePolicyResult(
          buildPolicyInput({
            recordingPreference: 'ON',
            startsAt: PAST,
            endsAt: PAST,
          }),
        ),
      ).toEqual({
        shouldRecord: false,
        reason: 'PREFERENCE_ON_EVENT_NOT_UPCOMING',
      });
    });
  });

  describe('OFF preference', () => {
    it('should not request recording for this event', () => {
      expect(
        resolvePolicyResult(buildPolicyInput({ recordingPreference: 'OFF' })),
      ).toEqual({ shouldRecord: false, reason: 'PREFERENCE_OFF' });
    });
  });

  describe('global guards', () => {
    it('should not request recording when recording is disabled for the workspace, ignoring ON', () => {
      expect(
        resolvePolicyResult(
          buildPolicyInput({ recordingPreference: 'ON' }),
          false,
        ),
      ).toEqual({
        shouldRecord: false,
        reason: 'WORKSPACE_RECORDING_DISABLED',
      });
    });

    it('should not request recording for a canceled event, ignoring ON', () => {
      expect(
        resolvePolicyResult(
          buildPolicyInput({ recordingPreference: 'ON', isCanceled: true }),
        ),
      ).toEqual({ shouldRecord: false, reason: 'EVENT_CANCELED' });
    });
  });
});
