import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { webhookStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.webhook,
  namePlural: 'webhooks',
  labelSingular: 'Webhook',
  labelPlural: 'Webhooks',
  description: 'A webhook',
  icon: 'IconRobot',
})
@IsSystem()
export class WebhookObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: webhookStandardFieldIds.targetUrl,
    type: FieldMetadataType.TEXT,
    label: 'Target Url',
    description: 'Webhook target url',
    icon: 'IconLink',
  })
  targetUrl: string;

  @FieldMetadata({
    standardId: webhookStandardFieldIds.operation,
    type: FieldMetadataType.TEXT,
    label: 'Operation',
    description: 'Webhook operation',
    icon: 'IconCheckbox',
  })
  operation: string;
}
