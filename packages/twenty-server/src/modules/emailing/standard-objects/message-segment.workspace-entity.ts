import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageSegmentMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-segment-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_MESSAGE_SEGMENT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class MessageSegmentWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  members: EntityRelation<MessageSegmentMemberWorkspaceEntity[]>;
  searchVector: string;
}
