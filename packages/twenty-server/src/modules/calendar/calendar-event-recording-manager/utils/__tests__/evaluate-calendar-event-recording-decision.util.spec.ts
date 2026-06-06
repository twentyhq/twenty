import { type CalendarEventRecordingPolicyInput } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-input.type';
import { evaluateCalendarEventRecordingDecision } from 'src/modules/calendar/calendar-event-recording-manager/utils/evaluate-calendar-event-recording-decision.util';

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

const evaluate = (
  input: CalendarEventRecordingPolicyInput,
  isRecordingEnabledForWorkspace = true,
) =>
  evaluateCalendarEventRecordingDecision({
    input,
    now: NOW,
    isRecordingEnabledForWorkspace,
  });

describe('evaluateCalendarEventRecordingDecision', () => {
  describe('AUTO preference', () => {
    it('should request recording when AUTO matches every policy condition', () => {
      expect(evaluate(buildPolicyInput())).toEqual({
        eventIntent: 'ACTIVE',
        reason: 'AUTO_POLICY_MATCHED',
      });
    });

    it('should not request recording when AUTO has no conference link', () => {
      expect(evaluate(buildPolicyInput({ conferenceLinkUrl: null }))).toEqual({
        eventIntent: 'CANCELED',
        reason: 'AUTO_MISSING_CONFERENCE_LINK',
      });
    });

    it('should not request recording when AUTO event already ended', () => {
      expect(
        evaluate(buildPolicyInput({ startsAt: PAST, endsAt: PAST })),
      ).toEqual({
        eventIntent: 'CANCELED',
        reason: 'AUTO_EVENT_NOT_UPCOMING',
      });
    });

    it('should not request recording when AUTO event has no external participant', () => {
      expect(
        evaluate(buildPolicyInput({ hasExternalParticipant: false })),
      ).toEqual({
        eventIntent: 'CANCELED',
        reason: 'AUTO_NO_EXTERNAL_PARTICIPANT',
      });
    });

    it('should treat an unknown preference as AUTO', () => {
      expect(
        evaluate(buildPolicyInput({ recordingPreference: 'SOMETHING_ELSE' })),
      ).toEqual({
        eventIntent: 'ACTIVE',
        reason: 'AUTO_POLICY_MATCHED',
      });
    });

    it('should keep an in-progress meeting eligible via its end time', () => {
      expect(
        evaluate(buildPolicyInput({ startsAt: PAST, endsAt: FUTURE })),
      ).toEqual({
        eventIntent: 'ACTIVE',
        reason: 'AUTO_POLICY_MATCHED',
      });
    });
  });

  describe('ON preference', () => {
    it('should request recording even when the AUTO policy would not match', () => {
      expect(
        evaluate(
          buildPolicyInput({
            recordingPreference: 'ON',
            conferenceLinkUrl: null,
            hasExternalParticipant: false,
          }),
        ),
      ).toEqual({ eventIntent: 'ACTIVE', reason: 'PREFERENCE_ON' });
    });

    it('should not request recording when the event already ended', () => {
      expect(
        evaluate(
          buildPolicyInput({
            recordingPreference: 'ON',
            startsAt: PAST,
            endsAt: PAST,
          }),
        ),
      ).toEqual({
        eventIntent: 'CANCELED',
        reason: 'PREFERENCE_ON_EVENT_NOT_UPCOMING',
      });
    });
  });

  describe('OFF preference', () => {
    it('should cancel recording intent for this event', () => {
      expect(
        evaluate(buildPolicyInput({ recordingPreference: 'OFF' })),
      ).toEqual({ eventIntent: 'CANCELED', reason: 'PREFERENCE_OFF' });
    });
  });

  describe('global guards', () => {
    it('should cancel intent when recording is disabled for the workspace, ignoring ON', () => {
      expect(
        evaluate(buildPolicyInput({ recordingPreference: 'ON' }), false),
      ).toEqual({
        eventIntent: 'CANCELED',
        reason: 'WORKSPACE_RECORDING_DISABLED',
      });
    });

    it('should cancel intent for a canceled event, ignoring ON', () => {
      expect(
        evaluate(
          buildPolicyInput({ recordingPreference: 'ON', isCanceled: true }),
        ),
      ).toEqual({ eventIntent: 'CANCELED', reason: 'EVENT_CANCELED' });
    });
  });
});
