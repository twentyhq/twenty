import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

const connectedAccountMetadata = {
  nameSingular: 'connectedAccount',
  namePlural: 'connectedAccounts',
  labelSingular: 'Connected Account',
  labelPlural: 'Connected Accounts',
  targetTableName: 'connectedAccount',
  description: 'A connected account',
  icon: 'IconBuildingSkyscraper',
  isActive: true,
  isSystem: false,
  fields: [
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'type',
      label: 'type',
      targetColumnMap: {
        value: 'type',
      },
      description: 'The account type',
      icon: 'IconSettings',
      isNullable: false,
      defaultValue: { value: '' },
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'accessToken',
      label: 'accessToken',
      targetColumnMap: {
        value: 'accessToken',
      },
      description: 'Messaging provider access token',
      icon: 'IconKey',
      isNullable: false,
      defaultValue: { value: '' },
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'refreshToken',
      label: 'refreshToken',
      targetColumnMap: {
        value: 'refreshToken',
      },
      description: 'Messaging provider refresh token',
      icon: 'IconKey',
      isNullable: false,
      defaultValue: { value: '' },
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.TEXT, // Should be an array of strings
      name: 'externalScopes',
      label: 'externalScopes',
      targetColumnMap: {
        value: 'externalScopes',
      },
      description: 'External scopes',
      icon: 'IconCircle',
      isNullable: false,
      defaultValue: { value: '' },
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.BOOLEAN, // Should be an array of strings
      name: 'hasEmailScope',
      label: 'hasEmailScope',
      targetColumnMap: {
        value: 'hasEmailScope',
      },
      description: 'Has email scope',
      icon: 'IconMail',
      isNullable: false,
      defaultValue: { value: '' },
    },
  ],
};

export default connectedAccountMetadata;
