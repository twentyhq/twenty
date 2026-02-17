import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type AggregateOperations,
  type ViewFilterGroupLogicalOperator,
  type ViewFilterOperand,
  type ViewOpenRecordIn,
  type ViewType,
  type ViewVisibility,
} from '@/types';

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
  aggregateOperation?: AggregateOperations;
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
  logicalOperator: ViewFilterGroupLogicalOperator;
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
  type?: ViewType;
  icon?: string;
  position?: number;
  isCompact?: boolean;
  visibility?: ViewVisibility;
  openRecordIn?: ViewOpenRecordIn;
  fields?: ViewFieldManifest[];
  filters?: ViewFilterManifest[];
  filterGroups?: ViewFilterGroupManifest[];
  groups?: ViewGroupManifest[];
  fieldGroups?: ViewFieldGroupManifest[];
};
