import { type ExplorerNode } from './editor-types';
import { terminalEditorState } from './terminal-editor-state';

const DEFAULT_EDITOR_FILE_ID = 'launch-object';
const STARTER_EDITOR_FILE_ID = 'application-config';

describe('terminalEditorState', () => {
  it('should choose the correct fallback file for generated and starter modes', () => {
    expect(terminalEditorState.getFallbackFileId(true)).toBe(
      DEFAULT_EDITOR_FILE_ID,
    );
    expect(terminalEditorState.getFallbackFileId(false)).toBe(
      STARTER_EDITOR_FILE_ID,
    );
  });

  it('should create an initial editor state from visibility mode', () => {
    expect(terminalEditorState.getInitialState(true)).toEqual({
      activeFileId: DEFAULT_EDITOR_FILE_ID,
      openFileIds: [DEFAULT_EDITOR_FILE_ID],
    });

    expect(terminalEditorState.getInitialState(false)).toEqual({
      activeFileId: STARTER_EDITOR_FILE_ID,
      openFileIds: [STARTER_EDITOR_FILE_ID],
    });
  });

  it('should activate and open the generated default file when generated files become visible', () => {
    expect(
      terminalEditorState.syncWithGeneratedFiles({
        state: {
          activeFileId: STARTER_EDITOR_FILE_ID,
          openFileIds: [STARTER_EDITOR_FILE_ID],
        },
        showGeneratedFiles: true,
      }),
    ).toEqual({
      activeFileId: DEFAULT_EDITOR_FILE_ID,
      openFileIds: [STARTER_EDITOR_FILE_ID, DEFAULT_EDITOR_FILE_ID],
    });
  });

  it('should remove generated files and fall back to the starter file when generated files are hidden', () => {
    expect(
      terminalEditorState.syncWithGeneratedFiles({
        state: {
          activeFileId: DEFAULT_EDITOR_FILE_ID,
          openFileIds: [DEFAULT_EDITOR_FILE_ID, 'rocket-object'],
        },
        showGeneratedFiles: false,
      }),
    ).toEqual({
      activeFileId: STARTER_EDITOR_FILE_ID,
      openFileIds: [STARTER_EDITOR_FILE_ID],
    });
  });

  it('should keep a non-generated active file only when it remains open after generated files are hidden', () => {
    expect(
      terminalEditorState.syncWithGeneratedFiles({
        state: {
          activeFileId: STARTER_EDITOR_FILE_ID,
          openFileIds: [DEFAULT_EDITOR_FILE_ID, STARTER_EDITOR_FILE_ID],
        },
        showGeneratedFiles: false,
      }),
    ).toEqual({
      activeFileId: STARTER_EDITOR_FILE_ID,
      openFileIds: [STARTER_EDITOR_FILE_ID],
    });
  });

  it('should select a file without duplicating an already open tab', () => {
    const state = {
      activeFileId: STARTER_EDITOR_FILE_ID,
      openFileIds: [STARTER_EDITOR_FILE_ID],
    };

    expect(
      terminalEditorState.selectFile({
        state,
        fileId: STARTER_EDITOR_FILE_ID,
      }),
    ).toEqual(state);

    expect(
      terminalEditorState.selectFile({
        state,
        fileId: DEFAULT_EDITOR_FILE_ID,
      }),
    ).toEqual({
      activeFileId: DEFAULT_EDITOR_FILE_ID,
      openFileIds: [STARTER_EDITOR_FILE_ID, DEFAULT_EDITOR_FILE_ID],
    });
  });

  it('should close inactive tabs without changing the active file', () => {
    expect(
      terminalEditorState.closeFile({
        state: {
          activeFileId: STARTER_EDITOR_FILE_ID,
          openFileIds: [STARTER_EDITOR_FILE_ID, DEFAULT_EDITOR_FILE_ID],
        },
        fileId: DEFAULT_EDITOR_FILE_ID,
        fallbackFileId: STARTER_EDITOR_FILE_ID,
      }),
    ).toEqual({
      activeFileId: STARTER_EDITOR_FILE_ID,
      openFileIds: [STARTER_EDITOR_FILE_ID],
    });
  });

  it('should close active tabs and activate the previous remaining tab', () => {
    expect(
      terminalEditorState.closeFile({
        state: {
          activeFileId: DEFAULT_EDITOR_FILE_ID,
          openFileIds: [
            STARTER_EDITOR_FILE_ID,
            'schema-identifiers',
            DEFAULT_EDITOR_FILE_ID,
          ],
        },
        fileId: DEFAULT_EDITOR_FILE_ID,
        fallbackFileId: STARTER_EDITOR_FILE_ID,
      }),
    ).toEqual({
      activeFileId: 'schema-identifiers',
      openFileIds: [STARTER_EDITOR_FILE_ID, 'schema-identifiers'],
    });
  });

  it('should keep one fallback tab open when the last tab closes', () => {
    expect(
      terminalEditorState.closeFile({
        state: {
          activeFileId: STARTER_EDITOR_FILE_ID,
          openFileIds: [STARTER_EDITOR_FILE_ID],
        },
        fileId: STARTER_EDITOR_FILE_ID,
        fallbackFileId: STARTER_EDITOR_FILE_ID,
      }),
    ).toEqual({
      activeFileId: STARTER_EDITOR_FILE_ID,
      openFileIds: [STARTER_EDITOR_FILE_ID],
    });
  });

  it('should filter generated explorer nodes only when generated files are hidden', () => {
    const nodes: ExplorerNode[] = [
      {
        depth: 0,
        expanded: true,
        id: 'root',
        kind: 'folder',
        name: 'root',
      },
      {
        depth: 1,
        fileId: DEFAULT_EDITOR_FILE_ID,
        generated: true,
        icon: 'ts',
        iconLabel: 'TS',
        id: 'generated',
        kind: 'file',
        name: 'generated.ts',
      },
      {
        depth: 1,
        fileId: STARTER_EDITOR_FILE_ID,
        icon: 'ts',
        iconLabel: 'TS',
        id: 'starter',
        kind: 'file',
        name: 'starter.ts',
      },
    ];

    expect(terminalEditorState.getVisibleExplorerNodes(nodes, true)).toBe(
      nodes,
    );
    expect(terminalEditorState.getVisibleExplorerNodes(nodes, false)).toEqual([
      nodes[0],
      nodes[2],
    ]);
  });
});
