import { ViewKey } from '@/types/ViewKey';

export const DISCRIMINATOR_BY_ENTITY_TYPE = {
  object: (input: { nameSingular: string }) => input.nameSingular,
  field: (input: { name: string }) => input.name,
  selectOption: (input: { label: string }) => input.label,
  view: (input: { key?: string | null; name: string }) =>
    input.key ?? input.name,
  viewField: (input: { fieldMetadataUniversalIdentifier: string }) =>
    input.fieldMetadataUniversalIdentifier,
  viewSort: (input: { fieldMetadataUniversalIdentifier: string }) =>
    input.fieldMetadataUniversalIdentifier,
  viewGroup: (input: { fieldValue: string }) => input.fieldValue,
  viewFilter: (input: {
    fieldMetadataUniversalIdentifier: string;
    operand: string;
    subFieldName?: string | null;
  }) =>
    `${input.fieldMetadataUniversalIdentifier}:${input.operand}:${input.subFieldName ?? ''}`,
  index: (input: { fieldUniversalIdentifiers: string[]; isUnique?: boolean }) =>
    `${[...input.fieldUniversalIdentifiers].sort().join(',')}:${input.isUnique ? 'unique' : 'index'}`,
  pageLayout: (input: { name: string }) => input.name,
  pageLayoutTab: (input: { title: string }) => input.title,
  pageLayoutWidget: (input: { title: string; type: string }) =>
    `${input.title}:${input.type}`,
  role: (input: { label: string }) => input.label,
  objectPermission: (input: { objectUniversalIdentifier: string }) =>
    input.objectUniversalIdentifier,
  fieldPermission: (input: {
    objectUniversalIdentifier: string;
    fieldUniversalIdentifier: string;
  }) => `${input.objectUniversalIdentifier}:${input.fieldUniversalIdentifier}`,
  permissionFlag: (input: { key: string }) => input.key,
  commandMenuItem: (input: {
    frontComponentUniversalIdentifier: string;
    availabilityObjectUniversalIdentifier?: string | null;
    availabilityType?: string | null;
  }) =>
    `${input.frontComponentUniversalIdentifier}:${input.availabilityObjectUniversalIdentifier ?? input.availabilityType ?? ''}`,
  navigationMenuItem: (input: {
    viewUniversalIdentifier?: string | null;
    pageLayoutUniversalIdentifier?: string | null;
    targetObjectUniversalIdentifier?: string | null;
    link?: string | null;
  }) =>
    input.viewUniversalIdentifier ??
    input.pageLayoutUniversalIdentifier ??
    input.targetObjectUniversalIdentifier ??
    input.link ??
    '',
  frontComponent: (input: { componentName: string }) => input.componentName,
  logicFunction: (input: { sourceHandlerPath: string }) =>
    input.sourceHandlerPath,
  agent: (input: { name: string }) => input.name,
  skill: (input: { name: string }) => input.name,
  connectionProvider: (input: { name: string }) => input.name,
} as const;

export const SYSTEM_RECORD_VIEW_DISCRIMINATOR = {
  index: ViewKey.INDEX,
  recordPageFields: 'RECORD_PAGE_FIELDS',
} as const satisfies Record<string, string>;

export type SystemRecordViewKind =
  keyof typeof SYSTEM_RECORD_VIEW_DISCRIMINATOR;

export const SYSTEM_INDEX_DISCRIMINATOR = {
  searchVector: 'SEARCH_VECTOR',
} as const satisfies Record<string, string>;

export type SystemIndexKind = keyof typeof SYSTEM_INDEX_DISCRIMINATOR;

export const SYSTEM_RECORD_PAGE_LAYOUT_DISCRIMINATOR = 'RECORD_PAGE';

export const SYSTEM_RECORD_PAGE_TAB_DISCRIMINATOR = {
  home: 'home',
  timeline: 'timeline',
  tasks: 'tasks',
  notes: 'notes',
  files: 'files',
} as const satisfies Record<string, string>;

export type SystemRecordPageTabKind =
  keyof typeof SYSTEM_RECORD_PAGE_TAB_DISCRIMINATOR;

export const SYSTEM_RECORD_PAGE_WIDGET_DISCRIMINATOR = {
  fields: 'FIELDS',
  timeline: 'TIMELINE',
  tasks: 'TASKS',
  notes: 'NOTES',
  files: 'FILES',
} as const satisfies Record<string, string>;

export type SystemRecordPageWidgetKind =
  keyof typeof SYSTEM_RECORD_PAGE_WIDGET_DISCRIMINATOR;

export const SYSTEM_NAVIGATION_COMMAND_DISCRIMINATOR = 'navigation';
