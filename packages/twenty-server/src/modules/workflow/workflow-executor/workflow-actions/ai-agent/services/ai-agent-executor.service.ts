import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { generateObject, generateText, stepCountIs, ToolSet } from 'ai';
import { Repository } from 'typeorm';

import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { ToolAdapterService } from 'src/engine/core-modules/ai/services/tool-adapter.service';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { AgentExecutionResult } from 'src/engine/metadata-modules/agent/agent-execution.service';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/agent/agent.exception';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/agent/constants/agent-config.const';
import { AGENT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/agent/constants/agent-system-prompts.const';
import { convertOutputSchemaToZod } from 'src/engine/metadata-modules/agent/utils/convert-output-schema-to-zod';
import { type ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleContext } from 'src/engine/metadata-modules/role/types/role-context.type';
import { OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

@Injectable()
export class AiAgentExecutorService {
  private readonly logger = new Logger(AiAgentExecutorService.name);
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly toolAdapterService: ToolAdapterService,
    @InjectRepository(RoleTargetsEntity)
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
    private readonly toolService: ToolService,
  ) {}

  private async getTools(
    agentId: string,
    workspaceId: string,
    actorContext?: ActorMetadata,
    roleContext?: RoleContext,
  ): Promise<ToolSet> {
    const roleTarget = await this.roleTargetsRepository.findOne({
      where: {
        agentId: agentId,
        workspaceId,
      },
      select: ['roleId'],
    });

    const agentRoleId = roleTarget?.roleId;

    if (!roleContext && !agentRoleId) {
      return await this.toolAdapterService.getTools();
    }

    const effectiveRoleContext: RoleContext = roleContext?.roleIds
      ? { roleIds: roleContext.roleIds }
      : roleContext?.roleId
        ? { roleId: roleContext.roleId }
        : agentRoleId
          ? { roleId: agentRoleId }
          : {};

    const actionTools = await this.toolAdapterService.getTools(
      effectiveRoleContext,
      workspaceId,
    );

    const databaseTools = await this.toolService.listTools(
      effectiveRoleContext,
      workspaceId,
      actorContext,
    );

    return {
      ...databaseTools,
      ...actionTools,
    };
  }

  async executeAgent({
    agent,
    schema,
    userPrompt,
    actorContext,
    roleContext,
  }: {
    agent: AgentEntity | null;
    schema: OutputSchema;
    userPrompt: string;
    actorContext?: ActorMetadata;
    roleContext?: RoleContext;
  }): Promise<AgentExecutionResult> {
    try {
      const registeredModel =
        await this.aiModelRegistryService.resolveModelForAgent(agent);

      const tools = agent
        ? await this.getTools(
            agent.id,
            agent.workspaceId,
            actorContext,
            roleContext,
          )
        : {};

      this.logger.log(`Generated ${Object.keys(tools).length} tools for agent`);

      const textResponse = await generateText({
        system: `You are executing as part of a workflow automation. ${agent ? agent.prompt : ''}`,
        tools,
        model: registeredModel.model,
        prompt: userPrompt,
        stopWhen: stepCountIs(AGENT_CONFIG.MAX_STEPS),
      });

      if (Object.keys(schema).length === 0) {
        return {
          result: { response: textResponse.text },
          usage: textResponse.usage,
        };
      }
      const output = await generateObject({
        system: AGENT_SYSTEM_PROMPTS.OUTPUT_GENERATOR,
        model: registeredModel.model,
        prompt: `Based on the following execution results, generate the structured output according to the schema:

                 Execution Results: ${textResponse.text}

                 Please generate the structured output based on the execution results and context above.`,
        schema: convertOutputSchemaToZod(schema),
      });

      return {
        result: output.object,
        usage: {
          inputTokens:
            (textResponse.usage?.inputTokens ?? 0) +
            (output.usage?.inputTokens ?? 0),
          outputTokens:
            (textResponse.usage?.outputTokens ?? 0) +
            (output.usage?.outputTokens ?? 0),
          totalTokens:
            (textResponse.usage?.totalTokens ?? 0) +
            (output.usage?.totalTokens ?? 0),
        },
      };
    } catch (error) {
      if (error instanceof AgentException) {
        throw error;
      }
      throw new AgentException(
        error instanceof Error ? error.message : 'Agent execution failed',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }
  }
}
