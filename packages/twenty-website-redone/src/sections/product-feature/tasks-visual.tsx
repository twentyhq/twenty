'use client';

import { styled } from '@linaria/react';
import { IconCalendar, IconCheck } from '@tabler/icons-react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';
import { Chip } from '@/app-preview/primitives/chip';
import { PersonAvatar } from '@/app-preview/primitives/person-avatar';
import { previewFontSize } from '@/app-preview/preview-font-size';

import { RecordTabHeader } from './record-tab-header';

const PEOPLE = sharedAssetUrls.peopleAvatars;

type TaskTarget = {
  avatarUrl: string;
  name: string;
};

type Task = {
  body: string;
  done: boolean;
  due: string;
  target: TaskTarget;
  title: string;
};

const TASKS: Task[] = [
  {
    body: 'Loop in legal before sending.',
    done: false,
    due: 'Tomorrow',
    target: { avatarUrl: PEOPLE.darioAmodei, name: 'Dario Amodei' },
    title: 'Send NDA',
  },
  {
    body: 'Send the updated annual quote.',
    done: false,
    due: 'Jul 24',
    target: { avatarUrl: PEOPLE.patrickCollison, name: 'Patrick Collison' },
    title: 'Follow up on pricing',
  },
  {
    body: 'Use the Q3 template.',
    done: false,
    due: 'Jul 26',
    target: { avatarUrl: PEOPLE.dylanField, name: 'Dylan Field' },
    title: 'Onboarding deck',
  },
  {
    body: 'Coordinated with the data team.',
    done: true,
    due: 'Jul 18',
    target: { avatarUrl: PEOPLE.darioAmodei, name: 'Dario Amodei' },
    title: 'Schedule security review',
  },
];

const TASK_GROUPS = [
  { items: TASKS.filter((task) => !task.done), label: 'To do' },
  { items: TASKS.filter((task) => task.done), label: 'Done' },
];

const Root = styled.div`
  background-color: ${THEME_LIGHT.background.primary};
  display: flex;
  flex-direction: column;
  font-family: ${THEME_LIGHT.font.family};
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

const Row = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: 8px;
  height: 48px;
  padding: 0 16px;

  &:hover {
    background-color: ${THEME_LIGHT.background.transparent.light};
  }
`;

const RowLeft = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const Checkbox = styled.span`
  align-items: center;
  border: 1px solid ${THEME_LIGHT.border.color.strong};
  border-radius: ${THEME_LIGHT.border.radius.rounded};
  box-sizing: border-box;
  color: ${THEME_LIGHT.font.color.inverted};
  display: flex;
  flex-shrink: 0;
  height: 14px;
  justify-content: center;
  width: 14px;

  &[data-done] {
    background-color: ${THEME_LIGHT.color.blue};
    border-color: ${THEME_LIGHT.color.blue};
  }
`;

const Title = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  overflow: hidden;
  padding: 0 ${THEME_LIGHT.spacing(2)};
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-done] {
    text-decoration: line-through;
  }
`;

const Body = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowRight = styled.div`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
  gap: 8px;
  max-width: 50%;
`;

const Due = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.secondary};
  display: flex;
  flex-shrink: 0;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  gap: ${THEME_LIGHT.spacing(1)};
  white-space: nowrap;
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
              <Row key={task.title}>
                <RowLeft>
                  <Checkbox data-done={task.done ? '' : undefined}>
                    {task.done ? <IconCheck size={11} stroke={2.5} /> : null}
                  </Checkbox>
                  <Title data-done={task.done ? '' : undefined}>
                    {task.title}
                  </Title>
                  <Body>{task.body}</Body>
                </RowLeft>
                <RowRight>
                  <Due>
                    <IconCalendar size={16} stroke={2} />
                    {task.due}
                  </Due>
                  <Chip
                    label={task.target.name}
                    leftComponent={
                      <PersonAvatar
                        person={{
                          avatarUrl: task.target.avatarUrl,
                          name: task.target.name,
                        }}
                      />
                    }
                    variant="transparent"
                  />
                </RowRight>
              </Row>
            ))}
          </Group>
        ))}
      </Panel>
    </Root>
  );
}
