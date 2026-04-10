import type { HeroBaseDataType } from '@/sections/Hero/types/HeroBaseData';

// -- Cell value types --

export type HeroCellText = {
  type: 'text';
  targetLabel?: string;
  value: string;
  shortLabel?: string;
  tone?: string;
};
export type HeroCellNumber = { type: 'number'; value: string };
export type HeroCellLink = { type: 'link'; value: string };
export type HeroCellBoolean = { type: 'boolean'; value: boolean };
export type HeroCellTag = { type: 'tag'; value: string };

export type HeroCellPerson = {
  type: 'person';
  name: string;
  avatarUrl?: string;
  kind?: 'api' | 'person' | 'system' | 'workflow';
  shortLabel?: string;
  tone?: string;
};

export type HeroCellEntity = {
  type: 'entity';
  name: string;
  domain?: string;
};

export type HeroCellRelation = {
  type: 'relation';
  items: { name: string; shortLabel?: string; tone?: string }[];
};

export type HeroCellValue =
  | HeroCellText
  | HeroCellNumber
  | HeroCellLink
  | HeroCellBoolean
  | HeroCellTag
  | HeroCellPerson
  | HeroCellEntity
  | HeroCellRelation;

// -- Column & row --

export type HeroColumnDef = {
  id: string;
  label: string;
  width: number;
  align?: 'left' | 'right';
  isFirstColumn?: boolean;
};

export type HeroRowDef = {
  id: string;
  cells: Record<string, HeroCellValue>;
};

export type HeroDashboardMetricType = {
  id: string;
  title: string;
  value: string;
};

export type HeroDashboardChartImageType = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

export type HeroDashboardDataType = {
  distributionChart: HeroDashboardChartImageType;
  metrics: HeroDashboardMetricType[];
  revenueChart: HeroDashboardChartImageType;
  visitsChart: HeroDashboardChartImageType;
};

export type HeroNavbarActionType = {
  desktopOnly?: boolean;
  icon: string;
  label?: string;
  labelTone?: 'primary' | 'secondary' | 'tertiary';
  trailingLabel?: string;
  variant?: 'button' | 'icon';
};

export type HeroPageHeaderType = {
  actions?: string[];
  count?: number;
  navbarActions?: HeroNavbarActionType[];
  showListIcon?: boolean;
  title: string;
};

export type HeroTablePageDefinition = {
  columns: HeroColumnDef[];
  header: HeroPageHeaderType;
  rows: HeroRowDef[];
  type: 'table';
  width?: number;
};

export type HeroDashboardPageDefinition = {
  dashboard: HeroDashboardDataType;
  header: HeroPageHeaderType;
  type: 'dashboard';
};

export type HeroWorkflowPageDefinition = {
  header: HeroPageHeaderType;
  type: 'workflow';
};

export type HeroKanbanCardType = {
  accountOwner: HeroCellPerson;
  amount: string;
  checked?: boolean;
  company: HeroCellEntity;
  date: string;
  id: string;
  mainContact: HeroCellPerson;
  rating: number;
  recordId: string;
  title: string;
};

export type HeroKanbanLaneType = {
  cards: HeroKanbanCardType[];
  id: string;
  label: string;
  tone: string;
};

export type HeroKanbanPageDefinition = {
  header: HeroPageHeaderType;
  lanes: HeroKanbanLaneType[];
  type: 'kanban';
};

export type HeroPageDefinition =
  | HeroDashboardPageDefinition
  | HeroKanbanPageDefinition
  | HeroTablePageDefinition
  | HeroWorkflowPageDefinition;

export type HeroPageType = HeroPageDefinition['type'];

// -- Sidebar icon --

export type HeroSidebarIcon =
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

// -- Sidebar navigation --

export type HeroSidebarItem = {
  id: string;
  label: string;
  href?: string;
  icon: HeroSidebarIcon;
  page?: HeroPageDefinition;
  meta?: string;
  active?: boolean;
  showChevron?: boolean;
  children?: HeroSidebarItem[];
};

export type HeroSidebarFolder = {
  id: string;
  label: string;
  icon: HeroSidebarIcon;
  defaultOpen?: boolean;
  showChevron?: boolean;
  children?: HeroSidebarItem[];
  items: HeroSidebarItem[];
};

export type HeroSidebarEntry = HeroSidebarItem | HeroSidebarFolder;

// -- Top-level visual --

export type HeroVisualType = {
  workspace: { icon: string; name: string };
  favoritesNav?: HeroSidebarItem[];
  workspaceNav: HeroSidebarEntry[];
  tableWidth?: number;
  actions?: string[];
};

export type HeroHomeDataType = HeroBaseDataType & {
  visual: HeroVisualType;
};
