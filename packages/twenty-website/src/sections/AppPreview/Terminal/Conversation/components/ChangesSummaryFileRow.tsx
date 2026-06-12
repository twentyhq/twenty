import { styled } from '@linaria/react';
import { IconChevronRight } from '@tabler/icons-react';

import type { FileChange } from '../utils/file-change-type';
import { ChangesSummaryDiffCounts } from './ChangesSummaryDiffCounts';

const FileRow = styled.div<{ $delay: string }>`
  animation: chatFileRowFade 240ms ease-out both;
  animation-delay: ${({ $delay }) => $delay};
  align-items: center;
  display: flex;
  gap: 10px;
  padding: 9px 14px;
  transition: background-color 0.14s ease;

  & + & {
    border-top: 1px solid rgba(0, 0, 0, 0.04);
  }

  &:hover {
    background: rgba(0, 0, 0, 0.02);
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
  color: rgba(0, 0, 0, 0.78);
  flex: 1 1 auto;
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 11.5px;
  font-weight: 500;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Chevron = styled.span`
  align-items: center;
  color: rgba(0, 0, 0, 0.3);
  display: inline-flex;
  flex: 0 0 auto;
`;

type ChangesSummaryFileRowProps = {
  animationDelay: string;
  change: FileChange;
};

export const ChangesSummaryFileRow = ({
  animationDelay,
  change,
}: ChangesSummaryFileRowProps) => (
  <FileRow $delay={animationDelay}>
    <FilePath>{change.path}</FilePath>
    <ChangesSummaryDiffCounts added={change.added} removed={change.removed} />
    <Chevron>
      <IconChevronRight size={14} stroke={1.8} />
    </Chevron>
  </FileRow>
);
