import { canObjectBeManagedByAutomation } from '@/workflow/utils/canObjectBeManagedByAutomation';

describe('canObjectBeManagedByAutomation', () => {
  it('should return true for a standard non-blocked object', () => {
    expect(canObjectBeManagedByAutomation({ nameSingular: 'company' })).toBe(
      true,
    );
  });

  it('should return true for noteTarget and taskTarget', () => {
    expect(canObjectBeManagedByAutomation({ nameSingular: 'noteTarget' })).toBe(
      true,
    );
    expect(canObjectBeManagedByAutomation({ nameSingular: 'taskTarget' })).toBe(
      true,
    );
  });

  it('should return true for attachment and timelineActivity', () => {
    expect(canObjectBeManagedByAutomation({ nameSingular: 'attachment' })).toBe(
      true,
    );
    expect(
      canObjectBeManagedByAutomation({ nameSingular: 'timelineActivity' }),
    ).toBe(true);
  });

  it.each([
    'workflow',
    'workflowVersion',
    'workflowRun',
    'workflowAutomatedTrigger',
    'workspaceMember',
    'dashboard',
    'message',
    'messageThread',
    'messageChannelMessageAssociation',
    'messageParticipant',
    'calendarEvent',
    'calendarEventParticipant',
    'calendarChannelEventAssociation',
  ])('should return false for %s', (nameSingular) => {
    expect(canObjectBeManagedByAutomation({ nameSingular })).toBe(false);
  });
});
