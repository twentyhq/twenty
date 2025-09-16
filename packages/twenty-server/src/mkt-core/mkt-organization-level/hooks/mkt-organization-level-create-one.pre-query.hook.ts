import { BadRequestException, Logger } from '@nestjs/common';

import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MktOrganizationLevelWorkspaceEntity } from 'src/mkt-core/mkt-organization-level/mkt-organization-level.workspace-entity';
import { OrganizationLevelValidationService } from 'src/mkt-core/mkt-organization-level/services/organization-level-validation.service';
import { CreateOrganizationLevelDto } from 'src/mkt-core/mkt-organization-level/dto/create-organization-level.dto';
import { PERMISSION_TEMPLATES } from 'src/mkt-core/mkt-organization-level/constants/permission-templates.constants';

@WorkspaceQueryHook('mktOrganizationLevel.createOne')
export class MktOrganizationLevelCreateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  private readonly logger = new Logger(
    MktOrganizationLevelCreateOnePreQueryHook.name,
  );

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly validationService: OrganizationLevelValidationService,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: CreateOneResolverArgs<MktOrganizationLevelWorkspaceEntity>,
  ): Promise<CreateOneResolverArgs<MktOrganizationLevelWorkspaceEntity>> {
    const input = payload?.data;
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!input || !workspaceId) {
      throw new BadRequestException('Invalid input data or workspace context');
    }

    this.logger.log('Validating organization level creation data');

    // 1. Validate input with class-validator
    const validatedDto = await this.validationService.validateCreateInput(
      input as unknown as Record<string, unknown>,
    );

    // 2. Validate level code uniqueness
    await this.validateLevelCodeUniqueness(validatedDto.levelCode, workspaceId);

    // 3. Validate parent level relationship
    await this.validateParentLevel(validatedDto, workspaceId);

    // 4. Transform to entity format
    const sanitizedData = this.transformDtoToEntity(validatedDto);

    this.logger.log('Organization level validation completed successfully');

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

  private async validateLevelCodeUniqueness(
    levelCode: string,
    workspaceId: string,
  ): Promise<void> {
    const repository = await this.getRepository(workspaceId);

    const existingLevel = await repository.findOne({
      where: { levelCode },
    });

    if (existingLevel) {
      throw new BadRequestException(
        `Organization level with code '${levelCode}' already exists`,
      );
    }
  }

  private async validateParentLevel(
    input: { hierarchyLevel: number; parentLevelId?: string },
    workspaceId: string,
  ): Promise<void> {
    const { hierarchyLevel, parentLevelId } = input;

    // Validate parent exists and has correct hierarchy
    if (parentLevelId) {
      const repository = await this.getRepository(workspaceId);

      const parentLevel = await repository.findOne({
        where: { id: parentLevelId },
      });

      if (!parentLevel) {
        throw new BadRequestException(
          `Parent level with ID '${parentLevelId}' not found`,
        );
      }

      if (parentLevel.hierarchyLevel >= hierarchyLevel) {
        throw new BadRequestException(
          `Parent level hierarchy (${parentLevel.hierarchyLevel}) must be lower than current level hierarchy (${hierarchyLevel})`,
        );
      }

      if (!parentLevel.isActive) {
        throw new BadRequestException(
          'Cannot set inactive organization level as parent',
        );
      }
    }
  }

  private getDefaultPermissionsTemplate() {
    return PERMISSION_TEMPLATES.JUNIOR_STAFF;
  }

  private transformDtoToEntity(
    dto: CreateOrganizationLevelDto,
  ): Partial<MktOrganizationLevelWorkspaceEntity> {
    const defaultTemplate = this.getDefaultPermissionsTemplate();

    return {
      levelCode: dto.levelCode,
      levelName: dto.levelName,
      hierarchyLevel: dto.hierarchyLevel,
      displayOrder: dto.displayOrder ?? 0,
      levelNameEn: dto.levelNameEn ?? undefined,
      description: dto.description ?? undefined,
      parentLevelId: dto.parentLevelId ?? undefined,
      isActive: dto.isActive ?? true,
      defaultPermissions:
        dto.defaultPermissions ?? defaultTemplate.defaultPermissions,
      accessLimitations:
        dto.accessLimitations ?? defaultTemplate.accessLimitations,
      position: 0,
    };
  }
}
