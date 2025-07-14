import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonWorkspaceEntity } from '../person/standard-objects/person.workspace-entity';
import { ListingWorkspaceEntity } from '../listing/standard-objects/listing.workspace-entity';
import { OpportunityWorkspaceEntity } from '../opportunity/standard-objects/opportunity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from '../workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class ReportingService {
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

  async getReport(reportName: string, params: any): Promise<any> {
    switch (reportName) {
      case 'lead':
        return this.getLeadReport(params);
      case 'agent-performance':
        return this.getAgentPerformanceReport(params);
      case 'listing':
        return this.getListingReport(params);
      default:
        throw new Error(`Report not found: ${reportName}`);
    }
  }

  private async getLeadReport(params: any): Promise<any> {
    return this.personRepository.find({ where: params, relations: ['agent'] });
  }

  private async getAgentPerformanceReport(params: any): Promise<any> {
    // This is a placeholder. You'll need to implement the logic to generate the agent performance report.
    return [];
  }

  private async getListingReport(params: any): Promise<any> {
    return this.listingRepository.find({ where: params, relations: ['property', 'agent'] });
  }
}
