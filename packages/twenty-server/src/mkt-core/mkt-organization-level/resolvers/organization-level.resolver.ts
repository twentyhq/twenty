import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { OrganizationLevelService } from 'src/mkt-core/mkt-organization-level/services/organization-level.service';
import {
  OrganizationLevelHierarchyNode,
  OrganizationLevelStatistics,
  OrganizationLevelQueryOptions,
} from 'src/mkt-core/mkt-organization-level/graphql-types';

@Resolver()
@UseGuards(UserAuthGuard)
export class OrganizationLevelResolver {
  constructor(
    private readonly organizationLevelService: OrganizationLevelService,
  ) {}

  // === CORE QUERIES ===

  /**
   * Lấy toàn bộ cây phân cấp organization levels
   * Business Value: Hierarchy tree building không thể thay thế bằng auto-generated CRUD
   */
  @Query(() => [OrganizationLevelHierarchyNode])
  async getOrganizationLevelHierarchy(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('options', {
      type: () => OrganizationLevelQueryOptions,
      nullable: true,
    })
    options?: OrganizationLevelQueryOptions,
  ): Promise<OrganizationLevelHierarchyNode[]> {
    return await this.organizationLevelService.getOrganizationLevelHierarchy(
      workspaceId,
      options,
    );
  }

  /**
   * Lấy thống kê về cấu trúc organization levels
   * Business Value: Analytics & aggregated data không có trong auto-generated
   */
  @Query(() => OrganizationLevelStatistics)
  async getOrganizationLevelStatistics(
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<OrganizationLevelStatistics> {
    return await this.organizationLevelService.getOrganizationLevelStatistics(
      workspaceId,
    );
  }

  // === SPECIALIZED MUTATIONS ===

  /**
   * Sắp xếp lại thứ tự hiển thị của organization levels
   * Business Value: Batch operations không có trong auto-generated CRUD
   */
  @Mutation(() => [OrganizationLevelHierarchyNode])
  async reorderOrganizationLevels(
    @Args('levelIds', { type: () => [String] }) levelIds: string[],
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<OrganizationLevelHierarchyNode[]> {
    const results: OrganizationLevelHierarchyNode[] = [];

    for (let i = 0; i < levelIds.length; i++) {
      const updatedLevel =
        await this.organizationLevelService.updateOrganizationLevel(
          workspaceId,
          levelIds[i],
          { displayOrder: i },
        );

      results.push(updatedLevel);
    }

    return results;
  }

  // === SPECIALIZED QUERIES ===

  /**
   * Lấy đường dẫn hierarchy từ root đến một level cụ thể
   * Business Value: Path finding trong hierarchy, useful cho breadcrumbs
   */
  @Query(() => [OrganizationLevelHierarchyNode])
  async getOrganizationLevelPath(
    @Args('levelId') levelId: string,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<OrganizationLevelHierarchyNode[]> {
    const level = await this.organizationLevelService.getOrganizationLevel(
      workspaceId,
      levelId,
    );

    const path: OrganizationLevelHierarchyNode[] = [level];
    let currentLevel = level;

    // Walk up the hierarchy
    while (currentLevel.parentLevelId) {
      const parentLevel =
        await this.organizationLevelService.getOrganizationLevel(
          workspaceId,
          currentLevel.parentLevelId,
        );

      path.unshift(parentLevel);
      currentLevel = parentLevel;
    }

    return path;
  }
}
