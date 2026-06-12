import { recordTabs } from './record-tabs';
import { type RecordPageDefinition } from '../../types';

const basePage: RecordPageDefinition = {
  type: 'record',
  header: { title: 'Anthropic' },
  record: { name: 'Anthropic', createdAt: 'Added 3 months ago', fields: [], relations: [] },
  notes: [],
};

const note = { id: 'note-1', title: 'Kickoff', body: 'Notes body' };

describe('recordTabs.getAvailable', () => {
  it('should expose only tabs whose panels have content', () => {
    const page: RecordPageDefinition = {
      ...basePage,
      notes: [note],
      tasks: [
        {
          id: 'task-1',
          title: 'Follow up',
          body: 'Send recap',
          due: 'Tomorrow',
          target: { name: 'Anthropic', domain: 'anthropic.com' },
        },
      ],
    };

    expect(recordTabs.getAvailable(page).map((tab) => tab.label)).toEqual([
      'Tasks',
      'Notes',
    ]);
  });

  it('should keep the authored tab order when everything is populated', () => {
    const page: RecordPageDefinition = {
      ...basePage,
      notes: [note],
      timeline: [
        {
          kind: 'created',
          id: 'event-1',
          subject: 'Anthropic',
          actor: 'Lucie',
          time: '2:30 PM',
        },
      ],
      tasks: [
        {
          id: 'task-1',
          title: 'Follow up',
          body: 'Send recap',
          due: 'Tomorrow',
          target: { name: 'Anthropic' },
        },
      ],
      files: [
        { id: 'file-1', name: 'MSA.pdf', category: 'pdf', date: '2 Jun' },
      ],
      emails: [
        {
          id: 'email-1',
          participants: [{ name: 'Dario' }],
          count: 3,
          subject: 'Renewal',
          body: 'Thanks for the call',
          date: '2 Jun',
        },
      ],
      calendar: [
        {
          id: 'day-1',
          weekday: 'Mon',
          day: '9',
          events: [
            {
              id: 'cal-1',
              start: '9:00',
              end: '9:30',
              title: 'Sync',
              participants: [{ name: 'Dario' }],
            },
          ],
        },
      ],
    };

    expect(recordTabs.getAvailable(page).map((tab) => tab.label)).toEqual([
      'Timeline',
      'Tasks',
      'Notes',
      'Files',
      'Emails',
      'Calendar',
    ]);
  });

  it('should return no tabs for an empty record', () => {
    expect(recordTabs.getAvailable(basePage)).toEqual([]);
  });
});
