import { displayPage } from './display-page';
import { PRODUCT_VISUAL_SCENES } from './product-visual-scenes';
import { NEW_TASK_ROWS } from './new-task-rows';
import { type KanbanPageDefinition, type TablePageDefinition } from '../types';

const { buildFocusedOpportunitiesPage, getStreamProgress, resolveDisplayPage } =
  displayPage;

const sceneByKind = (kind: string) => {
  const scene = PRODUCT_VISUAL_SCENES.find((entry) => entry.kind === kind);
  if (!scene) throw new Error(`missing scene ${kind}`);
  return scene;
};

const kanbanPage: KanbanPageDefinition = {
  type: 'kanban',
  header: { title: 'All Opportunities', count: 9 },
  lanes: [
    {
      id: 'new',
      label: 'New',
      tone: 'blue',
      cards: [
        { id: 'a' },
        { id: 'b' },
      ] as KanbanPageDefinition['lanes'][number]['cards'],
    },
    {
      id: 'empty',
      label: 'Screening',
      tone: 'gray',
      cards: [],
    },
    {
      id: 'meeting',
      label: 'Meeting',
      tone: 'green',
      cards: [{ id: 'c' }] as KanbanPageDefinition['lanes'][number]['cards'],
    },
  ],
};

describe('displayPage.getStreamProgress', () => {
  it('should treat an empty answer as fully streamed', () => {
    expect(getStreamProgress(0, 0)).toBe(1);
  });

  it('should clamp to 1', () => {
    expect(getStreamProgress(50, 10)).toBe(1);
  });
});

describe('displayPage.buildFocusedOpportunitiesPage', () => {
  it('should drop empty lanes and retitle the board', () => {
    const focused = buildFocusedOpportunitiesPage(kanbanPage, 1);
    expect(focused.lanes.map((lane) => lane.id)).toEqual(['new', 'meeting']);
    expect(focused.header.title).toBe('Pipeline by stage');
    expect(focused.header.count).toBe(3);
  });

  it('should reveal no cards before 18% stream progress', () => {
    const focused = buildFocusedOpportunitiesPage(kanbanPage, 0.18);
    expect(focused.lanes.every((lane) => lane.cards.length === 0)).toBe(true);
    expect(focused.header.count).toBe(0);
  });

  it('should fill lanes left to right as progress advances', () => {
    const focused = buildFocusedOpportunitiesPage(kanbanPage, 0.5);
    const counts = focused.lanes.map((lane) => lane.cards.length);
    expect(counts[0]).toBeGreaterThan(0);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(focused.header.count);
  });
});

describe('displayPage.resolveDisplayPage', () => {
  it('should mark the kanban generating at zero progress and hide the count', () => {
    const scene = sceneByKind('opportunityReview');
    const resolved = resolveDisplayPage(kanbanPage, 'opportunities', scene, 0);
    expect(resolved.type).toBe('kanban');
    if (resolved.type === 'kanban') {
      expect(resolved.generating).toBe(true);
      expect(resolved.header.count).toBeUndefined();
      expect(resolved.lanes.map((lane) => lane.id)).toEqual(['new', 'meeting']);
    }
  });

  it('should swap the tasks table to the generated rows', () => {
    const scene = sceneByKind('taskCreation');
    const tablePage: TablePageDefinition = {
      type: 'table',
      header: { title: 'All Tasks', count: 3 },
      columns: [],
      rows: [],
    };
    const generating = resolveDisplayPage(tablePage, 'tasks', scene, 0);
    if (generating.type === 'table') {
      expect(generating.generating).toBe(true);
      expect(generating.header.count).toBeUndefined();
    }
    const streamed = resolveDisplayPage(tablePage, 'tasks', scene, 0.4);
    if (streamed.type === 'table') {
      expect(streamed.generating).toBe(false);
      expect(streamed.rows).toBe(NEW_TASK_ROWS);
      expect(streamed.header.count).toBe(10);
    }
  });

  it('should pass through pages the scene does not touch', () => {
    const scene = sceneByKind('leadCreation');
    expect(resolveDisplayPage(kanbanPage, 'companies', scene, 1)).toBe(
      kanbanPage,
    );
  });
});
