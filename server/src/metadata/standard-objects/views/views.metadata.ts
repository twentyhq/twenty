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
      type: 'text',
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
      type: 'text',
      name: 'objectId',
      label: 'Object Id',
      targetColumnMap: {
        value: 'objectId',
      },
      description: 'View target object',
      icon: null,
      isNullable: false,
    },
    {
      type: 'text',
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
