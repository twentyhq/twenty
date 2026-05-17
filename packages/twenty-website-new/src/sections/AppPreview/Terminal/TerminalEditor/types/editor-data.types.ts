export type FileIconKind = 'ts' | 'md' | 'js' | 'git' | 'yaml' | 'cf' | 'lock';

export type ExplorerNode = {
  id: string;
  name: string;
  depth: number;
} & (
  | { kind: 'folder'; expanded: boolean; generated?: boolean }
  | {
      kind: 'file';
      icon: FileIconKind;
      iconLabel: string;
      fileId?: string;
      generated?: boolean;
    }
);

export type TokenKind =
  | 'text'
  | 'keyword'
  | 'function'
  | 'string'
  | 'property'
  | 'identifier'
  | 'comment';

export type CodeToken = { kind: TokenKind; value: string };

export type CodeLine = CodeToken[];

export type EditorFile = {
  id: string;
  name: string;
  path: string;
  source: string;
};
