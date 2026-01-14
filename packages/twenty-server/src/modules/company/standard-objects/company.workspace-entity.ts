import {
  FieldMetadataType,
  type ActorMetadata,
  type AddressMetadata,
  type CurrencyMetadata,
  type LinksMetadata,
} from 'twenty-shared/types';

import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';
const DOMAIN_NAME_FIELD_NAME = 'domainName';

export const SEARCH_FIELDS_FOR_COMPANY: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: DOMAIN_NAME_FIELD_NAME, type: FieldMetadataType.LINKS },
];

export class CompanyWorkspaceEntity {
  // Base fields
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  // Company-specific fields
  name: string | null;
  domainName: LinksMetadata;
  employees: number | null;
  linkedinLink: LinksMetadata | null;
  xLink: LinksMetadata | null;
  annualRecurringRevenue: CurrencyMetadata | null;
  address: AddressMetadata;
  idealCustomerProfile: boolean;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  /** @deprecated Use `address` field instead */
  addressOld: string | null;
  searchVector: string;

  // Relations
  people: EntityRelation<PersonWorkspaceEntity[]>;
  accountOwner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  accountOwnerId: string | null;
  taskTargets: EntityRelation<TaskTargetWorkspaceEntity[]>;
  noteTargets: EntityRelation<NoteTargetWorkspaceEntity[]>;
  opportunities: EntityRelation<OpportunityWorkspaceEntity[]>;
  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;
  attachments: EntityRelation<AttachmentWorkspaceEntity[]>;
  timelineActivities: EntityRelation<TimelineActivityWorkspaceEntity[]>;
}
