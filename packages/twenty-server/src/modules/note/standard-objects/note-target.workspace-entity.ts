import { type Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { type NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export class NoteTargetWorkspaceEntity extends BaseWorkspaceEntity {
  note: Relation<NoteWorkspaceEntity> | null;
  noteId: string | null;
  person: Relation<PersonWorkspaceEntity> | null;
  personId: string | null;
  company: Relation<CompanyWorkspaceEntity> | null;
  companyId: string | null;
  opportunity: Relation<OpportunityWorkspaceEntity> | null;
  opportunityId: string | null;
  custom: Relation<CustomWorkspaceEntity>;
}
