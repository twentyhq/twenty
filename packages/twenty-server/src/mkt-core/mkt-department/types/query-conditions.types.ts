/**
 * Query condition types for department hierarchy operations
 */

export type HierarchyWhereCondition = {
  childDepartmentId?: string;
  parentDepartmentId?: string;
  isActive?: boolean;
  relationshipType?: string | string[];
  hierarchyLevel?: number;
};

export type DepartmentWhereCondition = {
  id?: string;
  departmentCode?: string;
  isActive?: boolean;
};

export type HierarchyOrderCondition = {
  displayOrder?: 'ASC' | 'DESC';
  hierarchyLevel?: 'ASC' | 'DESC';
  departmentCode?: 'ASC' | 'DESC';
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
  [key: string]: 'ASC' | 'DESC' | undefined;
};

export type DepartmentOrderCondition = {
  displayOrder?: 'ASC' | 'DESC';
  departmentCode?: 'ASC' | 'DESC';
  departmentName?: 'ASC' | 'DESC';
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
  [key: string]: 'ASC' | 'DESC' | undefined;
};
