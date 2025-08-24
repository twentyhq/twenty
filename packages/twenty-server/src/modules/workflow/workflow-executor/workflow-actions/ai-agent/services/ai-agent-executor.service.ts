import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CoreMessage, generateObject, generateText, ToolSet } from 'ai';
import { Repository } from 'typeorm';

import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { ToolAdapterService } from 'src/engine/core-modules/ai/services/tool-adapter.service';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AgentExecutionResult } from 'src/engine/metadata-modules/agent/agent-execution.service';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/agent/agent.exception';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/agent/constants/agent-config.const';
import { AGENT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/agent/constants/agent-system-prompts.const';
import { convertOutputSchemaToZod } from 'src/engine/metadata-modules/agent/utils/convert-output-schema-to-zod';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

@Injectable()
export class AiAgentExecutorService {
  private readonly logger = new Logger(AiAgentExecutorService.name);
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly toolAdapterService: ToolAdapterService,
    @InjectRepository(RoleTargetsEntity, 'core')
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly toolService: ToolService,
  ) {}

  private async getTools(
    agentId: string,
    workspaceId: string,
  ): Promise<ToolSet> {
    const roleTarget = await this.roleTargetsRepository.findOne({
      where: {
        agentId: agentId,
        workspaceId,
      },
      select: ['roleId'],
    });

    const role = await this.roleRepository.findOne({
      where: {
        id: roleTarget?.roleId,
        workspaceId,
      },
    });

    if (!roleTarget?.roleId || !role) {
      const actionTools = await this.toolAdapterService.getTools();

      return { ...actionTools };
    }

    const actionTools = await this.toolAdapterService.getTools(
      role.id,
      workspaceId,
    );

    const databaseTools = await this.toolService.listTools(
      role.id,
      workspaceId,
    );

    return {
      ...databaseTools,
      ...actionTools,
    };
  }

  async prepareAIRequestConfig({
    messages,
    prompt,
    system,
    agent,
  }: {
    system: string;
    agent: AgentEntity | null;
    prompt?: string;
    messages?: CoreMessage[];
  }) {
    try {
      const aiModel = this.aiModelRegistryService.getEffectiveModelConfig(
        agent?.modelId ?? 'auto',
      );

      if (agent && !aiModel) {
        const error = `AI model with id ${agent.modelId} not found`;

        this.logger.error(error);
        throw new AgentException(
          error,
          AgentExceptionCode.AGENT_EXECUTION_FAILED,
        );
      }

      this.logger.log(
        `Resolved model: ${aiModel.modelId} (provider: ${aiModel.provider})`,
      );

      const provider = aiModel.provider;

      await this.aiModelRegistryService.validateApiKey(provider);

      const tools = agent
        ? await this.getTools(agent.id, agent.workspaceId)
        : {};

      this.logger.log(`Generated ${Object.keys(tools).length} tools for agent`);

      const registeredModel = this.aiModelRegistryService.getModel(
        aiModel.modelId,
      );

      if (!registeredModel) {
        throw new AgentException(
          `Model ${aiModel.modelId} not found in registry`,
          AgentExceptionCode.AGENT_EXECUTION_FAILED,
        );
      }

      return {
        system,
        tools,
        model: registeredModel.model,
        ...(messages && { messages }),
        ...(prompt && { prompt }),
        maxSteps: AGENT_CONFIG.MAX_STEPS,
      };
    } catch (error) {
      this.logger.error(
        `Failed to prepare AI request config for agent ${agent?.id ?? 'no agent'}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async executeAgent({
    agent,
    schema,
    userPrompt,
  }: {
    agent: AgentEntity | null;
    context: Record<string, unknown>;
    schema: OutputSchema;
    userPrompt: string;
  }): Promise<AgentExecutionResult> {
    try {
      const aiRequestConfig = await this.prepareAIRequestConfig({
        system: `You are executing as part of a workflow automation. ${agent ? agent.prompt : ''}`,
        agent,
        prompt: userPrompt,
      });
      const textResponse = await generateText(aiRequestConfig);

      if (Object.keys(schema).length === 0) {
        return {
          result: { response: textResponse.text },
          usage: textResponse.usage,
        };
      }
      const output = await generateObject({
        system: AGENT_SYSTEM_PROMPTS.OUTPUT_GENERATOR,
        model: aiRequestConfig.model,
        prompt: `Based on the following execution results, generate the structured output according to the schema:

                 Execution Results: ${textResponse.text}

                 Please generate the structured output based on the execution results and context above.`,
        schema: convertOutputSchemaToZod(schema),
      });

      return {
        result: output.object,
        usage: {
          promptTokens:
            (textResponse.usage?.promptTokens ?? 0) +
            (output.usage?.promptTokens ?? 0),
          completionTokens:
            (textResponse.usage?.completionTokens ?? 0) +
            (output.usage?.completionTokens ?? 0),
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
