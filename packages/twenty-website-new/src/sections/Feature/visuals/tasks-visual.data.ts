export const TASKS = [
  {
    assignee: 'SN',
    done: false,
    dueDate: 'Today',
    overdue: true,
    title: 'Send NDA to Steve Aravi',
  },
  {
    assignee: 'JL',
    done: true,
    dueDate: 'Yesterday',
    overdue: false,
    title: 'Call back Steve about Qonto pricing',
  },
  {
    assignee: 'SN',
    done: false,
    dueDate: 'Tomorrow',
    overdue: false,
    title: 'Prepare deck for Q3 review',
  },
  {
    assignee: 'MK',
    done: true,
    dueDate: '2 days ago',
    overdue: false,
    title: 'Update contact info for Acme Corp',
  },
  {
    assignee: 'JL',
    done: false,
    dueDate: 'Friday',
    overdue: false,
    title: 'Follow up on partnership proposal',
  },
];

export const TABS = ['Timeline', 'Tasks', 'Notes', 'Files', 'Emails'];

export const AVATAR_COLORS: Record<string, string> = {
  JL: '#6366f1',
  MK: '#f59e0b',
  SN: '#16a34a',
};
