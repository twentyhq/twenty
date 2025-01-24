import { FieldMetadataType } from 'twenty-shared';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsDeprecated } from 'src/engine/twenty-orm/decorators/workspace-is-deprecated.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WEBHOOK_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.webhook,
  namePlural: 'webhooks',
  labelSingular: 'Webhook',
  labelPlural: 'Webhooks',
  description: 'A webhook',
  icon: STANDARD_OBJECT_ICONS.webhook,
  labelIdentifierStandardId: WEBHOOK_STANDARD_FIELD_IDS.targetUrl,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class WebhookWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WEBHOOK_STANDARD_FIELD_IDS.targetUrl,
    type: FieldMetadataType.TEXT,
    label: 'Target Url',
    description: 'Webhook target url',
    icon: 'IconLink',
  })
  targetUrl: string;

  @WorkspaceField({
    standardId: WEBHOOK_STANDARD_FIELD_IDS.operation,
    type: FieldMetadataType.TEXT,
    label: 'Operation',
    description: 'Webhook operation',
    icon: 'IconCheckbox',
  })
  @WorkspaceIsDeprecated()
  operation: string;

  @WorkspaceField({
    standardId: WEBHOOK_STANDARD_FIELD_IDS.operations,
    type: FieldMetadataType.ARRAY,
    label: 'Operations',
    description: 'Webhook operations',
    icon: 'IconCheckbox',
    defaultValue: ['*.*'],
  })
  operations: string[];

  @WorkspaceField({
    standardId: WEBHOOK_STANDARD_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: 'Description',
    description: undefined,
    icon: 'IconInfo',
  })
  @WorkspaceIsNullable()
  description: string;

  @WorkspaceField({
    standardId: WEBHOOK_STANDARD_FIELD_IDS.secret,
    type: FieldMetadataType.TEXT,
    label: 'Secret',
    description:
      'Optional secret used to compute the HMAC signature for webhook payloads. This secret is shared between Twenty and the webhook consumer to authenticate webhook requests.',
    icon: 'IconLock',
  })
  secret: string;
}
