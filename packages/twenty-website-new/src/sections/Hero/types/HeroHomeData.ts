import type { HeroBaseDataType } from '@/sections/Hero/types/HeroBaseData';

// -- Cell value types --

export type HeroCellText = { type: 'text'; value: string };
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

// -- Sidebar icon --

export type HeroSidebarIcon =
  | { kind: 'tabler'; name: string; tone: string; overlay?: 'link' }
  | { kind: 'brand'; brand: string; overlay?: 'link' }
  | {
      kind: 'avatar';
      label: string;
      tone: string;
      shape?: 'circle' | 'square';
    };

// -- Sidebar navigation --

export type HeroSidebarItem = {
  id: string;
  label: string;
  icon: HeroSidebarIcon;
  meta?: string;
  active?: boolean;
  showChevron?: boolean;
  children?: HeroSidebarItem[];
  columns?: HeroColumnDef[];
  rows?: HeroRowDef[];
  viewLabel?: string;
  viewCount?: number;
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
