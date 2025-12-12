import { Injectable, Logger } from '@nestjs/common';

import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { IsNull, Not, type EntityManager } from 'typeorm';

import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { transformAgentEntityToFlatAgent } from 'src/engine/metadata-modules/flat-agent/utils/transform-agent-entity-to-flat-agent.util';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceAgentComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-agent.comparator';
import { StandardAgentFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-agent.factory';
import { STANDARD_AGENT_DEFINITIONS } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/standard-agent-definitions';

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

    const existingStandardAgentEntities = await agentRepository.find({
      where: {
        workspaceId: context.workspaceId,
        standardId: Not(IsNull()),
      },
    });

    const targetStandardAgents = this.standardAgentFactory.create(
      STANDARD_AGENT_DEFINITIONS,
      context,
      existingStandardAgentEntities,
    );

    const agentComparatorResults = this.workspaceAgentComparator.compare({
      fromFlatAgents: existingStandardAgentEntities.map(
        transformAgentEntityToFlatAgent,
      ),
      toFlatAgents: targetStandardAgents,
    });

    for (const agentComparatorResult of agentComparatorResults) {
      switch (agentComparatorResult.action) {
        case ComparatorAction.CREATE: {
          const agentToCreate = agentComparatorResult.object;

          const flatAgentData = removePropertiesFromRecord(agentToCreate, [
            'universalIdentifier',
            'id',
          ]);

          const createdAgent = await agentRepository.save({
            ...flatAgentData,
            workspaceId: context.workspaceId,
          });

          const agentDefinition = STANDARD_AGENT_DEFINITIONS.find(
            (def) => def.standardId === createdAgent.standardId,
          );

          if (agentDefinition?.standardRoleId) {
            try {
              const roleRepository = manager.getRepository(RoleEntity);
              const role = await roleRepository.findOne({
                where: {
                  standardId: agentDefinition.standardRoleId,
                  workspaceId: context.workspaceId,
                },
              });

              if (!role) {
                throw new Error(
                  `Standard role with standard ID ${agentDefinition.standardRoleId} not found in workspace`,
                );
              }

              const roleTargetRepository =
                manager.getRepository(RoleTargetEntity);

              await roleTargetRepository.save({
                roleId: role.id,
                agentId: createdAgent.id,
                workspaceId: context.workspaceId,
              });
            } catch (error) {
              this.logger.error(
                `Failed to assign standard role ${agentDefinition.standardRoleId} to agent ${createdAgent.id}: ${error.message}`,
                error.stack,
              );
              throw error;
            }
          }
          break;
        }

        case ComparatorAction.UPDATE: {
          const agentToUpdate = agentComparatorResult.object;

          const flatAgentData = removePropertiesFromRecord(agentToUpdate, [
            'id',
            'universalIdentifier',
            'workspaceId',
            'standardRoleId' as keyof typeof agentToUpdate,
          ]);

          await agentRepository.update({ id: agentToUpdate.id }, flatAgentData);

          const agentDefinition = STANDARD_AGENT_DEFINITIONS.find(
            (def) => def.standardId === agentToUpdate.standardId,
          );

          if (agentDefinition?.standardRoleId) {
            try {
              const roleRepository = manager.getRepository(RoleEntity);
              const role = await roleRepository.findOne({
                where: {
                  standardId: agentDefinition.standardRoleId,
                  workspaceId: context.workspaceId,
                },
              });

              if (!role) {
                throw new Error(
                  `Standard role with standard ID ${agentDefinition.standardRoleId} not found in workspace`,
                );
              }

              const roleTargetRepository =
                manager.getRepository(RoleTargetEntity);

              await roleTargetRepository.save({
                roleId: role.id,
                agentId: agentToUpdate.id,
                workspaceId: context.workspaceId,
              });
            } catch (error) {
              this.logger.error(
                `Failed to assign standard role ${agentDefinition.standardRoleId} to agent ${agentToUpdate.id}: ${error.message}`,
                error.stack,
              );
              throw error;
            }
          }
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
}
