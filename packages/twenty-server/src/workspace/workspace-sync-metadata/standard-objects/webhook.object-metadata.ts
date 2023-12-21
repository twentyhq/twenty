import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

@ObjectMetadata({
  namePlural: 'webhooks',
  labelSingular: 'Webhook',
  labelPlural: 'Webhooks',
  description: 'A webhook',
  icon: 'IconRobot',
})
@IsSystem()
export class WebhookObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Target Url',
    description: 'Webhook target url',
    icon: 'IconLink',
  })
  targetUrl: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Operation',
    description: 'Webhook operation',
    icon: 'IconCheckbox',
  })
  operation: string;
}
