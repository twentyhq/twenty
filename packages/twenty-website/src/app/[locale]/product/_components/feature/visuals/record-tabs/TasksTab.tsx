'use client';

import { styled } from '@linaria/react';
import { IconCalendarEvent, IconCheck } from '@tabler/icons-react';

import { SHARED_PEOPLE_AVATAR_URLS } from '@/content/site/asset-paths';

import {
  CARD_ACCENT,
  CARD_TEXT,
  CARD_TEXT_SECONDARY,
  CARD_TEXT_TERTIARY,
  TEXT_LIGHT,
} from '../visual-tokens';
import { RelAvatar, RelChip } from './record-tab-shared';

const TasksView = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow: hidden;
  padding: 14px 12px;
`;

const TaskSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TaskSectionHeader = styled.div`
  align-items: center;
  color: ${TEXT_LIGHT};
  display: flex;
  font-size: 11px;
  font-weight: 600;
  gap: 6px;
  padding: 0 8px 6px;
`;

const TaskCount = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-weight: 500;
`;

const TaskRow = styled.div`
  align-items: center;
  border-radius: 6px;
  display: flex;
  gap: 10px;
  padding: 8px;
`;

const TaskLeft = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 0;
`;

const TaskCheckbox = styled.span`
  align-items: center;
  background: transparent;
  border: 1px solid ${CARD_TEXT_SECONDARY};
  border-radius: 4px;
  color: #ffffff;
  display: flex;
  flex-shrink: 0;
  height: 15px;
  justify-content: center;
  width: 15px;

  svg {
    height: 11px;
    width: 11px;
  }

  &[data-done='true'] {
    background: ${CARD_ACCENT};
    border-color: ${CARD_ACCENT};
  }
`;

const TaskTitle = styled.span`
  color: ${CARD_TEXT};
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-done='true'] {
    color: ${CARD_TEXT_TERTIARY};
    text-decoration: line-through;
  }
`;

const TaskBody = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 12px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TaskRight = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  padding-left: 10px;
`;

const TaskDue = styled.span`
  align-items: center;
  color: ${CARD_TEXT_SECONDARY};
  display: flex;
  flex-shrink: 0;
  font-size: 11px;
  gap: 4px;
  white-space: nowrap;

  svg {
    height: 13px;
    width: 13px;
  }
`;

const TASKS = [
  {
    status: 'TODO',
    title: 'Send NDA',
    body: 'Loop in legal before sending.',
    due: 'Tomorrow',
    person: {
      name: 'Dario Amodei',
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
    },
  },
  {
    status: 'TODO',
    title: 'Follow up on pricing',
    body: 'Send the updated annual quote.',
    due: 'Jul 24',
    person: {
      name: 'Patrick Collison',
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.patrickCollison,
    },
  },
  {
    status: 'TODO',
    title: 'Onboarding deck',
    body: 'Use the Q3 template.',
    due: 'Jul 26',
    person: {
      name: 'Dylan Field',
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.dylanField,
    },
  },
  {
    status: 'DONE',
    title: 'Schedule security review',
    body: 'Coordinated with the data team.',
    due: 'Jul 18',
    person: {
      name: 'Dario Amodei',
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
    },
  },
];

export function TasksTab() {
  return (
    <TasksView>
      {[
        {
          label: 'To do',
          items: TASKS.filter((task) => task.status === 'TODO'),
        },
        {
          label: 'Done',
          items: TASKS.filter((task) => task.status === 'DONE'),
        },
      ].map((group) => (
        <TaskSection key={group.label}>
          <TaskSectionHeader>
            {group.label}
            <TaskCount>{group.items.length}</TaskCount>
          </TaskSectionHeader>
          {group.items.map((task) => {
            const done = task.status === 'DONE';
            return (
              <TaskRow key={task.title}>
                <TaskLeft>
                  <TaskCheckbox data-done={done}>
                    {done ? <IconCheck /> : null}
                  </TaskCheckbox>
                  <TaskTitle data-done={done}>{task.title}</TaskTitle>
                  <TaskBody>{task.body}</TaskBody>
                </TaskLeft>
                <TaskRight>
                  <TaskDue>
                    <IconCalendarEvent />
                    {task.due}
                  </TaskDue>
                  <RelChip>
                    <RelAvatar alt="" src={task.person.avatarUrl} />
                    {task.person.name}
                  </RelChip>
                </TaskRight>
              </TaskRow>
            );
          })}
        </TaskSection>
      ))}
    </TasksView>
  );
}
