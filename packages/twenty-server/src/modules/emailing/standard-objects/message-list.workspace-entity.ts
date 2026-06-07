import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_MESSAGE_LIST: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class MessageListWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  members: EntityRelation<MessageListMemberWorkspaceEntity[]>;
  searchVector: string;
}
