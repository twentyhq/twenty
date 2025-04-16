import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CHATBOT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WhatsappWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';

export enum ChatbotStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
}

const ChatbotStatusOptions: FieldMetadataComplexOption[] = [
  {
    value: ChatbotStatus.DRAFT,
    label: 'Draft',
    position: 0,
    color: 'yellow',
  },
  {
    value: ChatbotStatus.ACTIVE,
    label: 'Active',
    position: 1,
    color: 'green',
  },
  {
    value: ChatbotStatus.DEACTIVATED,
    label: 'Deactivated',
    position: 2,
    color: 'gray',
  },
];

registerEnumType(ChatbotStatus, {
  name: 'ChatbotStatus',
  description: 'Chatbot status options',
});

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_CHATBOT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.chatbot,
  namePlural: 'chatbots',
  labelSingular: msg`Chatbot`,
  labelPlural: msg`Chatbots`,
  description: msg`A chatbot`,
  icon: STANDARD_OBJECT_ICONS.chatbot,
  labelIdentifierStandardId: CHATBOT_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsNotAuditLogged()
@ObjectType()
export class ChatbotWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The chatbot flow name`,
    icon: 'IconSettingsAutomation',
  })
  @Field(() => String, { nullable: true })
  name: string | null;

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.statuses,
    type: FieldMetadataType.SELECT,
    label: msg`Statuses`,
    description: msg`The current statuses of the chatbot flow`,
    icon: 'IconStatusChange',
    options: ChatbotStatusOptions,
  })
  @WorkspaceIsNullable()
  @Field(() => ChatbotStatus, { nullable: true })
  statuses: ChatbotStatus | null;

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Chatbot record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceRelation({
    standardId: CHATBOT_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the chatbot`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: CHATBOT_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline activities linked to the chatbot`,
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: CHATBOT_STANDARD_FIELD_IDS.whatsappIntegration,
    type: RelationMetadataType.ONE_TO_MANY,
    label: msg`Whatsapp Integration`,
    description: msg`Integration linked to the charge`,
    icon: 'IconPhone',
    inverseSideTarget: () => WhatsappWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  whatsappIntegrations: Relation<WhatsappWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_CHATBOT,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: any;
}
