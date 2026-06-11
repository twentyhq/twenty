import { IconPlus } from '@tabler/icons-react';
import { styled } from '@linaria/react';

import { color, mediaUp, semanticColor, spacing } from '@/tokens';

// The plus-tipped hairline that separates major blocks: horizontal when
// stacked, vertical from md up. Consumers add their own margins.
const DividerRoot = styled.div`
  align-items: center;
  color: ${color('blue')};
  display: flex;
  gap: ${spacing(1.5)};
  width: 100%;

  ${mediaUp('md')} {
    flex-direction: column;
    height: 100%;
    width: auto;
  }
`;

const DividerLine = styled.div`
  background-color: ${semanticColor.line};
  flex: 1 1 0%;
  height: 1px;
  min-height: 1px;
  min-width: 0;

  ${mediaUp('md')} {
    height: auto;
    min-height: 0;
    min-width: 1px;
    width: 1px;
  }
`;

export function MarkedDivider() {
  return (
    <DividerRoot role="separator">
      <IconPlus aria-hidden size={12} stroke={1.5} />
      <DividerLine aria-hidden />
      <IconPlus aria-hidden size={12} stroke={1.5} />
    </DividerRoot>
  );
}
