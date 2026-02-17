import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type ViewFilterOperand } from '@/types';

export type ViewManifestType = 'TABLE' | 'KANBAN' | 'CALENDAR' | 'FIELDS_WIDGET';

export type ViewManifestVisibility = 'WORKSPACE' | 'UNLISTED';

export type ViewManifestOpenRecordIn = 'SIDE_PANEL' | 'RECORD_PAGE';

export type ViewManifestAggregateOperation =
  | 'MIN'
  | 'MAX'
  | 'AVG'
  | 'SUM'
  | 'COUNT'
  | 'COUNT_UNIQUE_VALUES'
  | 'COUNT_EMPTY'
  | 'COUNT_NOT_EMPTY'
  | 'COUNT_TRUE'
  | 'COUNT_FALSE'
  | 'PERCENTAGE_EMPTY'
  | 'PERCENTAGE_NOT_EMPTY';

export type ViewManifestFilterGroupLogicalOperator = 'AND' | 'OR' | 'NOT';

export type ViewManifestFilterValue =
  | string
  | string[]
  | boolean
  | number
  | Record<string, unknown>;

export type ViewFieldManifest = SyncableEntityOptions & {
  fieldMetadataUniversalIdentifier: string;
  isVisible?: boolean;
  size?: number;
  position: number;
  aggregateOperation?: ViewManifestAggregateOperation;
  viewFieldGroupUniversalIdentifier?: string;
};

export type ViewFilterManifest = SyncableEntityOptions & {
  fieldMetadataUniversalIdentifier: string;
  operand: ViewFilterOperand;
  value: ViewManifestFilterValue;
  subFieldName?: string;
  viewFilterGroupUniversalIdentifier?: string;
  positionInViewFilterGroup?: number;
};

export type ViewFilterGroupManifest = SyncableEntityOptions & {
  logicalOperator: ViewManifestFilterGroupLogicalOperator;
  parentViewFilterGroupUniversalIdentifier?: string;
  positionInViewFilterGroup?: number;
};

export type ViewGroupManifest = SyncableEntityOptions & {
  fieldValue: string;
  isVisible?: boolean;
  position: number;
};

export type ViewFieldGroupManifest = SyncableEntityOptions & {
  name?: string;
  position: number;
  isVisible?: boolean;
};

export type ViewManifest = SyncableEntityOptions & {
  name: string;
  objectUniversalIdentifier: string;
  type?: ViewManifestType;
  icon?: string;
  position?: number;
  isCompact?: boolean;
  visibility?: ViewManifestVisibility;
  openRecordIn?: ViewManifestOpenRecordIn;
  fields?: ViewFieldManifest[];
  filters?: ViewFilterManifest[];
  filterGroups?: ViewFilterGroupManifest[];
  groups?: ViewGroupManifest[];
  fieldGroups?: ViewFieldGroupManifest[];
};
