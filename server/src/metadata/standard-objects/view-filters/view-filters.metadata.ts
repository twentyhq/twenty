const viewFiltersMetadata = {
  nameSingular: 'viewFilterV2',
  namePlural: 'viewFiltersV2',
  labelSingular: 'View Filter',
  labelPlural: 'View Filters',
  targetTableName: 'viewFilter',
  description: '(System) View Filters',
  icon: 'IconFilterBolt',
  fields: [
    {
      type: 'TEXT',
      name: 'fieldId',
      label: 'Field Id',
      targetColumnMap: {
        value: 'fieldId',
      },
      description: 'View Filter target field',
      icon: null,
      isNullable: true,
    },
    {
      type: 'TEXT',
      name: 'viewId',
      label: 'View Id',
      targetColumnMap: {
        value: 'viewId',
      },
      description: 'View Filter related view',
      icon: null,
      isNullable: false,
    },
    {
      type: 'TEXT',
      name: 'operand',
      label: 'Operand',
      targetColumnMap: {
        value: 'operand',
      },
      description: 'View Filter operand',
      icon: null,
      isNullable: false,
    },
    {
      type: 'TEXT',
      name: 'value',
      label: 'Value',
      targetColumnMap: {
        value: 'value',
      },
      description: 'View Filter value',
      icon: null,
      isNullable: false,
    },
    {
      type: 'TEXT',
      name: 'displayValue',
      label: 'Display Value',
      targetColumnMap: {
        value: 'displayValue',
      },
      description: 'View Filter Display Value',
      icon: null,
      isNullable: false,
    },
  ],
};

export default viewFiltersMetadata;
