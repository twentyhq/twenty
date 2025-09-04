import { Injectable, Logger } from '@nestjs/common';

import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { IsNull, Not, type EntityManager } from 'typeorm';

import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { AgentRoleService } from 'src/engine/metadata-modules/agent-role/agent-role.service';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { transformAgentEntityToFlatAgent } from 'src/engine/metadata-modules/flat-agent/utils/transform-agent-entity-to-flat-agent.util';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { AGENT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-agents.util';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';
import { WorkspaceAgentComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-agent.comparator';
import { StandardAgentFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-agent.factory';
import { standardAgentDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents';
import { WORKFLOW_CREATION_AGENT } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/agents/workflow-creation-agent';

@Injectable()
export class WorkspaceSyncAgentService {
  private readonly logger = new Logger(WorkspaceSyncAgentService.name);

  constructor(
    private readonly standardAgentFactory: StandardAgentFactory,
    private readonly workspaceAgentComparator: WorkspaceAgentComparator,
    private readonly agentRoleService: AgentRoleService,
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
      standardAgentDefinitions,
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

          const agentDefinition = standardAgentDefinitions.find(
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

              const roleTargetsRepository =
                manager.getRepository(RoleTargetsEntity);

              await roleTargetsRepository.save({
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

          if (createdAgent.standardId === WORKFLOW_CREATION_AGENT.standardId) {
            await this.createAgentHandoffToWorkflowCreationAgent(
              createdAgent.id,
              context.workspaceId,
              manager,
            );
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

          const agentDefinition = standardAgentDefinitions.find(
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

              const roleTargetsRepository =
                manager.getRepository(RoleTargetsEntity);

              await roleTargetsRepository.save({
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

  private async createAgentHandoffToWorkflowCreationAgent(
    workflowCreationAgentId: string,
    workspaceId: string,
    manager: EntityManager,
  ): Promise<void> {
    try {
      const agentRepository = manager.getRepository(AgentEntity);

      let defaultAgent: AgentEntity | null = null;

      if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
        defaultAgent = await agentRepository.findOne({
          where: {
            id: AGENT_DATA_SEED_IDS.APPLE_DEFAULT_AGENT,
            workspaceId,
          },
        });
      } else if (workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID) {
        defaultAgent = await agentRepository.findOne({
          where: {
            id: AGENT_DATA_SEED_IDS.YCOMBINATOR_DEFAULT_AGENT,
            workspaceId,
          },
        });
      } else {
        defaultAgent = await agentRepository.findOne({
          where: {
            workspaceId,
          },
        });
      }

      if (!defaultAgent) {
        this.logger.warn(
          `Default agent not found for workspace ${workspaceId}. Agent handoff will not be created.`,
        );

        return;
      }

      const agentHandoffRepository = manager.getRepository('agentHandoff');
      const existingHandoff = await agentHandoffRepository.findOne({
        where: {
          fromAgentId: defaultAgent.id,
          toAgentId: workflowCreationAgentId,
          workspaceId,
        },
      });

      if (existingHandoff) {
        this.logger.log(
          `Agent handoff from default agent to workflow creation agent already exists for workspace ${workspaceId}`,
        );

        return;
      }

      await agentHandoffRepository.save({
        fromAgentId: defaultAgent.id,
        toAgentId: workflowCreationAgentId,
        workspaceId,
        description:
          'Handoff from default agent to workflow creation agent for processing workflow creation requests',
      });

      this.logger.log(
        `Successfully created agent handoff from default agent to workflow creation agent for workspace ${workspaceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create agent handoff to workflow creation agent: ${error.message}`,
      );
    }
  }
}
