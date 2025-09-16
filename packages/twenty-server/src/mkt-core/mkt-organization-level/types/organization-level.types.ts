/**
 * Organization Level Service Types
 */

export interface OrganizationLevelQueryConditions {
  isActive?: boolean;
  hierarchyLevel?: number | number[];
  levelCodes?: string[];
  parentLevelId?: string;
}

export interface HierarchyNodeMetadata {
  totalEmployees: number;
  activeEmployees: number;
  directChildrenCount: number;
  totalDescendantsCount: number;
  depth: number;
  isLeaf: boolean;
  hasCircularReference: boolean;
}

export interface OrganizationLevelPermissionSummary {
  resourceCount: number;
  actionCount: number;
  restrictionCount: number;
  temporalLimitations: boolean;
  dataAccessLimitations: boolean;
  operationalLimitations: boolean;
  functionalLimitations: boolean;
}

export interface OrganizationLevelAnalytics {
  levelId: string;
  levelName: string;
  hierarchyLevel: number;
  employeeMetrics: {
    total: number;
    active: number;
    averageTenure: number;
    turnoverRate: number;
  };
  performanceMetrics: {
    averageKpiScore?: number;
    completedGoals: number;
    overdueTasks: number;
  };
  hierarchyMetrics: {
    directReports: number;
    totalReports: number;
    managementSpan: number;
    organizationalDepth: number;
  };
}

export type OrganizationSize = 'small' | 'medium' | 'large' | 'enterprise';

export type HierarchyValidationSeverity = 'error' | 'warning' | 'info';

export interface HierarchyOptimizationSuggestion {
  type: 'restructure' | 'merge' | 'split' | 'rebalance';
  priority: 'high' | 'medium' | 'low';
  description: string;
  affectedLevels: string[];
  expectedBenefit: string;
  implementationComplexity: 'easy' | 'medium' | 'complex';
}
