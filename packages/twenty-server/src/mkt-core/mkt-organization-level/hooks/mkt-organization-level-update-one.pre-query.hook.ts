import { BadRequestException, Logger } from '@nestjs/common';

import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MktOrganizationLevelWorkspaceEntity } from 'src/mkt-core/mkt-organization-level/mkt-organization-level.workspace-entity';
import { OrganizationLevelValidationService } from 'src/mkt-core/mkt-organization-level/services/organization-level-validation.service';
import { UpdateOrganizationLevelDto } from 'src/mkt-core/mkt-organization-level/dto/update-organization-level.dto';

@WorkspaceQueryHook('mktOrganizationLevel.updateOne')
export class MktOrganizationLevelUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  private readonly logger = new Logger(
    MktOrganizationLevelUpdateOnePreQueryHook.name,
  );

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly validationService: OrganizationLevelValidationService,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: UpdateOneResolverArgs<MktOrganizationLevelWorkspaceEntity>,
  ): Promise<UpdateOneResolverArgs<MktOrganizationLevelWorkspaceEntity>> {
    const input = payload?.data;
    const recordId = payload?.id;
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!input || !recordId || !workspaceId) {
      throw new BadRequestException(
        'Invalid input data, record ID, or workspace context',
      );
    }

    this.logger.log(`Validating organization level update for ID: ${recordId}`);

    // Get current record
    const currentRecord = await this.getCurrentRecord(recordId, workspaceId);

    // 1. Validate input with class-validator
    const validatedDto = await this.validationService.validateUpdateInput(
      input as unknown as Record<string, unknown>,
    );

    // 2. Validate level code uniqueness (if changed)
    if (
      validatedDto.levelCode &&
      validatedDto.levelCode !== currentRecord.levelCode
    ) {
      await this.validateLevelCodeUniqueness(
        validatedDto.levelCode,
        workspaceId,
        recordId,
      );
    }

    // 3. Validate hierarchy level changes
    if (validatedDto.hierarchyLevel !== undefined) {
      await this.validateHierarchyLevelUpdate(
        validatedDto,
        currentRecord,
        workspaceId,
      );
    }

    // 4. Validate parent level changes
    if (
      validatedDto.parentLevelId !== undefined ||
      validatedDto.hierarchyLevel !== undefined
    ) {
      await this.validateParentLevelUpdate(
        validatedDto,
        currentRecord,
        workspaceId,
      );
    }

    // 5. Validate activation/deactivation
    if (validatedDto.isActive !== undefined) {
      await this.validateActivationChange(
        validatedDto.isActive,
        currentRecord,
        workspaceId,
      );
    }

    // 6. Transform to entity format
    const sanitizedData = this.transformDtoToEntity(validatedDto);

    this.logger.log(
      'Organization level update validation completed successfully',
    );

    return {
      ...payload,
      data: sanitizedData as MktOrganizationLevelWorkspaceEntity,
    };
  }

  private async getRepository(workspaceId: string) {
    return await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrganizationLevelWorkspaceEntity>(
      workspaceId,
      'mktOrganizationLevel',
      { shouldBypassPermissionChecks: true },
    );
  }

  private async getCurrentRecord(
    recordId: string,
    workspaceId: string,
  ): Promise<MktOrganizationLevelWorkspaceEntity> {
    const repository = await this.getRepository(workspaceId);

    const record = await repository.findOne({
      where: { id: recordId },
    });

    if (!record) {
      throw new BadRequestException(
        `Organization level with ID '${recordId}' not found`,
      );
    }

    return record;
  }

  private async validateLevelCodeUniqueness(
    levelCode: string,
    workspaceId: string,
    currentRecordId: string,
  ): Promise<void> {
    const repository = await this.getRepository(workspaceId);

    const existingLevel = await repository.findOne({
      where: { levelCode },
    });

    if (existingLevel && existingLevel.id !== currentRecordId) {
      throw new BadRequestException(
        `Organization level with code '${levelCode}' already exists`,
      );
    }
  }

  private async validateHierarchyLevelUpdate(
    input: { hierarchyLevel?: number },
    currentRecord: MktOrganizationLevelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    const newHierarchyLevel = input.hierarchyLevel;
    const oldHierarchyLevel = currentRecord.hierarchyLevel;

    if (!newHierarchyLevel || newHierarchyLevel === oldHierarchyLevel) {
      return; // No change
    }

    // Check if this level has children - if so, hierarchy change might break structure
    const repository = await this.getRepository(workspaceId);

    const childLevels = await repository.find({
      where: { parentLevelId: currentRecord.id },
    });

    if (
      childLevels.length > 0 &&
      newHierarchyLevel >= Math.min(...childLevels.map((c) => c.hierarchyLevel))
    ) {
      throw new BadRequestException(
        'Cannot change hierarchy level: this would create invalid parent-child relationships. ' +
          'Please update child levels first or ensure new hierarchy level maintains valid structure.',
      );
    }
  }

  private async validateParentLevelUpdate(
    input: { hierarchyLevel?: number; parentLevelId?: string },
    currentRecord: MktOrganizationLevelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    const newHierarchyLevel =
      input.hierarchyLevel ?? currentRecord.hierarchyLevel;
    const newParentLevelId =
      input.parentLevelId !== undefined
        ? input.parentLevelId
        : currentRecord.parentLevelId;

    // Level 1 should not have parent
    if (newHierarchyLevel === 1 && newParentLevelId) {
      throw new BadRequestException(
        'Level 1 (highest hierarchy level) cannot have a parent level',
      );
    }

    // Levels > 1 should have parent
    if (newHierarchyLevel > 1 && !newParentLevelId) {
      throw new BadRequestException(
        'Hierarchy levels below 1 must have a parent level',
      );
    }

    // Validate parent exists and relationships
    if (newParentLevelId && newParentLevelId !== currentRecord.id) {
      const repository = await this.getRepository(workspaceId);

      const parentLevel = await repository.findOne({
        where: { id: newParentLevelId },
      });

      if (!parentLevel) {
        throw new BadRequestException(
          `Parent level with ID '${newParentLevelId}' not found`,
        );
      }

      if (parentLevel.hierarchyLevel >= newHierarchyLevel) {
        throw new BadRequestException(
          `Parent level hierarchy (${parentLevel.hierarchyLevel}) must be lower than current level hierarchy (${newHierarchyLevel})`,
        );
      }

      if (!parentLevel.isActive) {
        throw new BadRequestException(
          'Cannot set inactive organization level as parent',
        );
      }

      // Check for circular reference
      await this.checkCircularReference(
        currentRecord.id,
        newParentLevelId,
        workspaceId,
      );
    }
  }

  private async checkCircularReference(
    currentId: string,
    newParentId: string,
    workspaceId: string,
  ): Promise<void> {
    const repository = await this.getRepository(workspaceId);

    let checkId: string | null | undefined = newParentId;
    const visited = new Set<string>();

    while (checkId && !visited.has(checkId)) {
      if (checkId === currentId) {
        throw new BadRequestException(
          'Cannot set parent level: this would create a circular reference in the hierarchy',
        );
      }

      visited.add(checkId);

      const parent = await repository.findOne({
        where: { id: checkId },
      });

      checkId = parent?.parentLevelId || null;
    }
  }

  private async validateActivationChange(
    newIsActive: boolean,
    currentRecord: MktOrganizationLevelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    // If deactivating, check if this level has active children
    if (!newIsActive && currentRecord.isActive) {
      const repository = await this.getRepository(workspaceId);

      const activeChildren = await repository.find({
        where: {
          parentLevelId: currentRecord.id,
          isActive: true,
        },
      });

      if (activeChildren.length > 0) {
        throw new BadRequestException(
          'Cannot deactivate organization level: it has active child levels. ' +
            'Please deactivate child levels first.',
        );
      }
    }

    // If activating, check if parent is active
    if (newIsActive && !currentRecord.isActive && currentRecord.parentLevelId) {
      const repository = await this.getRepository(workspaceId);

      const parent = await repository.findOne({
        where: { id: currentRecord.parentLevelId },
      });

      if (parent && !parent.isActive) {
        throw new BadRequestException(
          'Cannot activate organization level: parent level is inactive. ' +
            'Please activate parent level first.',
        );
      }
    }
  }

  private transformDtoToEntity(
    dto: UpdateOrganizationLevelDto,
  ): Partial<MktOrganizationLevelWorkspaceEntity> {
    const entity: Partial<MktOrganizationLevelWorkspaceEntity> = {};

    if (dto.levelCode !== undefined) entity.levelCode = dto.levelCode;
    if (dto.levelName !== undefined) entity.levelName = dto.levelName;
    if (dto.levelNameEn !== undefined) entity.levelNameEn = dto.levelNameEn;
    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.hierarchyLevel !== undefined)
      entity.hierarchyLevel = dto.hierarchyLevel;
    if (dto.parentLevelId !== undefined)
      entity.parentLevelId = dto.parentLevelId;
    if (dto.displayOrder !== undefined) entity.displayOrder = dto.displayOrder;
    if (dto.isActive !== undefined) entity.isActive = dto.isActive;
    if (dto.defaultPermissions !== undefined)
      entity.defaultPermissions = dto.defaultPermissions;
    if (dto.accessLimitations !== undefined)
      entity.accessLimitations = dto.accessLimitations;

    return entity;
  }
}
