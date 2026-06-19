import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { IconCalendar, IconCheck, IconPlus } from '@tabler/icons-react';

import { FaviconLogo } from '../../primitives/FaviconLogo';
import { PersonAvatar } from '../../primitives/PersonAvatar';
import { type RecordTask } from '../../types';
import { RECORD_PANEL_CHROME } from './RecordPanelChrome';

const TaskLeft = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const TaskCheckbox = styled.span<{ $done?: boolean }>`
  align-items: center;
  background: ${({ $done }) =>
    $done ? THEME_LIGHT.accent.accent9 : 'transparent'};
  border: 1px solid
    ${({ $done }) =>
      $done ? THEME_LIGHT.accent.accent9 : THEME_LIGHT.font.color.primary};
  border-radius: 50%;
  color: ${THEME_LIGHT.font.color.inverted};
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const TaskTitle = styled.span<{ $done?: boolean }>`
  color: ${THEME_LIGHT.font.color.primary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  padding: 0 8px;
  text-decoration: ${({ $done }) => ($done ? 'line-through' : 'none')};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TaskBody = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TaskRight = styled.div`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
  gap: 8px;
  margin-left: auto;
`;

const DueDate = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.secondary};
  display: flex;
  font-family: ${THEME_LIGHT.font.family};
  font-size: 13px;
  gap: 4px;
  white-space: nowrap;
`;

const TargetChip = styled.span`
  align-items: center;
  background: ${THEME_LIGHT.background.secondary};
  border: 1px solid ${THEME_LIGHT.border.color.light};
  border-radius: 50px;
  color: ${THEME_LIGHT.font.color.primary};
  display: inline-flex;
  font-family: ${THEME_LIGHT.font.family};
  font-size: 13px;
  gap: 4px;
  max-width: 160px;
  padding: 1px 8px 1px 2px;
  white-space: nowrap;
`;

const TargetChipName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const {
  ActivityRowBox,
  ListCard,
  TabAddButton,
  TabHeader,
  TabHeaderCount,
  TabHeaderLabel,
  TabHeaderTitle,
  TabSection,
} = RECORD_PANEL_CHROME;

export function RecordTasks({ tasks }: { tasks: RecordTask[] }) {
  return (
    <TabSection>
      <TabHeader>
        <TabHeaderLabel>
          <TabHeaderTitle>To do</TabHeaderTitle>
          <TabHeaderCount>{tasks.length}</TabHeaderCount>
        </TabHeaderLabel>
        <TabAddButton>
          <IconPlus size={14} stroke={2} />
          Add task
        </TabAddButton>
      </TabHeader>
      <ListCard>
        {tasks.map((task, index) => (
          <ActivityRowBox $index={index} key={task.id}>
            <TaskLeft>
              <TaskCheckbox $done={task.done}>
                {task.done ? <IconCheck size={11} stroke={3} /> : null}
              </TaskCheckbox>
              <TaskTitle $done={task.done}>{task.title}</TaskTitle>
              <TaskBody>{task.body}</TaskBody>
            </TaskLeft>
            <TaskRight>
              <DueDate>
                <IconCalendar size={16} stroke={THEME_LIGHT.icon.stroke.sm} />
                {task.due}
              </DueDate>
              <TargetChip>
                {task.target.domain ? (
                  <FaviconLogo
                    domain={task.target.domain}
                    label={task.target.name}
                    size={16}
                  />
                ) : (
                  <PersonAvatar
                    person={{ ...task.target, kind: 'person' }}
                    size={16}
                  />
                )}
                <TargetChipName>{task.target.name}</TargetChipName>
              </TargetChip>
            </TaskRight>
          </ActivityRowBox>
        ))}
      </ListCard>
    </TabSection>
  );
}
