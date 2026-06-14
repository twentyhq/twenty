'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconHome,
  IconMessageCircle2,
  IconMessageCirclePlus,
} from '@tabler/icons-react';

import { APP_FONT } from '../Shared/utils/app-preview-theme';

const Root = styled.div<{ $desktopExpanded: boolean }>`
  display: flex;
  justify-content: center;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    justify-content: ${({ $desktopExpanded }) =>
      $desktopExpanded ? 'space-between' : 'center'};
  }
`;

const SegmentedRail = styled.div<{ $desktopExpanded: boolean }>`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: ${({ $desktopExpanded }) => ($desktopExpanded ? 'flex' : 'none')};
    align-items: center;
    background-color: #fcfcfccc;
    border: 1px solid #ebebeb;
    border-radius: 999px;
    column-gap: 2px;
    height: 26px;
    padding-bottom: 3px;
    padding-left: 3px;
    padding-right: 3px;
    padding-top: 3px;
  }
`;

const Segment = styled.div<{ $selected?: boolean }>`
  align-items: center;
  background: ${({ $selected }) => ($selected ? '#0000000a' : 'transparent')};
  border-radius: 999px;
  display: flex;
  height: 20px;
  justify-content: center;
  width: 32px;
`;

const NewChat = styled.div<{ $desktopExpanded: boolean }>`
  align-items: center;
  background-color: #fcfcfc;
  border: 1px solid #ebebeb;
  border-radius: 999px;
  color: #666666;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;

  @media (min-width: ${theme.breakpoints.md}px) {
    column-gap: ${({ $desktopExpanded }) => ($desktopExpanded ? '4px' : '0')};
    height: ${({ $desktopExpanded }) => ($desktopExpanded ? '26px' : '32px')};
    padding-bottom: ${({ $desktopExpanded }) =>
      $desktopExpanded ? '3px' : '0'};
    padding-left: ${({ $desktopExpanded }) => ($desktopExpanded ? '3px' : '0')};
    padding-right: ${({ $desktopExpanded }) =>
      $desktopExpanded ? '3px' : '0'};
    padding-top: ${({ $desktopExpanded }) => ($desktopExpanded ? '3px' : '0')};
    width: ${({ $desktopExpanded }) => ($desktopExpanded ? '103px' : '32px')};
  }
`;

const NewChatLabel = styled.span<{ $desktopExpanded: boolean }>`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: ${({ $desktopExpanded }) => ($desktopExpanded ? 'block' : 'none')};
    font-family: ${APP_FONT};
    font-size: 13px;
    font-weight: ${theme.font.weight.medium};
    line-height: 1.4;
  }
`;

type SidebarControlsProps = {
  desktopExpanded: boolean;
};

export function SidebarControls({ desktopExpanded }: SidebarControlsProps) {
  return (
    <Root $desktopExpanded={desktopExpanded}>
      <SegmentedRail $desktopExpanded={desktopExpanded} aria-hidden="true">
        <Segment $selected>
          <IconHome aria-hidden color="#333333" size={16} strokeWidth={2} />
        </Segment>
        <Segment>
          <IconMessageCircle2
            aria-hidden
            color="#999999"
            size={16}
            strokeWidth={2}
          />
        </Segment>
      </SegmentedRail>

      <NewChat $desktopExpanded={desktopExpanded} aria-hidden="true">
        <IconMessageCirclePlus
          aria-hidden
          color="#666666"
          size={16}
          strokeWidth={2}
        />
        <NewChatLabel $desktopExpanded={desktopExpanded}>New chat</NewChatLabel>
      </NewChat>
    </Root>
  );
}
