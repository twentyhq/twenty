import { styled } from '@linaria/react';
import { IconCalendar, IconCheck } from '@tabler/icons-react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { Chip } from '@/app-preview/primitives/Chip';
import { PersonAvatar } from '@/app-preview/primitives/PersonAvatar';
import { previewFontSize } from '@/app-preview/preview-font-size';

import { type Task } from '../types/task';

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

export function TaskRow({ task }: { task: Task }) {
  return (
    <Row>
      <RowLeft>
        <Checkbox data-done={task.done ? '' : undefined}>
          {task.done ? <IconCheck size={11} stroke={2.5} /> : null}
        </Checkbox>
        <Title data-done={task.done ? '' : undefined}>{task.title}</Title>
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
  );
}
