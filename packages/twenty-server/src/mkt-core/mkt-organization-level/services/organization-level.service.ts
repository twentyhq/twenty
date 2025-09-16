import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { FindManyOptions, In } from 'typeorm';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getHierarchyLevelValidationError } from 'src/mkt-core/mkt-organization-level/validators/hierarchy-level-range.validator';
import { WorkspaceMemberMktEntity } from 'src/mkt-core/mkt-entities-extends/workspace-member.mkt-entity';
import {
  HIERARCHY_PERFORMANCE_LIMITS,
  MAX_ORGANIZATION_HIERARCHY_DEPTH,
} from 'src/mkt-core/mkt-organization-level/constants/hierarchy-constraints.constants';
import {
  CreateOrganizationLevelInput,
  LevelEmployeeCount,
  OrganizationLevelHierarchyNode,
  OrganizationLevelQueryOptions,
  OrganizationLevelStatistics,
  UpdateOrganizationLevelInput,
} from 'src/mkt-core/mkt-organization-level/graphql-types';
import { MktOrganizationLevelWorkspaceEntity } from 'src/mkt-core/mkt-organization-level/mkt-organization-level.workspace-entity';
import { OrganizationLevelHierarchyValidator } from 'src/mkt-core/mkt-organization-level/validators/hierarchy-validator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

interface RepositoryPair {
  organizationLevelRepository: WorkspaceRepository<MktOrganizationLevelWorkspaceEntity>;
  workspaceMemberRepository: WorkspaceRepository<WorkspaceMemberMktEntity>;
}

@Injectable()
export class OrganizationLevelService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly hierarchyValidator: OrganizationLevelHierarchyValidator,
  ) {}

  private async getRepositories(workspaceId: string): Promise<RepositoryPair> {
    const organizationLevelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrganizationLevelWorkspaceEntity>(
        workspaceId,
        'mktOrganizationLevel',
        { shouldBypassPermissionChecks: true },
      );

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberMktEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    return { organizationLevelRepository, workspaceMemberRepository };
  }

  /**
   * Get organization level hierarchy tree
   */
  async getOrganizationLevelHierarchy(
    workspaceId: string,
    options: OrganizationLevelQueryOptions = {},
  ): Promise<OrganizationLevelHierarchyNode[]> {
    const { organizationLevelRepository, workspaceMemberRepository } =
      await this.getRepositories(workspaceId);

    // Build query conditions
    const whereConditions: Record<string, unknown> = {};

    if (!options.includeInactive) {
      whereConditions.isActive = true;
    }
    if (options.levelCodes?.length) {
      whereConditions.levelCode = In(options.levelCodes);
    }
    if (options.hierarchyLevels?.length) {
      whereConditions.hierarchyLevel = In(options.hierarchyLevels);
    }

    // Get all organization levels
    const findOptions: FindManyOptions<MktOrganizationLevelWorkspaceEntity> = {
      where: whereConditions,
      order: { hierarchyLevel: 'ASC', displayOrder: 'ASC' },
    };

    const organizationLevels =
      await organizationLevelRepository.find(findOptions);

    if (!organizationLevels.length) {
      return [];
    }

    // Build hierarchy tree
    const levelMap = new Map<string, OrganizationLevelHierarchyNode>();
    const rootLevels: OrganizationLevelHierarchyNode[] = [];

    // First pass: Create nodes
    for (const level of organizationLevels) {
      const node = await this.buildHierarchyNode(
        level,
        workspaceMemberRepository,
        options.includeStatistics || false,
      );

      levelMap.set(level.id, node);

      // Root levels (hierarchyLevel = 1 or no parent)
      if (level.hierarchyLevel === 1 || !level.parentLevelId) {
        rootLevels.push(node);
      }
    }

    // Second pass: Build parent-child relationships
    for (const level of organizationLevels) {
      const node = levelMap.get(level.id);

      if (!node) continue;

      if (level.parentLevelId) {
        const parentNode = levelMap.get(level.parentLevelId);

        if (parentNode) {
          node.parent = parentNode;
          parentNode.children.push(node);
        }
      }
    }

    // Calculate descendant counts
    this.calculateDescendantCounts(rootLevels);

    return rootLevels;
  }

  /**
   * Get single organization level with hierarchy context
   */
  async getOrganizationLevel(
    workspaceId: string,
    levelId: string,
    options: OrganizationLevelQueryOptions = {},
  ): Promise<OrganizationLevelHierarchyNode> {
    const { organizationLevelRepository, workspaceMemberRepository } =
      await this.getRepositories(workspaceId);

    const organizationLevel = await organizationLevelRepository.findOne({
      where: { id: levelId },
    });

    if (!organizationLevel) {
      throw new NotFoundException(
        `Organization level with ID ${levelId} not found`,
      );
    }

    return await this.buildHierarchyNode(
      organizationLevel,
      workspaceMemberRepository,
      options.includeStatistics || false,
    );
  }

  /**
   * Get organization level statistics
   */
  async getOrganizationLevelStatistics(
    workspaceId: string,
  ): Promise<OrganizationLevelStatistics> {
    const { organizationLevelRepository, workspaceMemberRepository } =
      await this.getRepositories(workspaceId);

    // Get all organization levels
    const allLevels = await organizationLevelRepository.find({
      order: { hierarchyLevel: 'ASC' },
    });

    const activeLevels = allLevels.filter((l) => l.isActive);

    // Get employee counts by level
    const employeesByLevel: LevelEmployeeCount[] = [];
    let totalEmployees = 0;
    let activeEmployees = 0;

    for (const level of allLevels) {
      const allMembers = await workspaceMemberRepository.count({
        where: { organizationLevelId: level.id },
      });

      const activeMembers = await workspaceMemberRepository.count({
        where: {
          organizationLevelId: level.id,
          // Add additional active member criteria if needed
        },
      });

      totalEmployees += allMembers;
      activeEmployees += activeMembers;

      let status: 'normal' | 'understaffed' | 'overstaffed' = 'normal';

      if (allMembers > HIERARCHY_PERFORMANCE_LIMITS.MAX_USERS_PER_LEVEL) {
        status = 'overstaffed';
      } else if (allMembers === 0 && level.isActive) {
        status = 'understaffed';
      }

      employeesByLevel.push({
        levelId: level.id,
        levelName: level.levelName,
        hierarchyLevel: level.hierarchyLevel,
        employeeCount: allMembers,
        activeEmployeeCount: activeMembers,
        status,
      });
    }

    // Check for hierarchy issues
    const hasGapsInHierarchy = this.checkHierarchyGaps(allLevels);
    const hasCircularReferences = await this.checkCircularReferences(allLevels);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      allLevels,
      employeesByLevel,
      hasGapsInHierarchy,
      hasCircularReferences,
    );

    return {
      totalLevels: allLevels.length,
      activeLevels: activeLevels.length,
      maxHierarchyDepth: Math.max(...allLevels.map((l) => l.hierarchyLevel)),
      rootLevelsCount: allLevels.filter((l) => l.hierarchyLevel === 1).length,
      totalEmployees,
      activeEmployees,
      employeesByLevel,
      levelsWithoutEmployees: employeesByLevel.filter(
        (l) => l.employeeCount === 0,
      ).length,
      levelsExceedingRecommendedSize: employeesByLevel.filter(
        (l) => l.status === 'overstaffed',
      ).length,
      hasGapsInHierarchy,
      hasCircularReferences,
      recommendations,
    };
  }

  /**
   * Create new organization level
   */
  async createOrganizationLevel(
    workspaceId: string,
    input: CreateOrganizationLevelInput,
  ): Promise<OrganizationLevelHierarchyNode> {
    const { organizationLevelRepository, workspaceMemberRepository } =
      await this.getRepositories(workspaceId);

    // 1. Validate hierarchy level range
    const rangeError = getHierarchyLevelValidationError(input.hierarchyLevel);

    if (rangeError) {
      throw new BadRequestException(rangeError);
    }

    // 2. Get existing levels for validation
    const existingLevels = await organizationLevelRepository.find({
      select: ['id', 'hierarchyLevel', 'isActive', 'levelCode'],
    });

    // 3. Validate input - transform data to match validator interface
    const validationResult = this.hierarchyValidator.validateOrganizationLevel(
      input.hierarchyLevel,
      input.parentLevelId,
      existingLevels.map((level) => ({
        id: level.id,
        hierarchyLevel: level.hierarchyLevel,
        isActive: level.isActive ?? false, // Convert undefined to false
      })),
    );

    if (!validationResult.isValid) {
      throw new BadRequestException(
        `Validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`,
      );
    }

    // Check for unique level code
    const existingWithCode = existingLevels.find(
      (l) => l.levelCode === input.levelCode,
    );

    if (existingWithCode) {
      throw new BadRequestException(
        `Organization level with code '${input.levelCode}' already exists`,
      );
    }

    // Create the organization level
    const newLevel = await organizationLevelRepository.save({
      levelCode: input.levelCode,
      levelName: input.levelName,
      levelNameEn: input.levelNameEn,
      description: input.description,
      hierarchyLevel: input.hierarchyLevel,
      parentLevelId: input.parentLevelId,
      displayOrder: input.displayOrder || 0,
      isActive: input.isActive ?? true,
    });

    return await this.buildHierarchyNode(
      newLevel,
      workspaceMemberRepository,
      true,
    );
  }

  /**
   * Update organization level
   */
  async updateOrganizationLevel(
    workspaceId: string,
    levelId: string,
    input: UpdateOrganizationLevelInput,
  ): Promise<OrganizationLevelHierarchyNode> {
    const { organizationLevelRepository, workspaceMemberRepository } =
      await this.getRepositories(workspaceId);

    const existingLevel = await organizationLevelRepository.findOne({
      where: { id: levelId },
    });

    if (!existingLevel) {
      throw new NotFoundException(
        `Organization level with ID ${levelId} not found`,
      );
    }

    // Validate hierarchy level range if being changed
    if (
      input.hierarchyLevel &&
      input.hierarchyLevel !== existingLevel.hierarchyLevel
    ) {
      const rangeError = getHierarchyLevelValidationError(input.hierarchyLevel);

      if (rangeError) {
        throw new BadRequestException(rangeError);
      }

      const allLevels = await organizationLevelRepository.find({
        select: ['id', 'hierarchyLevel', 'isActive'],
      });

      const validationResult =
        this.hierarchyValidator.validateOrganizationLevel(
          input.hierarchyLevel,
          input.parentLevelId || existingLevel.parentLevelId,
          allLevels
            .filter((l) => l.id !== levelId)
            .map((level) => ({
              id: level.id,
              hierarchyLevel: level.hierarchyLevel,
              isActive: level.isActive ?? false, // Convert undefined to false
            })), // Exclude current level from validation
        );

      if (!validationResult.isValid) {
        throw new BadRequestException(
          `Validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`,
        );
      }
    }

    // Update the level
    await organizationLevelRepository.update(levelId, input);

    const updatedLevel = await organizationLevelRepository.findOne({
      where: { id: levelId },
    });

    if (!updatedLevel) {
      throw new NotFoundException(
        `Organization level with ID ${levelId} not found after update`,
      );
    }

    return await this.buildHierarchyNode(
      updatedLevel,
      workspaceMemberRepository,
      true,
    );
  }

  /**
   * Delete organization level
   */
  async deleteOrganizationLevel(
    workspaceId: string,
    levelId: string,
  ): Promise<boolean> {
    const { organizationLevelRepository, workspaceMemberRepository } =
      await this.getRepositories(workspaceId);

    const existingLevel = await organizationLevelRepository.findOne({
      where: { id: levelId },
    });

    if (!existingLevel) {
      throw new NotFoundException(
        `Organization level with ID ${levelId} not found`,
      );
    }

    // Check if there are employees assigned to this level
    const employeeCount = await workspaceMemberRepository.count({
      where: { organizationLevelId: levelId },
    });

    if (employeeCount > 0) {
      throw new BadRequestException(
        `Cannot delete organization level. There are ${employeeCount} employees assigned to this level.`,
      );
    }

    // Check if there are child levels
    const childrenCount = await organizationLevelRepository.count({
      where: { parentLevelId: levelId },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        `Cannot delete organization level. There are ${childrenCount} child levels dependent on this level.`,
      );
    }

    await organizationLevelRepository.delete(levelId);

    return true;
  }

  // Private helper methods

  private async buildHierarchyNode(
    level: MktOrganizationLevelWorkspaceEntity,
    workspaceMemberRepository: WorkspaceRepository<WorkspaceMemberMktEntity>,
    includeStatistics: boolean,
  ): Promise<OrganizationLevelHierarchyNode> {
    let totalEmployees = 0;
    let activeEmployees = 0;

    if (includeStatistics) {
      totalEmployees = await workspaceMemberRepository.count({
        where: { organizationLevelId: level.id },
      });

      activeEmployees = await workspaceMemberRepository.count({
        where: {
          organizationLevelId: level.id,
          // Add additional active member criteria
        },
      });
    }

    return {
      id: level.id,
      levelCode: level.levelCode,
      levelName: level.levelName,
      levelNameEn: level.levelNameEn,
      description: level.description,
      hierarchyLevel: level.hierarchyLevel,
      parentLevelId: level.parentLevelId,
      defaultPermissions: level.defaultPermissions,
      accessLimitations: level.accessLimitations,
      displayOrder: level.displayOrder,
      isActive: level.isActive,
      children: [],
      totalEmployees,
      activeEmployees,
      directChildrenCount: 0, // Will be calculated later
      totalDescendantsCount: 0, // Will be calculated later
      createdAt: new Date(level.createdAt),
      updatedAt: new Date(level.updatedAt),
      entity: level,
    };
  }

  private calculateDescendantCounts(
    nodes: OrganizationLevelHierarchyNode[],
  ): void {
    for (const node of nodes) {
      node.directChildrenCount = node.children.length;

      if (node.children.length > 0) {
        this.calculateDescendantCounts(node.children);
        node.totalDescendantsCount = node.children.reduce(
          (sum, child) => sum + 1 + child.totalDescendantsCount,
          0,
        );
      }
    }
  }

  private checkHierarchyGaps(
    levels: MktOrganizationLevelWorkspaceEntity[],
  ): boolean {
    const hierarchyLevels = levels
      .map((l) => l.hierarchyLevel)
      .sort((a, b) => a - b);

    for (let i = 1; i < hierarchyLevels.length; i++) {
      if (hierarchyLevels[i] - hierarchyLevels[i - 1] > 1) {
        return true;
      }
    }

    return false;
  }

  private async checkCircularReferences(
    levels: MktOrganizationLevelWorkspaceEntity[],
  ): Promise<boolean> {
    // Simple circular reference check using DFS
    for (const level of levels) {
      if (level.parentLevelId) {
        const visited = new Set<string>();
        let currentId: string | undefined = level.parentLevelId;

        while (currentId && !visited.has(currentId)) {
          if (currentId === level.id) {
            return true; // Circular reference found
          }

          visited.add(currentId);
          const parent = levels.find((l) => l.id === currentId);

          currentId = parent?.parentLevelId || undefined;
        }
      }
    }

    return false;
  }

  private generateRecommendations(
    levels: MktOrganizationLevelWorkspaceEntity[],
    employeeCounts: LevelEmployeeCount[],
    hasGaps: boolean,
    hasCircularRefs: boolean,
  ): string[] {
    const recommendations: string[] = [];

    if (hasCircularRefs) {
      recommendations.push('Fix circular references in organization hierarchy');
    }

    if (hasGaps) {
      recommendations.push(
        'Fill gaps in hierarchy levels for better organization',
      );
    }

    const overstaffedLevels = employeeCounts.filter(
      (l) => l.status === 'overstaffed',
    );

    if (overstaffedLevels.length > 0) {
      recommendations.push(
        `Consider splitting levels with too many employees: ${overstaffedLevels.map((l) => l.levelName).join(', ')}`,
      );
    }

    const understaffedLevels = employeeCounts.filter(
      (l) => l.status === 'understaffed',
    );

    if (understaffedLevels.length > 0) {
      recommendations.push(
        `Consider assigning employees to empty levels: ${understaffedLevels.map((l) => l.levelName).join(', ')}`,
      );
    }

    if (levels.length > MAX_ORGANIZATION_HIERARCHY_DEPTH) {
      recommendations.push(
        'Consider reducing hierarchy depth for better performance',
      );
    }

    return recommendations;
  }
}
