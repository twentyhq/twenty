'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

const Root = styled.div`
  background-color: #191920;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const TabBar = styled.div`
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 0;
  padding: 0 16px;
`;

const Tab = styled.span`
  align-items: center;
  color: rgba(255, 255, 255, 0.45);
  display: flex;
  font-size: 12px;
  font-weight: 500;
  gap: 6px;
  padding: 12px 14px;
  position: relative;
  white-space: nowrap;

  &[data-active='true'] {
    background-color: rgba(255, 255, 255, 0.06);
    border-radius: 6px 6px 0 0;
    color: rgba(255, 255, 255, 0.9);
  }

  svg {
    height: 13px;
    opacity: 0.7;
    width: 13px;
  }

  &[data-active='true'] svg {
    opacity: 1;
  }
`;

const SectionHeader = styled.div`
  color: rgba(255, 255, 255, 0.35);
  font-size: 11px;
  font-weight: 500;
  padding: 14px 20px 8px;
`;

const ActivityList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const ActivityRow = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
  padding: 10px 20px;
`;

const ActivityIcon = styled.div`
  align-items: center;
  color: rgba(255, 255, 255, 0.35);
  display: flex;
  flex-shrink: 0;
  height: 18px;
  justify-content: center;
  width: 18px;

  svg {
    height: 14px;
    width: 14px;
  }
`;

const ActivityBody = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
`;

const ActorName = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
`;

const ActionText = styled.span`
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  white-space: nowrap;
`;

const TaskChip = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 5px;
  white-space: nowrap;
`;

const TaskCircleEl = styled.span`
  align-items: center;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  height: 12px;
  justify-content: center;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
  width: 12px;

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
  }

  &[data-filled='true'] {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }

  &[data-filled='true']:hover {
    background-color: #2563eb;
    border-color: #2563eb;
  }
`;

const TaskName = styled.span`
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;

  &[data-strikethrough='true'] {
    text-decoration: line-through;
    text-decoration-color: rgba(255, 255, 255, 0.4);
  }
`;

const Timestamp = styled.span`
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  margin-left: auto;
  padding-left: 12px;
  white-space: nowrap;
`;

function IconTimeline() {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      viewBox="0 0 16 16"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8l2.5 1.5" />
    </svg>
  );
}

function IconTasks() {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      viewBox="0 0 16 16"
    >
      <rect height="10" rx="2" width="10" x="3" y="3" />
      <path d="M6 8l1.5 1.5L10 7" />
    </svg>
  );
}

function IconNotes() {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      viewBox="0 0 16 16"
    >
      <path d="M4 4h8M4 7h8M4 10h5" />
    </svg>
  );
}

function IconFiles() {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      viewBox="0 0 16 16"
    >
      <path d="M3 8.5a3 3 0 0 1 3-3h4.5a2 2 0 0 1 0 4H6.5a1 1 0 0 1 0-2H11" />
    </svg>
  );
}

function IconEmails() {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      viewBox="0 0 16 16"
    >
      <rect height="9" rx="2" width="12" x="2" y="3.5" />
      <path d="M2 5.5l6 4 6-4" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      viewBox="0 0 16 16"
    >
      <rect height="10" rx="2" width="10" x="3" y="3" />
      <path d="M3 7h10M6 2v2M10 2v2" />
    </svg>
  );
}

function IconComment() {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      viewBox="0 0 16 16"
    >
      <path d="M3 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6l-3 2.5V4z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.8"
      viewBox="0 0 16 16"
    >
      <path d="M4 8.5l3 3 5-6" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      viewBox="0 0 16 16"
    >
      <path d="M10.5 3.5l2 2M4 10l6.5-6.5 2 2L6 12H4v-2z" />
    </svg>
  );
}

const TABS = [
  { label: 'Timeline', icon: IconTimeline },
  { label: 'Tasks', icon: IconTasks },
  { label: 'Notes', icon: IconNotes },
  { label: 'Files', icon: IconFiles },
  { label: 'Emails', icon: IconEmails },
  { label: 'Calendar', icon: IconCalendar },
];

const ACTIVITIES = [
  {
    icon: IconComment,
    actor: 'Tim Cook',
    action: 'commented',
    task: 'Send NDA to Steve Anavi',
    filled: false,
    strikethrough: false,
    time: '10 mins ago',
  },
  {
    icon: IconComment,
    actor: 'Tim Cook',
    action: 'deleted',
    task: 'Send NDA to Steve Anavi',
    filled: true,
    strikethrough: true,
    time: '10 mins ago',
  },
  {
    icon: IconCheck,
    actor: 'Tim Cook',
    action: 'completed',
    task: 'Send NDA to Steve Anavi',
    filled: true,
    strikethrough: true,
    time: '10 mins ago',
  },
  {
    icon: IconComment,
    actor: 'Tim Cook',
    action: 'has been assigned to',
    task: 'Call back Steve about Qonto pricing',
    filled: false,
    strikethrough: false,
    time: '18:34',
  },
  {
    icon: IconPencil,
    actor: 'Tim Cook',
    action: 'Edited',
    task: 'Call back Steve about Qonto pricing',
    filled: false,
    strikethrough: false,
    time: '18:34',
  },
];

type TasksVisualProps = {
  active: boolean;
};

export function TasksVisual({ active: _active }: TasksVisualProps) {
  const [completed, setCompleted] = useState<Record<number, boolean>>({
    1: true,
    2: true,
  });

  const toggleComplete = (index: number) => {
    setCompleted((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Root>
      <TabBar>
        {TABS.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <Tab data-active={index === 1} key={tab.label}>
              <Icon />
              {tab.label}
            </Tab>
          );
        })}
      </TabBar>
      <SectionHeader>August</SectionHeader>
      <ActivityList>
        {ACTIVITIES.map((activity, index) => {
          const Icon = activity.icon;
          const isCompleted = !!completed[index];
          return (
            <ActivityRow key={index}>
              <ActivityIcon>
                <Icon />
              </ActivityIcon>
              <ActivityBody>
                <ActorName>{activity.actor}</ActorName>
                <ActionText>{activity.action}</ActionText>
                <TaskChip>
                  <TaskCircleEl
                    aria-label={
                      isCompleted ? 'Mark incomplete' : 'Mark complete'
                    }
                    data-filled={isCompleted}
                    onClick={() => toggleComplete(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleComplete(index);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    {isCompleted && (
                      <svg
                        fill="none"
                        height="7"
                        stroke="white"
                        strokeLinecap="round"
                        strokeWidth="2"
                        viewBox="0 0 10 10"
                        width="7"
                      >
                        <path d="M2 5.5L4.2 7.5L8 3" />
                      </svg>
                    )}
                  </TaskCircleEl>
                  <TaskName data-strikethrough={isCompleted}>
                    {activity.task}
                  </TaskName>
                </TaskChip>
              </ActivityBody>
              <Timestamp>{activity.time}</Timestamp>
            </ActivityRow>
          );
        })}
      </ActivityList>
    </Root>
  );
}
