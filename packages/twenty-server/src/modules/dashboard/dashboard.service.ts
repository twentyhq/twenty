import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonWorkspaceEntity } from '../person/standard-objects/person.workspace-entity';
import { ListingWorkspaceEntity } from '../listing/standard-objects/listing.workspace-entity';
import { OpportunityWorkspaceEntity } from '../opportunity/standard-objects/opportunity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from '../workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PersonWorkspaceEntity)
    private readonly personRepository: Repository<PersonWorkspaceEntity>,
    @InjectRepository(ListingWorkspaceEntity)
    private readonly listingRepository: Repository<ListingWorkspaceEntity>,
    @InjectRepository(OpportunityWorkspaceEntity)
    private readonly opportunityRepository: Repository<OpportunityWorkspaceEntity>,
    @InjectRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberRepository: Repository<WorkspaceMemberWorkspaceEntity>,
  ) {}

  async getDashboardData(): Promise<any> {
    const newLeads = await this.getNewLeads();
    const leadConversionRate = await this.getLeadConversionRate();
    const timeToClose = await this.getTimeToClose();
    const topAgents = await this.getTopAgents();
    const activeListings = await this.getActiveListings();

    return {
      newLeads,
      leadConversionRate,
      timeToClose,
      topAgents,
      activeListings,
    };
  }

  private async getNewLeads(): Promise<any> {
    // This is a placeholder. You'll need to implement the logic to get the number of new leads over time.
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [10, 20, 15, 25, 30, 20],
    };
  }

  private async getLeadConversionRate(): Promise<number> {
    const totalLeads = await this.personRepository.count();
    const closedLeads = await this.personRepository.count({ where: { leadStatus: 'CLOSED' } });
    return (closedLeads / totalLeads) * 100;
  }

  private async getTimeToClose(): Promise<number> {
    // This is a placeholder. You'll need to implement the logic to calculate the average time to close a deal.
    return 30; // in days
  }

  private async getTopAgents(): Promise<any[]> {
    // This is a placeholder. You'll need to implement the logic to get the top performing agents.
    return [
      { name: 'Agent 1', deals: 10 },
      { name: 'Agent 2', deals: 8 },
      { name: 'Agent 3', deals: 5 },
    ];
  }

  private async getActiveListings(): Promise<any[]> {
    return this.listingRepository.find({ where: { status: 'ACTIVE' } });
  }
}
