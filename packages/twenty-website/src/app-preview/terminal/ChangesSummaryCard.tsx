'use client';

import { styled } from '@linaria/react';
import {
  IconArrowBackUp,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { useState } from 'react';

import { EASING } from '@/tokens';
import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { changesSummaryCardState } from './changes-summary-card-state';
import { ChangesSummaryFileRow } from './ChangesSummaryFileRow';
import { CHANGESET_TOTALS } from './changeset-totals';
import { CONVERSATION_CORE } from './conversation-core';
import { DIFF_SPANS } from './diff-spans';
import { ROCKET_CHANGESET } from './rocket-changeset';

const terminal = APP_PREVIEW_TONES.terminal;

const CardRoot = styled.div`
  animation: chatCardEnter ${CONVERSATION_CORE.timings.fileCardEnterMs}ms
    ${EASING.standard} both;
  background: ${terminal.surface.card};
  border: 1px solid ${terminal.surface.cardBorder};
  border-radius: 10px;
  box-shadow: ${terminal.surface.cardShadow};
  overflow: hidden;
  width: 100%;

  @keyframes chatCardEnter {
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
  background: ${terminal.surface.cardHeader};
  display: flex;
  gap: 8px;
  padding: 10px 14px;
`;

const HeaderTitle = styled.div`
  align-items: center;
  color: ${terminal.text.cardTitle};
  display: flex;
  flex: 1 1 auto;
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
  font-size: 12.5px;
  font-weight: 500;
  gap: 6px;
`;

const UndoButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: ${terminal.text.undo};
  cursor: pointer;
  display: inline-flex;
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
  font-size: 12px;
  font-weight: 500;
  gap: 3px;
  padding: 3px 6px;
  transition:
    background-color 0.14s ease,
    color 0.14s ease;

  &:hover {
    background: ${terminal.surface.undoHoverBackground};
    color: ${terminal.text.undoHover};
  }
`;

const FileList = styled.div`
  border-top: 1px solid ${terminal.surface.cardListBorder};
  display: flex;
  flex-direction: column;
`;

const SeeMoreButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-top: 1px solid ${terminal.surface.cardSeeMoreBorder};
  color: ${terminal.text.seeMore};
  cursor: pointer;
  display: inline-flex;
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
  font-size: 11.5px;
  font-weight: 500;
  gap: 4px;
  justify-content: flex-start;
  letter-spacing: 0.1px;
  padding: 8px 14px;
  transition: color 0.14s ease;
  width: 100%;

  &:hover {
    color: ${terminal.text.seeMoreHover};
  }
`;

const SeeMoreChevron = styled.span`
  align-items: center;
  color: currentColor;
  display: inline-flex;
  flex: 0 0 auto;
`;

export function ChangesSummaryCard({ onUndo }: { onUndo?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hiddenCount = changesSummaryCardState.getHiddenChangesCount({
    changes: ROCKET_CHANGESET,
  });
  const visibleChanges = changesSummaryCardState.getVisibleChanges({
    changes: ROCKET_CHANGESET,
    isExpanded,
  });

  return (
    <CardRoot>
      <Header>
        <HeaderTitle>
          <span>{ROCKET_CHANGESET.length} files changed</span>
          <DIFF_SPANS.Added>+{CHANGESET_TOTALS.added}</DIFF_SPANS.Added>
          <DIFF_SPANS.Removed>-{CHANGESET_TOTALS.removed}</DIFF_SPANS.Removed>
        </HeaderTitle>
        <UndoButton onClick={onUndo} type="button">
          Undo
          <IconArrowBackUp size={12} stroke={2} />
        </UndoButton>
      </Header>
      <FileList>
        {visibleChanges.map((change, index) => (
          <ChangesSummaryFileRow
            animationDelay={changesSummaryCardState.getRowDelay(index)}
            change={change}
            key={change.path}
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
}
