import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { generateObject } from 'ai';
import { Repository } from 'typeorm';
import { z } from 'zod';

import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';

export interface RouterContext {
  conversationHistory: string;
  currentMessage: string;
  availableAgents: AgentEntity[];
  workspaceId: string;
}

@Injectable()
export class RouterService {
  private readonly logger = new Logger(RouterService.name);

  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  async routeMessage(context: RouterContext, workspace: Workspace) {
    try {
      const { conversationHistory, currentMessage, availableAgents } = context;

      if (availableAgents.length === 0) {
        this.logger.warn('No agents available for routing');

        return null;
      }

      if (availableAgents.length === 1) {
        return availableAgents[0].id;
      }

      const routerModel = this.getRouterModel(workspace);
      const agentDescriptions = this.buildAgentDescriptions(availableAgents);

      const systemPrompt = this.buildRouterSystemPrompt(agentDescriptions);
      const userPrompt = this.buildRouterUserPrompt(
        conversationHistory,
        currentMessage,
      );

      const routerDecisionSchema = z.object({
        agentId: z
          .enum(availableAgents.map((agent) => agent.id))
          .describe('The ID of the most suitable agent to handle this message'),
      });

      const result = await generateObject({
        model: routerModel,
        system: systemPrompt,
        prompt: userPrompt,
        schema: routerDecisionSchema,
        temperature: 0.1,
      });

      const decision = result.object;

      this.logger.log(`Routed to agent: ${decision.agentId}`);

      return decision.agentId;
    } catch (error) {
      this.logger.error('Router decision failed:', error);

      // Fallback to first available agent
      return context.availableAgents[0]?.id || null;
    }
  }

  async getAvailableAgents(workspaceId: string): Promise<AgentEntity[]> {
    return this.agentRepository.find({
      where: { workspaceId, deletedAt: undefined },
      order: { createdAt: 'ASC' },
    });
  }

  private getRouterModel(workspace: Workspace) {
    const modelId = workspace.routerModel || 'auto';

    if (modelId === 'auto') {
      const registeredModel = this.aiModelRegistryService.getDefaultModel();

      if (!registeredModel) {
        throw new Error('No router model available');
      }

      return registeredModel.model;
    }

    const registeredModel = this.aiModelRegistryService.getModel(modelId);

    if (!registeredModel) {
      throw new Error(`Router model "${modelId}" not available`);
    }

    return registeredModel.model;
  }

  private buildAgentDescriptions(agents: AgentEntity[]): string {
    return agents
      .map((agent) => `- ${agent.label} (${agent.id}): ${agent.description}`)
      .join('\n');
  }

  private buildRouterSystemPrompt(agentDescriptions: string): string {
    return `You are an AI router that decides which agent should handle a user's message.

Available agents:
${agentDescriptions}

Your task is to analyze the user's message and conversation history, then select the most appropriate agent to handle it. Choose the agent whose description and capabilities best match the user's request.`;
  }

  private buildRouterUserPrompt(
    conversationHistory: string,
    currentMessage: string,
  ): string {
    return `Conversation history:
${conversationHistory || 'No previous conversation'}

Current user message:
${currentMessage}

Which agent should handle this message?`;
  }
}
