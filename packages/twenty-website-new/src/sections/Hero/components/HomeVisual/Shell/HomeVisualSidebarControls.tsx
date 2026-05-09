'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconHome2,
  IconMessageCircle,
  IconMessageCirclePlus,
} from '@tabler/icons-react';

import {
  APP_FONT,
  COLORS,
  TABLER_STROKE,
} from '../Shared/utils/home-visual-theme';

const SidebarControls = styled.div`
  align-items: center;
  display: grid;
  gap: 8px;
  grid-auto-flow: column;
  grid-template-columns: auto;
  justify-content: center;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: flex;
    gap: 12px;
    grid-auto-flow: row;
    justify-content: space-between;
  }
`;

const SegmentedRail = styled.div`
  background: #fcfcfccc;
  border: 1px solid ${COLORS.border};
  border-radius: 40px;
  display: none;
  gap: 2px;
  grid-auto-flow: column;
  padding: 3px;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: grid;
  }
`;

const Segment = styled.div<{ $selected?: boolean }>`
  align-items: center;
  background: ${({ $selected }) => ($selected ? '#0000000a' : 'transparent')};
  border-radius: 16px;
  display: flex;
  height: 22px;
  justify-content: center;
  width: 22px;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding: 0 8px;
    width: 32px;
  }
`;

const NewChat = styled.div`
  align-items: center;
  background: ${COLORS.backgroundSecondary};
  border: 1px solid ${COLORS.border};
  border-radius: 40px;
  color: ${COLORS.textSecondary};
  display: flex;
  gap: 4px;
  height: 28px;
  justify-content: center;
  min-width: 0;
  padding: 3px;
  width: 28px;

  @media (min-width: ${theme.breakpoints.md}px) {
    width: 103px;
  }
`;

const NewChatLabel = styled.span`
  display: none;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
  }
`;

type MiniIconProps = {
  color?: string;
  size?: number;
};

function HomeMini({ color = COLORS.textSecondary, size = 16 }: MiniIconProps) {
  return (
    <IconHome2 aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function CommentMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return (
    <IconMessageCircle
      aria-hidden
      color={color}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

function MessageCirclePlusMini({
  color = COLORS.textSecondary,
  size = 16,
}: MiniIconProps) {
  return (
    <IconMessageCirclePlus
      aria-hidden
      color={color}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

export function HomeVisualSidebarControls() {
  return (
    <SidebarControls>
      <SegmentedRail aria-hidden="true">
        <Segment $selected>
          <HomeMini />
        </Segment>
        <Segment>
          <CommentMini />
        </Segment>
      </SegmentedRail>
      <NewChat aria-hidden="true">
        <MessageCirclePlusMini />
        <NewChatLabel>New chat</NewChatLabel>
      </NewChat>
    </SidebarControls>
  );
}
