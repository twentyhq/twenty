const viewSortsMetadata = {
  nameSingular: 'viewSortV2',
  namePlural: 'viewSortsV2',
  labelSingular: 'View Sort',
  labelPlural: 'View Sorts',
  targetTableName: 'viewSort',
  description: '(System) View Sorts',
  icon: 'IconArrowsSort',
  fields: [
    {
      type: 'TEXT',
      name: 'fieldMetadataId',
      label: 'Field Id',
      targetColumnMap: {
        value: 'fieldMetadataId',
      },
      description: 'View Sort target field',
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
      description: 'View Sort related view',
      icon: null,
      isNullable: false,
    },
    {
      type: 'TEXT',
      name: 'direction',
      label: 'Direction',
      targetColumnMap: {
        value: 'direction',
      },
      description: 'View Sort direction',
      icon: null,
      isNullable: false,
    },
  ],
};

export default viewSortsMetadata;
