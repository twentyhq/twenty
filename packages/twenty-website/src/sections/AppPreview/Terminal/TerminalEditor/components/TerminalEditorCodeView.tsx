import { styled } from '@linaria/react';
import { TERMINAL_TOKENS } from '../../utils/terminal-tokens';
import {
  type CodeLine,
  type CodeToken,
  type EditorFile,
  type TokenKind,
} from '../types/editor-data.types';
import { EDITOR_TOKENS } from '../utils/editor-tokens';

const CodeRegion = styled.div`
  background: ${EDITOR_TOKENS.surface.body};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
  padding: 12px 0;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;

  &::-webkit-scrollbar {
    background: ${EDITOR_TOKENS.surface.body};
    height: 8px;
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${EDITOR_TOKENS.surface.body};
  }
  &::-webkit-scrollbar-corner {
    background: ${EDITOR_TOKENS.surface.body};
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 999px;
  }
`;

const CodeStack = styled.div`
  display: flex;
  flex-direction: column;
  min-width: min-content;
`;

const CodeLineRow = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  min-width: max-content;
`;

const Gutter = styled.div`
  color: ${EDITOR_TOKENS.text.gutter};
  display: flex;
  flex: 0 0 52px;
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 12px;
  height: 20px;
  justify-content: flex-end;
  padding-right: 12px;
  user-select: none;
  width: 52px;
`;

const CodeText = styled.pre`
  color: ${EDITOR_TOKENS.text.code};
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 13px;
  line-height: 20px;
  margin: 0;
  padding: 0;
  white-space: pre;
`;

const TOKEN_COLOR: Record<TokenKind, string> = {
  text: EDITOR_TOKENS.text.code,
  keyword: EDITOR_TOKENS.syntax.keyword,
  function: EDITOR_TOKENS.syntax.function,
  string: EDITOR_TOKENS.syntax.string,
  property: EDITOR_TOKENS.syntax.property,
  identifier: EDITOR_TOKENS.syntax.identifier,
  comment: EDITOR_TOKENS.syntax.comment,
};

const renderCodeToken = (token: CodeToken, index: number) => {
  if (token.kind === 'text') {
    return <span key={index}>{token.value}</span>;
  }

  return (
    <span key={index} style={{ color: TOKEN_COLOR[token.kind] }}>
      {token.value}
    </span>
  );
};

type TerminalEditorCodeViewProps = {
  activeFile: EditorFile;
  codeLines: CodeLine[];
};

export const TerminalEditorCodeView = ({
  activeFile,
  codeLines,
}: TerminalEditorCodeViewProps) => (
  <CodeRegion>
    <CodeStack>
      {codeLines.map((line, index) => (
        <CodeLineRow key={`${activeFile.id}-${index}`}>
          <Gutter>{index + 1}</Gutter>
          <CodeText>
            {line.length === 0 ? ' ' : line.map(renderCodeToken)}
          </CodeText>
        </CodeLineRow>
      ))}
    </CodeStack>
  </CodeRegion>
);
