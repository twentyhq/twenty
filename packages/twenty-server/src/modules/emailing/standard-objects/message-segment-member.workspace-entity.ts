import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageSegmentWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-segment.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

// Join object linking a person to a segment (a hand-picked audience).
// Twenty has no many-to-many, so this is the rock between Person and Segment.
export class MessageSegmentMemberWorkspaceEntity extends BaseWorkspaceEntity {
  segment: EntityRelation<MessageSegmentWorkspaceEntity>;
  segmentId: string;
  person: EntityRelation<PersonWorkspaceEntity>;
  personId: string;
  searchVector: string;
}
