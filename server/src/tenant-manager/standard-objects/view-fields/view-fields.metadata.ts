const viewFieldsMetadata = {
  nameSingular: 'viewFieldV2',
  namePlural: 'viewFieldsV2',
  labelSingular: 'View Field',
  labelPlural: 'View Fields',
  targetTableName: 'viewField',
  description: '(System) View Fields',
  icon: 'IconColumns3',
  fields: [
    {
      type: 'TEXT',
      name: 'fieldMetadataId',
      label: 'Field Metadata Id',
      targetColumnMap: {
        value: 'fieldMetadataId',
      },
      description: 'View Field target field',
      icon: null,
      isNullable: false,
    },
    {
      type: 'TEXT',
      name: 'viewId',
      label: 'View Id',
      targetColumnMap: {
        value: 'viewId',
      },
      description: 'View Field related view',
      icon: null,
      isNullable: false,
    },
    {
      type: 'BOOLEAN',
      name: 'isVisible',
      label: 'Visible',
      targetColumnMap: {
        value: 'isVisible',
      },
      description: 'View Field visibility',
      icon: null,
      isNullable: false,
    },
    {
      type: 'NUMBER',
      name: 'size',
      label: 'Size',
      targetColumnMap: {
        value: 'size',
      },
      description: 'View Field size',
      icon: null,
      isNullable: false,
    },
    {
      type: 'NUMBER',
      name: 'position',
      label: 'Position',
      targetColumnMap: {
        value: 'position',
      },
      description: 'View Field position',
      icon: null,
      isNullable: false,
    },
  ],
};

export default viewFieldsMetadata;
