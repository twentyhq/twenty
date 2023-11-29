import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

const apiKeyMetadata = {
  nameSingular: 'apiKey',
  namePlural: 'apiKeys',
  labelSingular: 'Api Key',
  labelPlural: 'Api Keys',
  targetTableName: 'apiKey',
  description: 'An api key',
  icon: 'IconRobot',
  isActive: true,
  isSystem: true,
  fields: [
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'name',
      label: 'Name',
      targetColumnMap: {
        value: 'name',
      },
      description: 'ApiKey name',
      icon: 'IconLink',
      isNullable: false,
      defaultValue: { value: '' },
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.DATE_TIME,
      name: 'expiresAt',
      label: 'Expiration date',
      targetColumnMap: {
        value: 'expiresAt',
      },
      description: 'ApiKey expiration date',
      icon: 'IconCalendar',
      isNullable: false,
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.DATE_TIME,
      name: 'revokedAt',
      label: 'Revocation date',
      targetColumnMap: {
        value: 'revokedAt',
      },
      description: 'ApiKey revocation date',
      icon: 'IconCalendar',
      isNullable: true,
    },
  ],
};

export default apiKeyMetadata;
