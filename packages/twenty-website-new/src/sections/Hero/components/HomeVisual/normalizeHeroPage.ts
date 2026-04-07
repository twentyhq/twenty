import type {
  HeroKanbanPageDefinition,
  HeroPageDefinition,
  HeroSidebarItem,
  HeroTablePageDefinition,
  HeroWorkflowPageDefinition,
} from '../../types/HeroHomeData';

export type HeroPageDefaults = {
  defaultActions: string[];
  defaultTableWidth?: number;
};

function normalizeTablePage(
  page: HeroTablePageDefinition,
  defaults: HeroPageDefaults,
): HeroTablePageDefinition {
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
  page: HeroKanbanPageDefinition,
  defaults: HeroPageDefaults,
): HeroKanbanPageDefinition {
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
  page: HeroPageDefinition,
  defaults: HeroPageDefaults,
): HeroPageDefinition {
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
  page: HeroWorkflowPageDefinition,
): HeroWorkflowPageDefinition {
  return {
    ...page,
    header: {
      ...page.header,
      actions: [],
      showListIcon: false,
    },
  };
}

export function normalizeHeroPage(
  item: HeroSidebarItem,
  defaults: HeroPageDefaults,
): HeroPageDefinition | null {
  if (!item.page) {
    return null;
  }

  return normalizeExplicitPage(item.page, defaults);
}
