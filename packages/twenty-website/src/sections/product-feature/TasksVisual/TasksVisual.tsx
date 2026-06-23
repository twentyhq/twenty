'use client';

import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

import { RecordTabHeader } from '../RecordTabHeader';
import { TaskRow } from './components/TaskRow';
import { TASK_GROUPS } from './data/task-groups';

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

  & + & {
    margin-top: 8px;
  }
`;

const GroupHeader = styled.div`
  align-items: center;
  color: ${THEME_LIGHT.font.color.light};
  display: flex;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.sm)};
  font-weight: ${THEME_LIGHT.font.weight.semiBold};
  gap: 6px;
  padding: 0 16px 4px;
`;

const GroupCount = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-weight: ${THEME_LIGHT.font.weight.medium};
`;

export function TasksVisual({ active: _active }: { active: boolean }) {
  return (
    <Root>
      <RecordTabHeader active="Tasks" />
      <Panel>
        {TASK_GROUPS.map((group) => (
          <Group key={group.label}>
            <GroupHeader>
              {group.label}
              <GroupCount>{group.items.length}</GroupCount>
            </GroupHeader>
            {group.items.map((task) => (
              <TaskRow key={task.title} task={task} />
            ))}
          </Group>
        ))}
      </Panel>
    </Root>
  );
}
