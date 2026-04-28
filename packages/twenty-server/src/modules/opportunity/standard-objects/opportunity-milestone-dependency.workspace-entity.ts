import { type ActorMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type OpportunityMilestoneWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity-milestone.workspace-entity';

// Junction (edge) between two OpportunityMilestone records expressing a
// precedence relation: `dependentMilestone` cannot start until
// `requiredMilestone` is done. Self-referential via two MANY_TO_ONE pointers
// to the same target object — mirrors the TaskTarget/NoteTarget pattern but
// both legs aim at OpportunityMilestone.
//
// Both ends cascade on delete: removing either milestone removes the edge.
// Cycle prevention happens at the GraphQL pre-query hook layer (see
// `cyclic-dependency-validator.service.ts`), not here.
export class OpportunityMilestoneDependencyWorkspaceEntity extends BaseWorkspaceEntity {
  description: string | null;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  dependentMilestone: EntityRelation<OpportunityMilestoneWorkspaceEntity> | null;
  dependentMilestoneId: string | null;
  requiredMilestone: EntityRelation<OpportunityMilestoneWorkspaceEntity> | null;
  requiredMilestoneId: string | null;
}
