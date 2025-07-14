import { Test, TestingModule } from '@nestjs/testing';
import { LeadDistributionService } from './lead-distribution.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonWorkspaceEntity } from '../person/standard-objects/person.workspace-entity';
import { LeadDistributionModule } from './lead-distribution.module';
import { WorkspaceMemberWorkspaceEntity } from '../workspace-member/standard-objects/workspace-member.workspace-entity';

describe('LeadDistributionService', () => {
  let service: LeadDistributionService;
  let workspaceMemberRepository: Repository<WorkspaceMemberWorkspaceEntity>;
  let personRepository: Repository<PersonWorkspaceEntity>;

  const mockWorkspaceMemberRepository = {
    find: jest.fn(),
  };

  const mockPersonRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LeadDistributionModule],
    })
      .overrideProvider(getRepositoryToken(WorkspaceMemberWorkspaceEntity))
      .useValue(mockWorkspaceMemberRepository)
      .overrideProvider(getRepositoryToken(PersonWorkspaceEntity))
      .useValue(mockPersonRepository)
      .compile();

    service = module.get<LeadDistributionService>(LeadDistributionService);
    workspaceMemberRepository = module.get<Repository<WorkspaceMemberWorkspaceEntity>>(
      getRepositoryToken(WorkspaceMemberWorkspaceEntity),
    );
    personRepository = module.get<Repository<PersonWorkspaceEntity>>(
      getRepositoryToken(PersonWorkspaceEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('distributeLead', () => {
    it('should distribute a lead to an agent using round-robin', async () => {
      const agents = [
        { id: 'agent1', leadDistributionEnabled: true },
        { id: 'agent2', leadDistributionEnabled: true },
      ] as WorkspaceMemberWorkspaceEntity[];
      const lead = { id: 'lead1' } as PersonWorkspaceEntity;

      mockPersonRepository.save.mockResolvedValue(lead);

      await service.distributeLead(lead, agents, personRepository);

      expect(personRepository.save).toHaveBeenCalledWith({
        ...lead,
        agent: agents[0],
        leadStatus: 'ASSIGNED',
      });

      await service.distributeLead(lead, agents, personRepository);

      expect(personRepository.save).toHaveBeenCalledWith({
        ...lead,
        agent: agents[1],
        leadStatus: 'ASSIGNED',
      });
    });
  });
});
