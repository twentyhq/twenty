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
      icon: 'IconBuildingSkyscraper',
      isNullable: false,
      defaultValue: { value: '' },
    },
  ],
};

export default connectedAccountMetadata;
