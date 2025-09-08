import { Injectable, NotFoundException } from '@nestjs/common';

import {
  DepartmentAncestor,
  DepartmentDescendant,
  DepartmentTreeNode,
  DepartmentTreeOptions,
  HierarchyStatistics,
  HierarchyWhereCondition,
} from 'src/mkt-core/mkt-department/types';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MktDepartmentWorkspaceEntity } from 'src/mkt-core/mkt-department/mkt-department.workspace-entity';
import {
  DEPARTMENT_HIERARCHY_RELATIONSHIP_TYPES,
  MAX_DEPTH,
} from 'src/mkt-core/mkt-department/constants/relationship-type.constants';

@Injectable()
export class DepartmentService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  private async getRepositories(workspaceId: string) {
    const hierarchyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'mktDepartmentHierarchy',
        { shouldBypassPermissionChecks: true },
      );

    const departmentRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'mktDepartment',
        { shouldBypassPermissionChecks: true },
      );

    return { hierarchyRepository, departmentRepository };
  }

  /**
   * Get complete department tree from root
   */
  async getDepartmentTree(
    workspaceId: string,
    departmentId: string,
    options: DepartmentTreeOptions = {},
  ): Promise<DepartmentTreeNode> {
    // Step 1: Find root department
    const rootDepartment = await this.findRootDepartment(
      workspaceId,
      departmentId,
      options,
    );

    // Step 2: Build tree from root
    const tree = await this.buildTreeFromRoot(
      workspaceId,
      rootDepartment.id,
      options,
      0,
    );

    if (!tree) {
      throw new NotFoundException(
        `Could not build tree for department ${departmentId}`,
      );
    }

    return tree;
  }

  /**
   * Get subtree starting from specific department
   */
  async getDepartmentSubtree(
    workspaceId: string,
    departmentId: string,
    options: DepartmentTreeOptions = {},
  ): Promise<DepartmentTreeNode> {
    await this.validateDepartmentExists(workspaceId, departmentId);

    const tree = await this.buildTreeFromRoot(
      workspaceId,
      departmentId,
      options,
      0,
    );

    if (!tree) {
      throw new NotFoundException(
        `Could not build subtree for department ${departmentId}`,
      );
    }

    return tree;
  }

  /**
   * Get all ancestors of a department
   */
  async getDepartmentAncestors(
    workspaceId: string,
    departmentId: string,
    relationshipTypes?: string[],
  ): Promise<DepartmentAncestor[]> {
    await this.validateDepartmentExists(workspaceId, departmentId);
    const { hierarchyRepository } = await this.getRepositories(workspaceId);

    const ancestors: DepartmentAncestor[] = [];
    let currentDeptId = departmentId;
    let distance = 0;
    const visited = new Set<string>();

    while (currentDeptId && !visited.has(currentDeptId)) {
      visited.add(currentDeptId);
      distance++;

      const whereCondition: HierarchyWhereCondition = {
        childDepartmentId: currentDeptId,
        isActive: true,
      };

      if (relationshipTypes && relationshipTypes.length > 0) {
        whereCondition.relationshipType = relationshipTypes.includes('any')
          ? undefined
          : relationshipTypes;
      } else {
        whereCondition.relationshipType =
          DEPARTMENT_HIERARCHY_RELATIONSHIP_TYPES.PARENT_CHILD;
      }

      const parentHierarchy = await hierarchyRepository.findOne({
        where: whereCondition,
        relations: ['parentDepartment'],
      });

      if (!parentHierarchy) break;

      ancestors.push({
        id: parentHierarchy.parentDepartment.id,
        departmentCode: parentHierarchy.parentDepartment.departmentCode,
        departmentName: parentHierarchy.parentDepartment.departmentName,
        level: parentHierarchy.hierarchyLevel - 1,
        relationshipType: parentHierarchy.relationshipType,
        hierarchyId: parentHierarchy.id,
        distance,
      });

      currentDeptId = parentHierarchy.parentDepartmentId;
    }

    return ancestors.reverse(); // Root first
  }

  /**
   * Get all descendants of a department
   */
  async getDepartmentDescendants(
    workspaceId: string,
    departmentId: string,
    maxDepth = MAX_DEPTH,
    relationshipTypes?: string[],
  ): Promise<DepartmentDescendant[]> {
    await this.validateDepartmentExists(workspaceId, departmentId);

    const descendants: DepartmentDescendant[] = [];

    await this.collectDescendants(
      workspaceId,
      departmentId,
      descendants,
      maxDepth,
      0,
      [],
      relationshipTypes,
    );

    return descendants;
  }

  /**
   * Get hierarchy statistics
   */
  async getHierarchyStatistics(
    workspaceId: string,
  ): Promise<HierarchyStatistics> {
    const { hierarchyRepository } = await this.getRepositories(workspaceId);

    const [
      totalHierarchies,
      activeHierarchies,
      maxDepthResult,
      avgDepthResult,
      orphanedCount,
      circularCount,
    ] = await Promise.all([
      hierarchyRepository.count(),
      hierarchyRepository.count({ where: { isActive: true } }),
      hierarchyRepository
        .createQueryBuilder('h')
        .select('MAX(h.hierarchyLevel)', 'maxDepth')
        .getRawOne(),
      hierarchyRepository
        .createQueryBuilder('h')
        .select('AVG(h.hierarchyLevel)', 'avgDepth')
        .getRawOne(),
      this.countOrphanedDepartments(workspaceId),
      this.detectCircularReferences(workspaceId),
    ]);

    return {
      totalHierarchies,
      activeHierarchies,
      maxDepth: parseInt(maxDepthResult?.maxDepth || '0'),
      averageDepth: parseFloat(avgDepthResult?.avgDepth || '0'),
      orphanedDepartments: orphanedCount,
      circularReferences: circularCount,
    };
  }

  /**
   * Get complete department structure (all root departments with their trees)
   */
  async getCompleteDepartmentStructure(
    workspaceId: string,
    options: DepartmentTreeOptions = {},
  ): Promise<DepartmentTreeNode[]> {
    // Find all root departments (departments that don't have parents)
    const rootDepartments = await this.findAllRootDepartments(
      workspaceId,
      options,
    );

    // Build trees for each root department
    const trees = await Promise.all(
      rootDepartments.map(async (rootDept) => {
        return await this.buildTreeFromRoot(
          workspaceId,
          rootDept.id,
          options,
          0,
        );
      }),
    );

    // Filter out null results and return
    return trees.filter((tree) => tree !== null) as DepartmentTreeNode[];
  }

  /**
   * Rebuild hierarchy paths for all hierarchies
   */
  async rebuildAllHierarchyPaths(workspaceId: string): Promise<number> {
    const { hierarchyRepository } = await this.getRepositories(workspaceId);
    let rebuilt = 0;

    // Process level by level to maintain dependencies
    for (let level = 0; level <= MAX_DEPTH; level++) {
      const hierarchies = await hierarchyRepository.find({
        where: { hierarchyLevel: level, isActive: true },
      });

      for (const hierarchy of hierarchies) {
        const path = await this.computeHierarchyPath(
          workspaceId,
          hierarchy.childDepartmentId,
        );

        await hierarchyRepository.update(hierarchy.id, {
          hierarchyPath: path,
        });
        rebuilt++;
      }
    }

    return rebuilt;
  }

  // Private helper methods
  private async findAllRootDepartments(
    workspaceId: string,
    options: DepartmentTreeOptions = {},
  ): Promise<MktDepartmentWorkspaceEntity[]> {
    const { hierarchyRepository, departmentRepository } =
      await this.getRepositories(workspaceId);
    const { relationshipTypes, includeInactive = false } = options;

    // Get all departments
    const allDepartments =
      (await departmentRepository.find()) as MktDepartmentWorkspaceEntity[];

    // Get all child department IDs from hierarchies
    const whereCondition: HierarchyWhereCondition = {};

    if (!includeInactive) {
      whereCondition.isActive = true;
    }

    if (relationshipTypes && relationshipTypes.length > 0) {
      whereCondition.relationshipType = relationshipTypes;
    } else {
      whereCondition.relationshipType =
        DEPARTMENT_HIERARCHY_RELATIONSHIP_TYPES.PARENT_CHILD;
    }

    const hierarchies = await hierarchyRepository.find({
      where: whereCondition,
    });

    // Collect all department IDs that are children (have parents)
    const childDepartmentIds = new Set<string>();

    hierarchies.forEach((hierarchy) => {
      if (hierarchy.childDepartmentId) {
        childDepartmentIds.add(hierarchy.childDepartmentId);
      }
    });

    // Root departments are those that don't appear as children in any hierarchy

    return allDepartments.filter((dept) => !childDepartmentIds.has(dept.id));
  }

  private async findRootDepartment(
    workspaceId: string,
    departmentId: string,
    options: DepartmentTreeOptions = {},
  ): Promise<MktDepartmentWorkspaceEntity> {
    const { hierarchyRepository, departmentRepository } =
      await this.getRepositories(workspaceId);
    const { relationshipTypes } = options;
    let currentDeptId = departmentId;
    const visited = new Set<string>();

    while (currentDeptId && !visited.has(currentDeptId)) {
      visited.add(currentDeptId);

      const whereCondition: HierarchyWhereCondition = {
        childDepartmentId: currentDeptId,
        isActive: true,
      };

      if (relationshipTypes && relationshipTypes.length > 0) {
        whereCondition.relationshipType = relationshipTypes;
      } else {
        whereCondition.relationshipType =
          DEPARTMENT_HIERARCHY_RELATIONSHIP_TYPES.PARENT_CHILD;
      }

      const parentHierarchy = await hierarchyRepository.findOne({
        where: whereCondition,
        relations: ['parentDepartment'],
      });

      if (!parentHierarchy) break;
      currentDeptId = parentHierarchy.parentDepartmentId;
    }

    const rootDepartment = (await departmentRepository.findOne({
      where: { id: currentDeptId },
    })) as MktDepartmentWorkspaceEntity;

    if (!rootDepartment) {
      throw new NotFoundException(
        `Root department not found for department ${departmentId}`,
      );
    }

    return rootDepartment;
  }

  private async buildTreeFromRoot(
    workspaceId: string,
    rootId: string,
    options: DepartmentTreeOptions = {},
    currentDepth = 0,
  ): Promise<DepartmentTreeNode | null> {
    const { maxDepth = MAX_DEPTH } = options;

    if (currentDepth >= maxDepth) return null;

    const department = await this.findDepartmentById(workspaceId, rootId);
    const children = await this.buildChildrenNodes(
      workspaceId,
      rootId,
      options,
      currentDepth,
    );

    return this.createDepartmentTreeNode(department, currentDepth, children);
  }

  private async findDepartmentById(
    workspaceId: string,
    departmentId: string,
  ): Promise<MktDepartmentWorkspaceEntity> {
    const { departmentRepository } = await this.getRepositories(workspaceId);
    const department = await departmentRepository.findOne({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException(`Department ${departmentId} not found`);
    }

    return department as MktDepartmentWorkspaceEntity;
  }

  private async buildChildrenNodes(
    workspaceId: string,
    parentId: string,
    options: DepartmentTreeOptions,
    currentDepth: number,
  ): Promise<DepartmentTreeNode[]> {
    const { maxDepth = MAX_DEPTH } = options;

    if (currentDepth >= maxDepth - 1) {
      return [];
    }

    const childHierarchies = await this.findChildHierarchies(
      workspaceId,
      parentId,
      options,
    );

    const childPromises = childHierarchies.map(async (hierarchy) => {
      const childTree = await this.buildTreeFromRoot(
        workspaceId,
        hierarchy.childDepartmentId,
        options,
        currentDepth + 1,
      );

      if (childTree) {
        childTree.relationshipType = hierarchy.relationshipType;
        childTree.hierarchyId = hierarchy.id;
      }

      return childTree;
    });

    const children = await Promise.all(childPromises);

    return children.filter(Boolean) as DepartmentTreeNode[];
  }

  private async findChildHierarchies(
    workspaceId: string,
    parentId: string,
    options: DepartmentTreeOptions,
  ) {
    const { hierarchyRepository } = await this.getRepositories(workspaceId);
    const {
      includeInactive = false,
      relationshipTypes,
      sortBy = 'displayOrder',
      sortDirection = 'ASC',
    } = options;

    const whereCondition = this.buildHierarchyWhereCondition(
      parentId,
      includeInactive,
      relationshipTypes,
    );
    const orderCondition = this.buildOrderCondition(sortBy, sortDirection);

    return await hierarchyRepository.find({
      where: whereCondition,
      relations: ['childDepartment'],
      order: orderCondition,
    });
  }

  private buildHierarchyWhereCondition(
    parentId: string,
    includeInactive: boolean,
    relationshipTypes?: string[],
  ): HierarchyWhereCondition {
    const whereCondition: HierarchyWhereCondition = {
      parentDepartmentId: parentId,
    };

    if (!includeInactive) {
      whereCondition.isActive = true;
    }

    if (relationshipTypes && relationshipTypes.length > 0) {
      whereCondition.relationshipType = relationshipTypes;
    }

    return whereCondition;
  }

  private buildOrderCondition(
    sortBy?: string,
    sortDirection?: string,
  ): Record<string, 'ASC' | 'DESC'> {
    const orderCondition: Record<string, 'ASC' | 'DESC'> = {};

    if (sortBy && sortDirection) {
      orderCondition[sortBy] = sortDirection as 'ASC' | 'DESC';
    }

    return orderCondition;
  }

  private createDepartmentTreeNode(
    department: MktDepartmentWorkspaceEntity,
    currentDepth: number,
    children: DepartmentTreeNode[],
  ): DepartmentTreeNode {
    return {
      id: department.id,
      departmentCode: department.departmentCode,
      departmentName: department.departmentName,
      level: currentDepth,
      children,
      relationshipType: currentDepth === 0 ? undefined : undefined,
      hierarchyId: currentDepth === 0 ? undefined : undefined,
    };
  }

  private async collectDescendants(
    workspaceId: string,
    parentId: string,
    descendants: DepartmentDescendant[],
    maxDepth: number,
    currentDepth: number,
    currentPath: string[],
    relationshipTypes?: string[],
  ): Promise<void> {
    if (currentDepth >= maxDepth) return;

    const { hierarchyRepository } = await this.getRepositories(workspaceId);

    const whereCondition: HierarchyWhereCondition = {
      parentDepartmentId: parentId,
      isActive: true,
    };

    if (relationshipTypes && relationshipTypes.length > 0) {
      whereCondition.relationshipType = relationshipTypes;
    }

    const childHierarchies = await hierarchyRepository.find({
      where: whereCondition,
      relations: ['childDepartment'],
      order: { displayOrder: 'ASC' },
    });

    for (const hierarchy of childHierarchies) {
      const newPath = [
        ...currentPath,
        hierarchy.childDepartment.departmentCode,
      ];

      descendants.push({
        id: hierarchy.childDepartment.id,
        departmentCode: hierarchy.childDepartment.departmentCode,
        departmentName: hierarchy.childDepartment.departmentName,
        level: hierarchy.hierarchyLevel,
        relationshipType: hierarchy.relationshipType,
        hierarchyId: hierarchy.id,
        distance: currentDepth + 1,
        path: newPath,
      });

      // Recursive call for deeper levels
      await this.collectDescendants(
        workspaceId,
        hierarchy.childDepartmentId,
        descendants,
        maxDepth,
        currentDepth + 1,
        newPath,
        relationshipTypes,
      );
    }
  }

  private async computeHierarchyPath(
    workspaceId: string,
    departmentId: string,
  ): Promise<string[]> {
    const { hierarchyRepository } = await this.getRepositories(workspaceId);
    const path: string[] = [];
    let currentDeptId = departmentId;
    const visited = new Set<string>();

    while (currentDeptId && !visited.has(currentDeptId)) {
      visited.add(currentDeptId);

      const parentHierarchy = await hierarchyRepository.findOne({
        where: {
          childDepartmentId: currentDeptId,
          isActive: true,
          relationshipType:
            DEPARTMENT_HIERARCHY_RELATIONSHIP_TYPES.PARENT_CHILD,
        },
      });

      if (!parentHierarchy) break;

      path.unshift(parentHierarchy.parentDepartmentId);
      currentDeptId = parentHierarchy.parentDepartmentId;
    }

    return path;
  }

  private async validateDepartmentExists(
    workspaceId: string,
    departmentId: string,
  ): Promise<void> {
    const { departmentRepository } = await this.getRepositories(workspaceId);
    const exists = await departmentRepository.existsBy({
      id: departmentId,
    });

    if (!exists) {
      throw new NotFoundException(`Department ${departmentId} not found`);
    }
  }

  private async countOrphanedDepartments(workspaceId: string): Promise<number> {
    // Since we're using twentyORM, we'll use a simpler approach
    const { departmentRepository, hierarchyRepository } =
      await this.getRepositories(workspaceId);

    const allDepartments = await departmentRepository.find();
    const hierarchies = await hierarchyRepository.find();

    const departmentsInHierarchy = new Set<string>();

    hierarchies.forEach((h) => {
      if (h.parentDepartmentId)
        departmentsInHierarchy.add(h.parentDepartmentId);
      if (h.childDepartmentId) departmentsInHierarchy.add(h.childDepartmentId);
    });

    return allDepartments.filter((d) => !departmentsInHierarchy.has(d.id))
      .length;
  }

  private async detectCircularReferences(
    _workspaceId: string,
  ): Promise<number> {
    // TODO: Implement circular reference detection
    // This would require more complex graph traversal logic
    return 0;
  }
}
