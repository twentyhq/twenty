import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

const webhookMetadata = {
  nameSingular: 'webhook',
  namePlural: 'webhooks',
  labelSingular: 'Webhook',
  labelPlural: 'Webhooks',
  targetTableName: 'webhook',
  description: 'A webhook',
  icon: 'IconRobot',
  isActive: true,
  isSystem: true,
  fields: [
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'targetUrl',
      label: 'Target Url',
      targetColumnMap: {
        value: 'targetUrl',
      },
      description: 'Webhook target url',
      icon: 'IconLink',
      isNullable: false,
      defaultValue: { value: '' },
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'operation',
      label: 'Operation',
      targetColumnMap: {
        value: 'operation',
      },
      description: 'Webhook operation',
      icon: 'IconCheckbox',
      isNullable: false,
      defaultValue: { value: '' },
    },
  ],
};

export default webhookMetadata;
