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

export type CellSelect = {
  type: 'select';
  color?:
    | 'amber'
    | 'blue'
    | 'gray'
    | 'green'
    | 'orange'
    | 'pink'
    | 'purple'
    | 'red'
    | 'teal';
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

export type WorkflowNodeDef = {
  id: string;
  x: number;
  y: number;
  width: number;
  label: 'Trigger' | 'Action';
  title: string;
  iconName: string;
  iconColor?: string;
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
  header: PageHeader;
  nodes?: WorkflowNodeDef[];
  plusNode?: { x: number; y: number };
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

export type RecordFieldValue =
  | CellBoolean
  | CellCurrency
  | CellLink
  | CellPerson
  | CellSelect
  | CellText;

export type RecordField = {
  icon?: string;
  label: string;
  value: RecordFieldValue;
};

export type RecordRelation = {
  avatarUrl?: string;
  domain?: string;
  icon?: SidebarIcon;
  name: string;
};

export type RecordNote = {
  id: string;
  title: string;
  body: string;
  relation?: { avatarUrl?: string; name: string };
};

export type RecordPageDefinition = {
  type: 'record';
  header: PageHeader;
  record: {
    logoDomain?: string;
    name: string;
    createdAt: string;
    fields: RecordField[];
    moreCount?: number;
    relations: {
      title: string;
      count?: number;
      items: RecordRelation[];
    }[];
  };
  notes: RecordNote[];
};

export type PageDefinition =
  | DashboardPageDefinition
  | KanbanPageDefinition
  | RecordPageDefinition
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

type SidebarBaseItemDef = {
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
