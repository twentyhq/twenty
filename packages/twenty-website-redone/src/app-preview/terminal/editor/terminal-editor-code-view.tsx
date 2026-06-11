import { styled } from '@linaria/react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import {
  type CodeLine,
  type CodeToken,
  type EditorFile,
  type TokenKind,
} from './editor-types';

const editor = APP_PREVIEW_TONES.editor;

const CodeRegion = styled.div`
  background: ${editor.surface.body};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
  padding: 12px 0;
  scrollbar-color: ${editor.surface.scrollbarThumb} transparent;

  &::-webkit-scrollbar {
    background: ${editor.surface.body};
    height: 8px;
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${editor.surface.body};
  }
  &::-webkit-scrollbar-corner {
    background: ${editor.surface.body};
  }
  &::-webkit-scrollbar-thumb {
    background: ${editor.surface.scrollbarThumb};
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
  color: ${editor.text.gutter};
  display: flex;
  flex: 0 0 52px;
  font-family: ${APP_PREVIEW_STAGE.terminalFont.mono};
  font-size: 12px;
  height: 20px;
  justify-content: flex-end;
  padding-right: 12px;
  user-select: none;
  width: 52px;
`;

const CodeText = styled.pre`
  color: ${editor.text.code};
  font-family: ${APP_PREVIEW_STAGE.terminalFont.mono};
  font-size: 13px;
  line-height: 20px;
  margin: 0;
  padding: 0;
  white-space: pre;
`;

const TOKEN_COLOR: Record<TokenKind, string> = {
  text: editor.text.code,
  keyword: editor.syntax.keyword,
  function: editor.syntax.function,
  string: editor.syntax.string,
  property: editor.syntax.property,
  identifier: editor.syntax.identifier,
  comment: editor.syntax.comment,
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

export function TerminalEditorCodeView({
  activeFile,
  codeLines,
}: {
  activeFile: EditorFile;
  codeLines: CodeLine[];
}) {
  return (
    <CodeRegion>
      <CodeStack>
        {codeLines.map((line, index) => {
          // The 1-based line number IS the row's identity within a file.
          const lineNumber = index + 1;

          return (
            <CodeLineRow key={`${activeFile.id}-${lineNumber}`}>
              <Gutter>{lineNumber}</Gutter>
              <CodeText>
                {line.length === 0 ? ' ' : line.map(renderCodeToken)}
              </CodeText>
            </CodeLineRow>
          );
        })}
      </CodeStack>
    </CodeRegion>
  );
}
