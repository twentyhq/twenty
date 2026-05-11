import { type ExplorerNode } from '../types/editor-data.types';
import {
  closeTerminalEditorFile,
  getInitialTerminalEditorState,
  getTerminalEditorFallbackFileId,
  getVisibleTerminalEditorExplorerNodes,
  selectTerminalEditorFile,
  syncTerminalEditorStateWithGeneratedFiles,
} from '../utils/terminal-editor-state';

const DEFAULT_EDITOR_FILE_ID = 'launch-object';
const STARTER_EDITOR_FILE_ID = 'application-config';

describe('terminal-editor-state', () => {
  it('chooses the correct fallback file for generated and starter modes', () => {
    expect(getTerminalEditorFallbackFileId(true)).toBe(DEFAULT_EDITOR_FILE_ID);
    expect(getTerminalEditorFallbackFileId(false)).toBe(STARTER_EDITOR_FILE_ID);
  });

  it('creates an initial editor state from visibility mode', () => {
    expect(getInitialTerminalEditorState(true)).toEqual({
      activeFileId: DEFAULT_EDITOR_FILE_ID,
      openFileIds: [DEFAULT_EDITOR_FILE_ID],
    });

    expect(getInitialTerminalEditorState(false)).toEqual({
      activeFileId: STARTER_EDITOR_FILE_ID,
      openFileIds: [STARTER_EDITOR_FILE_ID],
    });
  });

  it('activates and opens the generated default file when generated files become visible', () => {
    expect(
      syncTerminalEditorStateWithGeneratedFiles({
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

  it('removes generated files and falls back to the starter file when generated files are hidden', () => {
    expect(
      syncTerminalEditorStateWithGeneratedFiles({
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

  it('keeps a non-generated active file only when it remains open after generated files are hidden', () => {
    expect(
      syncTerminalEditorStateWithGeneratedFiles({
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

  it('selects a file without duplicating an already open tab', () => {
    const state = {
      activeFileId: STARTER_EDITOR_FILE_ID,
      openFileIds: [STARTER_EDITOR_FILE_ID],
    };

    expect(
      selectTerminalEditorFile({
        state,
        fileId: STARTER_EDITOR_FILE_ID,
      }),
    ).toEqual(state);

    expect(
      selectTerminalEditorFile({
        state,
        fileId: DEFAULT_EDITOR_FILE_ID,
      }),
    ).toEqual({
      activeFileId: DEFAULT_EDITOR_FILE_ID,
      openFileIds: [STARTER_EDITOR_FILE_ID, DEFAULT_EDITOR_FILE_ID],
    });
  });

  it('closes inactive tabs without changing the active file', () => {
    expect(
      closeTerminalEditorFile({
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

  it('closes active tabs and activates the previous remaining tab', () => {
    expect(
      closeTerminalEditorFile({
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

  it('keeps one fallback tab open when the last tab closes', () => {
    expect(
      closeTerminalEditorFile({
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

  it('filters generated explorer nodes only when generated files are hidden', () => {
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

    expect(getVisibleTerminalEditorExplorerNodes(nodes, true)).toBe(nodes);
    expect(getVisibleTerminalEditorExplorerNodes(nodes, false)).toEqual([
      nodes[0],
      nodes[2],
    ]);
  });
});
