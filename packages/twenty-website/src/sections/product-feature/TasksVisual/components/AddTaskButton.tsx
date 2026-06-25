import { styled } from '@linaria/react';
import { IconPlus } from '@tabler/icons-react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

const Button = styled.div`
  align-items: center;
  background-color: transparent;
  border: 1px solid ${THEME_LIGHT.background.transparent.medium};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  box-sizing: border-box;
  color: ${THEME_LIGHT.font.color.secondary};
  display: inline-flex;
  flex-shrink: 0;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  gap: ${THEME_LIGHT.spacing(1)};
  height: 24px;
  padding: 0 ${THEME_LIGHT.spacing(2)};
  white-space: nowrap;
`;

export function AddTaskButton() {
  return (
    <Button>
      <IconPlus size={14} stroke={2} />
      Add task
    </Button>
  );
}
