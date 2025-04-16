import { Field, ObjectType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WHATSAPP_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ChatbotWorkspaceEntity } from 'src/modules/chatbot/standard-objects/chatbot.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.whatsappIntegration,
  namePlural: 'whatsappIntegrations',
  labelSingular: msg`Whatsapp Integration`,
  labelPlural: msg`WhatsappIntegrations`,
  description: msg`A whatsapp integration`,
  icon: 'IconBrandWhatsapp',
  labelIdentifierStandardId: WHATSAPP_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsNotAuditLogged()
@ObjectType()
export class WhatsappWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The name of the whatsapp integration`,
  })
  @Field(() => String, { nullable: true })
  name: string | null;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.phoneId,
    type: FieldMetadataType.TEXT,
    label: msg`Phone ID`,
    description: msg`The phone number ID obtained from Facebook Developer`,
  })
  @Field(() => String, { nullable: false })
  phoneId: string;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.businessAccountId,
    type: FieldMetadataType.TEXT,
    label: msg`Business Account ID`,
    description: msg`The business account ID obtained from Facebook Developer`,
  })
  @Field(() => String, { nullable: false })
  businessAccountId: string;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.appId,
    type: FieldMetadataType.TEXT,
    label: msg`App ID`,
    description: msg`The App ID obtained from Facebook Developer`,
  })
  @Field(() => String, { nullable: false })
  appId: string;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.appKey,
    type: FieldMetadataType.TEXT,
    label: msg`App Key`,
    description: msg`The App Secret Key obtained from Facebook Developer`,
  })
  @Field(() => String, { nullable: false })
  appKey: string;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.accessToken,
    type: FieldMetadataType.TEXT,
    label: msg`Access Token`,
    description: msg`The Access Token obtained from Facebook Developer`,
  })
  @Field(() => String, { nullable: false })
  accessToken: string;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.verifyToken,
    type: FieldMetadataType.TEXT,
    label: msg`Verify Token`,
    description: msg`The Verify Token obtained from Facebook Developer`,
  })
  @Field(() => String, { nullable: false })
  verifyToken: string;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.sla,
    type: FieldMetadataType.NUMBER,
    label: msg`Service Level Agreement`,
    description: msg`Service Level Agreement (SLA) in minutes`,
  })
  @Field(() => Number, { nullable: false, defaultValue: 30 })
  sla: number;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.disabled,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Status`,
    description: msg`Status of the integration`,
  })
  @Field(() => Boolean, { nullable: false, defaultValue: false })
  disabled: boolean;

  @WorkspaceRelation({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.chatbot,
    type: RelationMetadataType.MANY_TO_ONE,
    label: msg`Chatbot`,
    description: msg`Integration linked to the Chatbot`,
    icon: 'IconPhone',
    inverseSideTarget: () => ChatbotWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  chatbot: Relation<ChatbotWorkspaceEntity>;

  @WorkspaceJoinColumn('chatbot')
  chatbotId: string | null;
}
