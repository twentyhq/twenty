// The mockup's data vocabulary, ported from the old AppPreview types.
// Commit 3 renders the table page; the other page shapes land with their
// pages (commits 4-5) but the unions are complete so data ports verbatim.

export type CellText = {
  type: 'text';
  targetPageItemId?: string;
  value: string;
  shortLabel?: string;
  tone?: string;
};
export type CellNumber = { type: 'number'; value: string };
export type CellCurrency = { type: 'currency'; value: string };
export type CellLink = {
  type: 'link';
  kind?: 'email' | 'phone' | 'social' | 'url';
  label?: string;
  value: string;
};
export type CellBoolean = { type: 'boolean'; value: boolean };
export type CellSelectColor =
  | 'amber'
  | 'blue'
  | 'gray'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal';
export type CellSelect = {
  type: 'select';
  color?: CellSelectColor;
  value: string;
};
export type CellPerson = {
  type: 'person';
  name: string;
  avatarUrl?: string;
  kind?: 'api' | 'person' | 'system' | 'workflow';
  shortLabel?: string;
  tone?: string;
};
export type CellEntity = {
  type: 'entity';
  name: string;
  domain?: string;
};
export type CellRelation = {
  type: 'relation';
  items: { name: string; shortLabel?: string; tone?: string }[];
};
export type CellValue =
  | CellText
  | CellNumber
  | CellCurrency
  | CellLink
  | CellBoolean
  | CellSelect
  | CellPerson
  | CellEntity
  | CellRelation;

export type ColumnDef = {
  id: string;
  label: string;
  width: number;
  align?: 'left' | 'right';
  isFirstColumn?: boolean;
};
export type RowDef = {
  id: string;
  cells: Record<string, CellValue>;
};

export type NavbarAction = {
  icon: string;
  label?: string;
  trailingLabel?: string;
  labelTone?: 'primary' | 'secondary' | 'tertiary';
  variant?: 'icon';
  desktopOnly?: boolean;
};

export type PageHeader = {
  actions?: string[];
  count?: number;
  navbarActions?: NavbarAction[];
  showListIcon?: boolean;
  title: string;
};

export type TablePageDefinition = {
  columns: ColumnDef[];
  generating?: boolean;
  header: PageHeader;
  rows: RowDef[];
  type: 'table';
  width?: number;
};

export type KanbanCard = {
  accountOwner: CellPerson;
  amount: string;
  checked?: boolean;
  company: CellEntity;
  date: string;
  id: string;
  mainContact: CellPerson;
  rating: number;
  recordId: string;
  title: string;
};
export type KanbanLane = {
  cards: KanbanCard[];
  id: string;
  label: string;
  tone: string;
};
export type KanbanPageDefinition = {
  generating?: boolean;
  header: PageHeader;
  lanes: KanbanLane[];
  type: 'kanban';
};

export type WorkflowNodeDef = {
  id: string;
  x: number;
  y: number;
  width: number;
  label: 'Trigger' | 'Action';
  title: string;
  iconName: string;
  iconColor?: 'trigger' | 'action' | 'fallback';
};
export type WorkflowEdgeDef = {
  from: string;
  to: string;
  type:
    | 'branch'
    | 'curve'
    | 'loopBack'
    | 'loopRight'
    | 'smoothStep'
    | 'vertical';
};
export type WorkflowBranchLabelDef = {
  text: string;
  x: number;
  y: number;
};
export type WorkflowPageDefinition = {
  branchLabels?: WorkflowBranchLabelDef[];
  edges?: WorkflowEdgeDef[];
  generating?: boolean;
  header: PageHeader;
  nodes?: WorkflowNodeDef[];
  plusNode?: { x: number; y: number };
  type: 'workflow';
};

export type DashboardTrend = { direction: 'up' | 'down'; value: string };
export type DashboardKpi = {
  id: string;
  title: string;
  value: string;
  trend?: DashboardTrend;
};
export type DashboardBarChart = {
  title: string;
  bars: { label: string; value: number }[];
};
export type DashboardLineChart = {
  title: string;
  labels: string[];
  values: number[];
};
export type DashboardDonutChart = {
  title: string;
  centerLabel: string;
  centerValue: string;
  slices: { color: string; label: string; value: number }[];
};
export type DashboardData = {
  kpis: DashboardKpi[];
  barChart?: DashboardBarChart;
  donutChart?: DashboardDonutChart;
  lineChart?: DashboardLineChart;
  generating?: boolean;
};
export type DashboardPageDefinition = {
  dashboard: DashboardData;
  header: PageHeader;
  type: 'dashboard';
};

// The record surface belongs to the product-page family (out of wave).
export type PendingPageDefinition = {
  type: 'record';
  header: PageHeader;
};

export type PageDefinition =
  | TablePageDefinition
  | KanbanPageDefinition
  | WorkflowPageDefinition
  | DashboardPageDefinition
  | PendingPageDefinition;
export type PageType = PageDefinition['type'];

export type SidebarIcon =
  | { kind: 'tabler'; name: string; tone: string; overlay?: 'link' }
  | {
      kind: 'brand';
      brand: string;
      domain?: string;
      imageSrc?: string;
      overlay?: 'link';
    }
  | {
      color?: string;
      kind: 'avatar';
      label: string;
      tone: string;
      shape?: 'circle' | 'square';
    };

type SidebarBaseItemDef = {
  hidden?: boolean;
  id: string;
  label: string;
  icon: SidebarIcon;
  meta?: string;
};
export type SidebarPageItemDef = SidebarBaseItemDef & {
  page: PageDefinition;
  href?: never;
};
export type SidebarLinkItemDef = SidebarBaseItemDef & {
  href: string;
  page?: never;
};
export type SidebarItemDef = SidebarLinkItemDef | SidebarPageItemDef;
export type SidebarFolderDef = {
  id: string;
  label: string;
  icon: SidebarIcon;
  items: SidebarPageItemDef[];
};
export type SidebarEntry = SidebarItemDef | SidebarFolderDef;

export type AppPreviewSidebarConfig = {
  favorites: SidebarItemDef[];
  initialActiveItemId: string;
  initialOpenFolderIds: string[];
  workspace: SidebarEntry[];
};
export type AppPreviewConfig = {
  defaultViewbarActions: string[];
  sidebar: AppPreviewSidebarConfig;
};
