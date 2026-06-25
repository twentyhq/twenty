'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

import { RecordTabHeader } from '../components/RecordTabHeader';
import { AddTaskButton } from './components/AddTaskButton';
import { TaskRow } from './components/TaskRow';
import { TASKS } from './data/tasks';
import { toggleTaskDone } from './utils/toggle-task-done';

const Root = styled.div`
  background-color: ${THEME_LIGHT.background.primary};
  display: flex;
  flex-direction: column;
  font-family: var(--font-product), sans-serif;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const Panel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 8px 0;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px;
`;

const GroupHeader = styled.div`
  align-items: center;
  color: ${THEME_LIGHT.font.color.primary};
  display: flex;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.semiBold};
  justify-content: space-between;
  margin: ${THEME_LIGHT.spacing(4)} 0;
`;

const GroupCount = styled.span`
  color: ${THEME_LIGHT.font.color.light};
  margin-left: ${THEME_LIGHT.spacing(2)};
`;

const GroupCard = styled.div`
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  overflow: hidden;

  & > * + * {
    border-top: 1px solid ${THEME_LIGHT.border.color.light};
  }
`;

export function TasksVisual({ active: _active }: { active: boolean }) {
  const { i18n } = useLingui();
  const [tasks, setTasks] = useState(TASKS);

  const handleToggle = (id: string) => {
    setTasks((previous) => toggleTaskDone(previous, id));
  };

  const groups = [
    { id: 'todo', items: tasks.filter((task) => !task.done), label: msg`TODO` },
    { id: 'done', items: tasks.filter((task) => task.done), label: msg`DONE` },
  ];
  const buttonGroupId = groups.find((group) => group.items.length > 0)?.id;

  return (
    <Root>
      <RecordTabHeader active="Tasks" />
      <Panel>
        {groups.map((group) =>
          group.items.length > 0 ? (
            <Group key={group.id}>
              <GroupHeader>
                <span>
                  {i18n._(group.label)}
                  <GroupCount>{group.items.length}</GroupCount>
                </span>
                {group.id === buttonGroupId && <AddTaskButton />}
              </GroupHeader>
              <GroupCard>
                {group.items.map((task) => (
                  <TaskRow
                    key={task.id}
                    onToggle={() => handleToggle(task.id)}
                    task={task}
                  />
                ))}
              </GroupCard>
            </Group>
          ) : null,
        )}
      </Panel>
    </Root>
  );
}
