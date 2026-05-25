'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconChevronDown,
  IconLayoutSidebarLeftCollapse,
  IconSearch,
} from '@tabler/icons-react';

import { APP_FONT } from '../Shared/utils/app-preview-theme';

const APPLE_WORKSPACE_LOGO_SRC = '/images/home/hero/apple-rainbow-logo.svg';

const Header = styled.div<{ $desktopExpanded: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  padding-bottom: 8px;
  padding-left: 4px;
  padding-right: 4px;
  padding-top: 8px;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-direction: ${({ $desktopExpanded }) =>
      $desktopExpanded ? 'row' : 'column'};
    justify-content: ${({ $desktopExpanded }) =>
      $desktopExpanded ? 'space-between' : 'flex-start'};
    row-gap: ${({ $desktopExpanded }) => ($desktopExpanded ? '0' : '16px')};
  }
`;

const LeftGroup = styled.div<{ $desktopExpanded: boolean }>`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    column-gap: ${({ $desktopExpanded }) => ($desktopExpanded ? '8px' : '0')};
    justify-content: ${({ $desktopExpanded }) =>
      $desktopExpanded ? 'flex-start' : 'center'};
    width: ${({ $desktopExpanded }) => ($desktopExpanded ? 'auto' : '100%')};
  }
`;

const Logo = styled.img`
  display: block;
  height: 16px;
  object-fit: contain;
  width: 16px;
`;

const Name = styled.span<{ $desktopExpanded: boolean }>`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: ${({ $desktopExpanded }) => ($desktopExpanded ? 'block' : 'none')};
    color: #333333;
    font-family: ${APP_FONT};
    font-size: 13px;
    font-weight: ${theme.font.weight.medium};
    line-height: 1.4;
  }
`;

const Chevron = styled.span<{ $desktopExpanded: boolean }>`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: ${({ $desktopExpanded }) => ($desktopExpanded ? 'flex' : 'none')};
  }
`;

const RightGroup = styled.div<{ $desktopExpanded: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  row-gap: 16px;

  @media (min-width: ${theme.breakpoints.md}px) {
    column-gap: ${({ $desktopExpanded }) => ($desktopExpanded ? '8px' : '0')};
    flex-direction: ${({ $desktopExpanded }) =>
      $desktopExpanded ? 'row' : 'column'};
  }
`;

const CollapseButton = styled.span<{ $desktopExpanded: boolean }>`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: ${({ $desktopExpanded }) => ($desktopExpanded ? 'flex' : 'none')};
  }
`;

type SidebarHeaderProps = {
  desktopExpanded: boolean;
};

export function SidebarHeader({ desktopExpanded }: SidebarHeaderProps) {
  return (
    <Header $desktopExpanded={desktopExpanded}>
      <LeftGroup $desktopExpanded={desktopExpanded}>
        <Logo
          alt="Workspace logo"
          aria-hidden="true"
          src={APPLE_WORKSPACE_LOGO_SRC}
        />
        <Name $desktopExpanded={desktopExpanded}>Apple</Name>
        <Chevron $desktopExpanded={desktopExpanded}>
          <IconChevronDown color="#CCCCCC" size={16} />
        </Chevron>
      </LeftGroup>
      <RightGroup $desktopExpanded={desktopExpanded}>
        <IconSearch color="#666666" size={16} />
        <CollapseButton $desktopExpanded={desktopExpanded}>
          <IconLayoutSidebarLeftCollapse color="#666666" size={16} />
        </CollapseButton>
      </RightGroup>
    </Header>
  );
}
