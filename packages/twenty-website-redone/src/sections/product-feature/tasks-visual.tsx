'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useState, type ComponentType } from 'react';

import { PRODUCT_FEATURE_SCENE } from '@/tokens/feature-scenes/product-feature-scene';

const scene = PRODUCT_FEATURE_SCENE.activity;

const Root = styled.div`
  background-color: ${scene.background};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const TabBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${scene.tabLine};
  display: flex;
  gap: 0;
  padding: 0 16px;
`;

const Tab = styled.span`
  align-items: center;
  color: ${scene.inkMuted};
  display: flex;
  font-size: 12px;
  font-weight: 500;
  gap: 6px;
  padding: 12px 14px;
  position: relative;
  white-space: nowrap;

  &[data-active] {
    background-color: ${scene.activeTabWash};
    border-radius: 6px 6px 0 0;
    color: ${scene.ink};
  }

  svg {
    height: 13px;
    opacity: 0.7;
    width: 13px;
  }

  &[data-active] svg {
    opacity: 1;
  }
`;

const SectionHeader = styled.div`
  color: ${scene.inkGhost};
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
  color: ${scene.inkGhost};
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
  color: ${scene.ink};
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
`;

const ActionText = styled.span`
  color: ${scene.inkMuted};
  font-size: 12px;
  white-space: nowrap;
`;

const TaskChip = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 5px;
  white-space: nowrap;
`;

const TaskCircle = styled.span`
  align-items: center;
  border: 1.5px solid ${scene.circleBorder};
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
    border-color: ${scene.circleBorderHover};
  }

  &[data-filled] {
    background-color: ${scene.taskCircleFill};
    border-color: ${scene.taskCircleFill};
  }

  &[data-filled]:hover {
    background-color: ${scene.taskCircleFillHover};
    border-color: ${scene.taskCircleFillHover};
  }
`;

const TaskName = styled.span`
  color: ${scene.inkBody};
  font-size: 12px;

  &[data-strikethrough] {
    text-decoration: line-through;
    text-decoration-color: ${scene.strikethrough};
  }
`;

const Timestamp = styled.span`
  color: ${scene.inkDim};
  flex-shrink: 0;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  margin-left: auto;
  padding-left: 12px;
  white-space: nowrap;
`;

// The window's mini tab glyphs (authored scene artwork, verbatim).
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

const ACTIVE_TAB_NUMBER = 1;

type Activity = {
  action: string;
  actor: string;
  icon: ComponentType;
  task: string;
  time: string;
};

// Mock fiction activity feed (product-screenshot copy, English).
const ACTIVITIES: Activity[] = [
  {
    icon: IconComment,
    actor: 'Tim Cook',
    action: 'commented',
    task: 'Send NDA to Steve Anavi',
    time: '10 mins ago',
  },
  {
    icon: IconComment,
    actor: 'Tim Cook',
    action: 'deleted',
    task: 'Send NDA to Steve Anavi',
    time: '10 mins ago',
  },
  {
    icon: IconCheck,
    actor: 'Tim Cook',
    action: 'completed',
    task: 'Send NDA to Steve Anavi',
    time: '10 mins ago',
  },
  {
    icon: IconComment,
    actor: 'Tim Cook',
    action: 'has been assigned to',
    task: 'Call back Steve about Qonto pricing',
    time: '18:34',
  },
  {
    icon: IconPencil,
    actor: 'Tim Cook',
    action: 'Edited',
    task: 'Call back Steve about Qonto pricing',
    time: '18:34',
  },
];

// The middle activities start completed, matching the feed's story.
const INITIALLY_COMPLETED: Record<number, boolean> = { 1: true, 2: true };

export function TasksVisual({ active: _active }: { active: boolean }) {
  const { i18n } = useLingui();
  const [completed, setCompleted] =
    useState<Record<number, boolean>>(INITIALLY_COMPLETED);

  const toggleComplete = (activityNumber: number) => {
    setCompleted((previous) => ({
      ...previous,
      [activityNumber]: !previous[activityNumber],
    }));
  };

  const activities = ACTIVITIES.map((activity, activityNumber) => ({
    activity,
    activityNumber,
  }));

  return (
    <Root>
      <TabBar>
        {TABS.map((tab, tabNumber) => {
          const Icon = tab.icon;
          return (
            <Tab
              data-active={tabNumber === ACTIVE_TAB_NUMBER ? '' : undefined}
              key={tab.label}
            >
              <Icon />
              {tab.label}
            </Tab>
          );
        })}
      </TabBar>
      <SectionHeader>August</SectionHeader>
      <ActivityList>
        {activities.map(({ activity, activityNumber }) => {
          const Icon = activity.icon;
          const isCompleted = Boolean(completed[activityNumber]);
          return (
            <ActivityRow key={activityNumber}>
              <ActivityIcon>
                <Icon />
              </ActivityIcon>
              <ActivityBody>
                <ActorName>{activity.actor}</ActorName>
                <ActionText>{activity.action}</ActionText>
                <TaskChip>
                  <TaskCircle
                    aria-label={
                      isCompleted
                        ? i18n._(msg`Mark incomplete`)
                        : i18n._(msg`Mark complete`)
                    }
                    data-filled={isCompleted ? '' : undefined}
                    onClick={() => toggleComplete(activityNumber)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleComplete(activityNumber);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    {isCompleted ? (
                      <svg
                        fill="none"
                        height="7"
                        stroke={scene.inkOnFill}
                        strokeLinecap="round"
                        strokeWidth="2"
                        viewBox="0 0 10 10"
                        width="7"
                      >
                        <path d="M2 5.5L4.2 7.5L8 3" />
                      </svg>
                    ) : null}
                  </TaskCircle>
                  <TaskName data-strikethrough={isCompleted ? '' : undefined}>
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
