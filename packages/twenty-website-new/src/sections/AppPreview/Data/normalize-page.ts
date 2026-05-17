import type {
  KanbanPageDefinition,
  PageDefinition,
  SidebarItemDef,
  TablePageDefinition,
  WorkflowPageDefinition,
} from '../types';

import type { PageDefaults } from './page-defaults';

function normalizeTablePage(
  page: TablePageDefinition,
  defaults: PageDefaults,
): TablePageDefinition {
  return {
    ...page,
    header: {
      ...page.header,
      actions: page.header.actions ?? defaults.defaultActions,
      count: page.header.count ?? page.rows.length,
      showListIcon: page.header.showListIcon ?? true,
    },
    width: page.width ?? defaults.defaultTableWidth,
  };
}

function normalizeKanbanPage(
  page: KanbanPageDefinition,
  defaults: PageDefaults,
): KanbanPageDefinition {
  return {
    ...page,
    header: {
      ...page.header,
      actions: page.header.actions ?? defaults.defaultActions,
      count:
        page.header.count ??
        page.lanes.reduce((sum, lane) => sum + lane.cards.length, 0),
      showListIcon: page.header.showListIcon ?? true,
    },
  };
}

function normalizeExplicitPage(
  page: PageDefinition,
  defaults: PageDefaults,
): PageDefinition {
  if (page.type === 'table') {
    return normalizeTablePage(page, defaults);
  }

  if (page.type === 'kanban') {
    return normalizeKanbanPage(page, defaults);
  }

  if (page.type === 'workflow') {
    return normalizeWorkflowPage(page);
  }

  return {
    ...page,
    header: {
      ...page.header,
      showListIcon: page.header.showListIcon ?? false,
    },
  };
}

function normalizeWorkflowPage(
  page: WorkflowPageDefinition,
): WorkflowPageDefinition {
  return {
    ...page,
    header: {
      ...page.header,
      actions: [],
      showListIcon: false,
    },
  };
}

export function normalizePage(
  item: SidebarItemDef,
  defaults: PageDefaults,
): PageDefinition | null {
  if (!item.page) {
    return null;
  }

  return normalizeExplicitPage(item.page, defaults);
}
