import { Injectable, Logger } from '@nestjs/common';

import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { IsNull, Not, type Repository, type EntityManager } from 'typeorm';

import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { fromAgentEntityToFlatAgent } from 'src/engine/metadata-modules/flat-agent/utils/from-agent-entity-to-flat-agent.util';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceAgentComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-agent.comparator';
import { StandardAgentFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-agent.factory';
import { standardAgentDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents';
import { ADMIN_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/admin-role';

@Injectable()
export class WorkspaceSyncAgentService {
  private readonly logger = new Logger(WorkspaceSyncAgentService.name);

  constructor(
    private readonly standardAgentFactory: StandardAgentFactory,
    private readonly workspaceAgentComparator: WorkspaceAgentComparator,
  ) {}

  async synchronize(
    context: WorkspaceSyncContext,
    manager: EntityManager,
  ): Promise<void> {
    this.logger.log('Syncing standard agent.');

    const agentRepository = manager.getRepository(AgentEntity);
    const roleRepository = manager.getRepository(RoleEntity);
    const roleTargetsRepository = manager.getRepository(RoleTargetsEntity);

    const existingStandardAgentEntities = await agentRepository.find({
      where: {
        workspaceId: context.workspaceId,
        standardId: Not(IsNull()),
      },
    });

    const targetStandardAgents = this.standardAgentFactory.create(
      standardAgentDefinitions,
      context,
      existingStandardAgentEntities,
    );

    const agentComparatorResults = this.workspaceAgentComparator.compare({
      fromFlatAgents: existingStandardAgentEntities.map(
        fromAgentEntityToFlatAgent,
      ),
      toFlatAgents: targetStandardAgents,
    });

    for (const agentComparatorResult of agentComparatorResults) {
      switch (agentComparatorResult.action) {
        case ComparatorAction.CREATE: {
          const agentToCreate = agentComparatorResult.object;

          const flatAgentData = removePropertiesFromRecord(agentToCreate, [
            'uniqueIdentifier',
            'id',
          ]);

          const createdAgent = await agentRepository.save({
            ...flatAgentData,
            workspaceId: context.workspaceId,
          });

          await this.assignAdminRoleToAgent(
            createdAgent.id,
            context.workspaceId,
            roleRepository,
            roleTargetsRepository,
          );
          break;
        }

        case ComparatorAction.UPDATE: {
          const agentToUpdate = agentComparatorResult.object;

          const flatAgentData = removePropertiesFromRecord(agentToUpdate, [
            'id',
            'uniqueIdentifier',
            'workspaceId',
          ]);

          await agentRepository.update({ id: agentToUpdate.id }, flatAgentData);
          break;
        }

        case ComparatorAction.DELETE: {
          const agentToDelete = agentComparatorResult.object;

          await agentRepository.delete({ id: agentToDelete.id });
          break;
        }
      }
    }
  }

  private async assignAdminRoleToAgent(
    agentId: string,
    workspaceId: string,
    roleRepository: Repository<RoleEntity>,
    roleTargetsRepository: Repository<RoleTargetsEntity>,
  ): Promise<void> {
    try {
      const adminRole = await roleRepository.findOne({
        where: {
          workspaceId,
          standardId: ADMIN_ROLE.standardId,
        },
      });

      if (!adminRole) {
        this.logger.warn(
          `Admin role not found for workspace ${workspaceId}, cannot assign to workflow creation agent`,
        );

        return;
      }

      const existingRoleTarget = await roleTargetsRepository.findOne({
        where: {
          agentId,
          roleId: adminRole.id,
          workspaceId,
        },
      });

      if (existingRoleTarget) {
        this.logger.log(
          `Workflow creation agent already has admin role assigned`,
        );

        return;
      }

      await roleTargetsRepository.save({
        roleId: adminRole.id,
        agentId,
        workspaceId,
      });

      this.logger.log(
        `Successfully assigned admin role to workflow creation agent`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to assign admin role to workflow creation agent: ${error.message}`,
      );
    }
  }
}
