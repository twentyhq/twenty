import {
  ActorMetadata,
  type CurrencyMetadata,
  FieldMetadataType,
} from 'twenty-shared/types';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_OPPORTUNITY: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class OpportunityWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  amount: CurrencyMetadata | null;
  closeDate: Date | null;
  stage: string;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  pointOfContact: Relation<PersonWorkspaceEntity> | null;
  pointOfContactId: string | null;
  company: Relation<CompanyWorkspaceEntity> | null;
  companyId: string | null;
  favorites: Relation<FavoriteWorkspaceEntity[]>;
  taskTargets: Relation<TaskTargetWorkspaceEntity[]>;
  noteTargets: Relation<NoteTargetWorkspaceEntity[]>;
  attachments: Relation<AttachmentWorkspaceEntity[]>;
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
  probability: string;
  searchVector: string;
}
