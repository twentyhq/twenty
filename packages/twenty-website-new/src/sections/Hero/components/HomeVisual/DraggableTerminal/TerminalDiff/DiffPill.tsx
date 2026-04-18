'use client';

import { IconLayoutSidebarRight } from '@tabler/icons-react';
import { styled } from '@linaria/react';
import { TERMINAL_TOKENS } from '../terminalTokens';

type DiffPillProps = {
  added: number;
  removed: number;
  isActive?: boolean;
  onClick?: () => void;
};

const PillButton = styled.button<{ $active?: boolean }>`
  align-items: center;
  background: ${({ $active }) =>
    $active ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0.02)'};
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  color: rgba(0, 0, 0, 0.55);
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  height: 24px;
  padding: 4px 8px;
  transition:
    background-color 0.14s ease,
    border-color 0.14s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.12);
  }
`;

const DiffNumbers = styled.span`
  align-items: center;
  display: inline-flex;
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 13px;
  font-weight: 500;
  gap: 4px;
  line-height: 1;
`;

const Added = styled.span`
  color: #377e5d;
`;

const Removed = styled.span`
  color: #a94a4f;
`;

const IconWrap = styled.span`
  align-items: center;
  color: rgba(0, 0, 0, 0.45);
  display: inline-flex;
  flex: 0 0 16px;
  height: 16px;
  width: 16px;
`;

export const DiffPill = ({
  added,
  removed,
  isActive,
  onClick,
}: DiffPillProps) => {
  return (
    <PillButton
      $active={isActive}
      aria-label={isActive ? 'Hide changes' : 'Show changes'}
      aria-pressed={isActive}
      onClick={onClick}
      type="button"
    >
      <DiffNumbers>
        <Added>+{added}</Added>
        <Removed>-{removed}</Removed>
      </DiffNumbers>
      <IconWrap>
        <IconLayoutSidebarRight size={16} stroke={1.8} />
      </IconWrap>
    </PillButton>
  );
};
