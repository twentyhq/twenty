const viewsMetadata = {
  nameSingular: 'viewV2',
  namePlural: 'viewsV2',
  labelSingular: 'View',
  labelPlural: 'Views',
  targetTableName: 'view',
  description: '(System) Views',
  icon: 'IconLayoutCollage',
  fields: [
    {
      type: 'TEXT',
      name: 'name',
      label: 'Name',
      targetColumnMap: {
        value: 'name',
      },
      description: 'View name',
      icon: null,
      isNullable: false,
    },
    {
      type: 'TEXT',
      name: 'objectMetadataId',
      label: 'Object Metadata Id',
      targetColumnMap: {
        value: 'objectMetadataId',
      },
      description: 'View target object',
      icon: null,
      isNullable: false,
    },
    {
      type: 'TEXT',
      name: 'type',
      label: 'Type',
      targetColumnMap: {
        value: 'type',
      },
      description: 'View type',
      icon: null,
      isNullable: false,
    },
  ],
};

export default viewsMetadata;
