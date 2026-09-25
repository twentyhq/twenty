import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';

export class AgentChatThreadTargetWorkspaceEntity extends BaseWorkspaceEntity {
  thread: EntityRelation<AgentChatThreadWorkspaceEntity>;
  threadId: string;

  targetPerson: EntityRelation<PersonWorkspaceEntity> | null;
  targetPersonId: string | null;
  targetCompany: EntityRelation<CompanyWorkspaceEntity> | null;
  targetCompanyId: string | null;
  targetOpportunity: EntityRelation<OpportunityWorkspaceEntity> | null;
  targetOpportunityId: string | null;
  custom: EntityRelation<CustomWorkspaceEntity>;
}
