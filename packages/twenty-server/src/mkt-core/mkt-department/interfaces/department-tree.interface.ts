export interface DepartmentTreeNode {
  id: string;
  departmentCode: string;
  departmentName: string;
  level: number;
  children: DepartmentTreeNode[];
  relationshipType?: string;
  hierarchyId?: string;
  parent?: DepartmentTreeNode;
}

export interface DepartmentAncestor {
  id: string;
  departmentCode: string;
  departmentName: string;
  level: number;
  relationshipType: string;
  hierarchyId: string;
  distance: number;
}

export interface DepartmentDescendant {
  id: string;
  departmentCode: string;
  departmentName: string;
  level: number;
  relationshipType: string;
  hierarchyId: string;
  distance: number;
  path: string[];
}

export interface HierarchyStatistics {
  totalHierarchies: number;
  activeHierarchies: number;
  maxDepth: number;
  averageDepth: number;
  orphanedDepartments: number;
  circularReferences: number;
}

export interface DepartmentTreeOptions {
  maxDepth?: number;
  includeInactive?: boolean;
  relationshipTypes?: string[];
  sortBy?: 'displayOrder' | 'departmentName' | 'createdAt';
  sortDirection?: 'ASC' | 'DESC';
}
