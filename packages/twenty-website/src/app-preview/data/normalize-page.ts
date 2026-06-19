import {
  type KanbanPageDefinition,
  type PageDefinition,
  type SidebarPageItemDef,
  type TablePageDefinition,
} from '../types';

// Pages are authored sparse; the navigation layer fills the product's
// defaults — including the list icon, count, and the 1700px table canvas
// whose overshoot renders the "+ add field" filler column.
type PageDefaults = {
  defaultActions: string[];
  defaultTableWidth: number;
};

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

export function normalizePage(
  item: SidebarPageItemDef,
  defaults: PageDefaults,
): PageDefinition {
  const page = item.page;
  if (page.type === 'table') {
    return normalizeTablePage(page, defaults);
  }
  if (page.type === 'kanban') {
    return normalizeKanbanPage(page, defaults);
  }
  return {
    ...page,
    header: {
      ...page.header,
      showListIcon: page.header.showListIcon ?? false,
    },
  };
}
