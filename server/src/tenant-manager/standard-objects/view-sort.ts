const viewSortMetadata = {
  nameSingular: 'viewSortV2',
  namePlural: 'viewSortsV2',
  labelSingular: 'View Sort',
  labelPlural: 'View Sorts',
  targetTableName: 'viewSort',
  description: '(System) View Sorts',
  icon: 'IconArrowsSort',
  isActive: true,
  isSystem: true,
  fields: [
    {
      isCustom: false,
      isActive: true,
      type: 'TEXT',
      name: 'fieldMetadataId',
      label: 'Field Metadata Id',
      targetColumnMap: {
        value: 'fieldMetadataId',
      },
      description: 'View Sort target field',
      icon: null,
      isNullable: false,
    },
    {
      isCustom: false,
      isActive: true,
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
    {
      isCustom: false,
      isActive: true,
      type: 'RELATION',
      name: 'view',
      label: 'View',
      targetColumnMap: {
        value: 'viewId',
      },
      description: 'View Sort related view',
      icon: 'IconLayoutCollage',
      isNullable: false,
    },
    // Temporary Hack?
    {
      isCustom: false,
      isActive: true,
      type: 'TEXT',
      name: 'viewId',
      label: 'View Id',
      targetColumnMap: {
        value: 'viewId',
      },
      description: 'View Sort related view',
      icon: 'IconLayoutCollage',
      isNullable: false,
    },
  ],
};

export default viewSortMetadata;
