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
  if (item.page) {
    return normalizeExplicitPage(item.page, defaults);
  }

  if (item.pageType === 'dashboard' && item.dashboard) {
    return {
      type: 'dashboard',
      dashboard: item.dashboard,
      header: {
        showListIcon: false,
        title: item.viewLabel ?? item.label,
      },
    };
  }

  const columns = item.columns ?? [];
  const rows = item.rows ?? [];
  const hasLegacyTableData = columns.length > 0 || rows.length > 0;

  if (!hasLegacyTableData) {
    return null;
  }

  return normalizeTablePage(
    {
      type: 'table',
      columns,
      rows,
      header: {
        actions: defaults.defaultActions,
        count: item.viewCount ?? rows.length,
        showListIcon: true,
        title: item.viewLabel ?? item.label,
      },
      width: defaults.defaultTableWidth,
    },
    defaults,
  );
}
