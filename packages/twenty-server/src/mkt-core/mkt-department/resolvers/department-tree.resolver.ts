import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { DepartmentService } from 'src/mkt-core/mkt-department/services/department.service';
import { DepartmentTreeNode } from 'src/mkt-core/mkt-department/graphql-types/department-tree-node.type';
import { DepartmentAncestor } from 'src/mkt-core/mkt-department/graphql-types/department-ancestor.type';
import { DepartmentDescendant } from 'src/mkt-core/mkt-department/graphql-types/department-descendant.type';
import { HierarchyStatistics } from 'src/mkt-core/mkt-department/graphql-types/hierarchy-statistics.type';
import { DepartmentTreeOptions } from 'src/mkt-core/mkt-department/graphql-types/department-tree-options.input';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';

@Resolver()
export class DepartmentTreeResolver {
  constructor(private readonly hierarchyService: DepartmentService) {}

  //* Lấy toàn bộ cây phòng ban từ root
  @Query(() => DepartmentTreeNode)
  @UseGuards(UserAuthGuard)
  async getDepartmentHierarchyTree(
    @Args('rootDepartmentId') rootDepartmentId: string,
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('options', { type: () => DepartmentTreeOptions, nullable: true })
    options?: DepartmentTreeOptions,
  ): Promise<DepartmentTreeNode> {
    return await this.hierarchyService.getDepartmentTree(
      workspaceId,
      rootDepartmentId,
      options,
    );
  }

  //* Lấy cây phòng ban từ một node bất kỳ
  @Query(() => DepartmentTreeNode)
  @UseGuards(UserAuthGuard)
  async getDepartmentSubtree(
    @Args('departmentId') departmentId: string,
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('options', { type: () => DepartmentTreeOptions, nullable: true })
    options?: DepartmentTreeOptions,
  ): Promise<DepartmentTreeNode> {
    return await this.hierarchyService.getDepartmentSubtree(
      workspaceId,
      departmentId,
      options,
    );
  }

  //* Lấy nhiều cây phòng ban từ nhiều rootId
  @Query(() => [DepartmentTreeNode])
  @UseGuards(UserAuthGuard)
  async getDepartmentForest(
    @Args('rootIds', { type: () => [String] }) rootIds: string[],
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('options', { type: () => DepartmentTreeOptions, nullable: true })
    options?: DepartmentTreeOptions,
  ): Promise<DepartmentTreeNode[]> {
    const trees = await Promise.all(
      rootIds.map((rootId) =>
        this.hierarchyService.getDepartmentTree(workspaceId, rootId, options),
      ),
    );

    return trees.filter((tree) => tree !== null);
  }

  //* Tìm tất cả phòng ban cha/tổ tiên
  @Query(() => [DepartmentAncestor])
  @UseGuards(UserAuthGuard)
  async getDepartmentAncestors(
    @Args('departmentId') departmentId: string,
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('relationshipTypes', {
      type: () => [String],
      nullable: true,
      description:
        'Filter by relationship types. Use ["any"] to include all types.',
    })
    relationshipTypes?: string[],
  ): Promise<DepartmentAncestor[]> {
    return await this.hierarchyService.getDepartmentAncestors(
      workspaceId,
      departmentId,
      relationshipTypes,
    );
  }

  //* Tìm tất cả phòng ban con/hậu duệ
  @Query(() => [DepartmentDescendant])
  @UseGuards(UserAuthGuard)
  async getDepartmentDescendants(
    @Args('departmentId') departmentId: string,
    @Args('maxDepth', { type: () => Int, defaultValue: 5 }) maxDepth: number,
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('relationshipTypes', {
      type: () => [String],
      nullable: true,
      description: 'Filter by relationship types',
    })
    relationshipTypes?: string[],
  ): Promise<DepartmentDescendant[]> {
    return await this.hierarchyService.getDepartmentDescendants(
      workspaceId,
      departmentId,
      maxDepth,
      relationshipTypes,
    );
  }

  //* Thống kê về cấu trúc phòng ban
  @Query(() => HierarchyStatistics)
  @UseGuards(UserAuthGuard)
  async getHierarchyStatistics(
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<HierarchyStatistics> {
    return await this.hierarchyService.getHierarchyStatistics(workspaceId);
  }

  //* Lấy toàn bộ cấu trúc phòng ban (tất cả root departments)
  @Query(() => [DepartmentTreeNode])
  @UseGuards(UserAuthGuard)
  async getCompleteDepartmentStructure(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('options', { type: () => DepartmentTreeOptions, nullable: true })
    options?: DepartmentTreeOptions,
  ): Promise<DepartmentTreeNode[]> {
    return await this.hierarchyService.getCompleteDepartmentStructure(
      workspaceId,
      options,
    );
  }
}
