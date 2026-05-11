'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import {
  BG_PANEL,
  BORDER_COLOR,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from './visual-tokens';
import { AVATAR_COLORS, TABS, TASKS } from './tasks-visual.data';
import { WindowChrome } from './WindowChrome';

const TabBar = styled.div`
  border-bottom: 1px solid ${BORDER_COLOR};
  display: flex;
  flex-shrink: 0;
  gap: 0;
  overflow-x: auto;
`;

const Tab = styled.button`
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: ${TEXT_MUTED};
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding: 10px 14px;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
  white-space: nowrap;

  &[data-active='true'] {
    border-bottom-color: ${TEXT_PRIMARY};
    color: ${TEXT_PRIMARY};
  }

  &:hover {
    color: ${TEXT_SECONDARY};
  }
`;

const TaskList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: 6px 0;
`;

const TaskRow = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 10px;
  padding: 8px 16px;
  transition: background-color 0.1s ease;

  &:hover {
    background-color: ${BG_PANEL};
  }
`;

const Checkbox = styled.div`
  align-items: center;
  border: 1.5px solid ${TEXT_MUTED};
  border-radius: 4px;
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
  width: 16px;

  &[data-checked='true'] {
    background-color: #16a34a;
    border-color: #16a34a;
  }
`;

const CheckMark = styled.svg`
  height: 10px;
  width: 10px;
`;

const TaskTitle = styled.span`
  flex: 1;
  font-size: 12px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  transition:
    color 0.15s ease,
    text-decoration 0.15s ease;
  white-space: nowrap;

  &[data-checked='true'] {
    color: ${TEXT_MUTED};
    text-decoration: line-through;
  }

  &[data-checked='false'] {
    color: ${TEXT_PRIMARY};
  }
`;

const Avatar = styled.span`
  align-items: center;
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 700;
  height: 22px;
  justify-content: center;
  letter-spacing: 0.02em;
  width: 22px;
`;

const DueDate = styled.span`
  flex-shrink: 0;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;

  &[data-overdue='true'] {
    color: #ef4444;
  }

  &[data-overdue='false'] {
    color: ${TEXT_MUTED};
  }
`;

type TasksVisualProps = {
  active: boolean;
};

export function TasksVisual({ active }: TasksVisualProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    TASKS.forEach((task, index) => {
      initial[index] = task.done;
    });
    return initial;
  });

  const [activeTab, setActiveTab] = useState(1);

  const toggleTask = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <WindowChrome
      breadcrumb="Contacts"
      breadcrumbBold="Steve Aravi"
      title="Apple"
    >
      <TabBar>
        {TABS.map((tab, index) => (
          <Tab
            data-active={index === activeTab}
            key={tab}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </Tab>
        ))}
      </TabBar>
      <TaskList>
        {TASKS.map((task, index) => {
          const isChecked = checked[index] ?? task.done;
          const avatarColor = AVATAR_COLORS[task.assignee] ?? TEXT_MUTED;

          return (
            <TaskRow key={index} onClick={() => toggleTask(index)}>
              <Checkbox data-checked={isChecked}>
                {isChecked ? (
                  <CheckMark fill="none" viewBox="0 0 10 10">
                    <path
                      d="M2 5.5L4 7.5L8 3"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                  </CheckMark>
                ) : null}
              </Checkbox>
              <TaskTitle data-checked={isChecked}>{task.title}</TaskTitle>
              <Avatar
                style={{
                  backgroundColor: `${avatarColor}22`,
                  color: avatarColor,
                }}
              >
                {task.assignee}
              </Avatar>
              <DueDate data-overdue={task.overdue && !isChecked}>
                {task.dueDate}
              </DueDate>
            </TaskRow>
          );
        })}
      </TaskList>
    </WindowChrome>
  );
}
