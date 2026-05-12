'use client';

import { styled } from '@linaria/react';
import {
  IconArrowBackUp,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { useState } from 'react';

import { CHAT_TIMINGS } from '../utils/animation-timing';
import {
  getChangesSummaryRowDelay,
  getHiddenChangesCount,
  getVisibleChanges,
} from '../utils/changes-summary-card-state';
import { DiffAdded } from './DiffAdded';
import { DiffRemoved } from './DiffRemoved';
import { ChangesSummaryFileRow } from './ChangesSummaryFileRow';
import { CHANGESET_TOTALS } from '../utils/changeset-totals';
import { ROCKET_CHANGESET } from '../utils/rocket-changeset';

const CardRoot = styled.div`
  animation: chatCardRise ${CHAT_TIMINGS.fileCardEnterMs}ms
    cubic-bezier(0.22, 1, 0.36, 1) both;
  background: #f5f5f5;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  width: 100%;

  @keyframes chatCardRise {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Header = styled.div`
  align-items: center;
  background: #fafafa;
  display: flex;
  gap: 8px;
  padding: 10px 14px;
`;

const HeaderTitle = styled.div`
  align-items: center;
  color: rgba(0, 0, 0, 0.72);
  display: flex;
  flex: 1 1 auto;
  font-family: 'Inter', sans-serif;
  font-size: 12.5px;
  font-weight: 500;
  gap: 6px;
`;

const UndoButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: rgba(0, 0, 0, 0.55);
  cursor: pointer;
  display: inline-flex;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  gap: 3px;
  padding: 3px 6px;
  transition:
    background-color 0.14s ease,
    color 0.14s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
    color: rgba(0, 0, 0, 0.8);
  }
`;

const FileList = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
`;

const SeeMoreButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.48);
  cursor: pointer;
  display: inline-flex;
  font-family: 'Inter', sans-serif;
  font-size: 11.5px;
  font-weight: 500;
  gap: 4px;
  justify-content: flex-start;
  letter-spacing: 0.1px;
  padding: 8px 14px;
  transition: color 0.14s ease;
  width: 100%;

  &:hover {
    color: rgba(0, 0, 0, 0.72);
  }
`;

const SeeMoreChevron = styled.span`
  align-items: center;
  color: currentColor;
  display: inline-flex;
  flex: 0 0 auto;
`;

type ChangesSummaryCardProps = {
  onUndo?: () => void;
};

export const ChangesSummaryCard = ({ onUndo }: ChangesSummaryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hiddenCount = getHiddenChangesCount({ changes: ROCKET_CHANGESET });
  const visibleChanges = getVisibleChanges({
    changes: ROCKET_CHANGESET,
    isExpanded,
  });

  return (
    <CardRoot>
      <Header>
        <HeaderTitle>
          <span>{ROCKET_CHANGESET.length} files changed</span>
          <DiffAdded>+{CHANGESET_TOTALS.added}</DiffAdded>
          <DiffRemoved>-{CHANGESET_TOTALS.removed}</DiffRemoved>
        </HeaderTitle>
        <UndoButton onClick={onUndo} type="button">
          Undo
          <IconArrowBackUp size={12} stroke={2} />
        </UndoButton>
      </Header>
      <FileList>
        {visibleChanges.map((change, index) => (
          <ChangesSummaryFileRow
            animationDelay={getChangesSummaryRowDelay(index)}
            change={change}
            key={`${change.path}-${index}`}
          />
        ))}
      </FileList>
      {hiddenCount > 0 && (
        <SeeMoreButton
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          <SeeMoreChevron aria-hidden>
            {isExpanded ? (
              <IconChevronUp size={12} stroke={2} />
            ) : (
              <IconChevronDown size={12} stroke={2} />
            )}
          </SeeMoreChevron>
          {isExpanded ? 'See less' : `See ${hiddenCount} more`}
        </SeeMoreButton>
      )}
    </CardRoot>
  );
};
