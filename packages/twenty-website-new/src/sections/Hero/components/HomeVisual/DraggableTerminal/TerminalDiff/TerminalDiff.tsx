'use client';

import { IconArrowsVertical } from '@tabler/icons-react';
import { styled } from '@linaria/react';
import { TERMINAL_TOKENS } from '../terminalTokens';
import {
  DIFF_FILES,
  type DiffChunk,
  type DiffFile,
  type DiffToken,
  type DiffTokenKind,
} from './diffData';

const Root = styled.div`
  background: rgba(0, 0, 0, 0.02);
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 999px;
  }
`;

const FileHeader = styled.div`
  align-items: center;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  flex: 0 0 auto;
  gap: 10px;
  overflow: hidden;
  padding: 8px 14px;
  white-space: nowrap;

  & + & {
    border-top: 1px solid rgba(0, 0, 0, 0.04);
  }
`;

const FilePath = styled.p`
  color: rgba(0, 0, 0, 0.68);
  flex: 1 1 auto;
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 12px;
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DiffAdded = styled.span`
  color: #377e5d;
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 12px;
  font-weight: 500;
`;

const DiffRemoved = styled.span`
  color: #a94a4f;
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 12px;
  font-weight: 500;
`;

const DiffStack = styled.div`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 8px 8px 12px;
  width: 100%;
`;

const LineRow = styled.div<{ $change?: 'added' | 'removed' }>`
  align-items: center;
  background: ${({ $change }) => {
    if ($change === 'added') {
      return '#eaf4ed';
    }
    if ($change === 'removed') {
      return '#faeceb';
    }
    return 'transparent';
  }};
  border-radius: 2px;
  display: flex;
  overflow: hidden;
  position: relative;
`;

const ChangeBar = styled.span<{ $change: 'added' | 'removed' }>`
  background: ${({ $change }) => ($change === 'added' ? '#82be9c' : '#d2989b')};
  flex: 0 0 3px;
  width: 3px;
  align-self: stretch;
`;

const LineContent = styled.div<{ $indented?: boolean }>`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  gap: 12px;
  min-width: 0;
  overflow: hidden;
  padding: 6px 12px 6px ${({ $indented }) => ($indented ? '9px' : '12px')};
  white-space: nowrap;
`;

const LineNumber = styled.span`
  color: rgba(0, 0, 0, 0.32);
  flex: 0 0 auto;
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 12px;
`;

const LineText = styled.span`
  color: rgba(0, 0, 0, 0.8);
  flex: 1 1 auto;
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 12px;
  line-height: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UnmodRow = styled.div`
  align-items: center;
  display: flex;
  padding: 6px 0;
`;

const UnmodChip = styled.div`
  align-items: center;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 6px;
  color: rgba(0, 0, 0, 0.55);
  display: inline-flex;
  font-family: ${TERMINAL_TOKENS.font.ui};
  font-size: 12px;
  font-weight: 500;
  gap: 10px;
  padding: 6px 12px 6px 10px;
`;

const TOKEN_COLOR: Record<DiffTokenKind, string> = {
  text: 'rgba(0, 0, 0, 0.8)',
  keyword: '#8250df',
  type: '#953800',
  string: '#0a3069',
  identifier: '#0550ae',
};

const renderToken = (token: DiffToken, index: number) => {
  if (token.kind === 'text') {
    return <span key={index}>{token.value}</span>;
  }
  return (
    <span key={index} style={{ color: TOKEN_COLOR[token.kind] }}>
      {token.value}
    </span>
  );
};

const renderChunk = (chunk: DiffChunk, index: number) => {
  if (chunk.kind === 'unmodified') {
    return (
      <UnmodRow key={`unmod-${index}`}>
        <UnmodChip>
          <IconArrowsVertical size={12} stroke={1.8} />
          {chunk.count} unmodified lines
        </UnmodChip>
      </UnmodRow>
    );
  }
  return (
    <LineRow key={`line-${index}`} $change={chunk.change}>
      {chunk.change ? <ChangeBar $change={chunk.change} /> : null}
      <LineContent $indented={Boolean(chunk.change)}>
        <LineNumber>{chunk.lineNumber}</LineNumber>
        <LineText>{chunk.tokens.map(renderToken)}</LineText>
      </LineContent>
    </LineRow>
  );
};

const renderFile = (file: DiffFile) => (
  <div key={file.id}>
    <FileHeader>
      <FilePath>{file.path}</FilePath>
      <DiffAdded>+{file.added}</DiffAdded>
      <DiffRemoved>-{file.removed}</DiffRemoved>
    </FileHeader>
    <DiffStack>{file.chunks.map(renderChunk)}</DiffStack>
  </div>
);

export const TerminalDiff = () => {
  return <Root>{DIFF_FILES.map(renderFile)}</Root>;
};
