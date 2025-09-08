/**
 * Central export for all department-related types
 */

// Query condition types
export type {
  HierarchyWhereCondition,
  DepartmentWhereCondition,
  HierarchyOrderCondition,
  DepartmentOrderCondition,
} from './query-conditions.types';

// Service types
export type {
  DepartmentPathInfo,
  CircularReferenceInfo,
  RebuildResult,
  ValidationResult,
} from './service.types';

// Re-export interface types (keeping existing imports for backward compatibility)
export type {
  DepartmentTreeNode,
  DepartmentAncestor,
  DepartmentDescendant,
  HierarchyStatistics,
  DepartmentTreeOptions,
} from 'src/mkt-core/mkt-department/interfaces/department-tree.interface';
