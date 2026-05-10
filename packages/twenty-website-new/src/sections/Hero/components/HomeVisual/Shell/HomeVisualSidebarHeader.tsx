'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconChevronDown,
  IconLayoutSidebarLeftCollapse,
  IconSearch,
} from '@tabler/icons-react';

import {
  APP_FONT,
  COLORS,
  TABLER_STROKE,
} from '../Shared/utils/home-visual-theme';

const APPLE_WORKSPACE_LOGO_SRC = '/images/home/hero/apple-rainbow-logo.svg';

const SidebarTopBar = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-height: 32px;

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: 8px;
    grid-template-columns: minmax(0, 1fr) auto;
  }
`;

const WorkspaceMenu = styled.div`
  align-items: center;
  display: grid;
  gap: 4px;
  grid-auto-flow: column;
  grid-template-columns: auto;
  justify-content: center;
  min-width: 0;
  padding: 6px 4px;

  > svg:last-child {
    display: none;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: 8px;
    grid-auto-flow: row;
    grid-template-columns: auto 1fr auto;
    justify-content: stretch;

    > svg:last-child {
      display: block;
    }
  }
`;

const WorkspaceIcon = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const WorkspaceIconImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  object-position: center;
  width: 100%;
`;

const WorkspaceLabel = styled.span`
  color: ${COLORS.text};
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

const SidebarTopActions = styled.div`
  align-items: center;
  display: none;
  gap: 2px;
  grid-auto-flow: column;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: grid;
  }
`;

const SidebarIconButton = styled.div`
  align-items: center;
  border-radius: 4px;
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

type MiniIconProps = {
  color?: string;
  size?: number;
};

function ChevronDownMini({
  color = COLORS.textTertiary,
  size = 14,
}: MiniIconProps) {
  return (
    <IconChevronDown
      aria-hidden
      color={color}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

function SearchMini({ color = COLORS.textTertiary, size = 16 }: MiniIconProps) {
  return (
    <IconSearch aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function CollapseSidebarMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return (
    <IconLayoutSidebarLeftCollapse
      aria-hidden
      color={color}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

type HomeVisualSidebarHeaderProps = {
  workspaceName: string;
};

export function HomeVisualSidebarHeader({
  workspaceName,
}: HomeVisualSidebarHeaderProps) {
  return (
    <SidebarTopBar>
      <WorkspaceMenu>
        <WorkspaceIcon>
          <WorkspaceIconImage
            alt=""
            aria-hidden="true"
            src={APPLE_WORKSPACE_LOGO_SRC}
          />
        </WorkspaceIcon>
        <WorkspaceLabel>{workspaceName}</WorkspaceLabel>
        <ChevronDownMini color={COLORS.textLight} size={12} />
      </WorkspaceMenu>
      <SidebarTopActions>
        <SidebarIconButton aria-hidden="true">
          <SearchMini />
        </SidebarIconButton>
        <SidebarIconButton aria-hidden="true">
          <CollapseSidebarMini />
        </SidebarIconButton>
      </SidebarTopActions>
    </SidebarTopBar>
  );
}
