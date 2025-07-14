import { Injectable } from '@nestjs/common';
import { WorkspaceMemberWorkspaceEntity } from '../workspace-member/standard-objects/workspace-member.workspace-entity';
import { PersonWorkspaceEntity } from '../person/standard-objects/person.workspace-entity';
import { Repository } from 'typeorm';
import { WorkspaceMember } from '@nestjs/core/inspector/interfaces/workspace-member.interface';

@Injectable()
export class LeadDistributionService {
  private lastAgentIndex = 0;

  constructor() {}

  async distributeLead(
    lead: PersonWorkspaceEntity,
    agents: WorkspaceMemberWorkspaceEntity[],
    personRepository: Repository<PersonWorkspaceEntity>,
  ): Promise<void> {
    if (agents.length === 0) {
      return;
    }

    const leadDistributionConfig = await this.getLeadDistributionConfig();

    let agent: WorkspaceMemberWorkspaceEntity;

    if (leadDistributionConfig.type === 'weighted') {
      agent = this.getWeightedRoundRobinAgent(agents, leadDistributionConfig.weights);
    } else {
      agent = this.getRoundRobinAgent(agents);
    }

    lead.agent = agent;
    lead.leadStatus = 'ASSIGNED';
    await personRepository.save(lead);
  }

  private getRoundRobinAgent(agents: WorkspaceMemberWorkspaceEntity[]): WorkspaceMemberWorkspaceEntity {
    const agent = agents[this.lastAgentIndex];
    this.lastAgentIndex = (this.lastAgentIndex + 1) % agents.length;
    return agent;
  }

  private getWeightedRoundRobinAgent(
    agents: WorkspaceMemberWorkspaceEntity[],
    weights: { [agentId: string]: number },
  ): WorkspaceMemberWorkspaceEntity {
    const weightedAgents: WorkspaceMemberWorkspaceEntity[] = [];
    for (const agent of agents) {
      const weight = weights[agent.id] || 0;
      for (let i = 0; i < weight; i++) {
        weightedAgents.push(agent);
      }
    }

    if (weightedAgents.length === 0) {
      return this.getRoundRobinAgent(agents);
    }

    return this.getRoundRobinAgent(weightedAgents);
  }

  async getLeadDistributionConfig(): Promise<any> {
    // In a real application, this would fetch the config from a database or a configuration file.
    // For this example, we'll just return a mock config.
    return {
      type: 'round-robin', // or 'weighted'
      weights: {
        // agentId: weight
      },
    };
  }

  async setLeadDistributionConfig(config: any): Promise<void> {
    // In a real application, this would save the config to a database or a configuration file.
    console.log('Setting lead distribution config:', config);
  }
}
