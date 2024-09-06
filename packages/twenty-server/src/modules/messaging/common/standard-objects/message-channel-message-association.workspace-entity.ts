import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import {
  MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS,
  MESSAGE_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageChannelMessageAssociation,
  namePlural: 'messageChannelMessageAssociations',
  labelSingular: 'Associação de Canal de Mensagem',
  labelPlural: 'Associações de Canal de Mensagem',
  description: 'Mensagem sincronizada com um Canal de Mensagem',
  icon: 'IconMessage',
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageChannelMessageAssociationWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageExternalId,
    type: FieldMetadataType.TEXT,
    label: 'ID Externo da Mensagem',
    description: 'ID da mensagem do provedor de mensagens',
    icon: 'IconHash',
  })
  @WorkspaceIsNullable()
  messageExternalId: string | null;

  @WorkspaceField({
    standardId:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageThreadExternalId,
    type: FieldMetadataType.TEXT,
    label: 'ID Externo do Tópico',
    description: 'ID do tópico do provedor de mensagens',
    icon: 'IconHash',
  })
  @WorkspaceIsNullable()
  messageThreadExternalId: string | null;

  @WorkspaceField({
    standardId: MESSAGE_STANDARD_FIELD_IDS.direction,
    type: FieldMetadataType.SELECT,
    label: 'Direção',
    description: 'Direção da mensagem',
    icon: 'IconDirection',
    options: [
      {
        value: MessageDirection.INCOMING,
        label: 'Entrada',
        position: 0,
        color: 'green',
      },
      {
        value: MessageDirection.OUTGOING,
        label: 'Saída',
        position: 1,
        color: 'blue',
      },
    ],
    defaultValue: `'${MessageDirection.INCOMING}'`,
  })
  direction: MessageDirection;

  @WorkspaceRelation({
    standardId:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageChannel,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'ID do Canal de Mensagem',
    description: 'ID do Canal de Mensagem',
    icon: 'IconHash',
    inverseSideTarget: () => MessageChannelWorkspaceEntity,
    inverseSideFieldKey: 'messageChannelMessageAssociations',
  })
  @WorkspaceIsNullable()
  messageChannel: Relation<MessageChannelWorkspaceEntity> | null;

  @WorkspaceJoinColumn('messageChannel')
  messageChannelId: string;

  @WorkspaceRelation({
    standardId: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.message,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'ID da Mensagem',
    description: 'ID da Mensagem',
    icon: 'IconHash',
    inverseSideTarget: () => MessageWorkspaceEntity,
    inverseSideFieldKey: 'messageChannelMessageAssociations',
  })
  @WorkspaceIsNullable()
  message: Relation<MessageWorkspaceEntity> | null;

  @WorkspaceJoinColumn('message')
  messageId: string;
}
