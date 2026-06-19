import { styled } from '@linaria/react';
import { IconChevronRight } from '@tabler/icons-react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { ChangesSummaryDiffCounts } from './ChangesSummaryDiffCounts';
import { type FileChange } from './rocket-changeset';

const terminal = APP_PREVIEW_TONES.terminal;

const FileRow = styled.div<{ $delay: string }>`
  animation: chatFileRowFade 240ms ease-out both;
  animation-delay: ${({ $delay }) => $delay};
  align-items: center;
  display: flex;
  gap: 10px;
  padding: 9px 14px;
  transition: background-color 0.14s ease;

  & + & {
    border-top: 1px solid ${terminal.surface.cardRowBorder};
  }

  &:hover {
    background: ${terminal.surface.cardRowHover};
  }

  @keyframes chatFileRowFade {
    from {
      opacity: 0;
      transform: translateY(3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FilePath = styled.span`
  color: ${terminal.text.filePath};
  flex: 1 1 auto;
  font-family: ${APP_PREVIEW_STAGE.terminalFont.mono};
  font-size: 11.5px;
  font-weight: 500;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Chevron = styled.span`
  align-items: center;
  color: ${terminal.text.fileChevron};
  display: inline-flex;
  flex: 0 0 auto;
`;

export function ChangesSummaryFileRow({
  animationDelay,
  change,
}: {
  animationDelay: string;
  change: FileChange;
}) {
  return (
    <FileRow $delay={animationDelay}>
      <FilePath>{change.path}</FilePath>
      <ChangesSummaryDiffCounts added={change.added} removed={change.removed} />
      <Chevron>
        <IconChevronRight size={14} stroke={1.8} />
      </Chevron>
    </FileRow>
  );
}
