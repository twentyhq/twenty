import { styled } from '@linaria/react';
import {
  IconHome,
  IconMessageCircle2,
  IconMessageCirclePlus,
} from '@tabler/icons-react';

import { mediaUp } from '@/tokens';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { previewFontSize } from '@/app-preview/preview-font-size';

const theme = THEME_LIGHT;

const Root = styled.div`
  display: flex;
  justify-content: center;

  ${mediaUp('md')} {
    align-items: center;
    justify-content: space-between;
  }
`;

const SegmentedRail = styled.div`
  display: none;

  ${mediaUp('md')} {
    display: flex;
    align-items: center;
    /* The old hand-mixed #fcfcfccc: the secondary surface at 80%. */
    background-color: color-mix(
      in srgb,
      ${theme.background.secondary} 80%,
      transparent
    );
    border: 1px solid ${THEME_LIGHT.border.color.medium};
    border-radius: 999px;
    column-gap: 2px;
    height: 26px;
    padding: 3px;
  }
`;

const Segment = styled.div<{ $selected?: boolean }>`
  align-items: center;
  background: ${({ $selected }) =>
    $selected ? theme.background.transparent.light : 'transparent'};
  border-radius: 999px;
  display: flex;
  height: 20px;
  justify-content: center;
  width: 32px;
`;

const NewChat = styled.div`
  align-items: center;
  background-color: ${theme.background.secondary};
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: 999px;
  color: ${THEME_LIGHT.font.color.secondary};
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;

  ${mediaUp('md')} {
    column-gap: 4px;
    height: 26px;
    padding: 3px;
    width: 103px;
  }
`;

const NewChatLabel = styled.span`
  display: none;

  ${mediaUp('md')} {
    display: block;
    font-family: ${theme.font.family};
    font-size: ${previewFontSize(theme.font.size.md)};
    font-weight: ${theme.font.weight.medium};
    line-height: 1.4;
  }
`;

// The home/chat rail + "New chat" pill — chrome only, as on the old
// site: the AI conversation lives in the floating Terminal.
export function SidebarControls() {
  return (
    <Root>
      <SegmentedRail aria-hidden>
        <Segment $selected>
          <IconHome
            aria-hidden
            color={THEME_LIGHT.font.color.primary}
            size={16}
            strokeWidth={theme.icon.stroke.md}
          />
        </Segment>
        <Segment>
          <IconMessageCircle2
            aria-hidden
            color={THEME_LIGHT.font.color.tertiary}
            size={16}
            strokeWidth={theme.icon.stroke.md}
          />
        </Segment>
      </SegmentedRail>
      <NewChat aria-hidden>
        <IconMessageCirclePlus
          aria-hidden
          color={THEME_LIGHT.font.color.secondary}
          size={16}
          strokeWidth={theme.icon.stroke.md}
        />
        <NewChatLabel>New chat</NewChatLabel>
      </NewChat>
    </Root>
  );
}
