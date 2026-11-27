import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { buildAdminFlatRole } from 'src/engine/metadata-modules/flat-role/utils/build-admin-flat-role.util';
import { buildWorkspaceCustomApplicationFlatRole } from 'src/engine/metadata-modules/flat-role/utils/build-workspace-custom-application-flat-role.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class WorkspaceCustomApplicationRoleService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  public async findOrCreateGrantedRoleOrThrow({
    workspaceId,
    workspaceCustomFlatApplication,
  }: {
    workspaceId: string;
    workspaceCustomFlatApplication: FlatApplication;
  }): Promise<string> {
    const grantedRoleId = await this.findOrCreateFlatRoleOrThrow({
      workspaceId,
      flatRoleToCreate: buildWorkspaceCustomApplicationFlatRole({
        workspaceId,
        workspaceCustomFlatApplication,
      }),
    });

    if (workspaceCustomFlatApplication.requestedRoleId !== grantedRoleId) {
      await this.applicationService.update(workspaceCustomFlatApplication.id, {
        workspaceId,
        requestedRoleId: grantedRoleId,
      });
    }

    return grantedRoleId;
  }

  public async findOrCreateAdminRoleOrThrow({
    workspaceId,
    workspaceCustomFlatApplication,
  }: {
    workspaceId: string;
    workspaceCustomFlatApplication: FlatApplication;
  }): Promise<string> {
    return this.findOrCreateFlatRoleOrThrow({
      workspaceId,
      flatRoleToCreate: buildAdminFlatRole({
        workspaceId,
        ownerFlatApplication: workspaceCustomFlatApplication,
      }),
    });
  }

  // Workspace activation is retried after a failure, so the role may already exist
  private async findOrCreateFlatRoleOrThrow({
    workspaceId,
    flatRoleToCreate,
  }: {
    workspaceId: string;
    flatRoleToCreate: FlatRole;
  }): Promise<string> {
    const { flatRoleMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleMaps'],
        },
      );

    const existingFlatRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatRoleToCreate.universalIdentifier,
      flatEntityMaps: flatRoleMaps,
    });

    if (isDefined(existingFlatRole)) {
      return existingFlatRole.id;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            role: {
              flatEntityToCreate: [flatRoleToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            flatRoleToCreate.applicationUniversalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        `Multiple validation errors occurred while creating the ${flatRoleToCreate.label} role`,
      );
    }

    return flatRoleToCreate.id;
  }
}
