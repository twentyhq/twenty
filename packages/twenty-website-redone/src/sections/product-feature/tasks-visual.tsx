import { styled } from '@linaria/react';
import {
  IconCalendarEvent,
  IconCheck,
  IconCheckbox,
  IconMail,
  IconNotes,
  IconPaperclip,
  IconTimelineEvent,
} from '@tabler/icons-react';

import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';
import { PRODUCT_FEATURE_PALETTE } from '@/tokens/feature-scenes/product-feature-palette';

const palette = PRODUCT_FEATURE_PALETTE;
const avatars = sharedAssetUrls.peopleAvatars;

// The product's six record tabs. Only Tasks is active here — the others are
// context (this visual owns its own tab content, nothing else).
const RECORD_TABS = [
  { icon: IconTimelineEvent, label: 'Timeline' },
  { icon: IconCheckbox, label: 'Tasks' },
  { icon: IconNotes, label: 'Notes' },
  { icon: IconPaperclip, label: 'Files' },
  { icon: IconMail, label: 'Emails' },
  { icon: IconCalendarEvent, label: 'Calendar' },
];

const ACTIVE_TAB = 'Tasks';

type Task = {
  assignee: { avatarUrl: string; name: string };
  body: string;
  done: boolean;
  due: string;
  title: string;
};

const TASKS: Task[] = [
  {
    assignee: { avatarUrl: avatars.darioAmodei, name: 'Dario Amodei' },
    body: 'Loop in legal before sending.',
    done: false,
    due: 'Tomorrow',
    title: 'Send NDA',
  },
  {
    assignee: { avatarUrl: avatars.patrickCollison, name: 'Patrick Collison' },
    body: 'Send the updated annual quote.',
    done: false,
    due: 'Jul 24',
    title: 'Follow up on pricing',
  },
  {
    assignee: { avatarUrl: avatars.dylanField, name: 'Dylan Field' },
    body: 'Use the Q3 template.',
    done: false,
    due: 'Jul 26',
    title: 'Onboarding deck',
  },
  {
    assignee: { avatarUrl: avatars.darioAmodei, name: 'Dario Amodei' },
    body: 'Coordinated with the data team.',
    done: true,
    due: 'Jul 18',
    title: 'Schedule security review',
  },
];

const TASK_GROUPS = [
  { items: TASKS.filter((task) => !task.done), label: 'To do' },
  { items: TASKS.filter((task) => task.done), label: 'Done' },
];

const Root = styled.div`
  background-color: ${palette.background};
  display: flex;
  flex-direction: column;
  font-family: ${palette.font};
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const TabBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${palette.borderLight};
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  padding: 0 12px;
`;

const Tab = styled.span`
  align-items: center;
  color: ${palette.textSecondary};
  display: flex;
  font-size: 12px;
  font-weight: 500;
  gap: 5px;
  padding: 11px 8px;
  white-space: nowrap;

  svg {
    height: 15px;
    width: 15px;
  }

  &[data-active] {
    box-shadow: inset 0 -1px 0 ${palette.textPrimary};
    color: ${palette.textPrimary};
  }
`;

const TasksView = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 14px 12px;

  & > * + * {
    margin-top: 14px;
  }
`;

const TaskSection = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: 2px;
  }
`;

const TaskSectionHeader = styled.div`
  align-items: center;
  color: ${palette.textLight};
  display: flex;
  font-size: 11px;
  font-weight: 600;
  gap: 6px;
  padding: 0 8px 6px;
`;

const TaskCount = styled.span`
  color: ${palette.textTertiary};
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
  border: 1px solid ${palette.textSecondary};
  border-radius: 4px;
  color: ${palette.background};
  display: flex;
  flex-shrink: 0;
  height: 15px;
  justify-content: center;
  width: 15px;

  svg {
    height: 11px;
    width: 11px;
  }

  &[data-done] {
    background-color: ${palette.accent};
    border-color: ${palette.accent};
  }
`;

const TaskTitle = styled.span`
  color: ${palette.textPrimary};
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-done] {
    color: ${palette.textTertiary};
    text-decoration: line-through;
  }
`;

const TaskBody = styled.span`
  color: ${palette.textTertiary};
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
  color: ${palette.textSecondary};
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

const Assignee = styled.span`
  align-items: center;
  color: ${palette.textSecondary};
  display: inline-flex;
  font-size: 11px;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AssigneeAvatar = styled.img`
  border-radius: 999px;
  flex-shrink: 0;
  height: 14px;
  object-fit: cover;
  width: 14px;
`;

// A record's Tasks tab — the tab bar (Tasks active) over the To-do / Done task
// list with assignees and due dates.
export function TasksVisual() {
  return (
    <Root>
      <TabBar>
        {RECORD_TABS.map((recordTab) => {
          const TabIcon = recordTab.icon;
          return (
            <Tab
              data-active={recordTab.label === ACTIVE_TAB ? '' : undefined}
              key={recordTab.label}
            >
              <TabIcon />
              {recordTab.label}
            </Tab>
          );
        })}
      </TabBar>
      <TasksView>
        {TASK_GROUPS.map((group) => (
          <TaskSection key={group.label}>
            <TaskSectionHeader>
              {group.label}
              <TaskCount>{group.items.length}</TaskCount>
            </TaskSectionHeader>
            {group.items.map((task) => (
              <TaskRow key={task.title}>
                <TaskLeft>
                  <TaskCheckbox data-done={task.done ? '' : undefined}>
                    {task.done ? <IconCheck /> : null}
                  </TaskCheckbox>
                  <TaskTitle data-done={task.done ? '' : undefined}>
                    {task.title}
                  </TaskTitle>
                  <TaskBody>{task.body}</TaskBody>
                </TaskLeft>
                <TaskRight>
                  <TaskDue>
                    <IconCalendarEvent />
                    {task.due}
                  </TaskDue>
                  <Assignee>
                    <AssigneeAvatar
                      alt=""
                      fetchPriority="low"
                      loading="lazy"
                      src={task.assignee.avatarUrl}
                    />
                    {task.assignee.name}
                  </Assignee>
                </TaskRight>
              </TaskRow>
            ))}
          </TaskSection>
        ))}
      </TasksView>
    </Root>
  );
}
