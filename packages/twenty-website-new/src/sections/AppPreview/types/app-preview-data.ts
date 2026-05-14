export type CellText = {
  type: 'text';
  targetLabel?: string;
  value: string;
  shortLabel?: string;
  tone?: string;
};
export type CellNumber = { type: 'number'; value: string };
export type CellLink = { type: 'link'; value: string };
export type CellBoolean = { type: 'boolean'; value: boolean };
export type CellTag = { type: 'tag'; value: string };

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
  | CellLink
  | CellBoolean
  | CellTag
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

export type DashboardMetric = {
  id: string;
  title: string;
  value: string;
};

export type DashboardChartImage = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

export type DashboardData = {
  distributionChart: DashboardChartImage;
  metrics: DashboardMetric[];
  revenueChart: DashboardChartImage;
  visitsChart: DashboardChartImage;
};

export type NavbarAction = {
  desktopOnly?: boolean;
  icon: string;
  label?: string;
  labelTone?: 'primary' | 'secondary' | 'tertiary';
  trailingLabel?: string;
  variant?: 'button' | 'icon';
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
  header: PageHeader;
  rows: RowDef[];
  type: 'table';
  width?: number;
};

export type DashboardPageDefinition = {
  dashboard: DashboardData;
  header: PageHeader;
  type: 'dashboard';
};

export type WorkflowPageDefinition = {
  header: PageHeader;
  type: 'workflow';
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
  header: PageHeader;
  lanes: KanbanLane[];
  type: 'kanban';
};

export type PageDefinition =
  | DashboardPageDefinition
  | KanbanPageDefinition
  | TablePageDefinition
  | WorkflowPageDefinition;

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

export type SidebarItemDef = {
  id: string;
  label: string;
  href?: string;
  icon: SidebarIcon;
  page?: PageDefinition;
  meta?: string;
  active?: boolean;
  showChevron?: boolean;
  children?: SidebarItemDef[];
};

export type SidebarFolderDef = {
  id: string;
  label: string;
  icon: SidebarIcon;
  defaultOpen?: boolean;
  showChevron?: boolean;
  children?: SidebarItemDef[];
  items: SidebarItemDef[];
};

export type SidebarEntry = SidebarItemDef | SidebarFolderDef;

export type AppPreviewConfig = {
  workspace: { icon: string; name: string };
  favoritesNav?: SidebarItemDef[];
  workspaceNav: SidebarEntry[];
  tableWidth?: number;
  actions?: string[];
};
