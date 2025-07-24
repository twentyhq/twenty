import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsDeprecated } from 'src/engine/twenty-orm/decorators/workspace-is-deprecated.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WEBHOOK_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.webhook,
  namePlural: 'webhooks',
  labelSingular: msg`Webhook`,
  labelPlural: msg`Webhooks`,
  description: msg`A webhook`,
  icon: STANDARD_OBJECT_ICONS.webhook,
  labelIdentifierStandardId: WEBHOOK_STANDARD_FIELD_IDS.targetUrl,
})
@WorkspaceIsSystem()
@WorkspaceGate({
  featureFlag: 'IS_WORKSPACE_API_KEY_WEBHOOK_GRAPHQL_ENABLED',
  excludeFromDatabase: false,
  excludeFromWorkspaceApi: true,
})
export class WebhookWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WEBHOOK_STANDARD_FIELD_IDS.targetUrl,
    type: FieldMetadataType.TEXT,
    label: msg`Target Url`,
    description: msg`Webhook target url`,
    icon: 'IconLink',
  })
  targetUrl: string;

  @WorkspaceField({
    standardId: WEBHOOK_STANDARD_FIELD_IDS.operation,
    type: FieldMetadataType.TEXT,
    label: msg`Operation`,
    description: msg`Webhook operation`,
    icon: 'IconCheckbox',
  })
  @WorkspaceIsDeprecated()
  operation: string;

  @WorkspaceField({
    standardId: WEBHOOK_STANDARD_FIELD_IDS.operations,
    type: FieldMetadataType.ARRAY,
    label: msg`Operations`,
    description: msg`Webhook operations`,
    icon: 'IconCheckbox',
    defaultValue: ['*.*'],
  })
  operations: string[];

  @WorkspaceField({
    standardId: WEBHOOK_STANDARD_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: undefined,
    icon: 'IconInfo',
  })
  @WorkspaceIsNullable()
  description: string;

  @WorkspaceField({
    standardId: WEBHOOK_STANDARD_FIELD_IDS.secret,
    type: FieldMetadataType.TEXT,
    label: msg`Secret`,
    description: msg`Optional secret used to compute the HMAC signature for webhook payloads. This secret is shared between Twenty and the webhook consumer to authenticate webhook requests.`,
    icon: 'IconLock',
  })
  secret: string;
}
