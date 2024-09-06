import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CONNECTED_ACCOUNT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export enum ConnectedAccountProvider {
  GOOGLE = 'google',
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.connectedAccount,
  namePlural: 'connectedAccounts',
  labelSingular: 'Conta Conectada',
  labelPlural: 'Contas Conectadas',
  description: 'Uma conta conectada',
  icon: 'IconAt',
  labelIdentifierStandardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.handle,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class ConnectedAccountWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: 'Identificador',
    description: 'O identificador da conta (email, nome de usuário, número de telefone, etc.)',
    icon: 'IconMail',
  })
  handle: string;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.provider,
    type: FieldMetadataType.TEXT,
    label: 'Provedor',
    description: 'O provedor da conta',
    icon: 'IconSettings',
  })
  provider: ConnectedAccountProvider; // field metadata should be a SELECT

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.accessToken,
    type: FieldMetadataType.TEXT,
    label: 'Token de Acesso',
    description: 'Token de acesso do provedor de mensagens',
    icon: 'IconKey',
  })
  accessToken: string;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.refreshToken,
    type: FieldMetadataType.TEXT,
    label: 'Token de Atualização',
    description: 'Token de atualização do provedor de mensagens',
    icon: 'IconKey',
  })
  refreshToken: string;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.lastSyncHistoryId,
    type: FieldMetadataType.TEXT,
    label: 'ID do Último Histórico de Sincronização',
    description: 'ID do último histórico de sincronização',
    icon: 'IconHistory',
  })
  lastSyncHistoryId: string;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.authFailedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Falha na Autenticação em',
    description: 'Data e hora da falha na autenticação',
    icon: 'IconX',
  })
  @WorkspaceIsNullable()
  authFailedAt: Date | null;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.handleAliases,
    type: FieldMetadataType.TEXT,
    label: 'Aliases do Identificador',
    description: 'Aliases do identificador',
    icon: 'IconMail',
  })
  handleAliases: string;

  @WorkspaceRelation({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.accountOwner,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Proprietário da Conta',
    description: 'Proprietário da conta',
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'connectedAccounts',
  })
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string;

  @WorkspaceRelation({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.messageChannels,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Canais de Mensagens',
    description: 'Canais de mensagens associados',
    icon: 'IconMessage',
    inverseSideTarget: () => MessageChannelWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  messageChannels: Relation<MessageChannelWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.calendarChannels,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Canais de Calendário',
    description: 'Canais de calendário associados',
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarChannelWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  calendarChannels: Relation<CalendarChannelWorkspaceEntity[]>;
}
